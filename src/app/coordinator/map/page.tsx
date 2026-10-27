"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Flag, MapPin } from "lucide-react";
import { SectionHeader, Card, Badge, Btn, Button } from "@/components/ui";
import RaceRouteMap from "@/components/sections/RaceRouteMap";
import { RouteTab } from "@/context/ActiveTabContext";
import { getCoordinatorMapEvent } from "@/api/coordinator-map";
import { getEventCourse } from "@/api/race-map";
import { listMyStaffAssignments, type StaffAssignmentDto } from "@/api/check-in";
import { mapCoordinatorDistance } from "@/lib/coordinator-map.mapper";
import { courseToCheckpoints } from "@/lib/race-map.mapper";
import { getApiErrorMessage } from "@/lib/error";
import type { CoordinatorMapEventDto } from "@/dto/coordinator-map.dto";
import type { CourseConfigDto } from "@/dto/race-map.dto";

export default function CoordinatorMapPage() {
  const [assignments, setAssignments] = useState<StaffAssignmentDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listMyStaffAssignments().then((items) => {
      if (!active) return;
      setAssignments(items.filter((item) =>
        item.role.toLowerCase() === "coordinator" && item.status.toLowerCase() === "active"
      ));
    }).catch((error) => {
      if (active) setError(getApiErrorMessage(error, "Unable to load event assignments."));
    });
    return () => { active = false; };
  }, []);

  const selected = assignments?.[0];
  const eventDate = selected?.eventDate ? new Date(`${selected.eventDate}T00:00:00`) : null;

  return (
    <RouteTab tab="map">
      <div className="space-y-4">
        {selected ? (
          <>
            <Card>
              <section aria-labelledby="assigned-event-name" className="flex items-start gap-3 sm:gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                  <Flag className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Assigned event</p>
                    <Badge variant="secondary" className="px-2 py-0 text-[11px] font-medium">Coordinator</Badge>
                  </div>
                  <h1 id="assigned-event-name" className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                    {selected.eventName}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {eventDate && !Number.isNaN(eventDate.getTime()) && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                        <time dateTime={selected.eventDate ?? undefined}>
                          {eventDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </time>
                      </span>
                    )}
                    {selected.stationLabel && (
                      <span className="inline-flex min-w-0 items-start gap-1.5">
                        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        {selected.stationLabel}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </Card>
            <CoordinatorEventMap key={selected.eventId} assignment={selected} />
          </>
        ) : (
          <div role={error ? "alert" : "status"} className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
            {error ?? (assignments ? "You have no active coordinator assignments." : "Loading assignments…")}
          </div>
        )}
      </div>
    </RouteTab>
  );
}

function CoordinatorEventMap({ assignment }: { assignment: StaffAssignmentDto }) {
  const [event, setEvent] = useState<CoordinatorMapEventDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDistId, setSelectedDistId] = useState("");
  const [distanceIdInput, setDistanceIdInput] = useState("");
  const [courseResult, setCourseResult] = useState<{
    distanceId: string;
    course: CourseConfigDto | null;
    error?: string;
  } | null>(null);
  const [activeAlert, setActiveAlert] = useState<string | null>("SOS-001");

  useEffect(() => {
    let active = true;
    getCoordinatorMapEvent(assignment.eventId)
      .then((dto) => {
        if (!active) return;
        setEvent(dto);
        setSelectedDistId(dto.distances.find((distance) => distance.id)?.id ?? "");
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(getApiErrorMessage(error, "Unable to load event distances."));
        setEvent({ id: assignment.eventId, name: assignment.eventName, location: "", distances: [] });
      });
    return () => {
      active = false;
    };
  }, [assignment.eventId, assignment.eventName]);

  useEffect(() => {
    if (!selectedDistId) return;
    let active = true;
    getEventCourse(assignment.eventId, selectedDistId).then((course) => {
      if (active) setCourseResult({ distanceId: selectedDistId, course });
    }).catch((error) => {
      if (active) setCourseResult({ distanceId: selectedDistId, course: null, error: getApiErrorMessage(error, "Unable to load the course.") });
    });
    return () => { active = false; };
  }, [assignment.eventId, selectedDistId]);

  const currentResult = courseResult?.distanceId === selectedDistId ? courseResult : null;
  const course = currentResult?.course ?? null;
  const selectedDist = useMemo(() => {
    if (!selectedDistId) return null;
    const distance = event?.distances.find((distance) => distance.id === selectedDistId)
      ?? { id: selectedDistId, name: "Course", type: "", distanceKm: 0 };
    const index = event?.distances.findIndex((distance) => distance.id === selectedDistId) ?? 0;
    return mapCoordinatorDistance(distance, Math.max(0, index), course);
  }, [event, selectedDistId, course]);

  if (!event || !selectedDist) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
        <p role={loadError ? "alert" : "status"}>{loadError ?? (event ? "This event has no distances." : "Loading race map…")}</p>
        {event && (
          <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); setSelectedDistId(distanceIdInput.trim()); }}>
            <p>For a draft event, enter the distance ID supplied by the organizer to view its course.</p>
            <label className="block">Distance ID
              <input required value={distanceIdInput} onChange={(event) => setDistanceIdInput(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </label>
            <button type="submit" disabled={!distanceIdInput.trim()} className="rounded-lg bg-amber-500 px-3 py-2 font-semibold text-slate-950 disabled:opacity-50">Load course</button>
          </form>
        )}
      </div>
    );
  }

  const checkpoints = courseToCheckpoints(course);

  const alerts = [
    { id: "SOS-001", bib: "A0301", name: "Pham Van X", loc: `KM 28.4 – ${selectedDist.name}`, time: "09:22", type: "SOS", severity: "rose" as const, dist: selectedDist.type },
    { id: "DEV-007", bib: "B0089", name: "Le Thi Y", loc: "KM 6.2 – Off route 180m", time: "09:18", type: "DEVIATION", severity: "amber" as const, dist: selectedDist.type },
  ];

  return (
      <div className="animate-slide-up">
        <SectionHeader
          title="Course map"
          desc={`Interactive course map${event.location ? ` for ${event.location}` : ""}. Select a distance to view its route, checkpoints, water stations, and medical posts.`}
          color="#F59E0B"
        />

        {!event.distances.length && (
          <Button variant="outline" onClick={() => setSelectedDistId("")} className="mb-4">Change distance</Button>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {event.distances.map((distance, index) => {
            const isActive = distance.id === selectedDist.id;
            const color = mapCoordinatorDistance(distance, index).color;
            return (
              <Button
                key={distance.id}
                variant="outline"
                onClick={() => setSelectedDistId(distance.id ?? "")}
                disabled={!distance.id}
                aria-pressed={isActive}
                className="h-auto rounded-lg px-4 py-2 text-foreground"
                style={isActive ? { borderColor: color, backgroundColor: `${color}18` } : undefined}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: color, opacity: isActive ? 1 : 0.45 }} />
                {distance.name || `${distance.distanceKm}K`}
              </Button>
            );
          })}
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          {!currentResult ? (
            <div role="status" className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading course…</div>
          ) : currentResult.error ? (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">{currentResult.error}</div>
          ) : selectedDist.route.length < 2 ? (
            <div role="status" className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">No course polyline has been configured for this distance.</div>
          ) : <RaceRouteMap
            route={selectedDist.route}
            startPoint={selectedDist.startPoint}
            finishPoint={selectedDist.finishPoint}
            checkpoints={checkpoints}
            height="min(68vh, 680px)"
            routeColor={selectedDist.color}
          />}

          <div className="flex flex-col gap-3">
            <Card>
              <div className="mb-2 text-sm font-semibold text-foreground">{selectedDist.name}</div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course details</div>
                <Badge label={selectedDist.type} type="violet" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <InfoCell value={`${selectedDist.distanceKm} km`} label="Total distance" color={selectedDist.color} />
                <InfoCell value={selectedDist.elevationGainM == null ? "—" : `+${selectedDist.elevationGainM}m`} label="Elevation gain" color="#06B6D4" />
                <InfoCell value={String(selectedDist.checkpoints.length)} label="Course points" color="#F59E0B" />
                <InfoCell value={selectedDist.runnersCount?.toLocaleString("en-US") ?? "—"} label="Registered" color="#10B981" />
              </div>
              <div className="mt-3 flex justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span>Min: <strong className="text-foreground">{selectedDist.minElevationM == null ? "—" : `${selectedDist.minElevationM}m`}</strong></span>
                <span>Max: <strong className="text-foreground">{selectedDist.maxElevationM == null ? "—" : `${selectedDist.maxElevationM}m`}</strong></span>
              </div>
              {course && <p className="mt-3 text-xs text-muted-foreground">{course.waypoints.length} waypoints · Updated <time dateTime={course.updatedAt}>{new Date(course.updatedAt).toLocaleString("vi-VN")}</time></p>}
            </Card>

            <Card>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Checkpoints ({selectedDist.checkpoints.length})</div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {selectedDist.checkpoints.map((cp, index) => (
                  <div key={cp.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-xs">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-white" style={{ background: checkpointColor(cp.type) }}>
                      {cp.type === "start" ? "S" : cp.type === "finish" ? "F" : index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-foreground">{cp.name}</div>
                      <div className="text-[11px] text-muted-foreground">KM {cp.km} · {cp.elevation ?? "—"}m{cp.cutoff ? ` · ${cp.cutoff}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority alerts ({alerts.length})</div>
                <Badge label="LIVE GPS" type="rose" />
              </div>
              <div className="flex flex-col gap-2.5">
                {alerts.map((alert) => {
                  const isSelected = activeAlert === alert.id;
                  const alertColor = alert.severity === "rose" ? "#EF4444" : "#F59E0B";
                  return (
                    <div key={alert.id} onClick={() => setActiveAlert(alert.id)} className="cursor-pointer rounded-xl border p-3 transition" style={{ background: `${alertColor}0a`, borderColor: isSelected ? alertColor : `${alertColor}44` }}>
                      <div className="mb-1.5 flex items-center justify-between"><Badge label={alert.type} type={alert.severity} /><span className="text-[11px] text-muted-foreground">{alert.time}</span></div>
                      <div className="mb-1 text-sm font-bold text-foreground">BIB {alert.bib} · {alert.name}</div>
                      <div className="mb-2.5 text-[11px] text-muted-foreground">📍 {alert.loc} <span className="text-foreground">({alert.dist})</span></div>
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
    <div className="rounded-lg border border-border bg-muted/40 p-2.5">
      <div className="text-xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
