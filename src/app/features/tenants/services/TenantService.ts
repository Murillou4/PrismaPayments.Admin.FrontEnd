import type { Either, Failure } from '$core/error/Failure';
import { left, ValidationFailure } from '$core/error/Failure';
import type { TenantRepository } from '../data/repositories/TenantRepository';
import type {
  ListTenantsParams,
  Tenant,
  TenantCollection,
  TenantCreated,
  TenantFormPayload
} from '../domain/entities/Tenant';

export class TenantService {
  constructor(private readonly repo: TenantRepository) {}

  list(params?: ListTenantsParams): Promise<Either<Failure, TenantCollection>> {
    return this.repo.list(params);
  }

  getById(id: string): Promise<Either<Failure, Tenant>> {
    return this.repo.getById(id);
  }

  create(payload: TenantFormPayload): Promise<Either<Failure, TenantCreated>> {
    if (!payload.name.trim() || !payload.slug.trim()) {
      return Promise.resolve(left(new ValidationFailure('Preencha nome e slug do tenant.')));
    }
    return this.repo.create(payload);
  }

  update(id: string, payload: TenantFormPayload): Promise<Either<Failure, Tenant>> {
    return this.repo.update(id, payload);
  }
}
