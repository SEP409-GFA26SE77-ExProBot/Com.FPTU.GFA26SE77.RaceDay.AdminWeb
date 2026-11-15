import api from "@/config/axios";
import type { AdminDashboardDto } from "@/dto/dashboard.dto";
import type { DateRange } from "@/lib/dashboard";

export function getAdminDashboard(
  range: DateRange,
): Promise<AdminDashboardDto> {
  return api.get("api/v1/iam/admin/dashboard", { params: range });
}
