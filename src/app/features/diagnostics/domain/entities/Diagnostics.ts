export interface DiagnosticLogListItem {
  id: string;
  traceId?: string | null;
  flowId?: string | null;
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
  tenantId?: string | null;
  authResourceType?: string | null;
  authResourceId?: string | null;
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
  flowId?: string;
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

export interface FlowGraph {
  flowId: string;
  startedAt?: string | null;
  lastSeenAt?: string | null;
  nodes: FlowGraphNode[];
  edges: FlowGraphEdge[];
  resources: FlowGraphResource[];
}

export interface FlowGraphNode {
  id: string;
  type: string;
  label: string;
  resourceType?: string | null;
  resourceId?: string | null;
  status?: string | null;
  severity?: string | null;
  timestamp: string;
  metadata: Record<string, string | null | undefined>;
}

export interface FlowGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
}

export interface FlowGraphResource {
  resourceType: string;
  resourceId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  states: FlowGraphResourceState[];
}

export interface FlowGraphResourceState {
  nodeId: string;
  type: string;
  status?: string | null;
  severity?: string | null;
  timestamp: string;
  label: string;
}
