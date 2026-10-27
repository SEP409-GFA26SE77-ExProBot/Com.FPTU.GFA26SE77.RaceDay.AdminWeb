"use client";

import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { PhotographerJobProvider } from "@/context/PhotographerJobContext";
import { OcrJobResumer } from "@/components/photographer/OcrJobResumer";
import { PHOTOGRAPHER_NAV } from "@/config/ops-nav";

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveTabProvider defaultTab="upload">
      <PhotographerJobProvider>
        <OcrJobResumer />
        <div className="min-h-screen">
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
      </PhotographerJobProvider>
    </ActiveTabProvider>
  );
}
