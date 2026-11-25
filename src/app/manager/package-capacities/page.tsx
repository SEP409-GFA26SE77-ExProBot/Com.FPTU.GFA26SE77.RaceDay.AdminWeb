"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";
import {
  createPackageCapacity,
  listPackageCapacities,
  updatePackageCapacity,
} from "@/api/admin-packages";
import type { PackageCapacityOptionDto } from "@/dto/package-admin.dto";
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
  maxParticipants: 20,
  addOnFee: 0,
  sortOrder: 0,
};

export default function PackageCapacitiesPage() {
  const [list, setList] = useState<PackageCapacityOptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editFee, setEditFee] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listPackageCapacities();
      setList(rows);
      setEditFee(
        Object.fromEntries(rows.map((r) => [r.id, Number(r.addOnFee)]))
      );
    } catch (e) {
      setError(getApiErrorMessage(e, "Không tải được danh sách quy mô VĐV."));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    if (!form.name.trim() || form.maxParticipants < 1 || form.addOnFee < 0) {
      setError("Nhập tên, số VĐV ≥ 1 và phụ phí ≥ 0.");
      return;
    }
    setBusy(true);
    setError(null);
    setToast(null);
    try {
      await createPackageCapacity({
        name: form.name.trim(),
        maxParticipants: form.maxParticipants,
        addOnFee: form.addOnFee,
        sortOrder: form.sortOrder || form.maxParticipants,
      });
      setForm(emptyForm);
      setToast("Đã thêm mức quy mô VĐV.");
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Tạo quy mô VĐV thất bại."));
    } finally {
      setBusy(false);
    }
  };

  const onSaveFee = async (row: PackageCapacityOptionDto) => {
    const addOnFee = editFee[row.id];
    if (addOnFee == null || addOnFee < 0) {
      setError("Phụ phí không hợp lệ.");
      return;
    }
    setBusyId(row.id);
    setError(null);
    try {
      await updatePackageCapacity(row.id, { addOnFee });
      setToast(`Đã cập nhật phụ phí ${row.name}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Cập nhật phụ phí thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  const onToggle = async (row: PackageCapacityOptionDto) => {
    const active = row.status !== "active";
    setBusyId(row.id);
    setError(null);
    try {
      await updatePackageCapacity(row.id, { active });
      setToast(active ? `Đã hiện ${row.name}.` : `Đã ẩn ${row.name}.`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e, "Đổi trạng thái thất bại."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RouteTab tab="package-capacities">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-ADM-PKG-CAP"
          title="Cấu hình quy mô vận động viên"
          desc="Phụ phí theo số VĐV tối đa (QUY MÔ VĐV trên checkout). Số VĐV không đổi sau khi tạo; 0₫ = đã bao gồm."
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
          <p className="text-sm font-semibold text-foreground">Thêm mức quy mô</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">Tên</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: 50 VĐV"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Số VĐV tối đa
              </span>
              <input
                type="number"
                min={1}
                value={form.maxParticipants}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxParticipants: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-muted-foreground">
                Phụ phí (VND)
              </span>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.addOnFee}
                onChange={(e) =>
                  setForm({ ...form, addOnFee: Number(e.target.value) })
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
            Thêm mức
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
            Chưa có mức quy mô VĐV.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Tên</th>
                  <th className="px-3 py-2 font-semibold">VĐV tối đa</th>
                  <th className="px-3 py-2 font-semibold">Phụ phí</th>
                  <th className="px-3 py-2 font-semibold">Sort</th>
                  <th className="px-3 py-2 font-semibold">Trạng thái</th>
                  <th className="px-3 py-2 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.name}</td>
                    <td className="px-3 py-2">
                      {row.maxParticipants.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={editFee[row.id] ?? row.addOnFee}
                          onChange={(e) =>
                            setEditFee({
                              ...editFee,
                              [row.id]: Number(e.target.value),
                            })
                          }
                          className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {Number(editFee[row.id] ?? row.addOnFee) === 0
                            ? "Đã bao gồm"
                            : money(Number(editFee[row.id] ?? row.addOnFee))}
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
                          onClick={() => void onSaveFee(row)}
                        >
                          Lưu phí
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
