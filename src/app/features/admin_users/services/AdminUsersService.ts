import type { Either, Failure } from '$core/error/Failure';
import { left, ValidationFailure } from '$core/error/Failure';
import type { IAdminUsersRepository } from '../domain/repositories/IAdminUsersRepository';
import type {
  AdminUser,
  AdminUserCollection,
  CreateAdminUserPayload,
  ListAdminUsersParams,
  UpdateAdminUserPayload
} from '../domain/entities/AdminUser';

export class AdminUsersService {
  constructor(private readonly repo: IAdminUsersRepository) {}

  list(params?: ListAdminUsersParams): Promise<Either<Failure, AdminUserCollection>> {
    return this.repo.list(params);
  }

  create(payload: CreateAdminUserPayload): Promise<Either<Failure, AdminUser>> {
    if (!payload.name.trim() || !payload.email.trim() || !payload.password.trim()) {
      return Promise.resolve(left(new ValidationFailure('Preencha nome, e-mail e senha.')));
    }
    return this.repo.create(payload);
  }

  update(id: string, payload: UpdateAdminUserPayload): Promise<Either<Failure, AdminUser>> {
    return this.repo.update(id, payload);
  }

  deactivate(id: string): Promise<Either<Failure, void>> {
    return this.repo.deactivate(id);
  }
}
