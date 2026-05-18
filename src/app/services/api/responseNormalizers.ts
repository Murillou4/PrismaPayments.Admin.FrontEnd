export interface CollectionDefaults {
  total?: number;
  skip?: number;
  limit?: number;
  page?: number;
  pageSize?: number;
}

export interface NormalizedCollection<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
  page?: number;
  pageSize?: number;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function unwrapResponseData(value: unknown): unknown {
  if (isRecord(value) && 'responseType' in value && 'data' in value) {
    return value.data;
  }
  return value;
}

export function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function normalizeCollectionResponse<T>(
  value: unknown,
  defaults: CollectionDefaults = {}
): NormalizedCollection<T> {
  const raw = unwrapResponseData(value);
  if (Array.isArray(raw)) {
    return {
      items: raw as T[],
      total: defaults.total ?? raw.length,
      skip: defaults.skip ?? 0,
      limit: defaults.limit ?? raw.length,
      ...(defaults.page !== undefined ? { page: defaults.page } : {}),
      ...(defaults.pageSize !== undefined ? { pageSize: defaults.pageSize } : {})
    };
  }

  const record = isRecord(raw) ? raw : {};
  const items = asArray<T>(record.items);
  const page = asNumber(record.page, defaults.page ?? NaN);
  const pageSize = asNumber(record.pageSize, defaults.pageSize ?? NaN);

  return {
    items,
    total: asNumber(record.total, defaults.total ?? items.length),
    skip: asNumber(record.skip, defaults.skip ?? 0),
    limit: asNumber(record.limit, defaults.limit ?? items.length),
    ...(Number.isFinite(page) ? { page } : {}),
    ...(Number.isFinite(pageSize) ? { pageSize } : {})
  };
}

export function normalizeArrayResponse<T>(value: unknown): T[] {
  const raw = unwrapResponseData(value);
  if (isRecord(raw) && 'items' in raw) {
    return asArray<T>(raw.items);
  }
  return asArray<T>(raw);
}
