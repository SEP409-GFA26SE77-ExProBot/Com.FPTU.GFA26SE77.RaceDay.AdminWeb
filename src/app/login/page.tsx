"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginBackground } from "@/components/login/LoginBackground";

export default function LoginPage() {
  return (
    <main className="grid-overlay min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <LoginBackground />

      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
