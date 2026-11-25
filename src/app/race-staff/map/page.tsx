"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LocateFixed, MapPin } from "lucide-react";
import { SectionHeader, Card, Badge, Button } from "@/components/ui";
import RaceRouteMap, { type LiveMapMarker } from "@/components/sections/RaceRouteMap";
import { RouteTab } from "@/context/ActiveTabContext";
import { getCoordinatorMapEvent } from "@/api/coordinator-map";
import { getEventCourse } from "@/api/race-map";
import { listMyStaffAssignments, type StaffAssignmentDto } from "@/api/check-in";
import { mapCoordinatorDistance } from "@/lib/coordinator-map.mapper";
import { courseToCheckpoints } from "@/lib/race-map.mapper";
import { getApiErrorMessage } from "@/lib/error";
import type { CoordinatorMapEventDto } from "@/dto/coordinator-map.dto";
import type { CourseConfigDto } from "@/dto/race-map.dto";
import { isActiveRaceStaffAssignment } from "@/lib/staff-assignment";
import { useAuthStore } from "@/stores/auth-store";
import { useLiveStaffPositions } from "./use-live-staff-positions";

export default function RaceStaffMapPage() {
  const [assignments, setAssignments] = useState<StaffAssignmentDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listMyStaffAssignments().then((items) => {
      if (!active) return;
      setAssignments(items.filter(isActiveRaceStaffAssignment));
    }).catch((error) => {
      if (active) setError(getApiErrorMessage(error, "Không tải được danh sách phân công sự kiện."));
    });
    return () => { active = false; };
  }, []);

  const selected = assignments?.[0];

  return (
    <RouteTab tab="map">
      <div className="xl:-mb-12 xl:h-[calc(100%+3rem)]">
        {selected ? (
          <CoordinatorEventMap key={selected.eventId} assignment={selected} />
        ) : (
          <div role={error ? "alert" : "status"} className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
            {error ?? (assignments ? "Bạn chưa có phân công Race-staff nào đang hoạt động." : "Đang tải phân công…")}
          </div>
        )}
      </div>
    </RouteTab>
  );
}

