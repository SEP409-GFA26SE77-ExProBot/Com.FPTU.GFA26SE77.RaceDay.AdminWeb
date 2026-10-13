"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import OpsShell from "@/components/OpsShell";
import { ActiveTabProvider } from "@/context/ActiveTabContext";
import { ADMINISTRATOR_NAV } from "@/config/ops-nav";
import { isAdminRole } from "@/lib/role";

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    const role = Cookies.get("role");
    if (!token || !isAdminRole(role)) {
      router.replace(`/?from=${encodeURIComponent("/administrator")}`);
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-[#f7f5f1] text-sm text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        Đang kiểm tra phiên Admin…
      </div>
    );
  }

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
