import { describe, it, expect, vi } from 'vitest';
import { load } from '../+page.server';

function envelope(data: unknown, status = 200, message = 'ok') {
  return Response.json(
    {
      responseType: status === 200 ? 'OK' : 'INTERNAL_SERVER_ERROR',
      message,
      title: status === 200 ? 'OK' : 'Erro',
      status,
      data,
      date: new Date().toISOString()
    },
    { status }
  );
}

// O segundo arg do load (RequestEvent) so precisa expor `fetch` para este load.
// O tipo gerado inclui `void` na uniao; estreitamos aqui pois o load sempre
// retorna o objeto de dados.
async function runLoad(fetchImpl: typeof fetch) {
  const result = await load({ fetch: fetchImpl } as unknown as Parameters<typeof load>[0]);
  if (!result) throw new Error('dashboard load retornou void inesperadamente');
  return result;
}

describe('DASH-01: metricas globais carregadas no dashboard', () => {
  it('load retorna os dados de metricas quando o backend responde ok', async () => {
    const metrics = { totalVolume: 12345, merchants: 7 };
    const fetchMock = vi.fn(async () => envelope(metrics));

    const result = await runLoad(fetchMock as unknown as typeof fetch);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.initialDashboard).toEqual(metrics);
    expect(result.initialError).toBeNull();
  });

  it('usa uma janela de 7 dias (start = end - 6)', async () => {
    const fetchMock = vi.fn(async () => envelope({}));

    const result = await runLoad(fetchMock as unknown as typeof fetch);

    expect(result.initialStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.initialEndDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const days = Math.round(
      (new Date(result.initialEndDate).getTime() - new Date(result.initialStartDate).getTime()) / 86_400_000
    );
    expect(days).toBe(6);
  });

  it('expoe initialError quando o backend responde com erro', async () => {
    const fetchMock = vi.fn(async () => envelope(null, 500, 'backend caiu'));

    const result = await runLoad(fetchMock as unknown as typeof fetch);

    expect(result.initialDashboard).toBeNull();
    expect(result.initialError).toBe('backend caiu');
  });

  it('trata excecao de rede com mensagem de fallback', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('network down');
    });

    const result = await runLoad(fetchMock as unknown as typeof fetch);

    expect(result.initialDashboard).toBeNull();
    expect(result.initialError).toContain('dashboard');
  });

  // Render de componente (DASH-01/02/03) coberto em dashboard.render.svelte.test.ts.
});
