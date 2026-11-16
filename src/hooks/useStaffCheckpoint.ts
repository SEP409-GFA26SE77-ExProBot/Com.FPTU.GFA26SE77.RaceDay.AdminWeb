"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { fetchHubAccessToken, simulationHubUrl } from "@/lib/staff-simulation";
import { getStaffCheckpoint, type StaffCheckpointSnapshot } from "@/api/staff-simulation";
import { getApiErrorMessage } from "@/lib/error";
import { checkpointAccessLost } from "@/lib/staff-checkpoint";
import { useAuthStore } from "@/stores/auth-store";

type State = {
  eventId: string; snapshot: StaffCheckpointSnapshot | null; error: string;
  connected: boolean; updatedAt: number | null; notice: string; accessLost: boolean;
};
const empty = (eventId: string): State => ({ eventId, snapshot: null, error: "", connected: false, updatedAt: null, notice: "", accessLost: false });
export function useStaffCheckpoint(eventId: string, retry: number) {
  const signedOut = useAuthStore(s => s.isInitialized && !s.isAuthenticated);
  const [state, setState] = useState<State>(() => empty(eventId));
  const denied = useRef(false);
  useEffect(() => {
    denied.current = false;
    let disposed = false;
    let subscription: { dispose: () => void } | undefined;
    let connection: ReturnType<HubConnectionBuilder["build"]> | undefined;
    let lastFrame = 0;
    const fail = (error: unknown) => {
      if (disposed) return;
      const lost = checkpointAccessLost(error);
      if (lost) denied.current = true;
      const message = getApiErrorMessage(error, "Kết nối bị gián đoạn. Dữ liệu đang hiển thị là bản cập nhật cuối.");
      setState(current => current.accessLost && !lost ? current : ({ ...(current.eventId === eventId ? current : empty(eventId)),
        ...(lost ? { snapshot: null, updatedAt: null, accessLost: true } : {}),
        connected: false, error: message.includes("CHECKPOINT_ACCESS_DENIED: ") ? message.split("CHECKPOINT_ACCESS_DENIED: ")[1] : message,
      }));
    };
    const accept = (next: StaffCheckpointSnapshot, live: boolean) => {
      if (disposed || denied.current) return;
      lastFrame = Date.now();
      setState(current => {
        const old = current.eventId === eventId ? current.snapshot : null;
        // Different run ids can start again at generation zero after an API restart.
        if (old && old.runId === next.runId && old.distanceId === next.distanceId
          && old.checkpoint.id === next.checkpoint.id && old.version > next.version) return current;
        const changed = !!old && (old.runId !== next.runId || old.distanceId !== next.distanceId || old.checkpoint.id !== next.checkpoint.id);
        return { eventId, snapshot: next, error: "", connected: live, updatedAt: lastFrame, accessLost: false,
          notice: changed ? "Lượt giả lập hoặc phân công đã thay đổi. Màn hình đã chuyển sang dữ liệu mới." : current.notice };
      });
    };
    const subscribe = () => {
      subscription?.dispose();
      subscription = connection!.stream<StaffCheckpointSnapshot>("WatchCheckpoint", eventId).subscribe({
        next: next => accept(next, true),
        error: e => fail(e),
        complete: () => fail(new Error("Luồng cập nhật đã đóng. Bấm kết nối lại để nhận dữ liệu mới.")),
      });
    };
    const staleCheck = setInterval(() => {
      if (lastFrame && Date.now() - lastFrame > 5000) fail(new Error("Chưa nhận dữ liệu mới. Các thao tác đang được khóa."));
    }, 1000);
    void (async () => {
      try {
        accept(await getStaffCheckpoint(eventId), false);
        if (disposed) return;
        connection = new HubConnectionBuilder().withUrl(simulationHubUrl(), {
          accessTokenFactory: fetchHubAccessToken,
        }).withAutomaticReconnect([0, 1000, 3000, 5000]).configureLogging(LogLevel.Warning).build();
        connection.onreconnecting(() => fail(new Error("Đang kết nối lại. Dữ liệu hiển thị là bản cập nhật cuối.")));
        connection.onreconnected(() => { if (!disposed) subscribe(); });
        connection.onclose(e => fail(e || new Error("Kết nối đã đóng. Bấm kết nối lại.")));
        await connection.start();
        if (disposed) { await connection.stop(); return; }
        subscribe();
      } catch (e) { fail(e); }
    })();
    return () => { disposed = true; clearInterval(staleCheck); subscription?.dispose(); void connection?.stop(); };
  }, [eventId, retry]);
  const clearPrivate = useCallback(() => {
    denied.current = true;
    setState({ ...empty(eventId), accessLost: true, error: "Quyền truy cập đã thay đổi. Vui lòng đăng nhập lại hoặc kiểm tra phân công." });
  }, [eventId]);
  return { ...(!signedOut && state.eventId === eventId ? state : { ...empty(eventId), error: signedOut ? "Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại." : "" }), clearPrivate };
}
