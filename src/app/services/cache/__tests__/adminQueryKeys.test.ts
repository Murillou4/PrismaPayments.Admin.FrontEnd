import { describe, expect, it, vi } from 'vitest';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { executeAdminMutation } from '$appmod/services/cache/adminQuery';
import { queryClient } from '$appmod/services/cache/queryClient';

describe('admin query keys', () => {
  it('gera keys estaveis independente da ordem dos filtros', () => {
    expect(adminQueryKeys.payments.list({ page: 1, limit: 20, status: 'PAID', method: 'PIX' }))
      .toEqual(adminQueryKeys.payments.list({ method: 'PIX', status: 'PAID', limit: 20, page: 1 }));
  });

  it('agrupa recursos por dominio admin', () => {
    expect(adminQueryKeys.dashboard.all).toEqual(['admin', 'dashboard']);
    expect(adminQueryKeys.merchants.detail('m_1')).toEqual(['admin', 'merchants', 'detail', 'm_1']);
    expect(adminQueryKeys.diagnostics.all).toEqual(['admin', 'diagnostics']);
  });
});

describe('admin query invalidation', () => {
  it('invalida as keys informadas depois de mutation com sucesso', async () => {
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    const result = await executeAdminMutation(
      async () => ({
        responseType: 'OK',
        message: 'ok',
        title: 'OK',
        status: 200,
        data: { id: 'm_1' },
        extendedResultCode: 'OK',
        date: new Date().toISOString()
      }),
      [adminQueryKeys.merchants.all, adminQueryKeys.dashboard.all]
    );

    expect(result.ok).toBe(true);
    expect(spy).toHaveBeenCalledWith({ queryKey: adminQueryKeys.merchants.all });
    expect(spy).toHaveBeenCalledWith({ queryKey: adminQueryKeys.dashboard.all });
  });
});
