import type { QueryKey } from '@tanstack/svelte-query';
import { left, right, NetworkFailure, type Either, type Failure } from '$core/error/Failure';
import { apiResponseToEither, type ApiResponse } from '$appmod/services/api/apiResponse';
import { queryClient } from './queryClient';

export async function fetchAdminQuery<T>(
  queryKey: QueryKey,
  request: () => Promise<ApiResponse<T>>
): Promise<Either<Failure, T>> {
  try {
    const value = await queryClient.fetchQuery({
      queryKey,
      queryFn: async () => {
        const result = apiResponseToEither(await request());
        if (!result.ok) throw result.failure;
        return result.value;
      }
    });

    return right(value);
  } catch (error) {
    if (error instanceof Error) {
      return left(new NetworkFailure(error.message));
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return left(error as Failure);
    }
    return left(new NetworkFailure());
  }
}

export async function executeAdminMutation<T>(
  request: () => Promise<ApiResponse<T>>,
  invalidate: QueryKey[]
): Promise<Either<Failure, T>> {
  const result = apiResponseToEither(await request());
  if (!result.ok) return result;

  await Promise.all(
    invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  );

  return result;
}
