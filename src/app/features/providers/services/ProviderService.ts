import type { ProviderRepository } from '../data/repositories/ProviderRepository';

export class ProviderService {
  constructor(private readonly repo: ProviderRepository) {}

  list() {
    return this.repo.list();
  }
}
