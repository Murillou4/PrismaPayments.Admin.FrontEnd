export type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD';
export type PaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';

export interface PaymentPixInfo { qrCode: string; qrCodeUrl: string | null; }
export interface PaymentBoletoInfo { barcode: string; boletoUrl: string | null; dueDate: string; }
export interface PaymentCardInfo { lastFourDigits: string; brand: string; installments: number; }
export interface PaymentPayer { name: string; maskedDocument: string; email: string | null; phone: string | null; }

export interface Payment {
  id: string; merchantId: string; method: PaymentMethod; status: PaymentStatus;
  amount: number; feeAmount: number; netAmount: number; currency: string;
  description: string | null; isTest: boolean;
  pix: PaymentPixInfo | null; boleto: PaymentBoletoInfo | null; card: PaymentCardInfo | null;
  payer: PaymentPayer | null;
  expiresAt: string | null; paidAt: string | null; failedAt: string | null; failureReason: string | null;
  metadata: Record<string, string> | null;
  createdAt: string; updatedAt: string;
}

export interface PaginatedPayments { items: Payment[]; total: number; skip: number; limit: number; }
export interface ListPaymentsParams { page?: number; limit?: number; merchantId?: string; status?: PaymentStatus | ''; method?: PaymentMethod | ''; }
