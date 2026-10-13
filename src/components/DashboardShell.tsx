"use client";

import { useState, useEffect, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { adminEventApi, getPublicEvents, getPendingEvents } from "@/app/api";
import type { EventListItemDto } from "@/dtos";
import Sidebar from "./sections/Sidebar";
import { useActiveTab } from "@/context/ActiveTabContext";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Calendar, ChevronDown, Check } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
  href?: string;
}

export interface StatItem {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: string;
}

export interface DashboardShellProps {
  role?: string;
  roleAbbr?: string;
  roleIcon?: string;
  roleColor?: string;
  roleColorRgb?: string; // e.g. "6,182,212"
  navItems?: NavItem[];
  stats?: StatItem[];
  basePath?: string;
  tab?: string;
  children: ReactNode | ((activeSection: string, setSection: (s: string) => void) => ReactNode);
}

export default function DashboardShell({
  role = "Race-Day Coordinator",
  roleAbbr = "OPS",
  roleIcon = "🗺️",
  roleColor = "#F59E0B",
  roleColorRgb = "245,158,11",
  navItems = [],
  stats,
  basePath,
  tab,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const contextTab = useActiveTab().activeTab;
  const [active, setActive] = useState(navItems[0]?.id ?? "");
  const [collapsed, setCollapsed] = useState(false);
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const [eventsList, setEventsList] = useState<EventListItemDto[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventListItemDto | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const publicEvts = await getPublicEvents().catch(() => []);
        let pendingEvts: EventListItemDto[] = [];
        try {
          pendingEvts = await getPendingEvents();
        } catch { }

        const combinedMap = new Map<string, EventListItemDto>();
        publicEvts.forEach((e) => combinedMap.set(e.id, e));
        pendingEvts.forEach((e) => combinedMap.set(e.id, e));
        const allEvts = Array.from(combinedMap.values());

        setEventsList(allEvts);

        if (allEvts.length > 0) {
          const stored = localStorage.getItem("raceday_selected_event");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const matched = allEvts.find((e) => e.id === parsed.id) || allEvts[0];
              setCurrentEvent(matched);
            } catch {
              setCurrentEvent(allEvts[0]);
            }
          } else {
            setCurrentEvent(allEvts[0]);
            localStorage.setItem("raceday_selected_event", JSON.stringify(allEvts[0]));
            localStorage.setItem("raceday_selected_event_id", allEvts[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load real events from API", err);
      }
    }
    fetchEvents();
  }, []);

  const currentActiveId = useMemo(() => {
    if (basePath) {
      if (pathname === basePath || pathname === `${basePath}/`) {
        return navItems[0]?.id ?? "";
      }
      const matched = navItems.find((n) => {
        const itemHref = n.href ?? `${basePath}/${n.id}`;
        return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
      });
      if (matched) return matched.id;
    } else {
      const matched = navItems.find((n) => {
        if (!n.href) return false;
        return pathname === n.href || pathname.startsWith(`${n.href}/`);
      });
      if (matched) return matched.id;
    }
    return active;
  }, [basePath, pathname, navItems, active]);

  const effectiveTab = tab || contextTab || currentActiveId;
  const activeItem = navItems.find((n) => n.id === effectiveTab) ?? navItems[0];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--background)" }}>
      {/* ── Extracted Standalone Sidebar Section ────────── */}
      <Sidebar
        tab={effectiveTab}
        role={role}
        roleName={role}
        roleAbbr={roleAbbr}
        roleIcon={roleIcon}
        roleColor={roleColor}
        roleColorRgb={roleColorRgb}
        basePath={basePath}
        navItems={navItems}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onSelectTab={(newTab) => setActive(newTab)}
      />

      {/* ── Main area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <header
          style={{
            height: "60px",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--header-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            flexShrink: 0,
            gap: "16px",
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{roleAbbr}</span>
              <span style={{ color: "var(--border-strong)", fontSize: "14px" }}>/</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {activeItem?.label ?? "Dashboard"}
              </span>
            </div>

            {/* Active Event Indicator with Switcher */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsEventMenuOpen(!isEventMenuOpen)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  background: `rgba(${roleColorRgb},0.08)`,
                  border: `1px solid rgba(${roleColorRgb},0.25)`,
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Calendar size={14} strokeWidth={1.75} style={{ color: roleColor }} />
                <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentEvent?.name ?? "Da Lat Ultra Trail 2026"}
                </span>
                <ChevronDown size={13} strokeWidth={1.75} style={{ color: roleColor }} />
              </button>

              {/* Event Switcher Dropdown */}
              {isEventMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    width: "320px",
                    background: "var(--modal-bg)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "14px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                    padding: "8px",
                    zIndex: 999,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 10px 8px" }}>
                    Switch Active Event
                  </div>
                  {eventsList.map((eItem) => {
                    const isSelected = currentEvent?.id === eItem.id;
                    return (
                      <div
                        key={eItem.id}
                        onClick={() => {
                          setCurrentEvent(eItem);
                          setIsEventMenuOpen(false);
                          try {
                            if (typeof window !== "undefined") {
                              localStorage.setItem("raceday_selected_event_id", eItem.id);
                              localStorage.setItem("raceday_selected_event", JSON.stringify(eItem));
                            }
                          } catch { }
                          // Update URL param
                          const url = new URL(window.location.href);
                          url.searchParams.set("eventId", eItem.id);
                          window.history.replaceState({}, "", url.toString());
                          window.dispatchEvent(new Event("raceday_event_changed"));
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "8px",
                          background: isSelected ? `rgba(${roleColorRgb},0.12)` : "transparent",
                          border: isSelected ? `1px solid rgba(${roleColorRgb},0.3)` : "1px solid transparent",
                          cursor: "pointer",
                          marginBottom: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "var(--surface-hover)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? roleColor : "var(--text-primary)" }}>
                            {eItem.name}
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {eItem.location} · {(eItem.totalRunners || 0).toLocaleString("en-US")} VĐV
                          </div>
                        </div>
                        {isSelected && <Check size={14} strokeWidth={2.5} style={{ color: roleColor }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle size="md" />

          {/* Notification */}
          <div style={{ position: "relative" }}>
            <button
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                transition: "all 0.15s",
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
                border: "1.5px solid var(--background)",
              }}
            />
          </div>

          {/* Avatar */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
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
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              flexShrink: 0,
              overflowX: "auto",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 22px",
                  borderRight: "1px solid var(--border)",
                  minWidth: "150px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
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
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
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
          {typeof children === "function"
            ? (children as (activeSection: string, setSection: (s: string) => void) => ReactNode)(effectiveTab, setActive)
            : children}
        </main>
      </div>
    </div>
  );
}