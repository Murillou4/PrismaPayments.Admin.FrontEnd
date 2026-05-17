import type { Either, Failure } from '$core/error/Failure';
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
} from '../entities/Merchant';

export interface IMerchantRepository {
  listMerchants(params: ListMerchantsParams): Promise<Either<Failure, PaginatedMerchants>>;
  getById(id: string): Promise<Either<Failure, Merchant>>;
  create(payload: CreateMerchantPayload): Promise<Either<Failure, Merchant>>;
  updateStatus(id: string, payload: MerchantStatusUpdate): Promise<Either<Failure, Merchant>>;
  updateVerification(id: string, payload: MerchantVerificationUpdate): Promise<Either<Failure, Merchant>>;
  updateSettings(id: string, payload: MerchantSettingsUpdate): Promise<Either<Failure, Merchant>>;
  getDocuments(id: string): Promise<Either<Failure, MerchantDocument[]>>;
  getCredentials(id: string): Promise<Either<Failure, MerchantCredential[]>>;
  createCredential(id: string, payload: CreateCredentialPayload): Promise<Either<Failure, MerchantCredentialCreated>>;
  listTenants(): Promise<Either<Failure, Tenant[]>>;
}
