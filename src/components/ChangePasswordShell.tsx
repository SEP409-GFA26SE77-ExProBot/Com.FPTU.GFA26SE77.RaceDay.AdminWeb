"use client";

import type { ReactNode } from "react";
import OpsShell from "@/components/OpsShell";
import {
  ADMINISTRATOR_NAV,
  COORDINATOR_NAV,
  PHOTOGRAPHER_NAV,
  VOLUNTEER_NAV,
  type OpsRoleNav,
} from "@/config/ops-nav";
import { ActiveTabProvider } from "@/context/ActiveTabContext";

const NAV_BY_ROLE: Record<string, OpsRoleNav> = {
  ADMIN: ADMINISTRATOR_NAV,
  COORDINATOR: COORDINATOR_NAV,
  PHOTOGRAPHER: PHOTOGRAPHER_NAV,
  VOLUNTEER: VOLUNTEER_NAV,
};

export default function ChangePasswordShell({
  role,
  children,
}: {
  role: string;
  children: ReactNode;
}) {
  const nav = NAV_BY_ROLE[role.toUpperCase()] ?? COORDINATOR_NAV;
  const defaultTab = nav.groups[0]?.items[0]?.id ?? "";

  return (
    <ActiveTabProvider defaultTab={defaultTab}>
      <OpsShell
        groups={nav.groups}
        homeHref={nav.homeHref}
        breadcrumbLabel={nav.breadcrumbLabel}
        footerLabel={nav.footerLabel}
        footerIcon={nav.footerIcon}
      >
        {children}
      </OpsShell>
    </ActiveTabProvider>
  );
}
