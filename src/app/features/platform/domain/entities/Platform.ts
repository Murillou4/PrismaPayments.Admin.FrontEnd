export interface AdminCurrentUser {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  tenantId?: string | null;
  tenantName?: string | null;
  twoFactorEnabled?: boolean;
}

export interface SearchResultItem {
  type?: string | null;
  id?: string | null;
  label?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface SearchResponse {
  query?: string | null;
  items?: SearchResultItem[] | null;
  total: number;
}

export interface PlatformConfig {
  appName?: string | null;
  environment?: string | null;
  version?: string | null;
  apiPrefix?: string | null;
  diagnosticsEnabled?: boolean;
  backgroundWorkersDisabled?: boolean;
  features?: Record<string, unknown> | null;
  limits?: Record<string, unknown> | null;
  counters?: Record<string, unknown> | null;
  providers?: Array<Record<string, unknown>> | null;
}

export interface RateLimitStatus {
  enabled: boolean;
  globallyDisabled?: boolean;
  ttlMinutes?: number | null;
  disabledUntil?: string | null;
  autoReenableInMinutes?: number | null;
  reason?: string | null;
  message?: string | null;
}

export interface ToggleRateLimitPayload {
  enabled: boolean;
  ttlMinutes?: number | null;
}
