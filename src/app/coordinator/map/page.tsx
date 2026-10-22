"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader, Card, Badge, Btn } from "@/components/ui";
import RaceRouteMap from "@/components/sections/RaceRouteMap";
import type { Checkpoint } from "@/components/sections/RaceRouteMap";
import { RouteTab } from "@/context/ActiveTabContext";
import { getCoordinatorMapEvent } from "@/api/coordinator-map";
import { mapCoordinatorEvent } from "@/lib/coordinator-map.mapper";
import type { CoordinatorMapEvent } from "@/dto/coordinator-map.dto";

const CP_TYPE_MAP: Record<string, NonNullable<Checkpoint["type"]>> = {
  water: "WATER",
  medical: "MEDICAL",
  aid: "AID",
  cutoff: "TIMING",
  checkpoint: "CHECKPOINT",
  start: "CHECKPOINT",
  finish: "CHECKPOINT",
  cp: "TIMING",
};

export default function CoordinatorMapPage() {
  const [event, setEvent] = useState<CoordinatorMapEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDistId, setSelectedDistId] = useState("");
  const [activeAlert, setActiveAlert] = useState<string | null>("SOS-001");

  useEffect(() => {
    let active = true;
    getCoordinatorMapEvent()
      .then((dto) => {
        if (!active) return;
        const mapped = mapCoordinatorEvent(dto);
        setEvent(mapped);
        setSelectedDistId(mapped.distances[0]?.id ?? "");
      })
      .catch(() => {
        if (active) setLoadError("Unable to load the race map. Check the map API configuration and try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedDist = useMemo(
    () => event?.distances.find((distance) => distance.id === selectedDistId) ?? event?.distances[0],
    [event, selectedDistId]
  );

  if (!event || !selectedDist) {
    return (
      <RouteTab tab="map">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-sm text-slate-300">
          {loadError ?? "Loading race map…"}
        </div>
      </RouteTab>
    );
  }

  const checkpoints: Checkpoint[] = selectedDist.checkpoints
    .filter((cp) => cp.type !== "start" && cp.type !== "finish")
    .map((cp) => ({
      id: cp.id,
      name: cp.name,
      latitude: cp.lat,
      longitude: cp.lng,
      distanceFromStart: cp.km * 1000,
      type: CP_TYPE_MAP[cp.type.toLowerCase()] ?? "CHECKPOINT",
      description: [cp.cutoff ? `Cutoff: ${cp.cutoff}` : "", cp.elevation != null ? `Elevation: ${cp.elevation}m` : ""]
        .filter(Boolean)
        .join(" · "),
    }));

  const alerts = [
    { id: "SOS-001", bib: "A0301", name: "Pham Van X", loc: `KM 28.4 – ${selectedDist.name}`, time: "09:22", type: "SOS", severity: "rose" as const, dist: selectedDist.type },
    { id: "DEV-007", bib: "B0089", name: "Le Thi Y", loc: "KM 6.2 – Off route 180m", time: "09:18", type: "DEVIATION", severity: "amber" as const, dist: selectedDist.type },
  ];

  return (
    <RouteTab tab="map">
      <div className="animate-slide-up">
        <SectionHeader
          id="FR-OPS-01"
          title={`Race Route Map — ${event.name}`}
          desc={`Interactive course map for ${event.location}. Select a distance to view its route, checkpoints, water stations, and medical posts.`}
          color="#F59E0B"
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {event.distances.map((distance) => {
            const isActive = distance.id === selectedDist.id;
            return (
              <button
                key={distance.id}
                onClick={() => setSelectedDistId(distance.id)}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition"
                style={{
                  borderColor: isActive ? distance.color : "rgba(255,255,255,0.1)",
                  background: isActive ? `${distance.color}18` : "rgba(255,255,255,0.03)",
                  color: isActive ? distance.color : "rgba(255,255,255,0.55)",
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: distance.color, opacity: isActive ? 1 : 0.45 }} />
                {distance.type} — {distance.name}
              </button>
            );
          })}
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <RaceRouteMap
            route={selectedDist.route}
            startPoint={selectedDist.startPoint}
            finishPoint={selectedDist.finishPoint}
            checkpoints={checkpoints}
            height="min(68vh, 680px)"
            routeColor={selectedDist.color}
          />

          <div className="flex flex-col gap-3">
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Course details</div>
                <Badge label={selectedDist.type} type="violet" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <InfoCell value={`${selectedDist.distanceKm} km`} label="Total distance" color={selectedDist.color} />
                <InfoCell value={`+${selectedDist.elevationGainM}m`} label="Elevation gain" color="#06B6D4" />
                <InfoCell value={String(selectedDist.checkpoints.length)} label="Course points" color="#F59E0B" />
                <InfoCell value={selectedDist.runnersCount.toLocaleString("en-US")} label="Registered" color="#10B981" />
              </div>
              <div className="mt-3 flex justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
                <span>Min: <strong className="text-white">{selectedDist.minElevationM}m</strong></span>
                <span>Max: <strong className="text-white">{selectedDist.maxElevationM}m</strong></span>
              </div>
            </Card>

            <Card>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Checkpoints ({selectedDist.checkpoints.length})</div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {selectedDist.checkpoints.map((cp, index) => (
                  <div key={cp.id} className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2 text-xs">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-white" style={{ background: checkpointColor(cp.type) }}>
                      {cp.type === "start" ? "S" : cp.type === "finish" ? "F" : index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-white">{cp.name}</div>
                      <div className="text-[11px] text-slate-500">KM {cp.km} · {cp.elevation ?? "—"}m{cp.cutoff ? ` · ${cp.cutoff}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority alerts ({alerts.length})</div>
                <Badge label="LIVE GPS" type="rose" />
              </div>
              <div className="flex flex-col gap-2.5">
                {alerts.map((alert) => {
                  const isSelected = activeAlert === alert.id;
                  const alertColor = alert.severity === "rose" ? "#EF4444" : "#F59E0B";
                  return (
                    <div key={alert.id} onClick={() => setActiveAlert(alert.id)} className="cursor-pointer rounded-xl border p-3 transition" style={{ background: `${alertColor}0a`, borderColor: isSelected ? alertColor : `${alertColor}44` }}>
                      <div className="mb-1.5 flex items-center justify-between"><Badge label={alert.type} type={alert.severity} /><span className="text-[11px] text-slate-500">{alert.time}</span></div>
                      <div className="mb-1 text-sm font-bold text-white">BIB {alert.bib} · {alert.name}</div>
                      <div className="mb-2.5 text-[11px] text-slate-400">📍 {alert.loc} <span style={{ color: "#F59E0B" }}>({alert.dist})</span></div>
                      <div className="flex gap-1.5">
                        <Btn label="Dispatch 🚑" primary small color="#F59E0B" colorRgb="245,158,11" />
                        <Btn label="Radio contact" small color="#F59E0B" colorRgb="245,158,11" />
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

function checkpointColor(type: string) {
  if (type === "start") return "#10B981";
  if (type === "finish" || type === "medical") return "#EF4444";
  if (type === "water") return "#3B82F6";
  if (type === "aid") return "#A16207";
  return "#F59E0B";
}

function InfoCell({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
      <div className="text-xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}
