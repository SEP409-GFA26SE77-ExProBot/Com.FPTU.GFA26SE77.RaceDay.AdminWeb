"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  approveAdminPayout,
  confirmTransferAdminPayout,
  listAdminPayoutRequests,
  rejectAdminPayout,
} from "@/api/admin-finance";
import type { AdminPayoutRequestDto } from "@/dto/finance.dto";
import { getApiErrorMessage } from "@/lib/error";
import { CheckCircle2, Landmark, RefreshCw, XCircle } from "lucide-react";

const C = "#8B5CF6";

function money(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="pending">Chờ duyệt</Badge>;
    case "approved":
      return <Badge variant="secondary">Đã duyệt — chờ CK</Badge>;
    case "transferred":
      return <Badge variant="success">Đã chuyển khoản</Badge>;
    case "rejected":
      return <Badge variant="destructive">Từ chối</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

type DialogMode = "approve" | "confirm" | "reject";

export default function ManagerPayoutsPage() {
  const [list, setList] = useState<AdminPayoutRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    mode: DialogMode;
    row: AdminPayoutRequestDto;
  } | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [rejectReason, setRejectReason] = useState("");

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

  const closeDialog = () => {
    if (busyId) return;
    setDialog(null);
    setReceiptUrl("");
    setRejectReason("");
  };

  const openDialog = (mode: DialogMode, row: AdminPayoutRequestDto) => {
    setReceiptUrl("");
    setRejectReason("");
    setDialog({ mode, row });
  };

  const submitApprove = async () => {
    if (!dialog || dialog.mode !== "approve") return;
    const row = dialog.row;
    setBusyId(row.id);
    try {
      await approveAdminPayout(row.id);
      setDialog(null);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Duyệt lệnh thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const submitConfirm = async () => {
    if (!dialog || dialog.mode !== "confirm") return;
    const url = receiptUrl.trim();
    if (!url) {
      setError("Cần URL biên nhận / chứng từ chuyển khoản.");
      return;
    }
    const row = dialog.row;
    setBusyId(row.id);
    try {
      await confirmTransferAdminPayout(row.id, url);
      setDialog(null);
      setReceiptUrl("");
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Xác nhận chuyển khoản thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const submitReject = async () => {
    if (!dialog || dialog.mode !== "reject") return;
    const reason = rejectReason.trim();
    if (!reason) return;
    const row = dialog.row;
    setBusyId(row.id);
    try {
      await rejectAdminPayout(row.id, reason);
      setDialog(null);
      setRejectReason("");
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
          id="FR-MGR-PAY"
          title="Yêu cầu giải ngân"
          desc="Luồng chuẩn: Organizer xin rút → Manager duyệt lệnh → chuyển khoản ngân hàng ngoài hệ thống theo STK → xác nhận kèm biên nhận. Hệ thống không tự gọi API ngân hàng."
          color={C}
        />

        <Card className="mb-4 space-y-1 border-violet-200 bg-violet-50/70 p-4 text-xs text-violet-950">
          <p className="font-semibold">Quy trình 2 bước</p>
          <p>
            1) <strong>Duyệt lệnh</strong> — kiểm tra số tiền, STK, phase (T-4
            tuần / sau giải).
          </p>
          <p>
            2) <strong>Xác nhận đã CK</strong> — sau khi chuyển ngoài app, dán
            URL biên nhận (Drive/ảnh/PDF) bắt buộc.
          </p>
        </Card>

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
                  <p className="flex items-start gap-1.5">
                    <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="text-muted-foreground">
                        STK nhận giải ngân:{" "}
                      </span>
                      {row.bankAccount.bankName} ·{" "}
                      {row.bankAccount.accountNumber} ·{" "}
                      {row.bankAccount.accountHolderName}
                    </span>
                  </p>
                  {row.note ? (
                    <p className="mt-1 text-muted-foreground">
                      Ghi chú BTC: {row.note}
                    </p>
                  ) : null}
                  {row.rejectReason ? (
                    <p className="mt-1 text-red-600">
                      Lý do từ chối: {row.rejectReason}
                    </p>
                  ) : null}
                  {row.receiptUrl ? (
                    <p className="mt-1">
                      Biên nhận:{" "}
                      <a
                        href={row.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-violet-700 underline"
                      >
                        mở chứng từ
                      </a>
                    </p>
                  ) : null}
                </div>
                {row.status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => openDialog("approve", row)}
                      className="gap-1 text-white"
                      style={{ background: C }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Duyệt lệnh
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === row.id}
                      onClick={() => openDialog("reject", row)}
                      className="gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Từ chối
                    </Button>
                  </div>
                ) : null}
                {row.status === "approved" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => openDialog("confirm", row)}
                      className="gap-1 text-white"
                      style={{ background: C }}
                    >
                      <Landmark className="h-3.5 w-3.5" />
                      Xác nhận đã chuyển khoản
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === row.id}
                      onClick={() => openDialog("reject", row)}
                      className="gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Hủy duyệt
                    </Button>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )}

        <Dialog
          open={Boolean(dialog)}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <DialogContent className="sm:max-w-md">
            {dialog?.mode === "approve" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Duyệt lệnh giải ngân</DialogTitle>
                  <DialogDescription>
                    {money(dialog.row.amount)} ·{" "}
                    {dialog.row.eventName || "—"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                  <p>
                    Kiểm tra STK trước khi duyệt. Sau bước này bạn vẫn phải
                    chuyển khoản ngoài hệ thống rồi bấm xác nhận kèm biên nhận.
                  </p>
                  <p>
                    <strong>{dialog.row.bankAccount.bankName}</strong> ·{" "}
                    {dialog.row.bankAccount.accountNumber} ·{" "}
                    {dialog.row.bankAccount.accountHolderName}
                  </p>
                </div>
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyId === dialog.row.id}
                    onClick={closeDialog}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    disabled={busyId === dialog.row.id}
                    className="text-white"
                    style={{ background: C }}
                    onClick={() => void submitApprove()}
                  >
                    {busyId === dialog.row.id
                      ? "Đang duyệt…"
                      : "Xác nhận duyệt lệnh"}
                  </Button>
                </DialogFooter>
              </>
            ) : null}

            {dialog?.mode === "confirm" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Xác nhận đã chuyển khoản</DialogTitle>
                  <DialogDescription>
                    {money(dialog.row.amount)} ·{" "}
                    {dialog.row.eventName || "—"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                  <p>Đã chuyển đúng STK:</p>
                  <p>
                    <strong>{dialog.row.bankAccount.bankName}</strong> ·{" "}
                    {dialog.row.bankAccount.accountNumber} ·{" "}
                    {dialog.row.bankAccount.accountHolderName}
                  </p>
                </div>
                <label className="block space-y-2 text-sm">
                  <span className="font-medium">
                    URL biên nhận / chứng từ <span className="text-red-600">*</span>
                  </span>
                  <input
                    type="url"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="https://drive.google.com/… hoặc link ảnh/PDF"
                    required
                    disabled={busyId === dialog.row.id}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  <span className="text-xs text-muted-foreground">
                    Bắt buộc để đối soát. Hệ thống chỉ lưu chứng từ, không tự
                    chuyển tiền.
                  </span>
                </label>
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyId === dialog.row.id}
                    onClick={closeDialog}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    disabled={
                      busyId === dialog.row.id || !receiptUrl.trim()
                    }
                    className="text-white"
                    style={{ background: C }}
                    onClick={() => void submitConfirm()}
                  >
                    {busyId === dialog.row.id
                      ? "Đang xác nhận…"
                      : "Xác nhận đã CK"}
                  </Button>
                </DialogFooter>
              </>
            ) : null}

            {dialog?.mode === "reject" ? (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {dialog.row.status === "approved"
                      ? "Hủy duyệt / từ chối giải ngân"
                      : "Từ chối yêu cầu giải ngân"}
                  </DialogTitle>
                  <DialogDescription>
                    {money(dialog.row.amount)} ·{" "}
                    {dialog.row.eventName || "—"}
                  </DialogDescription>
                </DialogHeader>
                <label className="block space-y-2 text-sm">
                  <span className="font-medium">Lý do</span>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    required
                    disabled={busyId === dialog.row.id}
                    placeholder="Sai STK / chưa đủ điều kiện phase / nghi vấn…"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </label>
                <DialogFooter className="gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyId === dialog.row.id}
                    onClick={closeDialog}
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={
                      busyId === dialog.row.id || !rejectReason.trim()
                    }
                    onClick={() => void submitReject()}
                  >
                    {busyId === dialog.row.id
                      ? "Đang xử lý…"
                      : "Xác nhận từ chối"}
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </RouteTab>
  );
}
