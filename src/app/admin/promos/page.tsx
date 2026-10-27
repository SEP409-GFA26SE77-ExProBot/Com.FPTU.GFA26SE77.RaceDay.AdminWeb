"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  createPromoCode,
  listPromoCodes,
  updatePromoCode,
} from "@/api/admin-packages";
import type { PromoCodeDto } from "@/dto/package-admin.dto";
import { getApiErrorMessage } from "@/lib/error";
import { Plus, RefreshCw } from "lucide-react";

const C = "#8B5CF6";

function statusBadge(status: string) {
  if (status === "active") return <Badge variant="success">Đang dùng</Badge>;
  if (status === "inactive") return <Badge variant="secondary">Tắt</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function pctLabel(fraction: number) {
  return `${Math.round(Number(fraction) * 1000) / 10}%`;
}

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = {
  code: "",
  percentOffPct: 10,
  expiresLocal: "",
  maxRedemptions: "" as string | number,
};

export default function PromosPage() {
  const [list, setList] = useState<PromoCodeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList(await listPromoCodes());
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được danh sách mã giảm giá."));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    const code = form.code.trim().toUpperCase();
    const pct = Number(form.percentOffPct);
    if (!code || pct <= 0 || pct > 100) {
      setError("Mã không trống; % giảm trong khoảng 0 < x ≤ 100.");
      return;
    }
    setBusy(true);
    setError(null);
    setToast(null);
    try {
      const expiresAtUtc = form.expiresLocal
        ? new Date(form.expiresLocal).toISOString()
        : null;
      const max =
        form.maxRedemptions === "" || form.maxRedemptions == null
          ? null
          : Number(form.maxRedemptions);
      await createPromoCode({
        code,
        percentOff: pct / 100,
        expiresAtUtc,
        maxRedemptions: max != null && max > 0 ? max : null,
      });
      setForm(emptyForm);
      setToast(`Đã tạo mã ${code}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Tạo mã giảm giá thất bại."));
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (row: PromoCodeDto) => {
    const active = row.status !== "active";
    setBusyId(row.id);
    setError(null);
    try {
      await updatePromoCode(row.id, { active });
      setToast(active ? `Đã bật ${row.code}.` : `Đã tắt ${row.code}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Đổi trạng thái mã thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const onSetExpiry = async (row: PromoCodeDto) => {
    const current = toLocalInput(row.expiresAtUtc);
    const next = window.prompt(
      "Hạn dùng (YYYY-MM-DDTHH:mm, giờ máy bạn). Để trống = xóa hạn:",
      current
    );
    if (next === null) return;
    setBusyId(row.id);
    setError(null);
    try {
      if (!next.trim()) {
        await updatePromoCode(row.id, { clearExpiry: true });
      } else {
        await updatePromoCode(row.id, {
          expiresAtUtc: new Date(next.trim()).toISOString(),
        });
      }
      setToast(`Đã cập nhật hạn ${row.code}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Cập nhật hạn thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const onSetMax = async (row: PromoCodeDto) => {
    const next = window.prompt(
      "Số lần dùng tối đa (số nguyên). Để trống = không giới hạn:",
      row.maxRedemptions != null ? String(row.maxRedemptions) : ""
    );
    if (next === null) return;
    setBusyId(row.id);
    setError(null);
    try {
      if (!next.trim()) {
        await updatePromoCode(row.id, { clearMaxRedemptions: true });
      } else {
        const n = Number(next.trim());
        if (!Number.isFinite(n) || n < 1) {
          setError("Số lần dùng phải ≥ 1.");
          return;
        }
        await updatePromoCode(row.id, { maxRedemptions: n });
      }
      setToast(`Đã cập nhật giới hạn ${row.code}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Cập nhật giới hạn thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RouteTab tab="promos">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-PROMO"
          title="Cấu hình mã giảm giá"
          desc="Mã do Admin RaceDay phát hành — áp dụng trên checkout gói tổ chức (percentOff 0–1 trên API)."
          color={C}
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
        {toast ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {toast}
          </div>
        ) : null}

        <Card className="mb-4 space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">Phát hành mã mới</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">Mã</span>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="VD: RACE10"
                maxLength={50}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Giảm (%)
              </span>
              <input
                type="number"
                min={1}
                max={100}
                step={0.1}
                value={form.percentOffPct}
                onChange={(e) =>
                  setForm({
                    ...form,
                    percentOffPct: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Hết hạn (tuỳ chọn)
              </span>
              <input
                type="datetime-local"
                value={form.expiresLocal}
                onChange={(e) =>
                  setForm({ ...form, expiresLocal: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Số lần dùng tối đa
              </span>
              <input
                type="number"
                min={1}
                value={form.maxRedemptions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxRedemptions: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                placeholder="Không giới hạn"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
          <Button
            type="button"
            disabled={busy}
            onClick={() => void onCreate()}
            className="gap-1 text-white"
            style={{ background: C }}
          >
            <Plus className="h-3.5 w-3.5" />
            Phát hành mã
          </Button>
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

        {loading ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Đang tải…
          </Card>
        ) : list.length === 0 ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Chưa có mã giảm giá.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Mã</th>
                  <th className="px-3 py-2 font-semibold">Giảm</th>
                  <th className="px-3 py-2 font-semibold">Đã dùng</th>
                  <th className="px-3 py-2 font-semibold">Hạn</th>
                  <th className="px-3 py-2 font-semibold">Trạng thái</th>
                  <th className="px-3 py-2 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono font-semibold">
                      {row.code}
                    </td>
                    <td className="px-3 py-2">{pctLabel(row.percentOff)}</td>
                    <td className="px-3 py-2">
                      {row.usedCount}
                      {row.maxRedemptions != null
                        ? ` / ${row.maxRedemptions}`
                        : " / ∞"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {row.expiresAtUtc
                        ? new Date(row.expiresAtUtc).toLocaleString("vi-VN")
                        : "Không hạn"}
                    </td>
                    <td className="px-3 py-2">{statusBadge(row.status)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === row.id}
                          onClick={() => void onToggle(row)}
                          className="text-white"
                          style={{ background: C }}
                        >
                          {row.status === "active" ? "Tắt" : "Bật"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === row.id}
                          onClick={() => void onSetExpiry(row)}
                        >
                          Hạn
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === row.id}
                          onClick={() => void onSetMax(row)}
                        >
                          Giới hạn
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RouteTab>
  );
}
