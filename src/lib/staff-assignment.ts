import type { StaffAssignmentDto } from "@/api/check-in";
import { mapAppRole } from "./role";
import { Role } from "@/interfaces/role";

export function isActiveRaceStaffAssignment(assignment: StaffAssignmentDto): boolean {
  return mapAppRole(assignment.role) === Role.RACE_STAFF
    && assignment.status.toLowerCase() === "active";
}
