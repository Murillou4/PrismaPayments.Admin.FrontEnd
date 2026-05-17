export type FeeType = 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'WITHDRAWAL' | 'ANTICIPATION';
export type FeeCalculation = 'PERCENTAGE' | 'FIXED' | 'PERCENTAGE_PLUS_FIXED';

export interface FeeRule {
  id: string;
  tenantId?: string | null;
  merchantId?: string | null;
  feeType: FeeType;
  calculation: FeeCalculation;
  percentageRate: number;
  fixedAmount: number;
  minFee?: number | null;
  maxFee?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeRuleList {
  items: FeeRule[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface FeeRulePayload {
  merchantId?: string | null;
  feeType: FeeType;
  calculation: FeeCalculation;
  percentageRate: number;
  fixedAmount: number;
  minFee?: number | null;
  maxFee?: number | null;
  isActive?: boolean | null;
}

export interface FeeSimulationPayload {
  feeType: FeeType;
  amount: number;
  merchantId?: string | null;
}

export interface FeeSimulationResult {
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  ruleId?: string | null;
  calculationType?: string | null;
}
