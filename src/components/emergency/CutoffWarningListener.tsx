"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cutoffWarningStreamUrl, type CutoffWarningNotification } from "@/api/cutoff-warnings";
import { useCutoffWarningFeed } from "@/stores/cutoff-warning-store";
import { toastWarn } from "@/lib/toast";
import { formatClock } from "./format";

const RETRY_AFTER_CLOSE_MS = 15_000;

/**
 * Mounted once per Admin / Race-staff workspace. The server only sends warnings for events
 * this user may manage, so every notification here is in scope.
 */
export default function CutoffWarningListener() {
  const router = useRouter();

  useEffect(() => {
    const feed = useCutoffWarningFeed.getState();
    let stream: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const receive = (event: MessageEvent<string>) => {
      try {
        feed.receive(JSON.parse(event.data) as CutoffWarningNotification);
      } catch {
        feed.resync();
      }
    };

    const raised = (event: MessageEvent<string>) => {
      let warning: CutoffWarningNotification;
      try {
        warning = JSON.parse(event.data) as CutoffWarningNotification;
      } catch {
        feed.resync();
        return;
      }
      feed.receive(warning);
      toastWarn(
        `BIB ${warning.bibNumber} · ${warning.runnerName} chưa qua ${warning.checkpointName} trước cut-off ${formatClock(warning.cutoffAtUtc)}. Nhấn để mở trang Khẩn cấp.`,
        {
          toastId: `cutoff:${warning.warningId}`,
          autoClose: 15_000,
          onClick: () => router.push("/emergency"),
        },
      );
    };

    const connect = () => {
      if (disposed) return;
      stream = new EventSource(cutoffWarningStreamUrl());
      stream.addEventListener("ready", () => {
        feed.setConnected(true);
        // Catch up on anything raised while disconnected.
        feed.resync();
      });
      stream.addEventListener("CutoffWarningRaised", raised);
      stream.addEventListener("CutoffWarningResolved", receive);
      stream.addEventListener("CutoffWarningDismissed", receive);
      stream.addEventListener("unavailable", () => feed.setConnected(false));
      stream.onerror = () => {
        feed.setConnected(false);
        // CONNECTING = the browser retries by itself. CLOSED = HTTP error; retry later ourselves.
        if (stream?.readyState === EventSource.CLOSED) {
          stream.close();
          retry = setTimeout(connect, RETRY_AFTER_CLOSE_MS);
        }
      };
    };

    connect();
    return () => {
      disposed = true;
      clearTimeout(retry);
      stream?.close();
      feed.setConnected(false);
    };
  }, [router]);

  return null;
}
