import { describe, expect, it } from 'vitest';
import { normalizeAdminDashboardResponse } from '../DashboardRepository';

describe('normalizeAdminDashboardResponse', () => {
  it('preenche secoes ausentes com defaults seguros', () => {
    const dashboard = normalizeAdminDashboardResponse({
      filters: {},
      merchants: { pending: 2 }
    });

    expect(dashboard.payments.volume).toBe(0);
    expect(dashboard.payments.items).toEqual([]);
    expect(dashboard.merchants.pending).toBe(2);
    expect(dashboard.queues.failedPayments).toBe(0);
    expect(dashboard.webhookFailures.items).toEqual([]);
  });

  it('aceita envelope de resposta sem vazar wrapper para a tela', () => {
    const dashboard = normalizeAdminDashboardResponse({
      responseType: 'OK',
      data: {
        payments: {
          volume: 1200,
          total: 3,
          paid: 2,
          items: [{ id: 'pay_1', amount: 1200 }]
        }
      }
    });

    expect(dashboard.payments.volume).toBe(1200);
    expect(dashboard.payments.total).toBe(3);
    expect(dashboard.payments.items).toHaveLength(1);
    expect(dashboard.withdrawals.items).toEqual([]);
  });
});
