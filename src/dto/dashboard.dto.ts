export interface AdminDashboardDto {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  lockedUsers: number;
  newUsersInPeriod: number;
  usersByRole: { role: string; count: number }[];
  newUsersByDay: { date: string; count: number }[];
  from: string;
  to: string;
  timeZone: string;
  generatedAtUtc: string;
}
