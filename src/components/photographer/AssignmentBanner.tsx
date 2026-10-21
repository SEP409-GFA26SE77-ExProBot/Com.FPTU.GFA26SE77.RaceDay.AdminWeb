"use client";

import { Camera, Loader2, MapPin, RefreshCw } from "lucide-react";
import type { StaffAssignmentDto } from "@/api/check-in";

type Props = {
  assignment: StaffAssignmentDto | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

export function AssignmentBanner({
  assignment,
  loading,
  error,
  onRefresh,
}: Props) {
  if (loading) {
    return (
      <div className="flex h-14 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
        Đang tải giải được phân công…
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-950">
        <span className="flex-1 font-medium">
          {error || "Chưa có giải Photographer Active."}
        </span>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 to-sky-50 px-3.5 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600">
        <Camera className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-900">
          {assignment.eventName}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 text-cyan-600" />
            {assignment.stationLabel?.trim() || "Khu vực chưa gán"}
          </span>
          <span>·</span>
          <span className="font-semibold uppercase tracking-wide text-cyan-700">
            {assignment.role}
          </span>
          <span>·</span>
          <span
            className={
              assignment.status === "active"
                ? "font-semibold text-emerald-600"
                : "text-slate-500"
            }
          >
            {assignment.status}
          </span>
          {assignment.eventDate ? (
            <>
              <span>·</span>
              <span>
                {new Date(assignment.eventDate).toLocaleDateString("vi-VN")}
              </span>
            </>
          ) : null}
        </p>
      </div>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      ) : null}
    </div>
  );
}
