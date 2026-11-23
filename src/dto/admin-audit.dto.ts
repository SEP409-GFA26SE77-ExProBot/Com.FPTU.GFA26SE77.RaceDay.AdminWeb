/** Audit log — khớp GET /api/v1/audit-logs?page=&pageSize= */

export interface AuditEntryDto {
  id: string;
  action: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  payloadJson?: string | null;
  occurredOnUtc: string;
}

export interface PagedAuditEntriesResult {
  items: AuditEntryDto[];
  total: number;
  page: number;
  pageSize: number;
}