function CoordinatorEventMap({ assignment }: { assignment: StaffAssignmentDto }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [event, setEvent] = useState<CoordinatorMapEventDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDistId, setSelectedDistId] = useState("");
  const [distanceIdInput, setDistanceIdInput] = useState("");
  const [courseResult, setCourseResult] = useState<{
    distanceId: string;
    course: CourseConfigDto | null;
    error?: string;
  } | null>(null);
  const [liveFocus, setLiveFocus] = useState<{ id: string; revision: number } | null>(null);
  const [panelPage, setPanelPage] = useState<0 | 1>(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const { positions, error: gpsError } = useLiveStaffPositions(assignment.eventId);
  const checkpoints = useMemo(() => courseToCheckpoints(courseResult?.course ?? null), [courseResult]);
  const liveMarkers: LiveMapMarker[] = (positions ?? []).map((person) => ({
    id: person.userId,
    name: person.userId === currentUserId ? `${person.name} (tôi)` : person.name,
    role: person.roles.map((role) => role === "photographer" ? "Photographer" : "Race-staff").join(" · "),
    station: person.stations.map(({ id, label }) => {
      if (id === "duty:float") return "Di động";
      if (label) return label;
      return id.startsWith("map:") ? `Checkpoint ${id.split(":").slice(2).join(":")}` : id;
    }).join(" · ") || "Chưa được phân trạm",
    lat: person.latitude,
    lng: person.longitude,
  })).sort((first, second) => first.name.localeCompare(second.name));

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
        setLoadError(getApiErrorMessage(error, "Không tải được danh sách cự ly của sự kiện."));
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
      if (active) setCourseResult({ distanceId: selectedDistId, course: null, error: getApiErrorMessage(error, "Không tải được cung đường.") });
    });
    return () => { active = false; };
  }, [assignment.eventId, selectedDistId]);

  const currentResult = courseResult?.distanceId === selectedDistId ? courseResult : null;
  const course = currentResult?.course ?? null;
  const selectedDist = useMemo(() => {
    if (!selectedDistId) return null;
    const distance = event?.distances.find((distance) => distance.id === selectedDistId)
      ?? { id: selectedDistId, name: "Cung đường", type: "", distanceKm: 0 };
    const index = event?.distances.findIndex((distance) => distance.id === selectedDistId) ?? 0;
    return mapCoordinatorDistance(distance, Math.max(0, index), course);
  }, [event, selectedDistId, course]);

  if (!event) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
        <p role="status">Đang tải bản đồ giải chạy…</p>
      </div>
    );
  }

  const courseMessage = loadError ?? currentResult?.error ?? (!selectedDist
    ? "Sự kiện này chưa có cự ly nào."
    : !currentResult ? "Đang tải cung đường…" : selectedDist.route.length < 2
      ? "Cự ly này chưa được cấu hình đường chạy." : null);
  const eventDate = assignment.eventDate ? new Date(`${assignment.eventDate}T00:00:00`) : null;
  const headerDesc = [
    eventDate && !Number.isNaN(eventDate.getTime())
      ? eventDate.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" }) : null,
    assignment.stationLabel,
    event.location,
  ].filter(Boolean).join(" · ") || "Bản đồ cung đường";
  const showCourse = selectedDist && currentResult && !currentResult.error && selectedDist.route.length >= 2;

  return (
      <div className="animate-slide-up flex min-h-0 flex-col xl:h-full">
        <SectionHeader
          title={assignment.eventName}
          desc={headerDesc}
          color="#F59E0B"
        />

        {!event.distances.length && selectedDist && (
          <Button variant="outline" onClick={() => setSelectedDistId("")} className="mb-4">Đổi cự ly</Button>
        )}
        {!event.distances.length && !selectedDist && (
          <form className="mb-4 space-y-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground" onSubmit={(event) => { event.preventDefault(); setSelectedDistId(distanceIdInput.trim()); }}>
            <p>Với sự kiện nháp, hãy nhập mã cự ly do ban tổ chức cung cấp để xem cung đường.</p>
            <label className="block">Mã cự ly
              <input required value={distanceIdInput} onChange={(event) => setDistanceIdInput(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </label>
            <button type="submit" disabled={!distanceIdInput.trim()} className="rounded-lg bg-amber-500 px-3 py-2 font-semibold text-slate-950 disabled:opacity-50">Tải cung đường</button>
          </form>
        )}

        <div className="mb-4 flex shrink-0 flex-wrap gap-2">
          {event.distances.map((distance, index) => {
            const isActive = distance.id === selectedDist?.id;
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

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-rows-[minmax(0,1fr)]">
          <div ref={mapRef} className="flex h-[60vh] min-h-[320px] min-w-0 flex-col gap-3 xl:h-full xl:min-h-0">
            {courseMessage && <div role={loadError || currentResult?.error ? "alert" : "status"} className="shrink-0 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">{courseMessage}</div>}
            {(showCourse || liveMarkers.length > 0) && <div className="min-h-0 flex-1"><RaceRouteMap
              route={showCourse ? selectedDist.route : []}
              startPoint={showCourse ? selectedDist.startPoint : undefined}
              finishPoint={showCourse ? selectedDist.finishPoint : undefined}
              checkpoints={showCourse ? checkpoints : []}
              liveMarkers={liveMarkers}
              liveFocus={liveFocus}
              height="100%"
              routeColor={selectedDist?.color}
            /></div>}
          </div>

          <Card className="flex h-[480px] min-h-0 flex-col xl:h-full" style={{ padding: 0 }}>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {panelPage === 0 ? (
                <div className="space-y-4">
                  {selectedDist ? (
                    <>
                      <section aria-label="Thông tin giải chạy">
                        <div className="mb-2 text-sm font-semibold text-foreground">{selectedDist.name}</div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chi tiết cung đường</div>
                          <Badge label={selectedDist.type} type="violet" />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <InfoCell value={`${selectedDist.distanceKm} km`} label="Tổng quãng đường" color={selectedDist.color} />
                          <InfoCell value={String(selectedDist.checkpoints.length)} label="Checkpoint" color="#F59E0B" />
                          <InfoCell value={selectedDist.runnersCount?.toLocaleString("en-US") ?? "—"} label="Đã đăng ký" color="#10B981" />
                        </div>
                        {course && <p className="mt-3 text-xs text-muted-foreground">{course.waypoints.length} điểm dọc đường · Cập nhật <time dateTime={course.updatedAt}>{new Date(course.updatedAt).toLocaleString("vi-VN")}</time></p>}
                      </section>
                      <section aria-label="Danh sách checkpoint">
                        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Checkpoint ({selectedDist.checkpoints.length})</div>
                        <div className="space-y-1.5">
                          {selectedDist.checkpoints.map((cp, index) => (
                            <div key={cp.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-xs">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-white" style={{ background: checkpointColor(cp.type) }}>
                                {cp.type === "start" ? "S" : cp.type === "finish" ? "F" : index}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-semibold text-foreground">{cp.name}</div>
                                <div className="text-[11px] text-muted-foreground">KM {cp.km}{cp.cutoff ? ` · ${cp.cutoff}` : ""}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </>
                  ) : (
                    <p role="status" className="text-sm text-muted-foreground">Chọn một cự ly để xem chi tiết.</p>
                  )}
                </div>
              ) : (
                <section aria-label="Live GPS">
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-foreground">
                    <LocateFixed className="size-4" aria-hidden="true" />
                    LIVE GPS{positions && ` (${liveMarkers.length})`}
                  </h2>
                  {gpsError && <p role="alert" className="mb-2 text-sm text-destructive">{gpsError}</p>}
                  {!liveMarkers.length ? (
                    <p role="status" className="text-sm text-muted-foreground">
                      {!gpsError && (positions ? "Chưa có nhân sự nào chia sẻ vị trí." : "Đang kết nối GPS trực tiếp…")}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {liveMarkers.map((person) => (
                        <li key={person.id}>
                          <button
                            type="button"
                            aria-pressed={liveFocus?.id === person.id}
                            onClick={() => {
                              setLiveFocus((last) => ({ id: person.id, revision: (last?.revision ?? 0) + 1 }));
                              mapRef.current?.scrollIntoView({ block: "nearest" });
                            }}
                            className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-emerald-600 aria-pressed:bg-emerald-500/10"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block break-words text-sm font-semibold text-foreground">{person.name}</span>
                              <span className="block break-words text-xs text-muted-foreground">{person.role} · {person.station}</span>
                            </span>
                            <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>

            <nav aria-label="Các trang của bảng" className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-3 py-2">
              <Button variant="ghost" size="sm" onClick={() => setPanelPage(0)} disabled={panelPage === 0} aria-label="Trang trước">
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="ml-1 tabular-nums">{panelPage + 1}/2</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPanelPage(1)} disabled={panelPage === 1} aria-label="Trang sau">
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </nav>
          </Card>
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
