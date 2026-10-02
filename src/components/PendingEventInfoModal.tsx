"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RaceRouteMap, { Coordinate, Checkpoint } from "@/components/sections/RaceRouteMap";
import eventsData from "@/events.json";
import {
  MapPin,
  Calendar,
  Users,
  Mountain,
  Info,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  CloudSun,
  Clock,
  Navigation,
  Droplets,
  HeartPulse,
  Coffee,
  Flag,
  Trophy,
  Timer,
} from "lucide-react";

export type EventItemType = (typeof eventsData)[number];

const CP_TYPE_MAP: Record<string, Checkpoint["type"]> = {
  water: "WATER",
  medical: "MEDICAL",
  aid: "WATER",
  cutoff: "TIMING",
  start: "CHECKPOINT",
  finish: "CHECKPOINT",
};

interface PendingEventInfoModalProps {
  event?: EventItemType | null;
  eventId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onApprove?: (event: EventItemType) => void;
  onReject?: (event: EventItemType) => void;
}

export function PendingEventInfoModal({
  event: propEvent,
  eventId,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onApprove,
  onReject,
}: PendingEventInfoModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen || setInternalOpen;

  // Resolve event from prop or eventId or fallback to first pending event
  const event: EventItemType = useMemo(() => {
    if (propEvent) return propEvent;
    if (eventId) {
      const found = eventsData.find((e) => e.id === eventId);
      if (found) return found;
    }
    const pendingFallback = eventsData.find((e) => e.status === "pending");
    return pendingFallback || eventsData[0];
  }, [propEvent, eventId]);

  const distances = event?.distances || [];
  const [selectedDistanceType, setSelectedDistanceType] = useState<string>(
    distances[0]?.type || "5K"
  );

  const activeDistance = useMemo(() => {
    return (
      distances.find((d) => d.type === selectedDistanceType) || distances[0]
    );
  }, [distances, selectedDistanceType]);

  // Convert distance coordinates to RaceRouteMap format
  const route: Coordinate[] = useMemo(() => {
    if (!activeDistance?.leafletPolyline) return [];
    return activeDistance.leafletPolyline.map((point) => ({
      lat: point[0],
      lng: point[1],
    }));
  }, [activeDistance]);

  const startPoint: Coordinate = useMemo(() => {
    return {
      lat: activeDistance?.startLocation?.lat || event.coordinates.lat,
      lng: activeDistance?.startLocation?.lng || event.coordinates.lng,
    };
  }, [activeDistance, event]);

  const finishPoint: Coordinate = useMemo(() => {
    return {
      lat: activeDistance?.finishLocation?.lat || event.coordinates.lat,
      lng: activeDistance?.finishLocation?.lng || event.coordinates.lng,
    };
  }, [activeDistance, event]);

  const checkpoints: Checkpoint[] = useMemo(() => {
    if (!activeDistance?.checkpoints) return [];
    return activeDistance.checkpoints
      .filter((cp) => cp.type !== "start" && cp.type !== "finish")
      .map((cp) => ({
        id: cp.id,
        name: cp.name,
        latitude: cp.lat,
        longitude: cp.lng,
        distanceFromStart: cp.km * 1000,
        type: CP_TYPE_MAP[cp.type] ?? "CHECKPOINT",
        description: `Cutoff: ${cp.cutoff} · Elevation: ${cp.elevation}m`,
      }));
  }, [activeDistance]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50"
          >
            <Info className="h-3.5 w-3.5" />
            Information
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-background/95 backdrop-blur-2xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500" />

        <div className="p-6 space-y-6">
          {/* Header */}
          <DialogHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="pending" className="text-[11px] font-bold">
                    {event.status === "pending"
                      ? "PENDING APPROVAL"
                      : event.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {event.id}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground mt-1.5">
                  {event.name}
                </DialogTitle>
              </div>
            </div>

            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {event.tagline}
            </DialogDescription>
          </DialogHeader>

          {/* Key Facts Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-cyan-500 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Location</div>
                <div className="text-xs font-semibold text-foreground truncate max-w-[140px]" title={event.location}>
                  {event.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Date</div>
                <div className="text-xs font-semibold text-foreground">{event.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Runners Cap</div>
                <div className="text-xs font-semibold text-foreground">
                  {event.totalRunners.toLocaleString("en-US")} Runners
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <CloudSun className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Forecast</div>
                <div className="text-xs font-semibold text-foreground">
                  {event.weather.temp} · {event.weather.condition}
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Organizer Application Info
                </span>
              </div>
              <Badge
                variant={event.organizer.verified ? "success" : "pending"}
                className="text-[10px]"
              >
                {event.organizer.verified ? "Verified Organizer" : "Pending Verification"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div>
                <div className="text-sm font-bold text-foreground">{event.organizer.name}</div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {event.organizer.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {event.organizer.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Distance Selection Tabs & Preview Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Course Route Preview & Checkpoints
                </h4>
              </div>
            </div>

            {distances.length > 0 && (
              <Tabs
                value={selectedDistanceType}
                onValueChange={(val) => setSelectedDistanceType(val)}
                className="w-full"
              >
                <TabsList className="w-full justify-start overflow-x-auto bg-muted/60 p-1 rounded-xl">
                  {distances.map((dist) => (
                    <TabsTrigger
                      key={dist.type}
                      value={dist.type}
                      className="text-xs font-semibold gap-1.5 data-[state=active]:bg-card"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: dist.color }}
                      />
                      {dist.type} ({dist.distanceKm}km)
                    </TabsTrigger>
                  ))}
                </TabsList>

                {distances.map((dist) => (
                  <TabsContent key={dist.type} value={dist.type} className="space-y-4 pt-2">
                    {/* Distance Detail Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Distance</div>
                        <div className="text-lg font-black text-foreground">{dist.distanceKm} km</div>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Elevation Gain</div>
                        <div className="text-lg font-black text-cyan-400">+{dist.elevationGainM} m</div>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Elevation Range</div>
                        <div className="text-sm font-bold text-foreground mt-1">
                          {dist.minElevationM}m → {dist.maxElevationM}m
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Checkpoints</div>
                        <div className="text-lg font-black text-amber-400">{dist.checkpoints.length} Stations</div>
                      </div>
                    </div>

                    {/* Preview Map Section */}
                    <div className="rounded-xl overflow-hidden border border-border shadow-lg relative">
                      <div className="absolute top-3 left-3 z-[1000] bg-background/85 backdrop-blur-md px-3 py-1 rounded-lg border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-md">
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: dist.color }} />
                        {dist.name}
                      </div>
                      <RaceRouteMap
                        route={route}
                        startPoint={startPoint}
                        finishPoint={finishPoint}
                        checkpoints={checkpoints}
                        height="320px"
                        routeColor={dist.color}
                      />
                    </div>

                    {/* Checkpoint Breakdown List */}
                    <div className="p-3.5 rounded-xl border border-border bg-card/40 space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Official Checkpoints Timeline
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dist.checkpoints.map((cp) => (
                          <div
                            key={cp.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-md bg-background border border-border flex items-center justify-center">
                                {cp.type === "water" ? (
                                  <Droplets size={14} strokeWidth={1.75} className="text-cyan-500" />
                                ) : cp.type === "medical" ? (
                                  <HeartPulse size={14} strokeWidth={1.75} className="text-rose-500" />
                                ) : cp.type === "aid" ? (
                                  <Coffee size={14} strokeWidth={1.75} className="text-amber-500" />
                                ) : cp.type === "start" ? (
                                  <Flag size={14} strokeWidth={1.75} className="text-emerald-500" />
                                ) : cp.type === "finish" ? (
                                  <Trophy size={14} strokeWidth={1.75} className="text-purple-500" />
                                ) : (
                                  <Timer size={14} strokeWidth={1.75} className="text-blue-500" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{cp.name}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  KM {cp.km} · Alt: {cp.elevation}m
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                Cutoff: {cp.cutoff}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>

        {/* Modal Footer with shadcn Buttons */}
        <DialogFooter className="p-4 px-6 border-t border-border bg-muted/20 flex flex-row items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {onReject && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onReject(event);
                  setIsOpen(false);
                }}
              >
                Reject Application
              </Button>
            )}
            {onApprove && (
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                onClick={() => {
                  onApprove(event);
                  setIsOpen(false);
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Event
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PendingEventInfoModal;
