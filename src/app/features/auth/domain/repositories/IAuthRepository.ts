import type { Either, Failure } from '$core/error/Failure';
import type { AuthTokens } from '../entities/AdminUser';
import type { MessageResponse, TwoFactorSetup } from '../entities/AuthSecurity';

export interface IAuthRepository {
  login(email: string, password: string): Promise<Either<Failure, AuthTokens>>;
  setupTwoFactor(): Promise<Either<Failure, TwoFactorSetup>>;
  verifyTwoFactor(code: string): Promise<Either<Failure, MessageResponse>>;
  disableTwoFactor(code: string): Promise<Either<Failure, MessageResponse>>;
  logout(): void;
}
