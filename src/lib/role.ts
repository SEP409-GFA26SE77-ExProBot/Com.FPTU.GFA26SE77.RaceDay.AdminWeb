import { Role } from "@/interfaces/role";

/** BE/IAM đôi khi trả "USER" — map về Role app (cùng User FE). */
export function mapAppRole(raw: string | null | undefined): string {
  if (!raw || !String(raw).trim()) return Role.RUNNER;
  const r = String(raw)
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();
  if (r === "USER" || r === "CUSTOMER" || r === "MEMBER") return Role.RUNNER;
  return r;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return mapAppRole(role) === Role.ADMIN;
}
