import type { AuditRepository } from '../data/repositories/AuditRepository';
import type { AuditFilters } from '../domain/entities/Audit';

export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  list(filters?: AuditFilters) {
    return this.repo.list(filters);
  }
}
