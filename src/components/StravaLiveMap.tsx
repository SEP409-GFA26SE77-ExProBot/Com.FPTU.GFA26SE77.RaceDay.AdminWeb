"use client";

import { useState, useMemo } from "react";

export interface CheckpointInfo {
  id: string;
  name: string;
  km: number;
  x: number; // 0 - 1000 coordinate space
  y: number; // 0 - 600 coordinate space
  type: "start" | "aid" | "water" | "medical" | "cutoff" | "finish";
  cutoffTime: string;
  passedCount: number;
  expectedCount: number;
  elevation: number; // in meters
}

export interface RunnerMarker {
  id: string;
  bib: string;
  name: string;
  progress: number; // 0 to 1 along the route
  status: "normal" | "sos" | "deviation" | "leader";
  pace: string;
  gap?: string;
  lastCp: string;
}

export interface RouteCategory {
  id: "5k" | "10k" | "21k" | "42k";
  name: string;
  distanceKm: number;
  elevationGainM: number;
  estTime: string;
  activeRunners: number;
  color: string;
  glowColor: string;
  description: string;
  // SVG path definition
  pathD: string;
  // Route coordinates array for elevation profile & marker interpolation
  points: { x: number; y: number; km: number; elev: number }[];
  checkpoints: CheckpointInfo[];
  runners: RunnerMarker[];
}

// Shared common start coordinates (Same start location for all routes)
const START_X = 140;
const START_Y = 480;
const START_ELEV = 120; // 120m base elevation

