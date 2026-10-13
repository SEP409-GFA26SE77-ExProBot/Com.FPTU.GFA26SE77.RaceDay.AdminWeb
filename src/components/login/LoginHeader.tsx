"use client";

import { ShieldCheck } from "lucide-react";

export function LoginHeader() {
  return (
    <div className="text-center mb-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/25 to-cyan-500/15 border border-purple-500/30 inline-flex items-center justify-center mb-4 shadow-lg shadow-purple-500/10">
        <ShieldCheck size={28} className="text-purple-400" />
      </div>
      <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-1">
        RaceDay Portal
      </h1>
      <p className="text-sm text-muted-foreground">
        Đăng nhập vào hệ thống điều hành giải chạy
      </p>
    </div>
  );
}
