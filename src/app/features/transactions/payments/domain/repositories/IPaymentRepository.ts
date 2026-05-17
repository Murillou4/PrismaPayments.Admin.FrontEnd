import type { Either, Failure } from '$core/error/Failure';
import type { PaginatedPayments, Payment, ListPaymentsParams } from '../entities/Payment';

export interface IPaymentRepository {
  listPayments(params: ListPaymentsParams): Promise<Either<Failure, PaginatedPayments>>;
  getById(id: string): Promise<Either<Failure, Payment>>;
}
