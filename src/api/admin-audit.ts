/** Admin audit trail — GET /api/v1/audit-logs?page=&pageSize= */
import api from "@/config/axios";
import type { PagedAuditEntriesResult } from "@/dto/admin-audit.dto";

export async function listPagedAuditEntries(
  page = 1,
  pageSize = 10
): Promise<PagedAuditEntriesResult> {
  const data = (await api.get("api/v1/audit-logs", {
    params: { page, pageSize },
  })) as PagedAuditEntriesResult;
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number(data?.total ?? 0),
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}
