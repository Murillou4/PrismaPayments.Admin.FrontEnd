import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import type { AdminDashboardResponse } from '$appmod/features/dashboard/domain/entities/AdminDashboardResponse';
import { right } from '$core/error/Failure';

// goto e chamado pelos cards/linhas ao navegar; nao queremos navegar de verdade.
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

// O service locator instancia repositorios que fazem fetch real; substituimos a
// fachada por um getDashboard espionavel para controlar as recargas.
const getDashboard = vi.fn();
vi.mock('$core/service_locator/dependencies', () => ({
  appServices: { dashboard: () => ({ getDashboard }) }
}));

// chart.js precisa de canvas (ausente no jsdom); trocamos <Bar> por um stub que
// expoe os dados recebidos via data-attributes.
vi.mock('svelte5-chartjs', async () => {
  const Stub = (await import('./BarStub.svelte')).default;
  return { Bar: Stub };
});

const { default: DashboardPage } = await import(
  '$appmod/features/dashboard/presentation/pages/DashboardPage.svelte'
);

const today = new Date().toISOString();

function makeDashboard(overrides: Partial<AdminDashboardResponse> = {}): AdminDashboardResponse {
  return {
    filters: {},
    pagination: { skip: 0, limit: 100 },
    payments: {
      total: 873,
      paid: 800,
      failed: 12,
      processing: 5,
      volume: 9_900_000, // 99.000,00 -> "R$ 99,0k"
      methodBreakdown: [{ method: 'PIX', total: 800, paid: 800, amount: 9_900_000 }],
      items: [
        { id: 'p1', amount: 5_000_000, method: 'PIX', status: 'PAID', createdAt: today, paidAt: today },
        { id: 'p2', amount: 4_900_000, method: 'CREDIT_CARD', status: 'PAID', createdAt: today, paidAt: today }
      ]
    },
    withdrawals: { total: 30, processing: 2, failed: 1, todayVolume: 500_000, items: [] },
    disputes: { total: 4, open: 3, items: [] },
    merchants: { total: 50, active: 42, pending: 6, suspended: 2, pendingVerification: 6, items: [] },
    providers: {
      total: 2,
      active: 2,
      unhealthy: 0,
      items: [
        { id: 'prov1', name: 'acme', displayName: 'Acme Pay', healthStatus: 'HEALTHY', supportedMethods: ['PIX'] }
      ]
    },
    queues: { pendingMerchantVerification: 6, failedWebhooks: 2, openDisputes: 3, failedPayments: 12 },
    webhookFailures: { total: 2, items: [] },
    ...overrides
  };
}

function renderDashboard(dashboard = makeDashboard()) {
  return render(DashboardPage, {
    props: {
      initialDashboard: dashboard,
      initialError: null,
      initialStartDate: '2026-06-09',
      initialEndDate: '2026-06-15'
    }
  });
}

beforeEach(() => {
  getDashboard.mockReset();
  getDashboard.mockResolvedValue(right(makeDashboard()));
  window.localStorage.clear();
});

describe('DASH-01: metricas globais exibidas no dashboard', () => {
  it('exibe volume, merchants ativos e total de pagamentos vindos do initialDashboard', () => {
    const { container } = renderDashboard();

    // Volume compacto no card principal.
    expect(container.textContent).toContain('R$ 99,0k');

    const cards = [...container.querySelectorAll('.metric-card')];
    const merchantsCard = cards.find((c) => c.textContent?.includes('Merchants'));
    const paymentsCard = cards.find((c) => c.textContent?.includes('Pagamentos'));

    expect(merchantsCard?.textContent).toContain('42');
    expect(paymentsCard?.textContent).toContain('873');
  });

  it('nao dispara fetch quando ja recebe initialDashboard (onMount apenas cacheia)', () => {
    renderDashboard();
    expect(getDashboard).not.toHaveBeenCalled();
  });
});

describe('DASH-02: grafico de receita por periodo', () => {
  it('renderiza o grafico (svelte5-chartjs) com series quando ha transacoes no periodo', () => {
    const { getByTestId } = renderDashboard();

    const chart = getByTestId('bar-chart');
    // METHOD_DATASETS define 4 series (PIX/Cartao/Boleto/Debito).
    expect(chart.getAttribute('data-datasets')).toBe('4');
    // Os items de hoje caem nos buckets da semana -> ha volume agregado (> 0).
    expect(Number(chart.getAttribute('data-total'))).toBeGreaterThan(0);
  });

  it('exibe empty-state em vez do grafico quando nao ha volume no periodo', () => {
    const { container } = renderDashboard(
      makeDashboard({
        payments: {
          total: 0,
          paid: 0,
          failed: 0,
          processing: 0,
          volume: 0,
          methodBreakdown: [],
          items: []
        }
      })
    );

    expect(container.querySelector('[data-testid="bar-chart"]')).toBeNull();
    expect(container.textContent).toContain('Nenhuma transacao neste periodo');
  });

  it('trocar o preset de periodo recarrega os dados do grafico via service', async () => {
    const { container, getAllByText } = renderDashboard();
    expect(getDashboard).not.toHaveBeenCalled();

    const mesTab = getAllByText('Mes').find((el) => el.closest('.period-tabs'));
    expect(mesTab).toBeTruthy();
    await fireEvent.click(mesTab!);

    await waitFor(() => expect(getDashboard).toHaveBeenCalledTimes(1));

    // O preset "month" usa janela de 30 dias (start = hoje - 29).
    const filters = getDashboard.mock.calls[0][0];
    const days = Math.round(
      (new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) / 86_400_000
    );
    expect(days).toBe(29);

    // A aba "Mes" passa a ser a ativa.
    const activeTab = container.querySelector('.period-tabs button.active');
    expect(activeTab?.textContent?.trim()).toBe('Mes');
  });
});

describe('DASH-03: recarga das metricas', () => {
  // Obs: o componente nao implementa auto-refresh por setInterval; o mecanismo
  // de recarga existente e o botao "Atualizar". Testamos o comportamento real.
  it('clicar em "Atualizar" re-busca as metricas no service', async () => {
    const { getByLabelText } = renderDashboard();
    expect(getDashboard).not.toHaveBeenCalled();

    await fireEvent.click(getByLabelText('Atualizar'));

    await waitFor(() => expect(getDashboard).toHaveBeenCalledTimes(1));
  });
});