export const MOCK_ROUTES: Record<RouteCategory["id"], RouteCategory> = {
  "5k": {
    id: "5k",
    name: "5K Fun Run & Sprint",
    distanceKm: 5.0,
    elevationGainM: 85,
    estTime: "0h 28m",
    activeRunners: 420,
    color: "#10B981", // Emerald
    glowColor: "rgba(16,185,129,0.5)",
    description: "Scenic lakeside loop around the central stadium and botanical park.",
    pathD: `M ${START_X},${START_Y} C 180,430 220,400 280,390 C 340,380 390,410 410,460 C 430,510 380,540 310,540 C 240,540 170,520 ${START_X},${START_Y}`,
    points: [
      { x: START_X, y: START_Y, km: 0.0, elev: 120 },
      { x: 200, y: 420, km: 1.2, elev: 135 },
      { x: 280, y: 390, km: 2.5, elev: 165 },
      { x: 370, y: 420, km: 3.7, elev: 140 },
      { x: 310, y: 540, km: 4.4, elev: 125 },
      { x: START_X, y: START_Y, km: 5.0, elev: 120 },
    ],
    checkpoints: [
      { id: "CP-0", name: "Grand Stadium Start", km: 0.0, x: START_X, y: START_Y, type: "start", cutoffTime: "07:00", passedCount: 420, expectedCount: 420, elevation: 120 },
      { id: "CP-5K-1", name: "Lake Botanical Garden", km: 2.5, x: 280, y: 390, type: "water", cutoffTime: "07:45", passedCount: 388, expectedCount: 420, elevation: 165 },
      { id: "CP-5K-2", name: "South Bridge Aid Station", km: 4.2, x: 230, y: 530, type: "aid", cutoffTime: "08:15", passedCount: 310, expectedCount: 420, elevation: 125 },
      { id: "CP-5K-FIN", name: "Stadium Arena Finish", km: 5.0, x: START_X + 15, y: START_Y + 15, type: "finish", cutoffTime: "08:30", passedCount: 145, expectedCount: 420, elevation: 120 },
    ],
    runners: [
      { id: "R-501", bib: "5042", name: "Le Minh K", progress: 0.88, status: "leader", pace: "3:48 /km", lastCp: "South Bridge" },
      { id: "R-502", bib: "5112", name: "Nguyen Thi H", progress: 0.62, status: "normal", pace: "4:32 /km", lastCp: "Lake Botanical" },
      { id: "R-503", bib: "5204", name: "Tran Van T", progress: 0.35, status: "normal", pace: "5:10 /km", lastCp: "Start Gate" },
    ],
  },
  "10k": {
    id: "10k",
    name: "10K Challenge Run",
    distanceKm: 10.0,
    elevationGainM: 240,
    estTime: "0h 58m",
    activeRunners: 360,
    color: "#06B6D4", // Cyan
    glowColor: "rgba(6,182,212,0.5)",
    description: "Rolling hills route through East Valley and Riverside Boulevard.",
    pathD: `M ${START_X},${START_Y} C 200,410 260,350 340,320 C 420,290 520,310 590,260 C 650,220 680,260 640,330 C 580,410 480,460 380,490 C 280,520 190,510 ${START_X},${START_Y}`,
    points: [
      { x: START_X, y: START_Y, km: 0.0, elev: 120 },
      { x: 260, y: 350, km: 2.2, elev: 175 },
      { x: 380, y: 310, km: 4.1, elev: 230 },
      { x: 590, y: 260, km: 6.2, elev: 290 },
      { x: 640, y: 330, km: 7.8, elev: 210 },
      { x: 440, y: 475, km: 9.1, elev: 145 },
      { x: START_X, y: START_Y, km: 10.0, elev: 120 },
    ],
    checkpoints: [
      { id: "CP-0", name: "Grand Stadium Start", km: 0.0, x: START_X, y: START_Y, type: "start", cutoffTime: "06:30", passedCount: 360, expectedCount: 360, elevation: 120 },
      { id: "CP-10K-1", name: "Valley Creek Checkpoint", km: 3.2, x: 310, y: 330, type: "water", cutoffTime: "07:15", passedCount: 350, expectedCount: 360, elevation: 195 },
      { id: "CP-10K-2", name: "East Hill Viewpoint", km: 6.2, x: 590, y: 260, type: "aid", cutoffTime: "08:00", passedCount: 290, expectedCount: 360, elevation: 290 },
      { id: "CP-10K-3", name: "Riverside Junction", km: 8.5, x: 490, y: 460, type: "medical", cutoffTime: "08:30", passedCount: 220, expectedCount: 360, elevation: 160 },
      { id: "CP-10K-FIN", name: "Stadium Arena Finish", km: 10.0, x: START_X + 15, y: START_Y + 15, type: "finish", cutoffTime: "09:00", passedCount: 88, expectedCount: 360, elevation: 120 },
    ],
    runners: [
      { id: "R-101", bib: "B0089", name: "Le Thi Y", progress: 0.72, status: "deviation", pace: "4:55 /km", lastCp: "East Hill Viewpoint" },
      { id: "R-102", bib: "B0142", name: "Do Hoang M", progress: 0.86, status: "leader", pace: "3:52 /km", lastCp: "Riverside Junction" },
      { id: "R-103", bib: "B0215", name: "Nguyen Duc N", progress: 0.45, status: "normal", pace: "5:20 /km", lastCp: "Valley Creek" },
    ],
  },
  "21k": {
    id: "21k",
    name: "21K Half Marathon",
    distanceKm: 21.1,
    elevationGainM: 580,
    estTime: "2h 05m",
    activeRunners: 512,
    color: "#F59E0B", // Amber / Strava Gold
    glowColor: "rgba(245,158,11,0.5)",
    description: "Highland pass route climbing through Pine Ridge and Mountain Vista trails.",
    pathD: `M ${START_X},${START_Y} C 200,380 250,280 320,230 C 390,180 470,160 550,140 C 640,120 730,150 790,210 C 850,270 820,360 740,410 C 650,460 530,480 410,500 C 290,520 200,510 ${START_X},${START_Y}`,
    points: [
      { x: START_X, y: START_Y, km: 0.0, elev: 120 },
      { x: 260, y: 270, km: 4.5, elev: 220 },
      { x: 420, y: 170, km: 8.5, elev: 390 },
      { x: 550, y: 140, km: 12.0, elev: 540 },
      { x: 740, y: 170, km: 15.2, elev: 480 },
      { x: 790, y: 290, km: 17.8, elev: 340 },
      { x: 580, y: 470, km: 19.5, elev: 190 },
      { x: START_X, y: START_Y, km: 21.1, elev: 120 },
    ],
    checkpoints: [
      { id: "CP-0", name: "Grand Stadium Start", km: 0.0, x: START_X, y: START_Y, type: "start", cutoffTime: "06:00", passedCount: 512, expectedCount: 512, elevation: 120 },
      { id: "CP-21K-1", name: "KM 5.0 – Pine Valley", km: 5.0, x: 280, y: 250, type: "water", cutoffTime: "07:00", passedCount: 502, expectedCount: 512, elevation: 240 },
      { id: "CP-21K-2", name: "KM 10.5 – High Ridge", km: 10.5, x: 480, y: 155, type: "aid", cutoffTime: "08:00", passedCount: 475, expectedCount: 512, elevation: 490 },
      { id: "CP-21K-3", name: "KM 15.0 – Peak Vista", km: 15.0, x: 730, y: 160, type: "medical", cutoffTime: "09:00", passedCount: 420, expectedCount: 512, elevation: 520 },
      { id: "CP-21K-4", name: "KM 18.5 – Forest Descent", km: 18.5, x: 700, y: 430, type: "cutoff", cutoffTime: "09:45", passedCount: 370, expectedCount: 512, elevation: 260 },
      { id: "CP-21K-FIN", name: "Stadium Arena Finish", km: 21.1, x: START_X + 15, y: START_Y + 15, type: "finish", cutoffTime: "10:30", passedCount: 160, expectedCount: 512, elevation: 120 },
    ],
    runners: [
      { id: "R-201", bib: "A0301", name: "Pham Van X", progress: 0.65, status: "sos", pace: "0:00 (STOPPED)", gap: "SOS Triggered", lastCp: "Peak Vista" },
      { id: "R-202", bib: "A0042", name: "Nguyen Van A", progress: 0.78, status: "leader", pace: "4:15 /km", gap: "+0:00", lastCp: "Forest Descent" },
      { id: "R-203", bib: "A0110", name: "Hoang Van E", progress: 0.52, status: "normal", pace: "4:48 /km", gap: "+6:12", lastCp: "High Ridge" },
    ],
  },
  "42k": {
    id: "42k",
    name: "42K Ultra Marathon",
    distanceKm: 42.2,
    elevationGainM: 1250,
    estTime: "4h 30m",
    activeRunners: 342,
    color: "#FC4C02", // Strava Iconic Red-Orange
    glowColor: "rgba(252,76,2,0.65)",
    description: "The ultimate mountain trail loop traversing two mountain summits and deep alpine gorges.",
    pathD: `M ${START_X},${START_Y} C 160,340 220,200 310,130 C 400,60 520,40 640,50 C 760,60 860,110 910,180 C 960,250 930,360 870,440 C 810,510 680,560 550,560 C 420,560 280,540 200,520 ${START_X},${START_Y}`,
    points: [
      { x: START_X, y: START_Y, km: 0.0, elev: 120 },
      { x: 200, y: 240, km: 7.0, elev: 310 },
      { x: 330, y: 115, km: 14.0, elev: 680 },
      { x: 550, y: 45, km: 21.1, elev: 980 },
      { x: 720, y: 55, km: 28.4, elev: 1250 },
      { x: 910, y: 190, km: 33.0, elev: 850 },
      { x: 840, y: 470, km: 38.0, elev: 420 },
      { x: START_X, y: START_Y, km: 42.2, elev: 120 },
    ],
    checkpoints: [
      { id: "CP-0", name: "Grand Stadium Start", km: 0.0, x: START_X, y: START_Y, type: "start", cutoffTime: "05:00", passedCount: 342, expectedCount: 342, elevation: 120 },
      { id: "CP-42K-1", name: "KM 10 – Foothill Base", km: 10.0, x: 260, y: 170, type: "water", cutoffTime: "06:45", passedCount: 340, expectedCount: 342, elevation: 420 },
      { id: "CP-42K-2", name: "KM 21 – Alpine Hut Halfway", km: 21.1, x: 550, y: 45, type: "aid", cutoffTime: "08:30", passedCount: 325, expectedCount: 342, elevation: 980 },
      { id: "CP-42K-3", name: "KM 28.4 – Eagle Summit Peak", km: 28.4, x: 720, y: 55, type: "medical", cutoffTime: "10:15", passedCount: 298, expectedCount: 342, elevation: 1250 },
      { id: "CP-42K-4", name: "KM 35 – Gorge Bridge Cut-off", km: 35.0, x: 910, y: 270, type: "cutoff", cutoffTime: "11:45", passedCount: 260, expectedCount: 342, elevation: 620 },
      { id: "CP-42K-5", name: "KM 39 – Valley Forest Aid", km: 39.0, x: 670, y: 550, type: "aid", cutoffTime: "12:45", passedCount: 215, expectedCount: 342, elevation: 260 },
      { id: "CP-42K-FIN", name: "Stadium Arena Finish", km: 42.2, x: START_X + 15, y: START_Y + 15, type: "finish", cutoffTime: "14:00", passedCount: 78, expectedCount: 342, elevation: 120 },
    ],
    runners: [
      { id: "R-401", bib: "M0001", name: "Kenyan Elite Kip", progress: 0.82, status: "leader", pace: "3:35 /km", gap: "+0:00", lastCp: "Gorge Bridge Cut-off" },
      { id: "R-402", bib: "M0024", name: "Dang Van G", progress: 0.68, status: "normal", pace: "4:50 /km", gap: "+18:40", lastCp: "Eagle Summit Peak" },
      { id: "R-403", bib: "M0195", name: "Vo Thi F", progress: 0.55, status: "sos", pace: "0:00 (STOPPED)", gap: "SOS Active (KM 28.4)", lastCp: "Eagle Summit Peak" },
      { id: "R-404", bib: "M0077", name: "Nguyen Tuan A", progress: 0.42, status: "normal", pace: "5:12 /km", gap: "+42:10", lastCp: "Alpine Hut Halfway" },
    ],
  },
};

