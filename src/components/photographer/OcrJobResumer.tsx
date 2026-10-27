"use client";

import { useEffect } from "react";
import { usePhotographerEvent } from "@/hooks/usePhotographerEvent";
import { usePhotographerJob } from "@/context/PhotographerJobContext";

/** Khi F5 / vào lại photographer: nếu OCR còn pending thì gắn lại thanh tiến trình. */
export function OcrJobResumer() {
  const { eventId, loading } = usePhotographerEvent();
  const { resumeOcrIfPending, ocrRunning } = usePhotographerJob();

  useEffect(() => {
    if (loading || !eventId || ocrRunning) return;
    void resumeOcrIfPending(eventId);
  }, [eventId, loading, ocrRunning, resumeOcrIfPending]);

  return null;
}
