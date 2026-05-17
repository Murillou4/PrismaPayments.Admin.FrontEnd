// ── Filtros ────────────────────────────────────────────
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'PROCESSING' | 'CREATED' | 'REFUNDED' | 'CANCELLED';
export type WithdrawalStatus = 'COMPLETED' | 'PROCESSING' | 'FAILED';
export type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD';
export type MerchantStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface AdminDashboardFilters {
  startDate?: string;       // yyyy-MM-dd
  endDate?: string;         // yyyy-MM-dd
  paymentStatus?: PaymentStatus;
  withdrawalStatus?: WithdrawalStatus;
  method?: PaymentMethod;
  currency?: string;
  // admin-only
  merchantId?: string;
  merchantStatus?: MerchantStatus;
  verificationStatus?: string;
  disputeStatus?: string;
  disputeType?: string;
  providerName?: string;
  // paginação
  skip?: number;
  limit?: number;
}

// ── Paginação ──────────────────────────────────────────
export interface PaginationInfo {
  skip: number;
  limit: number;
}

// ── Items ──────────────────────────────────────────────
export interface PaymentItem {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  merchantId?: string; // admin only
}

export interface WithdrawalItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  merchantId?: string; // admin only
}

export interface DisputeItem {
  id: string;
  paymentId: string;
  merchantId: string;
  amount: number;
  status: string;
  disputeType: string;
  openedAt: string;
}

export interface MerchantSummaryItem {
  id: string;
  tenantId: string;
  tradeName: string;
  status: string;
  verificationStatus: string;
  createdAt: string;
}

export interface WebhookFailureItem {
  id: string;
  merchantId: string;
  eventType: string;
  responseStatus: number;
  createdAt: string;
}

export interface MethodBreakdown {
  method: string;
  total: number;
  paid: number;
  amount: number;
}

// ── Seções da resposta ─────────────────────────────────
export interface PaymentsSection {
  total: number;
  paid: number;
  failed: number;
  processing: number;
  volume: number;
  methodBreakdown?: MethodBreakdown[];
  items: PaymentItem[];
}

export interface WithdrawalsSection {
  total: number;
  processing: number;
  failed: number;
  todayVolume: number;
  items: WithdrawalItem[];
}

export interface DisputesSection {
  total: number;
  open: number;
  items: DisputeItem[];
}

export interface MerchantsSection {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  pendingVerification: number;
  items: MerchantSummaryItem[];
}

export interface WebhookFailuresSection {
  total: number;
  items: WebhookFailureItem[];
}

// ── Providers ─────────────────────────────────────────
export interface ProviderItem {
  id: string;
  name: string;
  displayName: string;
  healthStatus: string;
  lastHealthCheck?: string;
  supportedMethods: string[];
}

export interface ProvidersSection {
  total: number;
  active: number;
  unhealthy: number;
  items: ProviderItem[];
}

// ── Queues ────────────────────────────────────────────
export interface QueuesSection {
  pendingMerchantVerification: number;
  failedWebhooks: number;
  openDisputes: number;
  failedPayments: number;
}

// ── Resposta completa ──────────────────────────────────
export interface AdminDashboardResponse {
  filters: Record<string, string>;
  pagination: PaginationInfo;
  payments: PaymentsSection;
  withdrawals: WithdrawalsSection;
  disputes: DisputesSection;
  merchants: MerchantsSection;
  providers: ProvidersSection;
  queues: QueuesSection;
  webhookFailures: WebhookFailuresSection;
}
