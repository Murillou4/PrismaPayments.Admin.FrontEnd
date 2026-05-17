import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { API_PATHS } from '$core/constants/apiPaths';
import { adminQueryKeys } from '$appmod/services/cache/adminQueryKeys';
import { executeAdminMutation, fetchAdminQuery } from '$appmod/services/cache/adminQuery';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import type {
  PaginatedMerchants,
  Merchant,
  MerchantDocument,
  MerchantCredential,
  MerchantCredentialCreated,
  Tenant,
  CreateMerchantPayload,
  MerchantStatusUpdate,
  MerchantVerificationUpdate,
  MerchantSettingsUpdate,
  CreateCredentialPayload,
  ListMerchantsParams
} from '../../domain/entities/Merchant';

export class MerchantRepository implements IMerchantRepository {
  async listMerchants(params: ListMerchantsParams): Promise<Either<Failure, PaginatedMerchants>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    return fetchAdminQuery(
      adminQueryKeys.merchants.list(params),
      () => apiClient.get<PaginatedMerchants>(API_PATHS.ADMIN_MERCHANTS, {
        skip,
        limit,
        status: params.status && params.status !== 'ALL' ? params.status : undefined,
        verification: params.verification && params.verification !== 'ALL' ? params.verification : undefined,
        search: params.search
      })
    );
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
    return executeAdminMutation(
      () => apiClient.put<Merchant>(API_PATHS.ADMIN_MERCHANT_VERIFICATION(id), payload),
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
    return fetchAdminQuery(
      adminQueryKeys.merchants.tenants(),
      () => apiClient.get<Tenant[]>(API_PATHS.ADMIN_TENANTS)
    );
  }
}
