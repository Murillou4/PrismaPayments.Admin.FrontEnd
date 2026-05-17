import type { Either, Failure } from '$core/error/Failure';
import { left, ValidationFailure } from '$core/error/Failure';
import type { IAuthRepository } from '../domain/repositories/IAuthRepository';
import { validateLogin, hasErrors } from '../validators/authValidator';
import type { MessageResponse, TwoFactorSetup } from '../domain/entities/AuthSecurity';

export class AuthService {
  constructor(private readonly repo: IAuthRepository) {}

  async login(email: string, password: string): Promise<Either<Failure, void>> {
    const errors = validateLogin(email, password);
    if (hasErrors(errors)) {
      const firstError = Object.values(errors)[0]!;
      return left(new ValidationFailure(firstError));
    }

    const result = await this.repo.login(email, password);
    if (!result.ok) return result;

    return { ok: true, value: undefined };
  }

  logout(): void {}

  setupTwoFactor(): Promise<Either<Failure, TwoFactorSetup>> {
    return this.repo.setupTwoFactor();
  }

  verifyTwoFactor(code: string): Promise<Either<Failure, MessageResponse>> {
    if (!/^\d{6}$/.test(code.trim())) {
      return Promise.resolve(left(new ValidationFailure('Informe o codigo de 6 digitos.')));
    }
    return this.repo.verifyTwoFactor(code.trim());
  }

  disableTwoFactor(code: string): Promise<Either<Failure, MessageResponse>> {
    if (!/^\d{6}$/.test(code.trim())) {
      return Promise.resolve(left(new ValidationFailure('Informe o codigo de 6 digitos.')));
    }
    return this.repo.disableTwoFactor(code.trim());
  }

  isAuthenticated(): boolean {
    return false;
  }
}
