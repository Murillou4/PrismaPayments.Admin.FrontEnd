import type { Either, Failure } from '$core/error/Failure';
import type { PaymentRepository } from '../data/repositories/PaymentRepository';
import type {
  PaginatedPayments,
  Payment,
  ListPaymentsParams
} from '../domain/entities/Payment';

export class PaymentService {
  constructor(private readonly repo: PaymentRepository) {}

  async listPayments(params: ListPaymentsParams): Promise<Either<Failure, PaginatedPayments>> {
    return this.repo.listPayments(params);
  }

  async getById(id: string): Promise<Either<Failure, Payment>> {
    return this.repo.getById(id);
  }
}
