"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
}

export interface StatItem {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: string;
}

interface DashboardShellProps {
  role: string;
  roleAbbr: string;
  roleIcon: string;
  roleColor: string;
  roleColorRgb: string; // e.g. "6,182,212"
  navItems: NavItem[];
  stats?: StatItem[];
  children: (activeSection: string, setSection: (s: string) => void) => ReactNode;
}

export default function DashboardShell({
  role,
  roleAbbr,
  roleIcon,
  roleColor,
  roleColorRgb,
  navItems,
  stats,
  children,
}: DashboardShellProps) {
  const [active, setActive] = useState(navItems[0]?.id ?? "");
  const [collapsed, setCollapsed] = useState(false);

  const activeItem = navItems.find((n) => n.id === active);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#06050C" }}>
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside
        style={{
          width: collapsed ? "68px" : "248px",
          flexShrink: 0,
          background: "rgba(9,8,20,0.96)",
          borderRight: "1px solid rgba(255,255,255,0.055)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          zIndex: 20,
          position: "relative",
        }}
      >
        {/* Sidebar glow accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${roleColor}, transparent)`,
            opacity: 0.6,
          }}
        />

        {/* Logo row */}
        <div
          style={{
            padding: "18px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minHeight: "68px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "11px",
              background: `linear-gradient(135deg, ${roleColor}28, ${roleColor}0e)`,
              border: `1px solid ${roleColor}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
              cursor: collapsed ? "pointer" : "default",
            }}
            onClick={() => collapsed && setCollapsed(false)}
            title={collapsed ? "Expand sidebar" : undefined}
          >
            {roleIcon}
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#334155",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  RaceDay
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {role}
                </div>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  borderRadius: "6px",
                  flexShrink: 0,
                }}
                title="Collapse sidebar"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: collapsed ? "10px 0" : "9px 10px",
                  borderRadius: "10px",
                  marginBottom: "3px",
                  background: isActive
                    ? `rgba(${roleColorRgb},0.12)`
                    : "transparent",
                  border: isActive
                    ? `1px solid rgba(${roleColorRgb},0.28)`
                    : "1px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s",
                  justifyContent: collapsed ? "center" : "flex-start",
                  boxShadow: isActive
                    ? `0 0 16px rgba(${roleColorRgb},0.12)`
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "17px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? roleColor : "#64748B",
                        whiteSpace: "nowrap",
                        flex: 1,
                        transition: "color 0.15s",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "100px",
                          background: `rgba(${roleColorRgb},0.18)`,
                          color: roleColor,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              style={{
                width: "100%",
                padding: "9px 0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#334155",
                display: "flex",
                justifyContent: "center",
                borderRadius: "8px",
              }}
              title="Expand sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 10px",
                borderRadius: "10px",
                color: "#334155",
                fontSize: "13px",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#64748B";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Switch Role</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <header
          style={{
            height: "60px",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
            background: "rgba(6,5,12,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            flexShrink: 0,
            gap: "16px",
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>{roleAbbr}</span>
            <span style={{ color: "#1E293B", fontSize: "14px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>
              {activeItem?.label ?? "Dashboard"}
            </span>
          </div>

          {/* Notification */}
          <div style={{ position: "relative" }}>
            <button
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "9px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
              }}
            >
              🔔
            </button>
            <div
              style={{
                position: "absolute",
                top: "7px",
                right: "7px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#EC4899",
                border: "1.5px solid #06050C",
              }}
            />
          </div>

          {/* Avatar */}
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: `linear-gradient(135deg, ${roleColor}55, ${roleColor}22)`,
              border: `1px solid ${roleColor}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 800,
              color: roleColor,
              cursor: "pointer",
            }}
          >
            {roleAbbr.slice(0, 2)}
          </div>
        </header>

        {/* Stats strip */}
        {stats && stats.length > 0 && (
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(255,255,255,0.055)",
              background: "rgba(6,5,12,0.6)",
              flexShrink: 0,
              overflowX: "auto",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 22px",
                  borderRight: "1px solid rgba(255,255,255,0.055)",
                  minWidth: "150px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#334155",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{s.icon}</span>
                  {s.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                    {s.value}
                  </span>
                  {s.change && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 5px",
                        borderRadius: "4px",
                        background: s.positive
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                        color: s.positive ? "#10B981" : "#EF4444",
                      }}
                    >
                      {s.positive ? "↑" : "↓"} {s.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", position: "relative" }}>
          {children(active, setActive)}
        </main>
      </div>
    </div>
  );
}
