const STORAGE_PREFIX = 'prisma_admin:v1:';

function keyFor(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(keyFor(key));
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(keyFor(key));
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(keyFor(key), JSON.stringify(value));
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(keyFor(key));
}

export const localPreferencesStorage = {
  get,
  set,
  remove
};
