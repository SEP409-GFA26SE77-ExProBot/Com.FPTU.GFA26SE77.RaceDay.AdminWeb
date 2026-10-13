"use client";

import type { ReactNode } from "react";
import OpsShell from "@/components/OpsShell";
import { ADMINISTRATOR_NAV } from "@/config/ops-nav";

/** @deprecated Prefer OpsShell + ADMINISTRATOR_NAV; kept for existing imports. */
export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <OpsShell
      groups={ADMINISTRATOR_NAV.groups}
      homeHref={ADMINISTRATOR_NAV.homeHref}
      breadcrumbLabel={ADMINISTRATOR_NAV.breadcrumbLabel}
      footerLabel={ADMINISTRATOR_NAV.footerLabel}
      footerIcon={ADMINISTRATOR_NAV.footerIcon}
    >
      {children}
    </OpsShell>
  );
}
