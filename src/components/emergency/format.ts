const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "07:00", or "22/11 07:00" when not today. Local browser time. */
export function formatClock(utc: string | null | undefined): string {
  if (!utc) return "—";
  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return "—";
  const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return sameDay(date, new Date())
    ? time
    : `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} ${time}`;
}

/** "12 phút trước" style, for warning age. */
export function formatAgo(utc: string | null | undefined, now = Date.now()): string {
  if (!utc) return "";
  const minutes = Math.round((now - Date.parse(utc)) / 60_000);
  if (!Number.isFinite(minutes)) return "";
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  return `${hours} giờ ${minutes % 60} phút trước`;
}
