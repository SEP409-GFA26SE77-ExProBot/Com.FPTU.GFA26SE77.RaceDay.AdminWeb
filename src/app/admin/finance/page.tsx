"use client";

import { useEffect, useState } from "react";
import { SectionHeader, Card, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import { getPlatformFinanceOverview } from "@/api/admin-finance";
import type { PlatformFinanceOverviewDto } from "@/dto/finance.dto";
import { getApiErrorMessage } from "@/lib/error";
import { RefreshCw } from "lucide-react";

const C = "#8B5CF6";

function money(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export default function AdministratorFinancePage() {
  const [data, setData] = useState<PlatformFinanceOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPlatformFinanceOverview());
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được tổng quan tài chính."));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const cards = data
    ? [
        ["Escrow đang giữ", data.totalEscrowHeld],
        ["Phí nền tảng đã thu", data.platformFeeCollected],
        ["Chờ giải ngân", data.pendingPayoutAmount],
        ["Đã chuyển tháng này", data.transferredThisMonth],
      ]
    : [];

  return (
    <RouteTab tab="finance">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-FIN"
          title="Tài chính nền tảng"
          desc="Tổng escrow hệ thống đang giữ + doanh thu phí dịch vụ (tham chiếu marketplace escrow dashboard)."
          color={C}
        />

        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Tải lại
          </Button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading && !data ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Đang tải…
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map(([label, value]) => (
              <Card key={label as string} className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-xl font-extrabold" style={{ color: C }}>
                  {money(value as number)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RouteTab>
  );
}
