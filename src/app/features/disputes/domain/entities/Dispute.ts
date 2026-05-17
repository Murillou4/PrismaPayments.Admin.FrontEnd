export type DisputeType   = 'MED' | 'CHARGEBACK' | 'REFUND_REQUEST';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';

export interface Dispute {
  id: string;
  paymentId: string;
  merchantId: string;
  disputeType: DisputeType;
  status: DisputeStatus;
  amount: number;           // centavos — use formatCurrency()
  reason: string | null;
  resolution: string | null;
  externalId: string | null;
  openedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDisputes {
  items: Dispute[];
  total: number;
  skip: number;
  limit: number;
}

export interface ListDisputesParams {
  page?: number;
  limit?: number;
  status?: DisputeStatus | '';
  disputeType?: DisputeType | '';
  merchantId?: string;
}

export interface ResolveDisputePayload {
  resolution: string;
  status: 'ACCEPTED' | 'REJECTED' | 'RESOLVED';
}
