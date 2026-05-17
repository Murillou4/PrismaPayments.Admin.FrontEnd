import { QueryClient, type QueryKey } from '@tanstack/svelte-query';
import { failureFromApiResponse, type ApiResponse } from '$appmod/services/api/apiResponse';
import { Failure } from '$core/error/Failure';

const NON_RETRYABLE_STATUS = new Set([400, 401, 403, 404]);

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'extendedResultCode' in value
  );
}

function isFailure(value: unknown): value is Failure {
  return value instanceof Failure;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        if (isApiResponse(error) && NON_RETRYABLE_STATUS.has(error.status)) {
          return false;
        }
        if (isFailure(error)) {
          return !['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR'].includes(error.code ?? '') &&
            failureCount < 2;
        }
        if (error instanceof Error && NON_RETRYABLE_STATUS.has(Number(error.name))) {
          return false;
        }
        return failureCount < 2;
      }
    },
    mutations: {
      retry: false
    }
  }
});

export function throwIfApiError(response: ApiResponse<unknown>): void {
  if (response.status >= 200 && response.status < 300) return;
  throw failureFromApiResponse(response);
}

export function invalidateAdminQueries(queryKey: QueryKey): Promise<void> {
  return queryClient.invalidateQueries({ queryKey });
}
