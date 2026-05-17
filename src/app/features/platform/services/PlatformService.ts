import type { PlatformRepository } from '../data/repositories/PlatformRepository';
import type { ToggleRateLimitPayload } from '../domain/entities/Platform';

export class PlatformService {
  constructor(private readonly repo: PlatformRepository) {}

  me() {
    return this.repo.me();
  }

  search(q: string, limit?: number) {
    return this.repo.search(q, limit);
  }

  config() {
    return this.repo.config();
  }

  rateLimit() {
    return this.repo.rateLimit();
  }

  toggleRateLimit(payload: ToggleRateLimitPayload) {
    return this.repo.toggleRateLimit(payload);
  }
}
