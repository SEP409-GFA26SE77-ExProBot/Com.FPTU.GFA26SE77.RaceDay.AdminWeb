"use client";

import { useEffect, useState } from "react";
import { SectionHeader, Card, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  getPlatformFeeSettings,
  savePlatformFeeSettings,
} from "@/api/admin-finance";
import type { PlatformFeeSettingsDto } from "@/dto/finance.dto";
import { getApiErrorMessage } from "@/lib/error";

const C = "#8B5CF6";

export default function AdministratorSettingsPage() {
  const [form, setForm] = useState<PlatformFeeSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getPlatformFeeSettings();
        if (!cancelled) setForm(s);
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, "Không tải được cấu hình phí."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!form) return;
    setBusy(true);
    setError(null);
    try {
      const next = await savePlatformFeeSettings(form);
      setForm(next);
      setToast("Đã lưu cấu hình phí & điều kiện rút.");
    } catch (e) {
      setError(getApiErrorMessage(e, "Lưu cấu hình thất bại."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <RouteTab tab="settings">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-SET"
          title="Cấu hình phí nền tảng"
          desc="% hoa hồng trên mỗi vé + tỷ lệ rút trước/sau sự kiện (chuẩn marketplace escrow)."
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

        {loading || !form ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            Đang tải…
          </Card>
        ) : (
          <Card className="max-w-xl space-y-4 p-5">
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Phí nền tảng (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.platformFeePercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    platformFeePercent: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Cho rút tối đa trước sự kiện (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.preEventWithdrawPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    preEventWithdrawPercent: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Phần còn lại sau sự kiện (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.postEventWithdrawPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    postEventWithdrawPercent: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Số tiền rút tối thiểu (VND)
              </span>
              <input
                type="number"
                min={0}
                value={form.minPayoutAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minPayoutAmount: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">Ghi chú chính sách</span>
              <textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="text-white"
              style={{ background: C }}
            >
              Lưu cấu hình
            </Button>
          </Card>
        )}
      </div>
    </RouteTab>
  );
}
