"use client";

import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { ADMINISTRATOR_NAV } from "@/config/ops-nav";

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveTabProvider defaultTab="approvals">
      <div className="light min-h-screen bg-[#f7f5f1]" data-theme="light">
        <OpsShell
          groups={ADMINISTRATOR_NAV.groups}
          homeHref={ADMINISTRATOR_NAV.homeHref}
          breadcrumbLabel={ADMINISTRATOR_NAV.breadcrumbLabel}
          footerLabel={ADMINISTRATOR_NAV.footerLabel}
          footerIcon={ADMINISTRATOR_NAV.footerIcon}
        >
          {children}
        </OpsShell>
      </div>
    </ActiveTabProvider>
  );
}
