import { describe, expect, it } from 'vitest';
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
