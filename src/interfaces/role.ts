export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  RACE_STAFF = "RACE_STAFF",
  PHOTOGRAPHER = "PHOTOGRAPHER",
  RUNNER = "RUNNER",
  ORGANIZER = "ORGANIZER",
}

export const ALL_ROLES: Role[] = Object.values(Role);
