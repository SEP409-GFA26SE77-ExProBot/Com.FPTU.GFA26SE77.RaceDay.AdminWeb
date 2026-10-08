"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
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
  FileText,
  Ticket,
  CreditCard,
  Shirt,
  Tag,
  Landmark,
  Globe,
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
                  <span className="text-xs text-foreground/70 font-mono">
                    {event.id}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground mt-1.5">
                  {event.name}
                </DialogTitle>
              </div>
            </div>

            <DialogDescription className="text-sm text-foreground/90 leading-relaxed font-normal">
              {event.tagline}
            </DialogDescription>
          </DialogHeader>

          {/* Key Facts Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-foreground/70 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-foreground/70">Location</div>
                <div className="text-xs font-semibold text-foreground truncate max-w-[140px]" title={event.location}>
                  {event.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-foreground/70 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-foreground/70">Date</div>
                <div className="text-xs font-semibold text-foreground">{event.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-foreground/70 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-foreground/70">Runners Cap</div>
                <div className="text-xs font-semibold text-foreground">
                  {event.totalRunners.toLocaleString("en-US")} Runners
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <CloudSun className="h-4 w-4 text-foreground/70 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-foreground/70">Forecast</div>
                <div className="text-xs font-semibold text-foreground">
                  {event.weather.temp} · {event.weather.condition}
                </div>
              </div>
            </div>
          </div>

          {/* Organizer & Official Permit Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organizer Card */}
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-foreground/70" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Organizer Application
                    </span>
                  </div>
                  <Badge
                    variant={event.organizer.verified ? "success" : "pending"}
                    className="text-[10px]"
                  >
                    {event.organizer.verified ? "Verified Organizer" : "Pending Verification"}
                  </Badge>
                </div>

                <div>
                  <div className="text-sm font-bold text-foreground">{event.organizer.name}</div>
                  <div className="flex flex-col gap-1 text-xs text-foreground/80 mt-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-foreground/70" /> {event.organizer.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-foreground/70" /> {event.organizer.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Authority Registration Permit Card */}
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-foreground/70" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Official Permit Document
                  </span>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Authority Approved
                </Badge>
              </div>

              {("permitDocument" in event && event.permitDocument) ? (
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span className="truncate max-w-[200px]" title={event.permitDocument.fileName}>
                      {event.permitDocument.fileName}
                    </span>
                    <span className="text-[11px] text-foreground/70 font-mono">
                      {event.permitDocument.fileSize}
                    </span>
                  </div>
                  <div className="text-[11px] text-foreground/85 leading-snug">
                    <div><span className="font-semibold text-foreground">Issuing Authority:</span> {event.permitDocument.issuingAuthority}</div>
                    <div><span className="font-semibold text-foreground">Permit Code:</span> <code className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-foreground">{event.permitDocument.permitNumber}</code></div>
                    <div><span className="font-semibold text-foreground">Issued:</span> {event.permitDocument.issueDate} · <span className="font-semibold text-foreground">Valid Until:</span> {event.permitDocument.validUntil}</div>
                  </div>
                  <div className="pt-1">
                    <a
                      href={event.permitDocument.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-90 font-semibold text-xs transition-opacity shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Approved Permit (PDF)
                      <span className="text-[10px] opacity-80">↗</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-foreground/80">
                  Standard provincial tournament permit approved.
                </div>
              )}
            </div>
          </div>

          {/* Rules, Anti-Cheating & Rewards Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Race Rules & Anti-Cheating Penalties */}
            {("rules" in event && event.rules) && (
              <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-foreground/70" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Rules & Anti-Cheating Penalties
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <div className="font-bold text-foreground mb-1 text-[11px] uppercase tracking-wide">
                      General Competition Rules
                    </div>
                    <p className="text-foreground/90 leading-relaxed font-normal">
                      {event.rules.generalRules}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <div className="font-bold text-foreground mb-1 text-[11px] uppercase tracking-wide">
                      Mandatory Safety Gear
                    </div>
                    <p className="text-foreground/90 leading-relaxed font-normal">
                      {event.rules.mandatoryEquipment}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <div className="font-bold text-foreground mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <AlertCircle className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Cheating Penalties & Disqualification (DQ)</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-[11px] font-normal">
                      {event.rules.cheatingAndPenalties}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards & Prize Pool */}
            {("rewards" in event && event.rewards) && (
              <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-foreground/70" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Prize Pool & Rewards
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold text-foreground border-border">
                    Prize Pool: {event.rewards.prizePool}
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border space-y-1.5">
                    <div className="font-bold text-[11px] uppercase tracking-wide text-foreground">
                      Podium Placements
                    </div>
                    <div className="space-y-1">
                      {event.rewards.podium.map((pod: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between gap-2 text-[11px] py-0.5 border-b border-border/50 last:border-0">
                          <span className="font-bold text-foreground shrink-0">{pod.place}</span>
                          <span className="text-right text-foreground/90">{pod.prize}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                    <div className="font-bold text-[11px] uppercase tracking-wide text-foreground mb-1">
                      Finisher Package & Perks
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-[11px]">
                      {event.rewards.finisherRewards}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Pricing Section */}
          {("ticketPricing" in event && event.ticketPricing) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-foreground/70" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Registration Fees by Phase</h4>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/80 dark:bg-muted/60 border-b border-border">
                      <th className="text-left px-3 py-2 font-bold text-foreground uppercase tracking-wide text-[10px]">Phase</th>
                      <th className="text-left px-3 py-2 font-bold text-foreground uppercase tracking-wide text-[10px]">Period</th>
                      {Object.keys(event.ticketPricing.phases[0]?.prices ?? {}).map((dist) => (
                        <th key={dist} className="text-right px-3 py-2 font-bold text-foreground uppercase tracking-wide text-[10px]">{dist}</th>
                      ))}
                      <th className="text-left px-3 py-2 font-bold text-foreground uppercase tracking-wide text-[10px]">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.ticketPricing.phases.map((phase: any, idx: number) => (
                      <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2.5 font-bold text-foreground">{phase.phase}</td>
                        <td className="px-3 py-2.5 text-foreground/80 font-mono text-[11px]">{phase.period}</td>
                        {Object.values(phase.prices as Record<string, number>).map((price, pi) => (
                          <td key={pi} className="px-3 py-2.5 text-right font-bold text-foreground">
                            {(price as number).toLocaleString('vi-VN')}₫
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-foreground/80 text-[11px] max-w-[180px]">{phase.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {event.ticketPricing.groupDiscount?.eligible && (
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-foreground/70" />
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Group Discount Policy</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.ticketPricing.groupDiscount.tiers.map((tier: any, i: number) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-muted border border-border text-foreground font-medium">
                        {tier.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-foreground/85 leading-relaxed">{event.ticketPricing.groupDiscount.conditions}</p>
                </div>
              )}
            </div>
          )}

          {/* Merchandise: Shirt, BIB, Medal */}
          {("merchandise" in event && event.merchandise) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shirt className="h-4 w-4 text-foreground/70" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Race Kit & Merchandise Design</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Running Shirt */}
                <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
                  <div className="relative w-full h-36 bg-muted/40">
                    <Image
                      src={event.merchandise.runningShirt.sizeChartImage}
                      alt="Running Shirt Size Chart"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="text-[11px] font-bold text-foreground uppercase tracking-wide">Official Shirt</div>
                    <p className="text-[10px] text-foreground/80 leading-snug">{event.merchandise.runningShirt.description}</p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {event.merchandise.runningShirt.sizes.map((sz: string) => (
                        <span key={sz} className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono">{sz}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* BIB */}
                <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
                  <div className="relative w-full h-36 bg-muted/40">
                    <Image
                      src={event.merchandise.bib.designImage}
                      alt="Race BIB Design"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="text-[11px] font-bold text-foreground uppercase tracking-wide">Race BIB Design</div>
                    <p className="text-[10px] text-foreground/80 leading-snug">{event.merchandise.bib.description}</p>
                    <p className="text-[10px] text-foreground/70 leading-snug">{event.merchandise.bib.note}</p>
                  </div>
                </div>
                {/* Medal */}
                <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
                  <div className="relative w-full h-36 bg-muted/40">
                    <Image
                      src={event.merchandise.medal.designImage}
                      alt="Finisher Medal Design"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="text-[11px] font-bold text-foreground uppercase tracking-wide">Finisher Medal</div>
                    <p className="text-[10px] text-foreground/80 leading-snug">{event.merchandise.medal.description}</p>
                    <p className="text-[10px] text-foreground/70 leading-snug">{event.merchandise.medal.note}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Organizer Bank / Beneficiary Account */}
          {("organizer" in event && (event.organizer as any).beneficiaryAccount) && (
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-foreground/70" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Beneficiary / Payment Account Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {[
                  { label: "Account Holder", value: (event.organizer as any).beneficiaryAccount.accountHolder, mono: false, highlight: true },
                  { label: "Bank Name", value: (event.organizer as any).beneficiaryAccount.bankName, mono: false, highlight: false },
                  { label: "Account Number", value: (event.organizer as any).beneficiaryAccount.accountNumber, mono: true, highlight: true },
                  { label: "Branch", value: (event.organizer as any).beneficiaryAccount.branch, mono: false, highlight: false },
                  { label: "SWIFT / BIC", value: (event.organizer as any).beneficiaryAccount.swiftCode, mono: true, highlight: false },
                  { label: "Transfer Note Format", value: (event.organizer as any).beneficiaryAccount.transferNote, mono: true, highlight: false },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-foreground/70 tracking-wide">{row.label}</span>
                    <span className={`leading-snug text-foreground ${row.mono ? 'font-mono text-[11px]' : 'text-[12px]'} ${row.highlight ? 'font-bold' : 'font-medium'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              {(event.organizer as any).legalEntity && (
                <div className="text-[11px] text-foreground/80 border-t border-border pt-2 font-medium">
                  Registered Legal Entity: <span className="text-foreground font-bold">{(event.organizer as any).legalEntity}</span>
                  {(event.organizer as any).website && (
                    <> · <a href={(event.organizer as any).website} target="_blank" rel="noopener noreferrer" className="text-foreground font-semibold hover:underline inline-flex items-center gap-1">
                      <Globe className="h-3 w-3" />{(event.organizer as any).website}
                    </a></>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Distance Selection Tabs & Preview Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-foreground/70" />
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
                        <div className="text-[10px] text-foreground/70 uppercase font-bold">Total Distance</div>
                        <div className="text-lg font-black text-foreground">{dist.distanceKm} km</div>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="text-[10px] text-foreground/70 uppercase font-bold">Elevation Gain</div>
                        <div className="text-lg font-black text-foreground">+{dist.elevationGainM} m</div>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="text-[10px] text-foreground/70 uppercase font-bold">Elevation Range</div>
                        <div className="text-sm font-bold text-foreground mt-1">
                          {dist.minElevationM}m → {dist.maxElevationM}m
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="text-[10px] text-foreground/70 uppercase font-bold">Checkpoints</div>
                        <div className="text-lg font-black text-foreground">{dist.checkpoints.length} Stations</div>
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
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
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
                                  <Droplets size={14} strokeWidth={1.75} className="text-foreground" />
                                ) : cp.type === "medical" ? (
                                  <HeartPulse size={14} strokeWidth={1.75} className="text-foreground" />
                                ) : cp.type === "aid" ? (
                                  <Coffee size={14} strokeWidth={1.75} className="text-foreground" />
                                ) : cp.type === "start" ? (
                                  <Flag size={14} strokeWidth={1.75} className="text-foreground" />
                                ) : cp.type === "finish" ? (
                                  <Trophy size={14} strokeWidth={1.75} className="text-foreground" />
                                ) : (
                                  <Timer size={14} strokeWidth={1.75} className="text-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{cp.name}</div>
                                <div className="text-[10px] text-foreground/70">
                                  KM {cp.km} · Alt: {cp.elevation}m
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
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
