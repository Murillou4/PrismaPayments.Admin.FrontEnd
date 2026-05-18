import { describe, expect, it } from 'vitest';
import {
  normalizeArrayResponse,
  normalizeCollectionResponse
} from '../responseNormalizers';

describe('response normalizers', () => {
  it('normaliza envelope paginado parcial sem items', () => {
    const result = normalizeCollectionResponse<{ id: string }>({
      responseType: 'OK',
      data: {
        total: 12
      }
    }, { skip: 20, limit: 10 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(12);
    expect(result.skip).toBe(20);
    expect(result.limit).toBe(10);
  });

  it('normaliza listas diretas e arrays envelopados', () => {
    expect(normalizeCollectionResponse([{ id: 'one' }]).total).toBe(1);
    expect(normalizeArrayResponse({
      responseType: 'OK',
      data: [{ id: 'trace_1' }]
    })).toEqual([{ id: 'trace_1' }]);
    expect(normalizeArrayResponse({
      items: [{ id: 'trace_2' }]
    })).toEqual([{ id: 'trace_2' }]);
  });
});
