import type { Either, Failure } from '$core/error/Failure';
import type { Dispute, PaginatedDisputes, ListDisputesParams, ResolveDisputePayload } from '../entities/Dispute';

export interface IDisputeRepository {
  listDisputes(params: ListDisputesParams): Promise<Either<Failure, PaginatedDisputes>>;
  getById(id: string): Promise<Either<Failure, Dispute>>;
  resolveDispute(id: string, payload: ResolveDisputePayload): Promise<Either<Failure, Dispute>>;
}
