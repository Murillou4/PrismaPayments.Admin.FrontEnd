export interface AuditTimelineItem {
  id: string;
  tenantId?: string | null;
  actorType?: string | null;
  actorId?: string | null;
  action?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  traceId?: string | null;
  createdAt: string;
}

export interface AuditTimeline {
  items: AuditTimelineItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditFilters {
  actorType?: string;
  action?: string;
  page?: number;
  limit?: number;
}
