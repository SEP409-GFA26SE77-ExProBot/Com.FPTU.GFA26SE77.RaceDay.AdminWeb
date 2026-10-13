"use client";

import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { PHOTOGRAPHER_NAV } from "@/config/ops-nav";

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveTabProvider defaultTab="assignments">
      <div className="light min-h-screen bg-[#f7f5f1]" data-theme="light">
        <OpsShell
          groups={PHOTOGRAPHER_NAV.groups}
          homeHref={PHOTOGRAPHER_NAV.homeHref}
          breadcrumbLabel={PHOTOGRAPHER_NAV.breadcrumbLabel}
          footerLabel={PHOTOGRAPHER_NAV.footerLabel}
          footerIcon={PHOTOGRAPHER_NAV.footerIcon}
        >
          {children}
        </OpsShell>
      </div>
    </ActiveTabProvider>
  );
}
