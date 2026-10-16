"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredRole, setStoredRole } from "@/lib/roleStorage";
import { ROLES_CONFIG, RoleConfig, NavItemConfig } from "@/config/roles";
import { useActiveTab } from "@/context/ActiveTabContext";
import {
  QrCode,
  PenTool,
  AlertTriangle,
  ClipboardList,
  Map,
  HeartPulse,
  Timer,
  Layers,
  ShieldAlert,
  Truck,
  FileCheck,
  Users,
  Scale,
  ShieldCheck,
  BarChart3,
  Calendar,
  UploadCloud,
  Scan,
  Edit,
  LineChart,
  Send,
  Inbox,
  Activity,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Banknote,
  PiggyBank,
  Settings,
} from "lucide-react";

export interface SidebarProps {
  /** Explicit active tab ID for the current route */
  tab?: string;
  /** Role ID ("volunteer" | "coordinator" | "administrator" | "photographer") */
  role?: string;
  roleName?: string;
  roleAbbr?: string;
  roleIcon?: string | React.ReactNode;
  roleColor?: string;
  roleColorRgb?: string;
  basePath?: string;
  navItems?: NavItemConfig[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onSelectTab?: (tabId: string) => void;
  /** Ẩn Live Sync / Change Role (admin thật). */
  hideDemoFooter?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

function renderNavIcon(id: string, color: string, isActive: boolean) {
  const iconProps = {
    size: 17,
    strokeWidth: 1.75,
    style: {
      color: isActive ? color : "var(--text-secondary)",
      flexShrink: 0,
      transition: "color 0.15s ease",
    },
  };

  switch (id) {
    case "scanner":
      return <QrCode {...iconProps} />;
    case "manual":
      return <PenTool {...iconProps} />;
    case "issues":
      return <AlertTriangle {...iconProps} />;
    case "status":
      return <ClipboardList {...iconProps} />;
    case "map":
      return <Map {...iconProps} />;
    case "medical":
      return <HeartPulse {...iconProps} />;
    case "cutoff":
      return <Timer {...iconProps} />;
    case "inventory":
      return <Layers {...iconProps} />;
    case "contingency":
      return <ShieldAlert {...iconProps} />;
    case "broom":
      return <Truck {...iconProps} />;
    case "approvals":
      return <FileCheck {...iconProps} />;
    case "payouts":
      return <Banknote {...iconProps} />;
    case "finance":
      return <PiggyBank {...iconProps} />;
    case "settings":
      return <Settings {...iconProps} />;
    case "users":
      return <Users {...iconProps} />;
    case "reconciliation":
      return <Scale {...iconProps} />;
    case "audit":
      return <ShieldCheck {...iconProps} />;
    case "stats":
      return <BarChart3 {...iconProps} />;
    case "assignments":
      return <Calendar {...iconProps} />;
    case "upload":
      return <UploadCloud {...iconProps} />;
    case "ocr":
      return <Scan {...iconProps} />;
    case "corrections":
      return <Edit {...iconProps} />;
    case "analytics":
      return <LineChart {...iconProps} />;
    case "publish":
      return <Send {...iconProps} />;
    case "requests":
      return <Inbox {...iconProps} />;
    default:
      return <CircleDot {...iconProps} />;
  }
}

function renderRoleIcon(roleKey: string, color: string) {
  const iconProps = { size: 18, strokeWidth: 1.75, style: { color } };
  switch (roleKey.toLowerCase()) {
    case "coordinator":
    case "ops":
      return <Map {...iconProps} />;
    case "volunteer":
    case "vol":
      return <Activity {...iconProps} />;
    case "administrator":
    case "admin":
    case "adm":
      return <ShieldCheck {...iconProps} />;
    case "photographer":
    case "pho":
      return <Camera {...iconProps} />;
    default:
      return <ShieldCheck {...iconProps} />;
  }
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
  hideDemoFooter = false,
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
    if (pathname.startsWith("/admin")) return "administrator";
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
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
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
          borderBottom: "1px solid var(--border)",
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
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          {renderRoleIcon(activeRoleKey, roleColor)}
        </Link>
        {!isCollapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
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
                  color: "var(--text-primary)",
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
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                borderRadius: "6px",
                flexShrink: 0,
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
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
              {renderNavIcon(item.id, roleColor, isActive)}
              {!isCollapsed && (
                <>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? roleColor : "var(--text-secondary)",
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
                  if (!isActive) e.currentTarget.style.background = "var(--surface-hover)";
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
                if (!isActive) e.currentTarget.style.background = "var(--surface-hover)";
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
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
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
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Expand sidebar"
          >
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        ) : hideDemoFooter ? (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            RaceDay Admin
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
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
              <span style={{ fontSize: "11px", color: "var(--text-muted)", flex: 1 }}>Live Sync</span>
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
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
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
