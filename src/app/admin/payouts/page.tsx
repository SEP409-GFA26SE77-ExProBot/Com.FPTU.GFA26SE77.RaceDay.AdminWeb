"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  approveAdminPayout,
  listAdminPayoutRequests,
  rejectAdminPayout,
} from "@/api/admin-finance";
import type { AdminPayoutRequestDto } from "@/dto/finance.dto";
import { getApiErrorMessage } from "@/lib/error";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

const C = "#8B5CF6";

function money(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="pending">Chờ duyệt</Badge>;
    case "transferred":
    case "approved":
      return <Badge variant="success">Đã chuyển</Badge>;
    case "rejected":
      return <Badge variant="destructive">Từ chối</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function AdministratorPayoutsPage() {
  const [list, setList] = useState<AdminPayoutRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList(await listAdminPayoutRequests());
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được yêu cầu giải ngân."));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onApprove = async (row: AdminPayoutRequestDto) => {
    const receipt = window.prompt(
      "URL biên nhận chuyển khoản (bank slip) — có thể để trống khi mock:"
    );
    if (receipt === null) return;
    setBusyId(row.id);
    try {
      await approveAdminPayout(row.id, receipt || undefined);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Duyệt giải ngân thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (row: AdminPayoutRequestDto) => {
    const reason = window.prompt(
      "Lý do từ chối (giải chưa kết thúc / sai STK / nghi vấn…):"
    );
    if (!reason?.trim()) return;
    setBusyId(row.id);
    try {
      await rejectAdminPayout(row.id, reason.trim());
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Từ chối thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RouteTab tab="payouts">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-PAY"
          title="Yêu cầu giải ngân"
          desc="Duyệt lệnh rút escrow → chuyển khoản + đính biên nhận (Stripe Connect / Ticketbox payout)."
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

        {loading ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Đang tải…
          </Card>
        ) : list.length === 0 ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Không có yêu cầu giải ngân.
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((row) => (
              <Card key={row.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold" style={{ color: C }}>
                      {money(row.amount)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {row.organizerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.eventName || "—"} ·{" "}
                      {new Date(row.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {statusBadge(row.status)}
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs">
                  <p>
                    <span className="text-muted-foreground">Nhận về: </span>
                    {row.bankAccount.bankName} · {row.bankAccount.accountNumber}{" "}
                    · {row.bankAccount.accountHolderName}
                  </p>
                  {row.note ? (
                    <p className="mt-1 text-muted-foreground">
                      Ghi chú: {row.note}
                    </p>
                  ) : null}
                  {row.rejectReason ? (
                    <p className="mt-1 text-red-600">
                      Lý do: {row.rejectReason}
                    </p>
                  ) : null}
                </div>
                {row.status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => void onApprove(row)}
                      className="gap-1 text-white"
                      style={{ background: C }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Duyệt & đã CK
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === row.id}
                      onClick={() => void onReject(row)}
                      className="gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Từ chối
                    </Button>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </div>
    </RouteTab>
  );
}
