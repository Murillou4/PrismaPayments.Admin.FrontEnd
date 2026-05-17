export type WithdrawalStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface WithdrawalRecipient {
  pixKey: string;
  pixKeyType: string;
  name: string;
  documentNumber: string;
}

export interface Withdrawal {
  id: string; merchantId: string; externalId: string | null; providerName: string | null;
  status: WithdrawalStatus; amount: number; feeAmount: number; netAmount: number; currency: string;
  recipient: WithdrawalRecipient;
  completedAt: string | null; failedAt: string | null; failureReason: string | null;
  createdAt: string; updatedAt: string;
}

export interface PaginatedWithdrawals { items: Withdrawal[]; total: number; skip: number; limit: number; }
export interface ListWithdrawalsParams { page?: number; limit?: number; merchantId?: string; status?: WithdrawalStatus | ''; }
