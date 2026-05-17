export interface DiagnosticLogListItem {
  id: string;
  traceId?: string | null;
  level?: string | null;
  method?: string | null;
  path?: string | null;
  statusCode: number;
  durationMs: number;
  merchantId?: string | null;
  clientIp?: string | null;
  hasError?: boolean;
  errorMessage?: string | null;
  createdAt: string;
}

export interface DiagnosticLogDetail extends DiagnosticLogListItem {
  queryString?: string | null;
  requestHeaders?: Record<string, string> | null;
  requestBody?: string | null;
  responseBody?: string | null;
  userId?: string | null;
  userAgent?: string | null;
  error?: {
    message?: string | null;
    stackTrace?: string | null;
    type?: string | null;
  } | null;
}

export interface DiagnosticsList {
  items: DiagnosticLogListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface DiagnosticsStats {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgResponseTimeMs: number;
  statusCodeDistribution?: Record<string, number> | null;
  topFailingEndpoints?: Array<{ method?: string | null; path?: string | null; count: number }> | null;
}

export interface DiagnosticsFilters {
  dateFrom?: string;
  dateTo?: string;
  level?: string;
  statusCode?: number | null;
  method?: string;
  path?: string;
  traceId?: string;
  merchantId?: string;
  hasError?: boolean | null;
  page?: number;
  limit?: number;
}

export interface PurgeResult {
  deleted?: number;
  cutoff?: string;
  deletedCount?: number;
  cutoffUtc?: string;
  retentionDays?: number;
}
