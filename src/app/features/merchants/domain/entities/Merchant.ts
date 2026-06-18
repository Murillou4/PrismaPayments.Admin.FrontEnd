// Enums / union types
export type MerchantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED';

export type DocumentType =
  | 'IDENTITY_FRONT'
  | 'IDENTITY_BACK'
  | 'SELFIE'
  | 'PROOF_OF_ADDRESS'
  | 'ARTICLES_OF_INCORPORATION'
  | 'OTHER';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CredentialEnvironment = 'LIVE' | 'TEST';

export type DocumentNumber = 'CPF' | 'CNPJ';

// ── List item (usado na tabela da lista) ──────────────────────
export interface MerchantListItem {
  id: string;
  legalName: string;
  tradeName: string | null;
  documentNumber: string;
  documentType: DocumentNumber;
  email: string;
  status: MerchantStatus;
  verificationStatus: VerificationStatus;
  createdAt: string; // ISO string
}

// ── Balance (sub-objeto do detalhe) ───────────────────────────
export interface MerchantBalance {
  available: number;  // em centavos
  pending: number;
  reserved: number;
}

// ── Settings (sub-objeto do detalhe) ──────────────────────────
export interface MerchantSettings {
  webhookUrl: string | null;
  webhookEnabled?: boolean;
  webhookSecretConfigured?: boolean;
  twoFactorEnabled?: boolean;
  dailyWithdrawalLimit: number | null; // em centavos
  autoWithdrawalEnabled: boolean;
  autoWithdrawalThreshold?: number | null; // em centavos
  defaultPayoutDestinationId?: string | null;
  payoutDestinationCount?: number;
}

// ── Detalhe completo (GET /admin/merchants/{id}) ──────────────
export interface Merchant {
  id: string;
  legalName: string;
  tradeName: string | null;
  documentNumber: string;
  documentType: DocumentNumber;
  email: string;
  phone: string | null;
  status: MerchantStatus;
  verificationStatus: VerificationStatus;
  tenantId: string;
  balance: MerchantBalance;
  settings: MerchantSettings;
  createdAt: string;
  updatedAt: string;
}

// ── KYC Documents ─────────────────────────────────────────────
export interface MerchantDocument {
  id: string;
  documentType: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  notes: string | null;
  createdAt: string;
}

// ── Credentials ───────────────────────────────────────────────
export interface MerchantCredential {
  id: string;
  label: string;
  publicKey: string;
  secretKeyLast4: string;
  environment: CredentialEnvironment;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

/** Retornado apenas na criação — secretKey visível uma única vez */
export interface MerchantCredentialCreated extends MerchantCredential {
  secretKey: string;
}

// ── Tenant ────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
}

// ── Paginação ─────────────────────────────────────────────────
export interface PaginatedMerchants {
  items: MerchantListItem[];
  total: number;
  skip: number;
  limit: number;
}

// ── Payloads de mutação ───────────────────────────────────────
export interface CreateMerchantPayload {
  legalName: string;
  tradeName?: string;
  documentNumber: string;
  documentType: DocumentNumber;
  email: string;
  phone?: string;
  password: string;
  tenantId: string;
  status?: MerchantStatus;
  verificationStatus?: VerificationStatus;
}

export interface MerchantStatusUpdate {
  status: MerchantStatus;
  reason: string;
}

export interface MerchantVerificationUpdate {
  status: 'APPROVED' | 'REJECTED';
  notes: string;
}

export interface MerchantSettingsUpdate {
  webhookUrl?: string;
  twoFactorEnabled?: boolean;
  dailyWithdrawalLimit?: number;
  autoWithdrawalEnabled?: boolean;
  autoWithdrawalThreshold?: number;
}

export interface CreateCredentialPayload {
  label: string;
  environment: CredentialEnvironment;
}

export interface ListMerchantsParams {
  page?: number;
  limit?: number;
  status?: MerchantStatus | 'ALL';
  verification?: VerificationStatus | 'ALL';
  search?: string;
}
