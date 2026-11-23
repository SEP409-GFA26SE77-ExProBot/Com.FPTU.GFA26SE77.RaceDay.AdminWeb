"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { listMyStaffAssignments, type StaffAssignmentDto } from "@/api/check-in";
import { usePhotoQuery } from "@/hooks/use-photo-query";
import { Card, Btn, SectionHeader } from "@/components/ui";
import { RouteTab } from "@/context/ActiveTabContext";

export const PHOTO_COLOR = "#06B6D4";
export const PHOTO_RGB = "6,182,212";
export const photoInputClass = "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] disabled:opacity-50";

interface Workspace {
  assignments: StaffAssignmentDto[];
  selected?: StaffAssignmentDto;
  selectEvent: (eventId: string) => void;
  loading: boolean;
  error?: string;
  reload: () => void;
}
const Context = createContext<Workspace | null>(null);

export function PhotoWorkspaceProvider({ children }: { children: ReactNode }) {
  const load = useCallback(async () => (await listMyStaffAssignments()).filter((item) => item.role.toLowerCase() === "photographer" && item.status.toLowerCase() === "active"), []);
  const query = usePhotoQuery("photographer-assignments", load);
  const [eventId, selectEvent] = useState("");
  const assignments = query.data || [];
  const selected = assignments.find((item) => item.eventId === eventId) || assignments[0];
  return <Context.Provider value={{ assignments, selected, selectEvent, loading: query.loading, error: query.error, reload: query.reload }}>{children}</Context.Provider>;
}

export function usePhotoWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Photographer workspace is missing");
  return context;
}

export function PhotoNotice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div role={error ? "alert" : "status"} className={`my-3 rounded-lg border px-4 py-3 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-500" : "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"}`}>{children}</div>;
}

export function PhotoPage({ tab, title, description, children }: { tab: string; title: string; description: string; children: ReactNode }) {
  const { assignments, selected, selectEvent, loading, error, reload } = usePhotoWorkspace();
  return <RouteTab tab={tab}><div className="animate-slide-up space-y-5">
    <SectionHeader title={title} desc={description} color={PHOTO_COLOR} />
    <Card>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm font-semibold">Giải được phân công
          <select aria-label="Giải được phân công" className={`${photoInputClass} mt-2`} value={selected?.eventId || ""} onChange={(event) => selectEvent(event.target.value)} disabled={loading || !assignments.length}>
            {!assignments.length && <option value="">Chưa có phân công</option>}
            {assignments.map((item) => <option key={item.eventId} value={item.eventId}>{item.eventName}</option>)}
          </select>
        </label>
        <Btn label="Tải lại phân công" onClick={reload} disabled={loading} />
      </div>
      {selected && <p className="mt-3 text-sm text-[var(--text-secondary)]">{selected.eventDate ? new Date(`${selected.eventDate}T00:00:00`).toLocaleDateString("vi-VN") : "Chưa có ngày thi đấu"} · {selected.stationLabel || "Chưa phân công khu vực chụp"}</p>}
    </Card>
    {loading ? <PhotoNotice>Đang tải phân công…</PhotoNotice> : error ? <PhotoNotice error>{error}</PhotoNotice> : !selected ? <PhotoNotice>Bạn chưa có phân công nhiếp ảnh đang hoạt động. Liên hệ ban tổ chức để được phân công vào giải.</PhotoNotice> : <div key={selected.eventId}>{children}</div>}
  </div></RouteTab>;
}
