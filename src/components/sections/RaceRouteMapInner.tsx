"use client";

import React, { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { RaceRouteMapProps, Checkpoint } from "./RaceRouteMap";

// ─── Extended props (includes pre‑calculated bounds from parent) ────────────
interface InnerProps extends RaceRouteMapProps {
  allBoundsPoints: [number, number][];
}

// ─── Custom Leaflet DivIcon factories ───────────────────────────────────────
// Using DivIcon so we have full CSS control – no image assets needed.

function createStartIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:#10B981;
        border:3px solid #fff;
        box-shadow:0 2px 12px rgba(16,185,129,0.55);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:800;font-size:13px;font-family:system-ui,sans-serif;
      ">S</div>
    `,
  });
}

function createFinishIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:#EF4444;
        border:3px solid #fff;
        box-shadow:0 2px 12px rgba(239,68,68,0.55);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:800;font-size:13px;font-family:system-ui,sans-serif;
      ">F</div>
    `,
  });
}

/** Khớp palette organizer: CP cam, tiếp tế nâu, start/finish riêng. */
const CP_TYPE_COLORS: Record<string, string> = {
  WATER: "#3B82F6",
  MEDICAL: "#EF4444",
  TIMING: "#c2410c",
  CHECKPOINT: "#c2410c",
  AID: "#a16207",
};

function createCheckpointIcon(index: number, type?: string): L.DivIcon {
  const bg = CP_TYPE_COLORS[type ?? "CHECKPOINT"] ?? "#8B5CF6";
  return L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `
      <div style="
        width:30px;height:30px;border-radius:8px;
        background:${bg};
        border:2.5px solid rgba(255,255,255,0.85);
        box-shadow:0 2px 10px ${bg}66;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:700;font-size:12px;font-family:system-ui,sans-serif;
      ">${index + 1}</div>
    `,
  });
}

// ─── Type labels for popups ─────────────────────────────────────────────────
const CP_TYPE_LABELS: Record<string, string> = {
  WATER: "Trạm nước",
  MEDICAL: "Trạm y tế",
  TIMING: "Checkpoint (timing)",
  CHECKPOINT: "Checkpoint (timing)",
  AID: "Điểm tiếp tế",
};

// ─── Sub‑component: fits map bounds on mount / data change ──────────────────
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
  }, [map, points]);

  return null;
}

// ─── Checkpoint marker + popup ──────────────────────────────────────────────
function CheckpointMarker({ cp, index }: { cp: Checkpoint; index: number }) {
  const icon = createCheckpointIcon(index, cp.type);

  return (
    <Marker position={[cp.latitude, cp.longitude]} icon={icon}>
      <Popup>
        <div style={{ fontFamily: "system-ui, sans-serif", minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#1e293b" }}>
            {cp.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#475569" }}>
            <span>{CP_TYPE_LABELS[cp.type ?? "CHECKPOINT"] ?? cp.type}</span>
            {cp.distanceFromStart != null && (
              <span>📏 {(cp.distanceFromStart / 1000).toFixed(2)} km from start</span>
            )}
            {cp.description && (
              <span style={{ marginTop: 4, fontStyle: "italic", color: "#64748b", lineHeight: 1.4 }}>
                {cp.description}
              </span>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// ─── Main inner map component ───────────────────────────────────────────────
export default function RaceRouteMapInner({
  route,
  startPoint,
  finishPoint,
  checkpoints,
  allBoundsPoints,
  height = "520px",
  routeColor = "#8B5CF6",
  routeWeight = 4,
}: InnerProps) {
  // Convert route coordinates for the polyline.
  const polylinePositions: [number, number][] = route.map((c) => [c.lat, c.lng]);

  // We pick a sensible initial center (the start point).
  const center: [number, number] = [startPoint.lat, startPoint.lng];

  const startIcon = createStartIcon();
  const finishIcon = createFinishIcon();

  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Scoped overrides for Leaflet's default CSS that clashes with the dark theme */}
      <style>{`
        /* ── Leaflet popup overrides for dark admin theme ── */
        .leaflet-popup-content-wrapper {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .leaflet-popup-content { margin: 12px 14px !important; }
        .leaflet-popup-content div { color: #cbd5e1 !important; }
        .leaflet-popup-content div:first-child { color: #f1f5f9 !important; }
        .leaflet-popup-tip { background: #1e293b !important; }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          font-size: 18px !important;
        }
        .leaflet-popup-close-button:hover { color: #e2e8f0 !important; }

        /* Zoom controls */
        .leaflet-control-zoom a {
          background: rgba(30,41,59,0.92) !important;
          color: #e2e8f0 !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover { background: rgba(51,65,85,0.95) !important; }

        /* Attribution */
        .leaflet-control-attribution {
          background: rgba(6,5,12,0.7) !important;
          color: rgba(255,255,255,0.35) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: rgba(139,92,246,0.7) !important; }
      `}</style>

      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        {/* ── OSM tile layer ── */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── Auto‑fit bounds ── */}
        <FitBounds points={allBoundsPoints} />

        {/* ── Route polyline ── */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: routeColor,
              weight: routeWeight,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {/* ── Route outline (wider, transparent line for depth) ── */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: routeColor,
              weight: routeWeight + 6,
              opacity: 0.15,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {/* ── Start marker ── */}
        <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
          <Popup>
            <div style={{ fontFamily: "system-ui,sans-serif" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#10B981" }}>🏁 Start</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {startPoint.lat.toFixed(5)}, {startPoint.lng.toFixed(5)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* ── Finish marker ── */}
        <Marker position={[finishPoint.lat, finishPoint.lng]} icon={finishIcon}>
          <Popup>
            <div style={{ fontFamily: "system-ui,sans-serif" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#EF4444" }}>🏆 Finish</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {finishPoint.lat.toFixed(5)}, {finishPoint.lng.toFixed(5)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* ── Checkpoint markers ── */}
        {checkpoints.map((cp, i) => (
          <CheckpointMarker key={cp.id} cp={cp} index={i} />
        ))}
      </MapContainer>
    </div>
  );
}
