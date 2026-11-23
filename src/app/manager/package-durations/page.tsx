"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  createPackageDuration,
  listPackageDurations,
  updatePackageDuration,
} from "@/api/admin-packages";
import type { PackageDurationOptionDto } from "@/dto/package-admin.dto";
import { getApiErrorMessage } from "@/lib/error";
import { Plus, RefreshCw } from "lucide-react";

const C = "#8B5CF6";

function money(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function statusBadge(status: string) {
  if (status === "active") return <Badge variant="success">Đang bán</Badge>;
  if (status === "inactive") return <Badge variant="secondary">Ẩn</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

const emptyForm = {
  name: "",
  months: 1,
  price: 0,
  sortOrder: 0,
};

export default function PackageDurationsPage() {
  const [list, setList] = useState<PackageDurationOptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editPrice, setEditPrice] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listPackageDurations();
      setList(rows);
      setEditPrice(
        Object.fromEntries(rows.map((r) => [r.id, Number(r.price)]))
      );
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được danh sách gói thời hạn."));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    if (!form.name.trim() || form.months < 1 || form.price < 0) {
      setError("Nhập tên, số tháng ≥ 1 và giá ≥ 0.");
      return;
    }
    setBusy(true);
    setError(null);
    setToast(null);
    try {
      await createPackageDuration({
        name: form.name.trim(),
        months: form.months,
        price: form.price,
        sortOrder: form.sortOrder || form.months,
      });
      setForm(emptyForm);
      setToast("Đã thêm gói thời hạn.");
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Tạo gói thời hạn thất bại."));
    } finally {
      setBusy(false);
    }
  };

  const onSavePrice = async (row: PackageDurationOptionDto) => {
    const price = editPrice[row.id];
    if (price == null || price < 0) {
      setError("Giá không hợp lệ.");
      return;
    }
    setBusyId(row.id);
    setError(null);
    try {
      await updatePackageDuration(row.id, { price });
      setToast(`Đã cập nhật giá ${row.name}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Cập nhật giá thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const onToggle = async (row: PackageDurationOptionDto) => {
    const active = row.status !== "active";
    setBusyId(row.id);
    setError(null);
    try {
      await updatePackageDuration(row.id, { active });
      setToast(active ? `Đã hiện ${row.name}.` : `Đã ẩn ${row.name}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Đổi trạng thái thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RouteTab tab="package-durations">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-PKG-DUR"
          title="Cấu hình gói thời hạn"
          desc="Giá theo số tháng hiển thị ở checkout organizer (Chọn gói). Tháng không đổi sau khi tạo."
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
          <p className="text-sm font-semibold text-foreground">Thêm gói mới</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">Tên</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: 1 tháng"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">Số tháng</span>
              <input
                type="number"
                min={1}
                value={form.months}
                onChange={(e) =>
                  setForm({ ...form, months: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">Giá (VND)</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Thứ tự (sort)
              </span>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
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
            Thêm gói
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
            Chưa có gói thời hạn.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Tên</th>
                  <th className="px-3 py-2 font-semibold">Tháng</th>
                  <th className="px-3 py-2 font-semibold">Giá</th>
                  <th className="px-3 py-2 font-semibold">Sort</th>
                  <th className="px-3 py-2 font-semibold">Trạng thái</th>
                  <th className="px-3 py-2 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.name}</td>
                    <td className="px-3 py-2">{row.months}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={editPrice[row.id] ?? row.price}
                          onChange={(e) =>
                            setEditPrice({
                              ...editPrice,
                              [row.id]: Number(e.target.value),
                            })
                          }
                          className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {money(Number(editPrice[row.id] ?? row.price))}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{row.sortOrder}</td>
                    <td className="px-3 py-2">{statusBadge(row.status)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === row.id}
                          onClick={() => void onSavePrice(row)}
                        >
                          Lưu giá
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === row.id}
                          onClick={() => void onToggle(row)}
                          className="text-white"
                          style={{ background: C }}
                        >
                          {row.status === "active" ? "Ẩn" : "Hiện"}
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
