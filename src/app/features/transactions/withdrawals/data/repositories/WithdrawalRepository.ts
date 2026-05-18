import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import {
  asNumber,
  isRecord,
  normalizeCollectionResponse
} from '$appmod/services/api/responseNormalizers';
import type { IWithdrawalRepository } from '../../domain/repositories/IWithdrawalRepository';
import type {
  PaginatedWithdrawals,
  Withdrawal,
  WithdrawalRecipient,
  ListWithdrawalsParams
} from '../../domain/entities/Withdrawal';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function normalizeRecipient(value: unknown): WithdrawalRecipient {
  const record = isRecord(value) ? value : {};
  return {
    pixKey: asString(record.pixKey),
    pixKeyType: asString(record.pixKeyType),
    name: asString(record.name),
    documentNumber: asString(record.documentNumber)
  };
}

export function normalizeWithdrawal(value: unknown): Withdrawal {
  const record = isRecord(value) ? value : {};
  return {
    ...(record as Partial<Withdrawal>),
    id: asString(record.id),
    merchantId: asString(record.merchantId),
    externalId: asNullableString(record.externalId),
    providerName: asNullableString(record.providerName),
    status: asString(record.status, 'REQUESTED') as Withdrawal['status'],
    amount: asNumber(record.amount),
    feeAmount: asNumber(record.feeAmount),
    netAmount: asNumber(record.netAmount),
    currency: asString(record.currency, 'BRL'),
    recipient: normalizeRecipient(record.recipient),
    completedAt: asNullableString(record.completedAt),
    failedAt: asNullableString(record.failedAt),
    failureReason: asNullableString(record.failureReason),
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt)
  };
}

export class WithdrawalRepository implements IWithdrawalRepository {
  async listWithdrawals(params: ListWithdrawalsParams): Promise<Either<Failure, PaginatedWithdrawals>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const result = await fetchAdminQuery(
      adminQueryKeys.withdrawals.list(params),
      () => apiClient.get<unknown>(API_PATHS.ADMIN_WITHDRAWALS, {
        skip,
        limit,
        merchantId: params.merchantId,
        status: params.status
      })
    );

    if (!result.ok) return result;

    const collection = normalizeCollectionResponse<unknown>(result.value, { skip, limit });
    return {
      ok: true,
      value: {
        ...collection,
        items: collection.items.map(normalizeWithdrawal)
      }
    };
  }

  async getById(id: string): Promise<Either<Failure, Withdrawal>> {
    const result = await fetchAdminQuery(
      adminQueryKeys.withdrawals.detail(id),
      () => apiClient.get<unknown>(API_PATHS.ADMIN_WITHDRAWAL(id))
    );

    return result.ok
      ? { ok: true, value: normalizeWithdrawal(result.value) }
      : result;
  }
}
