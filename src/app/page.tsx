"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import eventsData from "@/events.json";
import { setStoredRole } from "@/lib/roleStorage";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PendingEventInfoModal } from "@/components/PendingEventInfoModal";
import { Button } from "@/components/ui/button";
import {
  Info,
  Camera,
  Activity,
  Map,
  ShieldCheck,
  MapPin,
  Calendar,
  Users,
  Building2,
} from "lucide-react";

interface RoleDef {
  id: string;
  name: string;
  description: string;
  frCount: number;
  color: string;
  borderColor: string;
  glowColor: string;
  features: string[];
  delay: string;
}

function renderRoleCardIcon(id: string, color: string, size = 24) {
  const iconProps = { size, strokeWidth: 1.75, style: { color } };
  switch (id) {
    case "photographer":
      return <Camera {...iconProps} />;
    case "volunteer":
      return <Activity {...iconProps} />;
    case "coordinator":
      return <Map {...iconProps} />;
    case "administrator":
      return <ShieldCheck {...iconProps} />;
    default:
      return <ShieldCheck {...iconProps} />;
  }
}

const roles: RoleDef[] = [
  {
    id: "photographer",
    name: "Photographer",
    description:
      "Upload race photos in bulk, let AI tag BIB numbers automatically, and publish verified shots for runners to find.",
    frCount: 7,
    color: "#06B6D4",
    borderColor: "rgba(6,182,212,0.30)",
    glowColor: "rgba(6,182,212,0.12)",
    features: ["Bulk Upload", "OCR BIB Recognition", "Analytics", "Publish"],
    delay: "0ms",
  },
  {
    id: "volunteer",
    name: "Volunteer",
    description:
      "Scan QR / RFID codes at checkpoints, handle lost bibs, record manual entries, and mark DNS / DNF / DQ status.",
    frCount: 4,
    color: "#10B981",
    borderColor: "rgba(16,185,129,0.30)",
    glowColor: "rgba(16,185,129,0.12)",
    features: ["QR / RFID Scan", "Manual Entry", "Issue Handling", "Status"],
    delay: "80ms",
  },
  {
    id: "coordinator",
    name: "Race-Day Coordinator",
    description:
      "Track runners live on the map, dispatch medical teams for SOS, manage aid-station inventory, and activate contingency plans.",
    frCount: 6,
    color: "#F59E0B",
    borderColor: "rgba(245,158,11,0.30)",
    glowColor: "rgba(245,158,11,0.12)",
    features: ["Live Map", "Medical Dispatch", "Aid Stations", "Cut-off"],
    delay: "160ms",
  },
  {
    id: "administrator",
    name: "Administrator",
    description:
      "Approve organizers and events, moderate content, reconcile timing anomalies, review audit trails and platform KPIs.",
    frCount: 5,
    color: "#8B5CF6",
    borderColor: "rgba(139,92,246,0.30)",
    glowColor: "rgba(139,92,246,0.12)",
    features: ["Approvals", "User Management", "Audit Trail", "Stats"],
    delay: "240ms",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleDef | null>(null);
  const [infoEvent, setInfoEvent] = useState<(typeof eventsData)[0] | null>(null);

  // Close event selector modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedRole) {
        setSelectedRole(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRole]);

  const handleSelectEvent = (eventItem: (typeof eventsData)[0]) => {
    if (!selectedRole) return;
    try {
      if (typeof window !== "undefined") {
        setStoredRole(selectedRole.id);
        localStorage.setItem("raceday_selected_event_id", eventItem.id);
        localStorage.setItem("raceday_selected_event", JSON.stringify(eventItem));
      }
    } catch {}
    router.push(`/${selectedRole.id}?eventId=${eventItem.id}`);
  };

  return (
    <main
      className="grid-overlay"
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Right Actions */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "28px",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <ThemeToggle showLabel size="md" />
      </div>

      {/* Ambient blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(139,92,246,0.10) 0%, transparent 100%)," +
            "radial-gradient(ellipse 50% 40% at 80% 70%, rgba(6,182,212,0.07) 0%, transparent 100%)",
        }}
      />

      {/* Floating orb */}
      <div
        className="animate-float"
        style={{
          position: "fixed",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1160px" }}>
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          {/* Platform badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 16px",
              background: "rgba(139,92,246,0.10)",
              border: "1px solid rgba(139,92,246,0.28)",
              borderRadius: "100px",
              marginBottom: "28px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#A855F7",
                display: "inline-block",
              }}
              className="animate-glow-pulse"
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#A855F7",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              RaceDay Operations Platform
            </span>
          </div>

          <h1
            className="gradient-text"
            style={{
              fontSize: "clamp(38px, 6vw, 72px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              margin: "0 0 18px",
            }}
          >
            Select Your Role
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#64748B",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Choose your operational role, pick an active race event, and enter your dedicated command center.
          </p>
        </div>

        {/* ── Role cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => {
                setSelectedRole(role);
                setStoredRole(role.id);
              }}
              style={{
                position: "relative",
                background: "var(--surface)",
                border: `1px solid ${role.borderColor}`,
                borderRadius: "20px",
                padding: "28px",
                cursor: "pointer",
                transition:
                  "transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s, border-color 0.25s",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                overflow: "hidden",
                animationDelay: role.delay,
              }}
              className="animate-slide-up"
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-6px) scale(1.01)";
                el.style.boxShadow = `0 0 48px ${role.glowColor}, 0 24px 64px rgba(0,0,0,0.25)`;
                el.style.borderColor = role.color;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0) scale(1)";
                el.style.boxShadow = "none";
                el.style.borderColor = role.borderColor;
              }}
            >
              {/* Background blob */}
              <div
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${role.glowColor} 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Icon pill */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${role.color}22, ${role.color}0a)`,
                  border: `1px solid ${role.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                {renderRoleCardIcon(role.id, role.color, 24)}
              </div>

              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: "0 0 8px",
                }}
              >
                {role.name}
              </h2>

              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                  margin: "0 0 18px",
                }}
              >
                {role.description}
              </p>

              {/* Feature tags */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "22px",
                }}
              >
                {role.features.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: "100px",
                      background: `${role.color}18`,
                      border: `1px solid ${role.color}30`,
                      color: role.color,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Footer row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "16px",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {role.frCount} operations
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: role.color,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Choose Event &rarr;
                </span>
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: "48px",
            fontSize: "12px",
            color: "#1E293B",
            letterSpacing: "0.04em",
          }}
        >
          GFA26SE77 · RaceDay Operations Platform · v1.0.0
        </p>
      </div>

      {/* ── Event Selection Menu Modal ── */}
      {selectedRole && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRole(null);
          }}
        >
          <div
            className="animate-slide-up"
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              background: "var(--modal-bg)",
              border: `1px solid ${selectedRole.borderColor}`,
              borderRadius: "24px",
              boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 50px ${selectedRole.glowColor}`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Top Accent Line */}
            <div
              style={{
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${selectedRole.color}, transparent)`,
              }}
            />

            {/* Modal Header */}
            <div
              style={{
                padding: "24px 28px 18px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: `linear-gradient(135deg, ${selectedRole.color}25, ${selectedRole.color}0a)`,
                    border: `1px solid ${selectedRole.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {renderRoleCardIcon(selectedRole.id, selectedRole.color, 22)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: selectedRole.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Role: {selectedRole.name}
                  </div>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      margin: "2px 0 0",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Select Active Race Event
                  </h2>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedRole(null)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                  e.currentTarget.style.color = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Event Cards List */}
            <div
              style={{
                padding: "24px 28px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {eventsData.map((evt) => {
                const isLive = evt.status === "live";
                const isPending = evt.status === "pending";
                const statusBadgeStyle = isLive
                  ? { bg: "rgba(239,68,68,0.18)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", text: "LIVE NOW" }
                  : isPending
                  ? { bg: "rgba(245,158,11,0.18)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)", text: "PENDING APPROVAL" }
                  : { bg: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", text: "UPCOMING" };

                return (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt)}
                    style={{
                      padding: "20px",
                      borderRadius: "16px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                      transition:
                        "transform 0.2s cubic-bezier(0.4,0,0.2,1), border-color 0.2s, box-shadow 0.2s, background 0.2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(-2px)";
                      el.style.borderColor = selectedRole.color;
                      el.style.background = "var(--surface-hover)";
                      el.style.boxShadow = `0 10px 30px rgba(0,0,0,0.2), 0 0 20px ${selectedRole.glowColor}`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = "translateY(0)";
                      el.style.borderColor = "var(--border)";
                      el.style.background = "var(--surface)";
                      el.style.boxShadow = "none";
                    }}
                  >
                    {/* Top Row: Event Name & Live Badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "17px",
                          fontWeight: 800,
                          color: "var(--text-primary)",
                          margin: 0,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {evt.name}
                      </h3>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: "100px",
                          background: statusBadgeStyle.bg,
                          color: statusBadgeStyle.color,
                          border: statusBadgeStyle.border,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {isLive && (
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#EF4444",
                            }}
                            className="animate-ping-slow"
                          />
                        )}
                        {statusBadgeStyle.text}
                      </span>
                    </div>

                    {/* Tagline / Subtitle */}
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        margin: "0 0 14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {evt.tagline}
                    </p>

                    {/* Meta Row: Date, Location, Organizer, Runners */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "14px",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        marginBottom: "14px",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <MapPin size={13} strokeWidth={1.75} className="text-cyan-500" />
                        {evt.location}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <Calendar size={13} strokeWidth={1.75} className="text-purple-500" />
                        {evt.date}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <Users size={13} strokeWidth={1.75} className="text-emerald-500" />
                        <strong style={{ color: "var(--text-primary)" }}>{evt.totalRunners.toLocaleString("en-US")}</strong> Runners
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <Building2 size={13} strokeWidth={1.75} className="text-amber-500" />
                        {evt.organizer.name}
                      </span>
                    </div>

                    {/* Distance Pills & Action CTA */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid var(--border)",
                        paddingTop: "12px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {evt.distances.map((dist) => (
                          <span
                            key={dist.type}
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "6px",
                              background: `${dist.color}15`,
                              border: `1px solid ${dist.color}35`,
                              color: dist.color,
                            }}
                          >
                            {dist.type} ({dist.distanceKm}km)
                          </span>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isPending && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInfoEvent(evt);
                            }}
                            className="h-7 px-2.5 text-xs font-semibold border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 gap-1"
                          >
                            <Info className="h-3.5 w-3.5" />
                            Information
                          </Button>
                        )}
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: selectedRole.color,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Enter Dashboard &rarr;
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 28px",
                background: "var(--surface)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Select an event to load its routes, checkpoints, and runner data.
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Modal for Pending Events */}
      {infoEvent && (
        <PendingEventInfoModal
          event={infoEvent}
          open={!!infoEvent}
          onOpenChange={(open) => {
            if (!open) setInfoEvent(null);
          }}
        />
      )}

    </main>
  );
}
