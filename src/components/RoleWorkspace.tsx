"use client";

import type { ReactNode } from "react";
import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { ADMINISTRATOR_NAV, MANAGER_NAV, PHOTOGRAPHER_NAV, RACE_STAFF_NAV } from "@/config/ops-nav";

const navigation = {
  ADMIN: ADMINISTRATOR_NAV,
  MANAGER: MANAGER_NAV,
  RACE_STAFF: RACE_STAFF_NAV,
  PHOTOGRAPHER: PHOTOGRAPHER_NAV,
};

export default function RoleWorkspace({ role, children }: { role: keyof typeof navigation; children: ReactNode }) {
  const nav = navigation[role];
  return (
    <ActiveTabProvider defaultTab={nav.groups.flatMap((group) => group.items).find((item) => item.href === nav.homeHref)?.id || nav.groups[0]?.items[0]?.id || ""}>
      <div className="min-h-screen">
        <OpsShell groups={nav.groups} homeHref={nav.homeHref} breadcrumbLabel={nav.breadcrumbLabel} footerLabel={nav.footerLabel} footerIcon={nav.footerIcon}>
          {children}
        </OpsShell>
      </div>
    </ActiveTabProvider>
  );
}
