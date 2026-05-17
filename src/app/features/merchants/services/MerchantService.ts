import type { Either, Failure } from '$core/error/Failure';
import { right } from '$core/error/Failure';
import type { MerchantRepository } from '../data/repositories/MerchantRepository';
import type {
  PaginatedMerchants,
  Merchant,
  MerchantDocument,
  MerchantCredential,
  MerchantCredentialCreated,
  Tenant,
  CreateMerchantPayload,
  MerchantStatusUpdate,
  MerchantVerificationUpdate,
  MerchantSettingsUpdate,
  CreateCredentialPayload,
  ListMerchantsParams
} from '../domain/entities/Merchant';

export class MerchantService {
  constructor(private readonly repo: MerchantRepository) {}

  async listMerchants(params: ListMerchantsParams): Promise<Either<Failure, PaginatedMerchants>> {
    return this.repo.listMerchants(params);
  }

  async getById(id: string): Promise<Either<Failure, Merchant>> {
    return this.repo.getById(id);
  }

  async create(payload: CreateMerchantPayload): Promise<Either<Failure, Merchant>> {
    return this.repo.create(payload);
  }

  async updateStatus(id: string, payload: MerchantStatusUpdate): Promise<Either<Failure, Merchant>> {
    return this.repo.updateStatus(id, payload);
  }

  async updateVerification(id: string, payload: MerchantVerificationUpdate): Promise<Either<Failure, Merchant>> {
    return this.repo.updateVerification(id, payload);
  }

  async updateSettings(id: string, payload: MerchantSettingsUpdate): Promise<Either<Failure, Merchant>> {
    return this.repo.updateSettings(id, payload);
  }

  async getDocuments(id: string): Promise<Either<Failure, MerchantDocument[]>> {
    return this.repo.getDocuments(id);
  }

  async getCredentials(id: string): Promise<Either<Failure, MerchantCredential[]>> {
    return this.repo.getCredentials(id);
  }

  async createCredential(id: string, payload: CreateCredentialPayload): Promise<Either<Failure, MerchantCredentialCreated>> {
    return this.repo.createCredential(id, payload);
  }

  async listTenants(): Promise<Either<Failure, Tenant[]>> {
    return this.repo.listTenants();
  }

  /**
   * Retorna a contagem de merchants com verification=PENDING_REVIEW.
   * Usa listMerchants com limit=1 e extrai o total da paginação.
   */
  async getPendingKYCCount(): Promise<Either<Failure, number>> {
    const result = await this.repo.listMerchants({
      verification: 'PENDING_REVIEW',
      limit: 1,
      page: 1
    });
    if (result.ok) {
      return right(result.value.total);
    }
    return result;
  }
}
