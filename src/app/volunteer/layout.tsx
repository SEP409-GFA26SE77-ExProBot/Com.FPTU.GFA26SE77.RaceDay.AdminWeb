"use client";

import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { VOLUNTEER_NAV } from "@/config/ops-nav";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveTabProvider defaultTab="scanner">
      <div className="min-h-screen">
        <OpsShell
          groups={VOLUNTEER_NAV.groups}
          homeHref={VOLUNTEER_NAV.homeHref}
          breadcrumbLabel={VOLUNTEER_NAV.breadcrumbLabel}
          footerLabel={VOLUNTEER_NAV.footerLabel}
          footerIcon={VOLUNTEER_NAV.footerIcon}
        >
          {children}
        </OpsShell>
      </div>
    </ActiveTabProvider>
  );
}
