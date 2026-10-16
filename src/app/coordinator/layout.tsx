"use client";

import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { COORDINATOR_NAV } from "@/config/ops-nav";

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveTabProvider defaultTab="map">
      <div className="min-h-screen">
        <OpsShell
          groups={COORDINATOR_NAV.groups}
          homeHref={COORDINATOR_NAV.homeHref}
          breadcrumbLabel={COORDINATOR_NAV.breadcrumbLabel}
          footerLabel={COORDINATOR_NAV.footerLabel}
          footerIcon={COORDINATOR_NAV.footerIcon}
        >
          {children}
        </OpsShell>
      </div>
    </ActiveTabProvider>
  );
}
