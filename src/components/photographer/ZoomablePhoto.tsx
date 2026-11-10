"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { mediaOpenUrl } from "@/lib/media-url";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const STEP = 0.35;

type Props = {
  url: string;
  alt?: string;
};

/**
 * Preview ảnh review: zoom + kéo — không vẽ bbox OCR (bbox hay lệch).
 */
export function ZoomablePhoto({ url, alt = "Race photo" }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const clampZoom = (z: number) =>
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));

  const setZoomAround = useCallback((next: number) => {
    const z = clampZoom(next);
    setZoom(z);
    if (z <= 1) setOffset({ x: 0, y: 0 });
  }, []);

  const zoomIn = () => setZoomAround(zoom + STEP);
  const zoomOut = () => setZoomAround(zoom - STEP);
  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const onWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -STEP : STEP;
    setZoomAround(zoom + delta);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current?.active) return;
    setOffset({
      x: drag.current.origX + (e.clientX - drag.current.startX),
      y: drag.current.origY + (e.clientY - drag.current.startY),
    });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current?.active) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    drag.current = null;
  };

  return (
    <div className="relative flex h-full w-full min-h-[220px] flex-col">
      <div
        ref={viewportRef}
        className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-950 ${
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        }`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaOpenUrl(url)}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-75 will-change-transform"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        />
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-slate-950/80 p-1 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          title="Thu nhỏ"
          disabled={zoom <= MIN_ZOOM}
          onClick={zoomOut}
          className="pointer-events-auto rounded-full p-2 text-white hover:bg-white/10 disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[3.25rem] text-center font-mono text-[11px] font-bold text-slate-200">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          title="Phóng to"
          disabled={zoom >= MAX_ZOOM}
          onClick={zoomIn}
          className="pointer-events-auto rounded-full p-2 text-white hover:bg-white/10 disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Reset"
          onClick={reset}
          className="pointer-events-auto rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] text-slate-300">
        Cuộn để zoom · kéo khi phóng to
      </p>
    </div>
  );
}
