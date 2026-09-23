"use client";
import Link from "next/link";

const roles = [
  {
    id: "photographer",
    name: "Photographer",
    icon: "📷",
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
    icon: "🏃",
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
    icon: "🗺️",
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
    icon: "⚡",
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
  return (
    <main
      className="grid-overlay"
      style={{
        minHeight: "100vh",
        background: "#06050C",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Choose your operational role to enter your personalized race-day
            dashboard.
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
            <Link
              key={role.id}
              href={`/${role.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.025)",
                  border: `1px solid ${role.borderColor}`,
                  borderRadius: "20px",
                  padding: "28px",
                  cursor: "pointer",
                  transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s, border-color 0.25s",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  overflow: "hidden",
                  animationDelay: role.delay,
                }}
                className="animate-slide-up"
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-6px) scale(1.01)";
                  el.style.boxShadow = `0 0 48px ${role.glowColor}, 0 24px 64px rgba(0,0,0,0.55)`;
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
                    fontSize: "26px",
                    marginBottom: "18px",
                  }}
                >
                  {role.icon}
                </div>

                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 8px",
                  }}
                >
                  {role.name}
                </h2>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748B",
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
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "16px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#334155" }}>
                    {role.frCount} requirements
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
                    Enter Dashboard
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7h8M8 4l3 3-3 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
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
    </main>
  );
}
