export interface AdminMetrics {
  totalVolume: number;
  totalTransactions: number;
  todayVolume: number;
  todayTransactions: number;
  availableBalance: number;
  pendingBalance: number;
  totalFeesCollected: number;
  totalMerchants: number;
  // DASH-03: alert counts
  openDisputes: number;
  pendingKycCount: number;
}