export default function StravaLiveMap({
  onSelectRunner,
  onSelectCheckpoint,
}: {
  onSelectRunner?: (runner: RunnerMarker) => void;
  onSelectCheckpoint?: (cp: CheckpointInfo) => void;
}) {
  const [selectedRouteId, setSelectedRouteId] = useState<RouteCategory["id"] | "all">("21k");
  const [activeLayer, setActiveLayer] = useState<"terrain" | "satellite" | "topo">("terrain");
  const [showElevation, setShowElevation] = useState(true);
  const [showRunners, setShowRunners] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; km: number; elev: number } | null>(null);
  const [hoverCheckpoint, setHoverCheckpoint] = useState<CheckpointInfo | null>(null);
  const [hoverRunner, setHoverRunner] = useState<RunnerMarker | null>(null);

  const activeRoute = selectedRouteId === "all" ? MOCK_ROUTES["21k"] : MOCK_ROUTES[selectedRouteId];

  // Calculate runner position along route points interpolation
  const getRunnerCoordinates = (route: RouteCategory, progress: number) => {
    const pts = route.points;
    if (!pts || pts.length === 0) return { x: START_X, y: START_Y, elev: 120 };
    const targetKm = progress * route.distanceKm;

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      if (targetKm >= p1.km && targetKm <= p2.km) {
        const span = p2.km - p1.km || 1;
        const ratio = (targetKm - p1.km) / span;
        return {
          x: p1.x + (p2.x - p1.x) * ratio,
          y: p1.y + (p2.y - p1.y) * ratio,
          elev: Math.round(p1.elev + (p2.elev - p1.elev) * ratio),
        };
      }
    }
    const last = pts[pts.length - 1];
    return { x: last.x, y: last.y, elev: last.elev };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(10,9,20,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}
    >
      {/* ── Top Bar: Strava Header & Route Category Selector ── */}
      <div
        style={{
          padding: "16px 20px",
          background: "linear-gradient(90deg, rgba(252,76,2,0.12) 0%, rgba(15,14,28,0.95) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
        }}
      >
        {/* Strava Branding & Event Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "5px 10px",
              background: "#FC4C02",
              borderRadius: "6px",
              fontWeight: 900,
              fontSize: "12px",
              color: "#fff",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              boxShadow: "0 0 16px rgba(252,76,2,0.4)",
            }}
          >
            <span>⚡</span> STRAVA LIVE
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
              Race Course Explorer & Live Telemetry
            </h3>
            <span style={{ fontSize: "11px", color: "#94A3B8" }}>
              Common Start: <strong style={{ color: "#10B981" }}>Grand Stadium (KM 0.0)</strong> · All 4 Race Distances
            </span>
          </div>
        </div>

        {/* Category Tabs: 5K, 10K, 21K, 42K, All Routes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(0,0,0,0.4)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.06)",
            gap: "4px",
          }}
        >
          {(["5k", "10k", "21k", "42k"] as const).map((catKey) => {
            const cat = MOCK_ROUTES[catKey];
            const isSelected = selectedRouteId === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedRouteId(catKey)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: isSelected ? `1px solid ${cat.color}` : "1px solid transparent",
                  background: isSelected ? `${cat.color}24` : "transparent",
                  color: isSelected ? cat.color : "#94A3B8",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: cat.color,
                    boxShadow: isSelected ? `0 0 8px ${cat.color}` : "none",
                  }}
                />
                {cat.distanceKm}KM
              </button>
            );
          })}

          {/* All Routes Combined Toggle */}
          <button
            onClick={() => setSelectedRouteId("all")}
            style={{
              padding: "6px 12px",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              border: selectedRouteId === "all" ? "1px solid #A855F7" : "1px solid transparent",
              background: selectedRouteId === "all" ? "rgba(168,85,247,0.22)" : "transparent",
              color: selectedRouteId === "all" ? "#C084FC" : "#64748B",
              transition: "all 0.15s",
            }}
          >
            All Courses
          </button>
        </div>
      </div>

      {/* ── Strava Stats Bar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          background: "rgba(0,0,0,0.35)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "10px 20px",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            Course Distance
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: selectedRouteId === "all" ? "#C084FC" : activeRoute.color, letterSpacing: "-0.02em" }}>
            {selectedRouteId === "all" ? "4 Events Active" : `${activeRoute.distanceKm} km`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            Elevation Gain
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
            {selectedRouteId === "all" ? "+1,250 m max" : `+${activeRoute.elevationGainM} m`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            Est. Leader Time
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
            {selectedRouteId === "all" ? "0h 28m – 4h 30m" : activeRoute.estTime}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            Checkpoints
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#10B981", letterSpacing: "-0.02em" }}>
            {selectedRouteId === "all" ? "12 Unique CPs" : `${activeRoute.checkpoints.length} Stations`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            Runners On Route
          </div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#F59E0B", letterSpacing: "-0.02em" }}>
            {selectedRouteId === "all" ? "1,634 total" : `${activeRoute.activeRunners} runners`}
          </div>
        </div>
      </div>

      {/* ── Main Map Canvas Viewport ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "440px",
          background: "#080711",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Layer Controls & Map Tools (Top Left Overlay) */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Layer switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(6,5,12,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "2px",
              backdropFilter: "blur(8px)",
            }}
          >
            {(["terrain", "topo", "satellite"] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                style={{
                  padding: "4px 9px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "capitalize",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: activeLayer === layer ? "#FC4C02" : "transparent",
                  color: activeLayer === layer ? "#fff" : "#94A3B8",
                }}
              >
                {layer}
              </button>
            ))}
          </div>

          {/* Feature toggles */}
          <div
            style={{
              display: "flex",
              gap: "6px",
            }}
          >
            <button
              onClick={() => setShowRunners(!showRunners)}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "6px",
                background: showRunners ? "rgba(16,185,129,0.2)" : "rgba(0,0,0,0.6)",
                border: `1px solid ${showRunners ? "#10B981" : "rgba(255,255,255,0.1)"}`,
                color: showRunners ? "#10B981" : "#64748B",
                cursor: "pointer",
              }}
            >
              🏃 Runners {showRunners ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setShowCheckpoints(!showCheckpoints)}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "6px",
                background: showCheckpoints ? "rgba(245,158,11,0.2)" : "rgba(0,0,0,0.6)",
                border: `1px solid ${showCheckpoints ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
                color: showCheckpoints ? "#F59E0B" : "#64748B",
                cursor: "pointer",
              }}
            >
              📍 CPs {showCheckpoints ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Compass & Scale Overlay (Top Right) */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            zIndex: 15,
            background: "rgba(6,5,12,0.85)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "6px 10px",
            borderRadius: "8px",
            fontSize: "10px",
            color: "#94A3B8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ fontWeight: 800, color: "#FC4C02" }}>N ▲</span>
          <span>1:25,000 GPS</span>
        </div>

        {/* ── Vector Map SVG Canvas ── */}
        <svg
          viewBox="0 0 1000 600"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            cursor: "crosshair",
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * 1000;
            const svgY = ((e.clientY - rect.top) / rect.height) * 600;

            // Find closest route point
            let closest = activeRoute.points[0];
            let minD = 999999;
            for (const pt of activeRoute.points) {
              const d = Math.hypot(pt.x - svgX, pt.y - svgY);
              if (d < minD) {
                minD = d;
                closest = pt;
              }
            }
            if (minD < 80) {
              setHoverPoint(closest);
            } else {
              setHoverPoint(null);
            }
          }}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="strava-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>

            {/* Glowing polyline filter for Strava glow effect */}
            <filter id="strava-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient for 42k route */}
            <linearGradient id="grad-42k" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FC4C02" />
              <stop offset="50%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FFD000" />
            </linearGradient>
          </defs>

          {/* Dark Terrain Base Layer */}
          <rect width="1000" height="600" fill="#06050C" />

          {/* Satellite / Terrain Hills Shading Simulation */}
          <g opacity={activeLayer === "satellite" ? "0.35" : activeLayer === "topo" ? "0.2" : "0.15"}>
            <ellipse cx="600" cy="180" rx="340" ry="140" fill="#1E293B" />
            <ellipse cx="750" cy="240" rx="220" ry="180" fill="#334155" />
            <ellipse cx="320" cy="280" rx="260" ry="160" fill="#1E293B" />
          </g>

          {/* Topographic Contour Lines */}
          <g fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1">
            <path d="M 50,200 Q 250,120 500,160 T 950,120" />
            <path d="M 50,300 Q 300,220 600,240 T 950,220" />
            <path d="M 50,400 Q 350,320 650,340 T 950,320" />
            <path d="M 150,550 Q 450,420 750,440 T 950,420" />
            {/* Mountain Summit Contour Rings */}
            <ellipse cx="720" cy="120" rx="140" ry="70" stroke="rgba(245,158,11,0.12)" />
            <ellipse cx="720" cy="120" rx="90" ry="45" stroke="rgba(245,158,11,0.15)" />
            <ellipse cx="720" cy="120" rx="40" ry="20" stroke="rgba(245,158,11,0.22)" />
            <text x="720" y="123" fill="rgba(245,158,11,0.4)" fontSize="9" textAnchor="middle">▲ 1,250m Summit</text>
          </g>

          {/* Central Lake / River Body */}
          <path
            d="M 220,530 C 260,460 340,440 380,470 C 420,500 360,560 300,560 Z"
            fill="rgba(6,182,212,0.12)"
            stroke="rgba(6,182,212,0.3)"
            strokeWidth="1.5"
          />
          <text x="320" y="505" fill="rgba(6,182,212,0.4)" fontSize="10" fontWeight="bold" textAnchor="middle">
            Lake Victoria Park
          </text>

          {/* Grid Overlay */}
          <rect width="1000" height="600" fill="url(#strava-grid)" pointerEvents="none" />

          {/* ── Draw Inactive Routes in Background when in Single or All Mode ── */}
          {(Object.keys(MOCK_ROUTES) as RouteCategory["id"][]).map((rId) => {
            const r = MOCK_ROUTES[rId];
            const isCurrent = selectedRouteId === rId;
            const isAll = selectedRouteId === "all";

            if (isCurrent && !isAll) return null; // Drawn in active layer

            return (
              <g key={rId} opacity={isAll ? "0.9" : "0.22"}>
                {/* Background route polyline */}
                <path
                  d={r.pathD}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={isAll ? "4" : "2.5"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={isAll ? "none" : "6,4"}
                />
              </g>
            );
          })}

          {/* ── Active Route Polyline (Glow + Solid Center) ── */}
          {selectedRouteId !== "all" && (
            <g>
              {/* Outer Glow Halo */}
              <path
                d={activeRoute.pathD}
                fill="none"
                stroke={activeRoute.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
                filter="url(#strava-glow)"
              />
              {/* Core Strava Solid Polyline */}
              <path
                d={activeRoute.pathD}
                fill="none"
                stroke={activeRoute.color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* White Center Tracking Strip */}
              <path
                d={activeRoute.pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </g>
          )}

          {/* ── Common Start Point Beacon (Same location for all routes!) ── */}
          <g transform={`translate(${START_X}, ${START_Y})`}>
            {/* Outer radar pulse */}
            <circle r="22" fill="rgba(16,185,129,0.18)" className="animate-ping-slow" />
            <circle r="12" fill="#10B981" />
            <circle r="5" fill="#ffffff" />
            {/* Start Pin Label */}
            <rect x="-42" y="-34" width="84" height="20" rx="5" fill="#10B981" />
            <text x="0" y="-20" fill="#000" fontSize="10" fontWeight="900" textAnchor="middle">
              🏁 START LINE
            </text>
          </g>

          {/* ── Checkpoints & Stations Along Route ── */}
          {showCheckpoints &&
            activeRoute.checkpoints.map((cp) => {
              if (cp.type === "start") return null; // already rendered start
              const isFinish = cp.type === "finish";
              const isHovered = hoverCheckpoint?.id === cp.id;

              return (
                <g
                  key={cp.id}
                  transform={`translate(${cp.x}, ${cp.y})`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverCheckpoint(cp)}
                  onMouseLeave={() => setHoverCheckpoint(null)}
                  onClick={() => onSelectCheckpoint?.(cp)}
                >
                  {/* Pin Circle */}
                  <circle
                    r={isFinish ? "10" : "8"}
                    fill={isFinish ? "#EC4899" : cp.type === "medical" ? "#EF4444" : "#F59E0B"}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Checkpoint Tag */}
                  <g transform="translate(0, -18)">
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="18"
                      rx="4"
                      fill={isHovered ? "#ffffff" : "rgba(10,9,20,0.92)"}
                      stroke={isFinish ? "#EC4899" : "#F59E0B"}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="1"
                      fill={isHovered ? "#000000" : "#ffffff"}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isFinish ? "🏆 FINISH" : `KM ${cp.km}`}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* ── Runners Telemetry Dots ── */}
          {showRunners &&
            activeRoute.runners.map((r) => {
              const pos = getRunnerCoordinates(activeRoute, r.progress);
              const isSos = r.status === "sos";
              const isDev = r.status === "deviation";
              const isLeader = r.status === "leader";

              return (
                <g
                  key={r.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverRunner(r)}
                  onMouseLeave={() => setHoverRunner(null)}
                  onClick={() => onSelectRunner?.(r)}
                >
                  {/* Pulse for alerts or leader */}
                  {(isSos || isDev || isLeader) && (
                    <circle
                      r={isSos ? "20" : "14"}
                      fill={isSos ? "rgba(239,68,68,0.3)" : isDev ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}
                      className="animate-ping-slow"
                    />
                  )}

                  {/* Runner Marker */}
                  <circle
                    r={isSos ? "8" : "6"}
                    fill={isSos ? "#EF4444" : isDev ? "#F59E0B" : isLeader ? "#10B981" : "#38BDF8"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* BIB Badge Overlay */}
                  <rect
                    x="-20"
                    y="10"
                    width="40"
                    height="14"
                    rx="3"
                    fill="rgba(0,0,0,0.85)"
                    stroke={isSos ? "#EF4444" : "rgba(255,255,255,0.2)"}
                    strokeWidth="0.8"
                  />
                  <text x="0" y="20" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {r.bib}
                  </text>
                </g>
              );
            })}

          {/* ── Hovered Scrubber Point ── */}
          {hoverPoint && (
            <g transform={`translate(${hoverPoint.x}, ${hoverPoint.y})`}>
              <circle r="7" fill="#ffffff" stroke="#FC4C02" strokeWidth="3" />
              <rect x="-45" y="-36" width="90" height="24" rx="5" fill="#000000" stroke="#FC4C02" strokeWidth="1" />
              <text x="0" y="-24" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                {hoverPoint.km.toFixed(1)} km · {hoverPoint.elev}m
              </text>
            </g>
          )}
        </svg>

        {/* ── Checkpoint Hover Tooltip Card ── */}
        {hoverCheckpoint && (
          <div
            className="animate-slide-up"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              zIndex: 20,
              background: "rgba(13,12,24,0.95)",
              border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
              minWidth: "220px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>{hoverCheckpoint.name}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#F59E0B" }}>KM {hoverCheckpoint.km}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "6px" }}>
              Elevation: <strong style={{ color: "#fff" }}>{hoverCheckpoint.elevation} m</strong> · Cut-off:{" "}
              <strong style={{ color: "#EF4444" }}>{hoverCheckpoint.cutoffTime}</strong>
            </div>
            <div style={{ fontSize: "11px", color: "#10B981", fontWeight: 600 }}>
              Passed: {hoverCheckpoint.passedCount} / {hoverCheckpoint.expectedCount} runners
            </div>
          </div>
        )}

        {/* ── Runner Hover Tooltip Card ── */}
        {hoverRunner && (
          <div
            className="animate-slide-up"
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              zIndex: 20,
              background: "rgba(13,12,24,0.95)",
              border: `1px solid ${hoverRunner.status === "sos" ? "#EF4444" : "rgba(6,182,212,0.4)"}`,
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
              minWidth: "220px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>BIB {hoverRunner.bib}</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: hoverRunner.status === "sos" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
                  color: hoverRunner.status === "sos" ? "#EF4444" : "#10B981",
                }}
              >
                {hoverRunner.status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#94A3B8" }}>{hoverRunner.name}</div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
              Pace: <strong style={{ color: "#fff" }}>{hoverRunner.pace}</strong> · Last CP: {hoverRunner.lastCp}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom: Strava Elevation Profile Graph ── */}
      {showElevation && selectedRouteId !== "all" && (
        <div
          style={{
            padding: "14px 20px 18px",
            background: "rgba(6,5,12,0.9)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8" }}>
                ⛰️ Elevation Profile
              </span>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                Min: 120m · Max: {Math.max(...activeRoute.points.map((p) => p.elev))}m · Gain: +{activeRoute.elevationGainM}m
              </span>
            </div>
            <div style={{ fontSize: "11px", color: activeRoute.color, fontWeight: 700 }}>
              {activeRoute.name}
            </div>
          </div>

          {/* Elevation Area Chart SVG */}
          <div style={{ position: "relative", width: "100%", height: "70px" }}>
            <svg
              viewBox="0 0 1000 70"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`elev-grad-${activeRoute.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeRoute.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={activeRoute.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Build polygon path from points */}
              {(() => {
                const pts = activeRoute.points;
                const maxE = Math.max(...pts.map((p) => p.elev), 1);
                const minE = 100;
                const svgPts = pts.map((p) => {
                  const x = (p.km / activeRoute.distanceKm) * 1000;
                  const y = 65 - ((p.elev - minE) / (maxE - minE)) * 55;
                  return `${x},${y}`;
                });

                const polyPath = `M 0,70 L ${svgPts.join(" L ")} L 1000,70 Z`;
                const strokePath = `M ${svgPts.join(" L ")}`;

                return (
                  <g>
                    {/* Fill */}
                    <path d={polyPath} fill={`url(#elev-grad-${activeRoute.id})`} />
                    {/* Stroke */}
                    <path d={strokePath} fill="none" stroke={activeRoute.color} strokeWidth="2" />

                    {/* Checkpoint vertical lines on elevation graph */}
                    {activeRoute.checkpoints.map((cp) => {
                      const cpX = (cp.km / activeRoute.distanceKm) * 1000;
                      return (
                        <g key={cp.id}>
                          <line
                            x1={cpX}
                            y1="10"
                            x2={cpX}
                            y2="70"
                            stroke="rgba(255,255,255,0.15)"
                            strokeDasharray="2,2"
                          />
                          <text x={cpX + 4} y="18" fill="#64748B" fontSize="8">
                            {cp.km}k
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
