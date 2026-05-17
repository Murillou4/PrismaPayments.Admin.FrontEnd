import type { Either, Failure } from '$core/error/Failure';
import type { DisputeRepository } from '../data/repositories/DisputeRepository';
import type { Dispute, PaginatedDisputes, ListDisputesParams, ResolveDisputePayload } from '../domain/entities/Dispute';

export class DisputeService {
  constructor(private readonly repo: DisputeRepository) {}

  async listDisputes(params: ListDisputesParams): Promise<Either<Failure, PaginatedDisputes>> {
    return this.repo.listDisputes(params);
  }

  async getById(id: string): Promise<Either<Failure, Dispute>> {
    return this.repo.getById(id);
  }

  async resolveDispute(id: string, payload: ResolveDisputePayload): Promise<Either<Failure, Dispute>> {
    return this.repo.resolveDispute(id, payload);
  }
}
