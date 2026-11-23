import type { StaffAthlete } from "@/api/staff-simulation";

export const journalKindLabels: Record<string, string> = {
  DNS_RECORDED: "Ghi DNS", DNF_RECORDED: "Ghi DNF", DQ_RECORDED: "Ghi DQ trực tiếp",
  DQ_REPORTED: "Gửi báo cáo DQ", DQ_APPROVED: "Duyệt DQ", DQ_REJECTED: "Từ chối DQ",
  CHECKPOINT_SUBMITTED: "Gửi báo cáo checkpoint",
};
export function checkpointStats(athletes: StaffAthlete[]) {
  return {
    total: athletes.length,
    passed: athletes.filter(a => a.passedAtSeconds != null).length,
    approaching: athletes.filter(a => a.passedAtSeconds == null && a.motion === "Racing").length,
    stoppedBefore: athletes.filter(a => a.passedAtSeconds == null && ["Dnf", "Dns", "Dq"].includes(a.motion)).length,
  };
}
export function matchesCheckpointFilter(a: StaffAthlete, filter: string) {
  switch (filter) {
    case "segment": return a.isInAssignedSegment;
    case "approaching": return a.passedAtSeconds == null && a.motion === "Racing";
    case "passed": return a.passedAtSeconds != null;
    case "stopped": return ["Dnf", "Dns", "Dq"].includes(a.motion);
    case "pending": return a.hasPendingDq;
    default: return true;
  }
}
export function checkpointAccessLost(error: unknown): boolean {
  const e = error as { status?: number; response?: { status?: number; data?: unknown }; message?: string };
  return [401, 403].includes(e?.response?.status ?? e?.status ?? 0)
    || (e?.message ?? "").includes("CHECKPOINT_ACCESS_DENIED:")
    || JSON.stringify(e?.response?.data ?? "").includes("CHECKPOINT_ACCESS_DENIED:");
}
