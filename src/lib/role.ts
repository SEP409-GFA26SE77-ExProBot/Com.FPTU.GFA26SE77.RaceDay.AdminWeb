import { Role } from "@/interfaces/role";

/** BE/IAM đôi khi trả "USER" — map về Role app (cùng User FE). */
export function mapAppRole(raw: string | null | undefined): string {
  if (!raw || !String(raw).trim()) return Role.RUNNER;
  const r = String(raw)
    .trim()
    .replace(/^ROLE_/i, "")
    .toUpperCase();
  if (r === "USER" || r === "CUSTOMER" || r === "MEMBER") return Role.RUNNER;
  if (r === "RACE-STAFF" || r === "RACESTAFF" || r === "RACE_STAFF") return Role.RACE_STAFF;
  return r;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return mapAppRole(role) === Role.ADMIN;
}
