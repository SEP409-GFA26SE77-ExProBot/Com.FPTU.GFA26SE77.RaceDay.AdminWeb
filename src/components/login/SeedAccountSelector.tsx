"use client";

import { Button } from "@/components/ui/button";

interface SeedAccountSelectorProps {
  onSelectAccount: (username: string, password?: string) => void;
}

export function SeedAccountSelector({ onSelectAccount }: SeedAccountSelectorProps) {
  const seedAccounts = [
    {
      label: "🔑 Admin",
      username: "admin",
      variant: "outline" as const,
      className: "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300",
    },
    {
      label: "📋 Organizer",
      username: "cuong.le",
      variant: "outline" as const,
      className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300",
    },
    {
      label: "🏃 Runner",
      username: "an.nguyen",
      variant: "outline" as const,
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300",
    },
  ];

  return (
    <div className="mt-7 pt-5 border-t border-border">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 text-center">
        Tài khoản mẫu (Seed Accounts)
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        {seedAccounts.map((acc) => (
          <Button
            key={acc.username}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectAccount(acc.username, "MatKhau@123")}
            className={acc.className}
          >
            {acc.label} ({acc.username})
          </Button>
        ))}
      </div>
    </div>
  );
}
