"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/error";

/** Discard responses from previous events/pages and avoid overlapping polling requests. */
export function usePhotoQuery<T>(key: string, load: () => Promise<T>, pollMs = 0) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: "" });
  const queryKey = `${key}:${version}`;
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    let active = true, running = false;
    const refresh = async () => {
      if (running) return;
      running = true;
      try {
        const data = await load();
        if (active) setState({ key: queryKey, data });
      } catch (error) {
        if (active) setState((previous) => ({ key: queryKey, data: previous.key === queryKey ? previous.data : undefined, error: getApiErrorMessage(error) }));
      } finally {
        running = false;
      }
    };
    void refresh();
    const timer = pollMs ? window.setInterval(() => { if (!document.hidden) void refresh(); }, pollMs) : undefined;
    return () => { active = false; if (timer !== undefined) window.clearInterval(timer); };
  }, [queryKey, load, pollMs]);
  return { data: state.key === queryKey ? state.data : undefined, error: state.key === queryKey ? state.error : undefined, loading: state.key !== queryKey, reload };
}
