import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { PhotographerJobProvider } from "@/context/PhotographerJobContext";
import { OcrJobResumer } from "@/components/photographer/OcrJobResumer";
import { PHOTOGRAPHER_NAV } from "@/config/ops-nav";

export const metadata: Metadata = {
  title: "RaceDay Admin Portal | Operations Dashboard",
  description:
    "Unified operations dashboard for RaceDay race management — Photographer, Volunteer, Coordinator, and Administrator roles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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