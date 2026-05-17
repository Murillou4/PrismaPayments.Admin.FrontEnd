import { env as privateEnv } from '$env/dynamic/private';
import type { ApiResponse } from '$appmod/services/api/apiResponse';

const AUTH_TIMEOUT_MS = 15_000;

export interface BackendActionResult<T> {
  ok: boolean;
  status: number;
  body: ApiResponse<T> | null;
}

function getPrivateEnv(name: string): string {
  const runtime = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name] ?? privateEnv[name] ?? '';
}

export function hasBackendBaseUrl(): boolean {
  return Boolean(getPrivateEnv('PRIVATE_API_BASE_URL'));
}

export async function postAdminAuth<T>(
  path: string,
  payload: Record<string, unknown>
): Promise<BackendActionResult<T>> {
  const baseUrl = getPrivateEnv('PRIVATE_API_BASE_URL');
  if (!baseUrl) {
    return { ok: false, status: 500, body: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getPrivateEnv('PRIVATE_CLIENT_SECRET')
          ? { 'client-secret': getPrivateEnv('PRIVATE_CLIENT_SECRET') }
          : {})
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    return { ok: response.ok, status: response.status, body };
  } catch {
    return { ok: false, status: 503, body: null };
  } finally {
    clearTimeout(timeout);
  }
}
