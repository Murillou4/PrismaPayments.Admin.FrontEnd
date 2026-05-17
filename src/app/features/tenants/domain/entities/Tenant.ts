export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface TenantBranding {
  displayName?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  surfaceColor?: string | null;
  textColor?: string | null;
  mutedTextColor?: string | null;
  fontFamily?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  websiteUrl?: string | null;
  checkoutHeadline?: string | null;
  checkoutDescription?: string | null;
  customCss?: string | null;
  customDomain?: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  clientKey?: string | null;
  clientSecretLast4?: string | null;
  branding?: TenantBranding | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCreated extends Tenant {
  clientSecret?: string | null;
}

export interface TenantCollection {
  items: Tenant[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface ListTenantsParams {
  page?: number;
  limit?: number;
  status?: TenantStatus | '';
}

export interface TenantFormPayload {
  name: string;
  slug: string;
  status?: TenantStatus;
  branding: TenantBranding;
  logo?: File | null;
  favicon?: File | null;
}
