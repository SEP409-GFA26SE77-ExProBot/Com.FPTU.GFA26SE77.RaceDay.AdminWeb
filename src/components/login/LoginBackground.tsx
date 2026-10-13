"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function LoginBackground() {
  return (
    <>
      {/* Top bar with theme toggle */}
      <div className="absolute top-6 right-7 z-50">
        <ThemeToggle showLabel size="md" />
      </div>

      {/* Ambient glowing blobs */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(139,92,246,0.12) 0%, transparent 100%)," +
            "radial-gradient(ellipse 40% 40% at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 100%)",
        }}
      />
    </>
  );
}
