import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import type {
  ListTenantsParams,
  Tenant,
  TenantCollection,
  TenantCreated,
  TenantFormPayload
} from '../../domain/entities/Tenant';

function tenantFormData(payload: TenantFormPayload, partial = false): FormData {
  const form = new FormData();
  if (!partial || payload.name) form.append('name', payload.name);
  if (!partial || payload.slug) form.append('slug', payload.slug);
  if (payload.status) form.append('status', payload.status);

  for (const [key, value] of Object.entries(payload.branding ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(`branding.${key}`, String(value));
    }
  }
  if (payload.logo) form.append('branding.logo', payload.logo);
  if (payload.favicon) form.append('branding.favicon', payload.favicon);
  return form;
}

export class TenantRepository {
  async list(params: ListTenantsParams = {}): Promise<Either<Failure, TenantCollection>> {
    const limit = params.limit ?? 20;
    const page = params.page ?? 1;
    return apiResponseToEither(
      await apiClient.get<TenantCollection>(API_PATHS.ADMIN_TENANTS, {
        skip: (page - 1) * limit,
        limit,
        status: params.status || undefined
      })
    );
  }

  async getById(id: string): Promise<Either<Failure, Tenant>> {
    return apiResponseToEither(await apiClient.get<Tenant>(API_PATHS.ADMIN_TENANT(id)));
  }

  async create(payload: TenantFormPayload): Promise<Either<Failure, TenantCreated>> {
    return apiResponseToEither(
      await apiClient.post<TenantCreated>(API_PATHS.ADMIN_TENANTS, tenantFormData(payload))
    );
  }

  async update(id: string, payload: TenantFormPayload): Promise<Either<Failure, Tenant>> {
    return apiResponseToEither(
      await apiClient.put<Tenant>(API_PATHS.ADMIN_TENANT(id), tenantFormData(payload, true))
    );
  }
}
