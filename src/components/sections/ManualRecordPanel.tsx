"use client";

import { AlertTriangle } from "lucide-react";

const FIELDS = [
  { label: "Số BIB", placeholder: "VD: A0042", type: "text" },
  { label: "Checkpoint", placeholder: "VD: CP3", type: "text" },
  { label: "Giờ đi qua", placeholder: "HH:MM:SS", type: "time" },
  { label: "Lý do", placeholder: "Thiết bị hỏng / Mất sóng…", type: "text" },
] as const;

const PENDING = [
  { bib: "A0043", cp: "CP2", time: "08:52:00", reason: "Thiết bị ngoại tuyến", logged: "09:01" },
  { bib: "B0204", cp: "CP1", time: "07:38:00", reason: "Chip RFID lỗi", logged: "08:45" },
  { bib: "C0091", cp: "CP3", time: "09:05:00", reason: "Mã QR hỏng", logged: "09:18" },
];

/** Manual time-record form + reconciliation queue (static demo data, not wired to the API yet). */
export default function ManualRecordPanel() {
  return (
    <div className="space-y-4">
      <form className="space-y-2.5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-2.5">
          {FIELDS.map((f) => (
            <label key={f.label} className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{f.label}</span>
              <input
                type={f.type}
                placeholder={f.placeholder}
                autoComplete="off"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />
            </label>
          ))}
        </div>
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Bản ghi này sẽ được tự động gắn nhãn <strong>MANUAL</strong> và chuyển cho Manager đối soát.
          </span>
        </p>
        <button
          type="submit"
          className="h-9 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-sm font-bold text-white"
        >
          Gửi bản ghi
        </button>
      </form>

      <section aria-label="Chờ đối soát">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Chờ đối soát</h3>
        <ul className="space-y-1.5">
          {PENDING.map((p) => (
            <li key={p.bib + p.cp} className="rounded-lg border border-amber-200/70 bg-amber-50/60 px-2.5 py-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-emerald-700">{p.bib}</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">MANUAL</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Checkpoint: {p.cp} · Giờ: {p.time}
              </p>
              <p className="text-[11px] text-slate-500">
                Lý do: {p.reason} · Ghi lúc {p.logged}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
