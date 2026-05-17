export interface PaymentProvider {
  id: string;
  name: string;
  displayName?: string | null;
  providerType?: string | null;
  isActive: boolean;
  supportedMethods?: string[] | null;
  healthStatus?: string | null;
  lastHealthCheck?: string | null;
  priorities?: Array<{
    paymentMethod?: string | null;
    priority?: number | null;
    isActive?: boolean | null;
  }> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProviderCollection {
  items: PaymentProvider[];
  total: number;
}
