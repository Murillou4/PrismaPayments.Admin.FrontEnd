import type { DiagnosticsRepository } from '../data/repositories/DiagnosticsRepository';
import type { DiagnosticsFilters } from '../domain/entities/Diagnostics';

export class DiagnosticsService {
  constructor(private readonly repo: DiagnosticsRepository) {}

  list(filters?: DiagnosticsFilters) {
    return this.repo.list(filters);
  }

  stats(filters?: DiagnosticsFilters) {
    return this.repo.stats(filters);
  }

  getById(id: string) {
    return this.repo.getById(id);
  }

  getTrace(traceId: string) {
    return this.repo.getTrace(traceId);
  }

  purge(olderThanDays: number) {
    return this.repo.purge(olderThanDays);
  }
}
