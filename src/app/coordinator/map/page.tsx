"use client";

import { useState, useMemo } from "react";
import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import RaceRouteMap from "@/components/sections/RaceRouteMap";
import type { Coordinate, Checkpoint } from "@/components/sections/RaceRouteMap";
import { RouteTab } from "@/context/ActiveTabContext";
import eventsData from "@/events.json";

// ─── Map checkpoint types from events.json → RaceRouteMap types ─────────────
const CP_TYPE_MAP: Record<string, Checkpoint["type"]> = {
  water: "WATER",
  medical: "MEDICAL",
  aid: "WATER",
  cutoff: "TIMING",
  start: "CHECKPOINT",
  finish: "CHECKPOINT",
};

// ─── Derive the active event (first "live" event, or first overall) ─────────
const activeEvent =
  eventsData.find((e) => e.status === "live") ?? eventsData[0];

type DistanceEntry = (typeof activeEvent.distances)[number];

export default function CoordinatorMapPage() {
  const distances = activeEvent.distances;
  const [selectedDistId, setSelectedDistId] = useState(distances[0].type);

  const selectedDist: DistanceEntry = useMemo(
    () => distances.find((d) => d.type === selectedDistId) ?? distances[0],
    [distances, selectedDistId]
  );

  // ── Convert events.json data → RaceRouteMapProps ─────────────────────────
  const route: Coordinate[] = selectedDist.leafletPolyline.map(
    (point) => ({ lat: point[0], lng: point[1] })
  );

  const startPoint: Coordinate = {
    lat: selectedDist.startLocation.lat,
    lng: selectedDist.startLocation.lng,
  };

  const finishPoint: Coordinate = {
    lat: selectedDist.finishLocation.lat,
    lng: selectedDist.finishLocation.lng,
  };

  // Filter out start/finish from checkpoints (they already have dedicated markers)
  const checkpoints: Checkpoint[] = selectedDist.checkpoints
    .filter((cp) => cp.type !== "start" && cp.type !== "finish")
    .map((cp) => ({
      id: cp.id,
      name: cp.name,
      latitude: cp.lat,
      longitude: cp.lng,
      distanceFromStart: cp.km * 1000, // km → meters
      type: CP_TYPE_MAP[cp.type] ?? "CHECKPOINT",
      description: `Cutoff: ${cp.cutoff} · Elevation: ${cp.elevation}m`,
    }));

  // ── Alert data (same as before) ──────────────────────────────────────────
  const alerts = [
    {
      id: "SOS-001",
      bib: "A0301",
      name: "Pham Van X",
      loc: `KM 28.4 – ${selectedDist.name}`,
      time: "09:22",
      type: "SOS",
      severity: "rose" as const,
      dist: selectedDist.type,
    },
    {
      id: "DEV-007",
      bib: "B0089",
      name: "Le Thi Y",
      loc: `KM 6.2 – Off route 180m`,
      time: "09:18",
      type: "DEVIATION",
      severity: "amber" as const,
      dist: selectedDist.type,
    },
  ];

  const [activeAlert, setActiveAlert] = useState<string | null>("SOS-001");

  return (
    <RouteTab tab="map">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-OPS-01"
          title={`Race Route Map — ${activeEvent.name}`}
          desc={`Interactive GPS route map for ${activeEvent.location}. Select a distance category to view route, checkpoints, water stations, and medical posts.`}
          color="#F59E0B"
        />

        {/* ── Distance selector tabs ────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "18px",
            flexWrap: "wrap",
          }}
        >
          {distances.map((d) => {
            const isActive = d.type === selectedDistId;
            return (
              <button
                key={d.type}
                onClick={() => setSelectedDistId(d.type)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  border: `1.5px solid ${isActive ? d.color : "rgba(255,255,255,0.1)"}`,
                  background: isActive
                    ? `${d.color}18`
                    : "rgba(255,255,255,0.03)",
                  color: isActive ? d.color : "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: d.color,
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
                {d.type} — {d.name}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* ── Leaflet Race Route Map ──────────────────────────────────── */}
          <RaceRouteMap
            route={route}
            startPoint={startPoint}
            finishPoint={finishPoint}
            checkpoints={checkpoints}
            height="580px"
            routeColor={selectedDist.color}
          />

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Course Info Card */}
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  📍 Course Details
                </div>
                <Badge label={selectedDist.type} type="violet" />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <InfoCell
                  value={`${selectedDist.distanceKm} km`}
                  label="Total Distance"
                  color={selectedDist.color}
                />
                <InfoCell
                  value={`+${selectedDist.elevationGainM}m`}
                  label="Elevation Gain"
                  color="#06B6D4"
                />
                <InfoCell
                  value={String(selectedDist.checkpoints.length)}
                  label="Checkpoints"
                  color="#F59E0B"
                />
                <InfoCell
                  value={selectedDist.runnersCount.toLocaleString("en-US")}
                  label="Registered"
                  color="#10B981"
                />
              </div>
              {/* Elevation range */}
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: "12px",
                  color: "#94A3B8",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  Min:{" "}
                  <strong style={{ color: "#fff" }}>
                    {selectedDist.minElevationM}m
                  </strong>
                </span>
                <span>
                  Max:{" "}
                  <strong style={{ color: "#fff" }}>
                    {selectedDist.maxElevationM}m
                  </strong>
                </span>
              </div>
            </Card>

            {/* Checkpoints list */}
            <Card>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "12px",
                }}
              >
                🏁 Checkpoints ({selectedDist.checkpoints.length})
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {selectedDist.checkpoints.map((cp, i) => (
                  <div
                    key={cp.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "12px",
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius:
                          cp.type === "start" || cp.type === "finish"
                            ? "50%"
                            : "6px",
                        background:
                          cp.type === "start"
                            ? "#10B981"
                            : cp.type === "finish"
                            ? "#EF4444"
                            : cp.type === "water" || cp.type === "aid"
                            ? "#3B82F6"
                            : cp.type === "medical"
                            ? "#EF4444"
                            : "#F59E0B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "10px",
                        flexShrink: 0,
                      }}
                    >
                      {cp.type === "start"
                        ? "S"
                        : cp.type === "finish"
                        ? "F"
                        : i}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#fff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cp.name}
                      </div>
                      <div style={{ color: "#64748B", fontSize: "11px" }}>
                        KM {cp.km} · {cp.elevation}m · ⏱ {cp.cutoff}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Incidents Card */}
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  🚨 Priority Alerts (2)
                </div>
                <Badge label="LIVE GPS" type="rose" />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {alerts.map((a) => {
                  const isSelected = activeAlert === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => setActiveAlert(a.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        background:
                          a.severity === "rose"
                            ? "rgba(239,68,68,0.06)"
                            : "rgba(245,158,11,0.06)",
                        border: `1px solid ${
                          isSelected
                            ? a.severity === "rose"
                              ? "#EF4444"
                              : "#F59E0B"
                            : a.severity === "rose"
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(245,158,11,0.2)"
                        }`,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <Badge label={a.type} type={a.severity} />
                        <span style={{ fontSize: "11px", color: "#64748B" }}>
                          {a.time}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#fff",
                          marginBottom: "2px",
                        }}
                      >
                        BIB {a.bib} · {a.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          marginBottom: "10px",
                        }}
                      >
                        📍 {a.loc}{" "}
                        <span style={{ color: "#F59E0B" }}>({a.dist})</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Btn
                          label="Dispatch 🚑"
                          primary
                          small
                          color="#F59E0B"
                          colorRgb="245,158,11"
                        />
                        <Btn
                          label="Radio Contact"
                          small
                          color="#F59E0B"
                          colorRgb="245,158,11"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </RouteTab>
  );
}

// ─── Small info cell used in the sidebar ────────────────────────────────────
function InfoCell({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "10px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#64748B" }}>{label}</div>
    </div>
  );
}
