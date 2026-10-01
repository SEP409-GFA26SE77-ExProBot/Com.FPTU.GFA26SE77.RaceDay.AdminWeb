"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
export type Coordinate = {
  lat: number;
  lng: number;
};

export type Checkpoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceFromStart?: number;
  type?: "WATER" | "MEDICAL" | "TIMING" | "CHECKPOINT";
  description?: string;
};

export type RaceRouteMapProps = {
  route: Coordinate[];
  startPoint: Coordinate;
  finishPoint: Coordinate;
  checkpoints: Checkpoint[];
  /** Map height in CSS units. Defaults to "520px" */
  height?: string;
  /** Route polyline colour. Defaults to "#8B5CF6" (violet) */
  routeColor?: string;
  /** Route polyline width. Defaults to 4 */
  routeWeight?: number;
};

// ─── Dynamic import (SSR‑safe) ──────────────────────────────────────────────
// Leaflet requires `window`, so we must skip SSR entirely.
const RaceRouteMapInner = dynamic(
  () => import("./RaceRouteMapInner"),
  { ssr: false, loading: () => <MapPlaceholder /> }
);

function MapPlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        height: "520px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: "14px",
        fontWeight: 500,
        gap: "8px",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
      Loading map…
    </div>
  );
}

// ─── Public component ───────────────────────────────────────────────────────
export default function RaceRouteMap(props: RaceRouteMapProps) {
  // Memoize the bounds calculation so we don't recompute every render.
  const bounds = useMemo(() => {
    const allPoints: [number, number][] = [
      [props.startPoint.lat, props.startPoint.lng],
      [props.finishPoint.lat, props.finishPoint.lng],
      ...props.route.map((c) => [c.lat, c.lng] as [number, number]),
      ...props.checkpoints.map((cp) => [cp.latitude, cp.longitude] as [number, number]),
    ];
    return allPoints;
  }, [props.route, props.startPoint, props.finishPoint, props.checkpoints]);

  return <RaceRouteMapInner {...props} allBoundsPoints={bounds} />;
}
