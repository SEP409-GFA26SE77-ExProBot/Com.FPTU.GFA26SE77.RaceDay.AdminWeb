"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  approveSystemErrorRefund,
  listSystemErrorRefunds,
  rejectSystemErrorRefund,
} from "@/api/admin-finance";
import type { ManagerSystemErrorRefundDto } from "@/dto/finance.dto";
import { getApiErrorMessage } from "@/lib/error";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

const C = "#0EA5E9";
const PAGE_SIZE = 10;
const MIN_REJECT_LEN = 10;

type DetailMode = "view" | "reject" | "approve";

function money(n: number) {
  return (n || 0).toLocaleString("vi-VN") + " ₫";
}

function statusBadge(status: string) {
  switch ((status || "").toLowerCase()) {
    case "requested":
      return <Badge variant="pending">Chờ duyệt</Badge>;
    case "processing":
      return <Badge variant="secondary">Đang xử lý</Badge>;
    case "refunded":
      return <Badge variant="success">Đã hoàn</Badge>;
    case "rejected":
      return <Badge variant="destructive">Từ chối</Badge>;
    default:
      return <Badge variant="secondary">{status || "—"}</Badge>;
  }
}

function regStatusLabel(status?: string | null) {
  switch ((status || "").toLowerCase()) {
    case "pending_approval":
      return "Chờ duyệt hồ sơ";
    case "confirmed":
      return "Đã xác nhận";
    case "cancelled":
      return "Đã hủy";
    case "rejected":
      return "Bị từ chối";
    case "finished":
      return "Đã finish";
    default:
      return status || "—";
  }
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(url);
}

function claimReason(row: ManagerSystemErrorRefundDto) {
  const text = (row.reasonText || "").trim();
  if (text) return text;
  return (row.reason || "").replace(/^\[Lỗi hệ thống\]\s*/i, "").trim() || "—";
}

function claimEvidence(row: ManagerSystemErrorRefundDto) {
  return row.evidenceUrls || [];
}

type Props = {
  tabId?: string;
};

