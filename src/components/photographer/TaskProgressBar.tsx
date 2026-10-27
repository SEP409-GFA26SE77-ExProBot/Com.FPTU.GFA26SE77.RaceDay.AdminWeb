"use client";

type Props = {
  label: string;
  percent: number;
  etaSeconds?: number | null;
  detail?: string | null;
};

function formatEta(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) {
    return "Đang ước lượng…";
  }
  if (seconds < 5) return "Sắp xong";
  if (seconds < 60) return `~${Math.ceil(seconds)}s còn lại`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `~${m}p ${s}s còn lại`;
}

export function TaskProgressBar({
  label,
  percent,
  etaSeconds,
  detail,
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-emerald-900">{label}</p>
        <p className="text-xs font-bold tabular-nums text-emerald-700">
          {pct}% · {formatEta(etaSeconds)}
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {detail ? (
        <p className="mt-2 text-xs leading-snug text-emerald-800/80">{detail}</p>
      ) : null}
    </div>
  );
}
