import type { Either, Failure } from '$core/error/Failure';
import type {
  AdminUser,
  AdminUserCollection,
  CreateAdminUserPayload,
  ListAdminUsersParams,
  UpdateAdminUserPayload
} from '../entities/AdminUser';

export interface IAdminUsersRepository {
  list(params?: ListAdminUsersParams): Promise<Either<Failure, AdminUserCollection>>;
  create(payload: CreateAdminUserPayload): Promise<Either<Failure, AdminUser>>;
  update(id: string, payload: UpdateAdminUserPayload): Promise<Either<Failure, AdminUser>>;
  deactivate(id: string): Promise<Either<Failure, void>>;
}
