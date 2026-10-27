export enum Role {
    ADMIN = 'ADMIN',
    PHOTOGRAPHER = 'PHOTOGRAPHER',
    RUNNER = 'RUNNER',
    ORGANIZER = 'ORGANIZER',
    STAFF = 'STAFF',
    VOLUNTEER = 'VOLUNTEER',
    COORDINATOR = 'COORDINATOR',
}

export interface NavItemConfig {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
  href?: string;
}

export interface StatItemConfig {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: string;
}