"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, extractRoleFromToken, getRouteForRole } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getUser();
    const roleFromToken = extractRoleFromToken(token);
    const effectiveRole = roleFromToken || user?.role || "administrator";
    const targetRoute = getRouteForRole(effectiveRole);

    router.replace(targetRoute);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        fontSize: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#8B5CF6",
            display: "inline-block",
          }}
          className="animate-ping"
        />
        <span>Đang chuyển hướng đến giao diện tương ứng...</span>
      </div>
    </div>
  );
}
