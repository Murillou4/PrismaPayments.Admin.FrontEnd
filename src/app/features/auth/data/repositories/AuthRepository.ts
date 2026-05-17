import type { Either, Failure } from '$core/error/Failure';
import { apiClient } from '$appmod/services/api/apiClient';
import { apiResponseToEither } from '$appmod/services/api/apiResponse';
import { API_PATHS } from '$core/constants/apiPaths';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import type { AuthTokens } from '../../domain/entities/AdminUser';
import type { MessageResponse, TwoFactorSetup } from '../../domain/entities/AuthSecurity';

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<Either<Failure, AuthTokens>> {
    return apiResponseToEither(
      await apiClient.postPublic<AuthTokens>(
        API_PATHS.AUTH_ADMIN_LOGIN,
        { email, password }
      )
    );
  }

  async setupTwoFactor(): Promise<Either<Failure, TwoFactorSetup>> {
    return apiResponseToEither(
      await apiClient.post<TwoFactorSetup>(API_PATHS.AUTH_ADMIN_2FA_SETUP)
    );
  }

  async verifyTwoFactor(code: string): Promise<Either<Failure, MessageResponse>> {
    return apiResponseToEither(
      await apiClient.post<MessageResponse>(API_PATHS.AUTH_ADMIN_2FA_VERIFY, { code })
    );
  }

  async disableTwoFactor(code: string): Promise<Either<Failure, MessageResponse>> {
    return apiResponseToEither(
      await apiClient.post<MessageResponse>(API_PATHS.AUTH_ADMIN_2FA_DISABLE, { code })
    );
  }

  logout(): void {}
}
