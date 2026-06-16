import { describe, expect, it, vi, beforeEach } from 'vitest';
import { normalizePaginatedMerchantsResponse } from '../MerchantRepository';

describe('normalizePaginatedMerchantsResponse', () => {
  it('garante array de items quando a resposta vem parcial', () => {
    const result = normalizePaginatedMerchantsResponse({ total: 4 }, 20, 10);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(4);
    expect(result.skip).toBe(20);
    expect(result.limit).toBe(10);
  });

  it('aceita envelope e lista direta sem quebrar a pagina', () => {
    const enveloped = normalizePaginatedMerchantsResponse({
      responseType: 'OK',
      data: {
        items: [{ id: 'merchant_1', legalName: 'Prisma Commerce' }],
        total: 1,
        skip: 0,
        limit: 20
      }
    }, 0, 20);

    const list = normalizePaginatedMerchantsResponse([{ id: 'merchant_2' }], 0, 20);

    expect(enveloped.items).toHaveLength(1);
    expect(enveloped.total).toBe(1);
    expect(list.items).toHaveLength(1);
    expect(list.total).toBe(1);
  });
});

// ── Regressões de contrato (validadas no smoke E2E 2026-06-16) ──────────────
// apiClient/adminQuery sao mockados: os helpers de cache apenas repassam o
// resultado do request, e o apiClient e um spy — assim isolamos a logica de
// transformacao do repositorio (nome/normalizacao do contrato da API).
const getSpy = vi.fn();
const putSpy = vi.fn();
const postSpy = vi.fn();

vi.mock('$appmod/services/api/apiClient', () => ({
  apiClient: {
    get: (...args: unknown[]) => getSpy(...args),
    put: (...args: unknown[]) => putSpy(...args),
    post: (...args: unknown[]) => postSpy(...args)
  }
}));

vi.mock('$appmod/services/cache/adminQuery', () => ({
  // Repassam o Either ja resolvido pelo "request" mockado.
  fetchAdminQuery: async (_key: unknown, request: () => Promise<unknown>) => request(),
  executeAdminMutation: async (request: () => Promise<unknown>) => request()
}));

const { MerchantRepository } = await import('../MerchantRepository');

beforeEach(() => {
  getSpy.mockReset();
  putSpy.mockReset();
  postSpy.mockReset();
});

describe('MerchantRepository.listTenants', () => {
  it('normaliza a colecao paginada ({ items }) para um array de tenants', async () => {
    // ADMIN_TENANTS responde como colecao paginada, nao como array puro.
    getSpy.mockResolvedValue({ ok: true, value: { items: [{ id: 't1' }, { id: 't2' }], total: 2 } });

    const repo = new MerchantRepository();
    const result = await repo.listTenants();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.value)).toBe(true);
      expect(result.value).toHaveLength(2);
      expect(result.value[0]).toMatchObject({ id: 't1' });
    }
  });

  it('propaga falha sem quebrar', async () => {
    getSpy.mockResolvedValue({ ok: false, failure: { message: 'boom' } });

    const repo = new MerchantRepository();
    const result = await repo.listTenants();

    expect(result.ok).toBe(false);
  });
});

describe('MerchantRepository.updateVerification', () => {
  it('mapeia APPROVED -> { verificationStatus: VERIFIED, notes } no corpo do PUT', async () => {
    putSpy.mockResolvedValue({ ok: true, value: { id: 'm1' } });

    const repo = new MerchantRepository();
    await repo.updateVerification('m1', { status: 'APPROVED', notes: 'ok' });

    expect(putSpy).toHaveBeenCalledOnce();
    const [path, body] = putSpy.mock.calls[0];
    expect(path).toContain('m1');
    expect(body).toEqual({ verificationStatus: 'VERIFIED', notes: 'ok' });
  });

  it('mapeia REJECTED -> { verificationStatus: REJECTED, notes }', async () => {
    putSpy.mockResolvedValue({ ok: true, value: { id: 'm1' } });

    const repo = new MerchantRepository();
    await repo.updateVerification('m1', { status: 'REJECTED', notes: 'documento ilegivel' });

    const [, body] = putSpy.mock.calls[0];
    expect(body).toEqual({ verificationStatus: 'REJECTED', notes: 'documento ilegivel' });
  });
});
