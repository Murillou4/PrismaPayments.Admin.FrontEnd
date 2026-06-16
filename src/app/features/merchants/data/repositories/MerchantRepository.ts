import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { executeAdminMutation, fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import { normalizeArrayResponse, normalizeCollectionResponse } from '$appmod/services/api/responseNormalizers';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import type {
  PaginatedMerchants,
  Merchant,
  MerchantDocument,
  MerchantCredential,
  MerchantCredentialCreated,
  MerchantListItem,
  Tenant,
  CreateMerchantPayload,
  MerchantStatusUpdate,
  MerchantVerificationUpdate,
  MerchantSettingsUpdate,
  CreateCredentialPayload,
  ListMerchantsParams
} from '../../domain/entities/Merchant';

export function normalizePaginatedMerchantsResponse(
  value: unknown,
  fallbackSkip: number,
  fallbackLimit: number
): PaginatedMerchants {
  return normalizeCollectionResponse<MerchantListItem>(value, {
    skip: fallbackSkip,
    limit: fallbackLimit
  });
}

export class MerchantRepository implements IMerchantRepository {
  async listMerchants(params: ListMerchantsParams): Promise<Either<Failure, PaginatedMerchants>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const result = await fetchAdminQuery(
      adminQueryKeys.merchants.list(params),
      () => apiClient.get<unknown>(API_PATHS.ADMIN_MERCHANTS, {
        skip,
        limit,
        status: params.status && params.status !== 'ALL' ? params.status : undefined,
        verification: params.verification && params.verification !== 'ALL' ? params.verification : undefined,
        search: params.search
      })
    );

    return result.ok
      ? { ok: true, value: normalizePaginatedMerchantsResponse(result.value, skip, limit) }
      : result;
  }

  async getById(id: string): Promise<Either<Failure, Merchant>> {
    return fetchAdminQuery(
      adminQueryKeys.merchants.detail(id),
      () => apiClient.get<Merchant>(API_PATHS.ADMIN_MERCHANT(id))
    );
  }

  async create(payload: CreateMerchantPayload): Promise<Either<Failure, Merchant>> {
    return executeAdminMutation(
      () => apiClient.post<Merchant>(API_PATHS.ADMIN_MERCHANTS, payload),
      [
        adminQueryKeys.merchants.all,
        adminQueryKeys.dashboard.all
      ]
    );
  }

  async updateStatus(id: string, payload: MerchantStatusUpdate): Promise<Either<Failure, Merchant>> {
    return executeAdminMutation(
      () => apiClient.put<Merchant>(API_PATHS.ADMIN_MERCHANT_STATUS(id), payload),
      [
        adminQueryKeys.merchants.all,
        adminQueryKeys.merchants.detail(id),
        adminQueryKeys.dashboard.all
      ]
    );
  }

  async updateVerification(id: string, payload: MerchantVerificationUpdate): Promise<Either<Failure, Merchant>> {
    // O endpoint espera { verificationStatus, notes } com os valores do enum do
    // backend (VERIFIED/REJECTED), não o { status: APPROVED } do domínio do admin.
    const body = {
      verificationStatus: payload.status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
      notes: payload.notes
    };
    return executeAdminMutation(
      () => apiClient.put<Merchant>(API_PATHS.ADMIN_MERCHANT_VERIFICATION(id), body),
      [
        adminQueryKeys.merchants.all,
        adminQueryKeys.merchants.detail(id),
        adminQueryKeys.merchants.documents(id),
        adminQueryKeys.dashboard.all
      ]
    );
  }

  async updateSettings(id: string, payload: MerchantSettingsUpdate): Promise<Either<Failure, Merchant>> {
    return executeAdminMutation(
      () => apiClient.put<Merchant>(API_PATHS.ADMIN_MERCHANT_SETTINGS(id), payload),
      [
        adminQueryKeys.merchants.all,
        adminQueryKeys.merchants.detail(id)
      ]
    );
  }

  async getDocuments(id: string): Promise<Either<Failure, MerchantDocument[]>> {
    return fetchAdminQuery(
      adminQueryKeys.merchants.documents(id),
      () => apiClient.get<MerchantDocument[]>(API_PATHS.ADMIN_MERCHANT_DOCUMENTS(id))
    );
  }

  async getCredentials(id: string): Promise<Either<Failure, MerchantCredential[]>> {
    return fetchAdminQuery(
      adminQueryKeys.merchants.credentials(id),
      () => apiClient.get<MerchantCredential[]>(API_PATHS.ADMIN_MERCHANT_CREDENTIALS(id))
    );
  }

  async createCredential(id: string, payload: CreateCredentialPayload): Promise<Either<Failure, MerchantCredentialCreated>> {
    return executeAdminMutation(
      () => apiClient.post<MerchantCredentialCreated>(API_PATHS.ADMIN_MERCHANT_CREDENTIALS(id), payload),
      [
        adminQueryKeys.merchants.credentials(id),
        adminQueryKeys.merchants.detail(id)
      ]
    );
  }

  async listTenants(): Promise<Either<Failure, Tenant[]>> {
    const result = await fetchAdminQuery(
      adminQueryKeys.merchants.tenants(),
      () => apiClient.get<unknown>(API_PATHS.ADMIN_TENANTS)
    );

    // ADMIN_TENANTS responde como coleção paginada ({ data: { items } }),
    // não como array puro; normalizamos para extrair os itens.
    return result.ok
      ? { ok: true, value: normalizeArrayResponse<Tenant>(result.value) }
      : result;
  }
}
