"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredRole, setStoredRole } from "@/lib/roleStorage";
import { ROLES_CONFIG, RoleConfig, NavItemConfig } from "@/config/roles";
import { useActiveTab } from "@/context/ActiveTabContext";

export interface SidebarProps {
  /** Explicit active tab ID for the current route */
  tab?: string;
  /** Role ID ("volunteer" | "coordinator" | "administrator" | "photographer") */
  role?: string;
  roleName?: string;
  roleAbbr?: string;
  roleIcon?: string;
  roleColor?: string;
  roleColorRgb?: string;
  basePath?: string;
  navItems?: NavItemConfig[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onSelectTab?: (tabId: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function Sidebar({
  tab,
  role: propRole,
  roleName: propRoleName,
  roleAbbr: propRoleAbbr,
  roleIcon: propRoleIcon,
  roleColor: propRoleColor,
  roleColorRgb: propRoleColorRgb,
  basePath: propBasePath,
  navItems: propNavItems,
  collapsed: controlledCollapsed,
  onToggleCollapse,
  onSelectTab,
  style,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const contextTab = useActiveTab().activeTab;

  // Internal collapse state if not controlled externally
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse ?? (() => setInternalCollapsed((prev) => !prev));

  // Determine active role from prop, storage/cookie, or pathname fallback
  const [activeRoleKey, setActiveRoleKey] = useState<string>(() => {
    if (propRole) return propRole;
    const stored = getStoredRole();
    if (stored && ROLES_CONFIG[stored]) return stored;
    // Derive from pathname
    if (pathname.startsWith("/coordinator")) return "coordinator";
    if (pathname.startsWith("/volunteer")) return "volunteer";
    if (pathname.startsWith("/administrator")) return "administrator";
    if (pathname.startsWith("/photographer")) return "photographer";
    return "coordinator";
  });

  useEffect(() => {
    if (propRole) {
      setActiveRoleKey(propRole);
      setStoredRole(propRole);
    } else {
      const stored = getStoredRole();
      if (stored && ROLES_CONFIG[stored]) {
        setActiveRoleKey(stored);
      } else {
        // Infer from route
        const segments = pathname.split("/").filter(Boolean);
        if (segments[0] && ROLES_CONFIG[segments[0]]) {
          setActiveRoleKey(segments[0]);
          setStoredRole(segments[0]);
        }
      }
    }
  }, [propRole, pathname]);

  const roleConfig: RoleConfig | undefined = ROLES_CONFIG[activeRoleKey];

  const roleName = propRoleName ?? roleConfig?.name ?? "RaceDay Admin";
  const roleAbbr = propRoleAbbr ?? roleConfig?.roleAbbr ?? "ADM";
  const roleIcon = propRoleIcon ?? roleConfig?.roleIcon ?? "⚡";
  const roleColor = propRoleColor ?? roleConfig?.roleColor ?? "#F59E0B";
  const roleColorRgb = propRoleColorRgb ?? roleConfig?.roleColorRgb ?? "245,158,11";
  const basePath = propBasePath ?? roleConfig?.basePath ?? `/${activeRoleKey}`;
  const navItems = propNavItems ?? roleConfig?.navItems ?? [];

  // Determine active tab: priority is explicit prop > contextTab > pathname match > first item
  const resolvedTab =
    tab ||
    contextTab ||
    navItems.find((n) => {
      const itemHref = n.href ?? `${basePath}/${n.id}`;
      return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
    })?.id ||
    navItems[0]?.id;

  return (
    <aside
      className={className}
      style={{
        width: isCollapsed ? "68px" : "248px",
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
        height: "100%",
        ...style,
      }}
    >
      {/* Sidebar top accent glow */}
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

      {/* Header / Logo row */}
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
        <Link
          href="/"
          title="Back to Role Selection"
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
            textDecoration: "none",
          }}
        >
          {roleIcon}
        </Link>
        {!isCollapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#64748B",
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
                {roleName}
              </div>
            </div>
            <button
              onClick={toggleCollapse}
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

      {/* Navigation tabs */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => {
          const itemHref = item.href ?? (basePath ? `${basePath}/${item.id}` : undefined);
          const isActive = item.id === resolvedTab;

          const buttonContent = (
            <>
              <span style={{ fontSize: "17px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
              {!isCollapsed && (
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
            </>
          );

          const commonStyles: React.CSSProperties = {
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: isCollapsed ? "10px 0" : "9px 10px",
            borderRadius: "10px",
            marginBottom: "3px",
            background: isActive ? `rgba(${roleColorRgb},0.12)` : "transparent",
            border: isActive ? `1px solid rgba(${roleColorRgb},0.28)` : "1px solid transparent",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.18s",
            justifyContent: isCollapsed ? "center" : "flex-start",
            boxShadow: isActive ? `0 0 16px rgba(${roleColorRgb},0.12)` : "none",
            textDecoration: "none",
            boxSizing: "border-box",
          };

          if (itemHref) {
            return (
              <Link
                key={item.id}
                href={itemHref}
                title={isCollapsed ? item.label : undefined}
                style={commonStyles}
                onClick={() => onSelectTab?.(item.id)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                {buttonContent}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab?.(item.id)}
              title={isCollapsed ? item.label : undefined}
              style={commonStyles}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {buttonContent}
            </button>
          );
        })}
      </nav>

      {/* Footer / Role status */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
        {isCollapsed ? (
          <button
            onClick={toggleCollapse}
            style={{
              width: "100%",
              height: "36px",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Expand sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "11px", color: "#64748B", flex: 1 }}>Live Sync</span>
              <span
                style={{
                  fontSize: "10px",
                  color: roleColor,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                {roleAbbr}
              </span>
            </div>

            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "6px",
                borderRadius: "8px",
                fontSize: "11px",
                color: "#475569",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#94A3B8";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span>⇄</span> Change Role
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
