import { useEffect, useState } from "react";
import { livePositionsUrl, type LivePositionFrame, type LiveStaffPosition } from "@/api/positioning";
import { toastWarn } from "@/lib/toast";

export function useLiveStaffPositions(eventId: string) {
  const [positions, setPositions] = useState<LiveStaffPosition[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stream = new EventSource(livePositionsUrl(eventId));
    const expiryMs = 20_000;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const latest = new Map<string, LiveStaffPosition>();

    function clearTimers() {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    }

    function accept(position: LiveStaffPosition, serverNow: number) {
      const ttl = Math.min(expiryMs, Date.parse(position.capturedAtUtc) + expiryMs - serverNow);
      if (!Number.isFinite(ttl) || ttl <= 0) return false;
      clearTimeout(timers.get(position.userId));
      latest.set(position.userId, position);
      timers.set(position.userId, setTimeout(() => {
        timers.delete(position.userId);
        latest.delete(position.userId);
        setPositions((people) => people?.filter((person) => person.userId !== position.userId) ?? null);
      }, ttl));
      return true;
    }

    stream.addEventListener("snapshot", (event: MessageEvent<string>) => {
      const frame = JSON.parse(event.data) as LivePositionFrame<LiveStaffPosition[]>;
      const serverNow = Date.parse(frame.serverNowUtc);
      clearTimers();
      latest.clear();
      setPositions(frame.data.filter((person) => accept(person, serverNow)));
      setError(null);
    });

    stream.addEventListener("position", (event: MessageEvent<string>) => {
      const frame = JSON.parse(event.data) as LivePositionFrame<LiveStaffPosition>;
      const update = frame.data;
      const current = latest.get(update.userId);
      if (current && Date.parse(current.capturedAtUtc) >= Date.parse(update.capturedAtUtc)) return;
      if (!accept(update, Date.parse(frame.serverNowUtc))) return;
      setPositions((people) => [
        ...(people ?? []).filter((person) => person.userId !== update.userId),
        update,
      ]);
    });
    stream.addEventListener("unavailable", () => setError("Mất kết nối GPS trực tiếp. Đang kết nối lại…"));

    stream.addEventListener("outside", (event: MessageEvent<string>) => {
      const alert = JSON.parse(event.data) as { staffName: string; assignmentId: string; occurredAtUtc: string };
      toastWarn(`${alert.staffName} đã rời khỏi khu vực được phân công.`, {
        autoClose: 8000,
        toastId: `${alert.assignmentId}:${alert.occurredAtUtc}`,
      });
    });
    stream.onerror = () => {
      setError(stream.readyState === EventSource.CLOSED
        ? "Không dùng được GPS trực tiếp. Hãy kiểm tra đăng nhập và phân công sự kiện."
        : "Mất kết nối GPS trực tiếp. Đang kết nối lại…");
    };

    return () => {
      stream.close();
      clearTimers();
    };
  }, [eventId]);

  return { positions, error };
}
