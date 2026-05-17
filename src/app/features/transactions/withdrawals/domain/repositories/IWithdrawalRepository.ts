import type { Either, Failure } from '$core/error/Failure';
import type { PaginatedWithdrawals, Withdrawal, ListWithdrawalsParams } from '../entities/Withdrawal';

export interface IWithdrawalRepository {
  listWithdrawals(params: ListWithdrawalsParams): Promise<Either<Failure, PaginatedWithdrawals>>;
  getById(id: string): Promise<Either<Failure, Withdrawal>>;
}
