import type { Either, Failure } from '$core/error/Failure';
import { left, ValidationFailure } from '$core/error/Failure';
import type { FeeRepository } from '../data/repositories/FeeRepository';
import type {
  FeeRule,
  FeeRuleList,
  FeeRulePayload,
  FeeSimulationPayload,
  FeeSimulationResult
} from '../domain/entities/Fee';

export class FeeService {
  constructor(private readonly repo: FeeRepository) {}

  list(page?: number, pageSize?: number): Promise<Either<Failure, FeeRuleList>> {
    return this.repo.list(page, pageSize);
  }

  create(payload: FeeRulePayload): Promise<Either<Failure, FeeRule>> {
    const valid = payload.percentageRate >= 0 && payload.fixedAmount >= 0;
    if (!valid) return Promise.resolve(left(new ValidationFailure('Taxas nao podem ser negativas.')));
    return this.repo.create(payload);
  }

  update(id: string, payload: Partial<FeeRulePayload>): Promise<Either<Failure, FeeRule>> {
    return this.repo.update(id, payload);
  }

  delete(id: string): Promise<Either<Failure, void>> {
    return this.repo.delete(id);
  }

  simulate(payload: FeeSimulationPayload): Promise<Either<Failure, FeeSimulationResult>> {
    if (payload.amount <= 0) {
      return Promise.resolve(left(new ValidationFailure('Informe um valor maior que zero.')));
    }
    return this.repo.simulate(payload);
  }
}
