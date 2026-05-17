import type { Either, Failure } from '$core/error/Failure';
import type { WithdrawalRepository } from '../data/repositories/WithdrawalRepository';
import type {
  PaginatedWithdrawals,
  Withdrawal,
  ListWithdrawalsParams
} from '../domain/entities/Withdrawal';

export class WithdrawalService {
  constructor(private readonly repo: WithdrawalRepository) {}

  async listWithdrawals(params: ListWithdrawalsParams): Promise<Either<Failure, PaginatedWithdrawals>> {
    return this.repo.listWithdrawals(params);
  }

  async getById(id: string): Promise<Either<Failure, Withdrawal>> {
    return this.repo.getById(id);
  }
}