export default function SystemErrorRefundsPanel({ tabId = "refund-claims" }: Props) {
  const [list, setList] = useState<ManagerSystemErrorRefundDto[]>([]);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ManagerSystemErrorRefundDto | null>(null);
  const [detailMode, setDetailMode] = useState<DetailMode>("view");
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openDetail = (row: ManagerSystemErrorRefundDto) => {
    setDetail(row);
    setDetailMode("view");
    setRejectReason("");
    setActionError(null);
    setPreviewUrl(null);
  };

  const closeDetail = (force = false) => {
    if (busyId && !force) return;
    setDetail(null);
    setDetailMode("view");
    setRejectReason("");
    setActionError(null);
    setPreviewUrl(null);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listSystemErrorRefunds(pendingOnly);
      setList(rows);
      setPage(1);
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được yêu cầu hoàn tiền."));
      toastError(e, "Không tải được yêu cầu hoàn tiền.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [pendingOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [list, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const onApproveConfirm = async (row: ManagerSystemErrorRefundDto) => {
    setBusyId(row.id);
    setActionError(null);
    try {
      await approveSystemErrorRefund(row.id);
      setBusyId(null);
      closeDetail(true);
      toastSuccess(
        `Đã duyệt hoàn ${money(row.refundAmount)} cho ${row.runnerName || "VĐV"}.`
      );
      await load();
    } catch (e) {
      const message = getApiErrorMessage(e, "Duyệt hoàn thất bại.");
      setActionError(message);
      toastError(e, "Duyệt hoàn thất bại.");
      setBusyId(null);
    }
  };

  const onRejectConfirm = async (row: ManagerSystemErrorRefundDto) => {
    const reason = rejectReason.trim();
    if (reason.length < MIN_REJECT_LEN) {
      const message = `Nhập lý do từ chối (tối thiểu ${MIN_REJECT_LEN} ký tự).`;
      setActionError(message);
      toastError(message);
      return;
    }
    setBusyId(row.id);
    setActionError(null);
    try {
      await rejectSystemErrorRefund(row.id, reason);
      setBusyId(null);
      closeDetail(true);
      toastSuccess("Đã từ chối yêu cầu hoàn tiền.");
      await load();
    } catch (e) {
      const message = getApiErrorMessage(e, "Từ chối thất bại.");
      setActionError(message);
      toastError(e, "Từ chối thất bại.");
      setBusyId(null);
    }
  };

  return (
    <div className="animate-slide-up" data-tab={tabId}>
      <SectionHeader
        id="FR-SYS-REFUND"
        title="Yêu cầu hoàn tiền lỗi hệ thống"
        desc="Danh sách rút gọn — mở chi tiết để xem lý do, đính kèm rồi duyệt hoặc từ chối."
        color={C}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => setPendingOnly(e.target.checked)}
            className="size-4 rounded border"
          />
          Chỉ chờ duyệt
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          className="gap-1"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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
          Không có yêu cầu{pendingOnly ? " chờ duyệt" : ""}.
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">STT</th>
                  <th className="px-3 py-2 font-semibold">Giải / BIB</th>
                  <th className="px-3 py-2 font-semibold">VĐV</th>
                  <th className="px-3 py-2 font-semibold">Đề xuất hoàn</th>
                  <th className="px-3 py-2 font-semibold">Gửi lúc</th>
                  <th className="px-3 py-2 font-semibold">Trạng thái</th>
                  <th className="px-3 py-2 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row, idx) => {
                  const stt = (page - 1) * PAGE_SIZE + idx + 1;
                  const evidenceCount = claimEvidence(row).length;
                  return (
                    <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                        {stt}
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-foreground">
                          {row.eventName || "Giải chạy"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.bibNumber ? `BIB ${row.bibNumber}` : "Chưa có BIB"}
                          {evidenceCount > 0 ? ` · ${evidenceCount} đính kèm` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{row.runnerName || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.runnerEmail || "—"}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold tabular-nums" style={{ color: C }}>
                          {money(row.refundAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Đã trả {money(row.paidAmount)}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {new Date(row.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-3 py-2.5">{statusBadge(row.status)}</td>
                      <td className="px-3 py-2.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => openDetail(row)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Trang {page}/{totalPages} · {list.length} yêu cầu
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {detail ? (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>
                  {detailMode === "reject"
                    ? "Từ chối yêu cầu"
                    : detailMode === "approve"
                      ? "Xác nhận duyệt hoàn"
                      : "Chi tiết yêu cầu"}
                </DialogTitle>
                <DialogDescription>
                  {detail.eventName || "Giải chạy"}
                  {detail.bibNumber ? ` · BIB ${detail.bibNumber}` : ""}
                </DialogDescription>
                <div className="pt-1">{statusBadge(detail.status)}</div>
              </DialogHeader>

              <div className="space-y-4 py-1">
                <dl className="grid grid-cols-1 gap-3 rounded-xl border border-border px-3 py-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      VĐV
                    </dt>
                    <dd className="text-sm font-semibold">
                      {detail.runnerName || "—"}
                    </dd>
                    <dd className="text-xs text-muted-foreground">
                      {detail.runnerEmail || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Trạng thái vé
                    </dt>
                    <dd className="text-sm font-medium">
                      {regStatusLabel(detail.registrationStatus)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Đã thanh toán
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {money(detail.paidAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Đề xuất hoàn
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums" style={{ color: C }}>
                      {money(detail.refundAmount)} · {detail.refundPercent || 100}%
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Thời gian gửi
                    </dt>
                    <dd className="text-sm">
                      {new Date(detail.createdAt).toLocaleString("vi-VN")}
                    </dd>
                  </div>
                </dl>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Lý do VĐV
                  </p>
                  <p className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm leading-relaxed">
                    {claimReason(detail)}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Đính kèm
                  </p>
                  {claimEvidence(detail).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có đính kèm.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {claimEvidence(detail).map((url) =>
                        isImageUrl(url) ? (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setPreviewUrl(url)}
                            className="overflow-hidden rounded-xl border border-border"
                            title="Xem ảnh"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="Đính kèm"
                              className="h-28 w-28 object-cover"
                            />
                          </button>
                        ) : (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
                          >
                            Mở file
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>

                {detail.rejectReason ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    Đã từ chối: {detail.rejectReason}
                  </p>
                ) : null}

                {detailMode === "reject" ? (
                  <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/60 px-3 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                      Lý do từ chối (bắt buộc)
                    </p>
                    <p className="text-xs text-red-700/80">
                      VĐV sẽ thấy lý do này trên lịch sử thanh toán / yêu cầu.
                    </p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        if (actionError) setActionError(null);
                      }}
                      rows={4}
                      maxLength={1000}
                      disabled={busyId === detail.id}
                      placeholder="VD: Không phải lỗi hệ thống; thiếu bằng chứng; ảnh không liên quan…"
                      className="w-full rounded-xl border border-red-200 bg-background px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {rejectReason.trim().length}/{MIN_REJECT_LEN}+ ký tự
                    </p>
                  </div>
                ) : null}

                {detailMode === "approve" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3 text-sm text-emerald-900">
                    Duyệt sẽ hoàn{" "}
                    <span className="font-bold">{money(detail.refundAmount)}</span>{" "}
                    cho {detail.runnerName || "VĐV"} và hủy vé/BIB liên quan. Thao tác
                    không hoàn tác.
                  </div>
                ) : null}

                {actionError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {actionError}
                  </div>
                ) : null}
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                {detailMode === "view" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={Boolean(busyId)}
                      onClick={() => closeDetail()}
                    >
                      Đóng
                    </Button>
                    {(detail.status || "").toLowerCase() === "requested" ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(busyId)}
                          onClick={() => {
                            setDetailMode("reject");
                            setActionError(null);
                          }}
                          className="gap-1 text-red-700"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                        <Button
                          type="button"
                          disabled={Boolean(busyId)}
                          onClick={() => {
                            setDetailMode("approve");
                            setActionError(null);
                          }}
                          className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Duyệt hoàn
                        </Button>
                      </>
                    ) : null}
                  </>
                ) : null}

                {detailMode === "reject" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={Boolean(busyId)}
                      onClick={() => {
                        setDetailMode("view");
                        setActionError(null);
                      }}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        busyId === detail.id ||
                        rejectReason.trim().length < MIN_REJECT_LEN
                      }
                      onClick={() => void onRejectConfirm(detail)}
                      className="gap-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {busyId === detail.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {busyId === detail.id ? "Đang từ chối…" : "Xác nhận từ chối"}
                    </Button>
                  </>
                ) : null}

                {detailMode === "approve" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={Boolean(busyId)}
                      onClick={() => {
                        setDetailMode("view");
                        setActionError(null);
                      }}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="button"
                      disabled={busyId === detail.id}
                      onClick={() => void onApproveConfirm(detail)}
                      className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {busyId === detail.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {busyId === detail.id ? "Đang duyệt…" : "Xác nhận duyệt"}
                    </Button>
                  </>
                ) : null}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {previewUrl ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl bg-background p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Xem đính kèm"
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
            />
            <div className="mt-2 flex justify-end gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-sky-700"
              >
                Mở tab mới <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Button type="button" size="sm" variant="outline" onClick={() => setPreviewUrl(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
