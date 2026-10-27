"use client";

import { Camera, Loader2, RefreshCw } from "lucide-react";
import type { StaffAssignmentDto } from "@/api/check-in";

type Props = {
  assignment: StaffAssignmentDto | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("vi-VN");
}

function formatStart(
  eventDate?: string | null,
  startTime?: string | null
): string {
  const date = formatDate(eventDate);
  if (!startTime) return date;
  // TimeOnly serializes as "HH:mm:ss"
  const time = startTime.length >= 5 ? startTime.slice(0, 5) : startTime;
  return date === "—" ? time : `${date} ${time}`;
}

function formatEnd(endDate?: string | null, eventDate?: string | null): string {
  if (endDate) return formatDate(endDate);
  return formatDate(eventDate);
}

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

  const statusActive = assignment.status === "active";

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 to-sky-50 px-3.5 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600">
        <Camera className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5 text-sm">
        <p className="text-slate-800">
          <span className="font-semibold text-slate-500">Event:</span>{" "}
          <span className="font-extrabold text-slate-900">
            {assignment.eventName}
          </span>
        </p>
        <p className="text-slate-700">
          <span className="font-semibold text-slate-500">Assign Location:</span>{" "}
          <span className="font-semibold">
            {assignment.stationLabel?.trim() || "Chưa gán khu vực"}
          </span>
        </p>
        <p className="text-slate-700">
          <span className="font-semibold text-slate-500">Status:</span>{" "}
          <span
            className={
              statusActive
                ? "font-bold text-emerald-600"
                : "font-semibold text-slate-600"
            }
          >
            {assignment.status}
          </span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700">
          <p>
            <span className="font-semibold text-slate-500">Event start:</span>{" "}
            <span className="font-semibold">
              {formatStart(assignment.eventDate, assignment.startTime)}
            </span>
          </p>
          <p>
            <span className="font-semibold text-slate-500">Event end:</span>{" "}
            <span className="font-semibold">
              {formatEnd(assignment.endDate, assignment.eventDate)}
            </span>
          </p>
        </div>
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
