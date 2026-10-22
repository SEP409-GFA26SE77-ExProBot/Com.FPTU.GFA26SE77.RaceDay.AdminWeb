"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";
import Cookies from "js-cookie";
import { logout } from "@/api/auth";
import { useActiveTab } from "@/context/ActiveTabContext";
import {
  ChevronDown,
  Flag,
  KeyRound,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./ui";

export type OpsIcon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export type OpsNavLeaf = {
  id: string;
  label: string;
  href: string;
  icon: OpsIcon;
};

export type OpsNavGroup = {
  heading: string;
  items: OpsNavLeaf[];
};

export type OpsShellProps = {
  children: ReactNode;
  groups: OpsNavGroup[];
  homeHref: string;
  /** Breadcrumb prefix, e.g. "Quản trị hệ thống" */
  breadcrumbLabel: string;
  /** Footer line under sidebar */
  footerLabel: string;
  footerIcon?: OpsIcon;
};

function leafActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function OpsShell({
  children,
  groups,
  homeHref,
  breadcrumbLabel,
  footerLabel,
  footerIcon: FooterIcon,
}: OpsShellProps) {
  const pathname = usePathname();
  const { setActiveTab } = useActiveTab();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.heading, true])),
  );
  const userMenuRef = useRef<HTMLDivElement>(null);
  // Cookie chỉ có trên client — đọc sau mount để tránh hydration U≠V
  const [username, setUsername] = useState("User");

  useEffect(() => {
    setUsername(Cookies.get("username") || "User");
  }, []);

  const initial = username.charAt(0).toUpperCase() || "U";

  const atHome = pathname === homeHref || pathname === `${homeHref}/`;
  const homeLeaf = groups[0]?.items[0] ?? null;

  const activeLeaf = useMemo(() => {
    for (const g of groups) {
      for (const leaf of g.items) {
        if (leafActive(pathname, leaf.href)) return leaf;
      }
    }
    if (atHome) return homeLeaf;
    return homeLeaf;
  }, [pathname, groups, atHome, homeLeaf]);

  useEffect(() => {
    if (activeLeaf) setActiveTab(activeLeaf.id);
  }, [activeLeaf, setActiveTab]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [userMenuOpen]);

  const closeMobile = () => setMobileOpen(false);

  const linkClass = (active: boolean) =>
    `group flex items-center rounded-xl text-sm font-medium transition-colors ${
      active
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-950/20"
        : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
    } ${
      collapsed
        ? "gap-3 px-3 py-3 lg:justify-center lg:px-0 lg:py-3"
        : "gap-3 px-3 py-2.5"
    }`;

  return (
    <div className="h-dvh overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] text-[var(--text-primary)] shadow-2xl shadow-slate-950/10 transition-[width,transform] duration-300 lg:translate-x-0 ${
          collapsed ? "w-[272px] lg:w-[72px]" : "w-[272px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-20 items-center border-b border-white/10 ${
            collapsed
              ? "justify-between px-5 lg:justify-center lg:px-0"
              : "justify-between px-5"
          }`}
        >
          <Link
            href={homeHref}
            onClick={closeMobile}
            className={`flex items-center overflow-hidden ${
              collapsed ? "gap-0 lg:justify-center" : "gap-3"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-600 shadow-lg shadow-orange-500/25">
              <Flag className="h-5 w-5" />
            </span>
            <span
              className={`${collapsed ? "lg:hidden" : ""} whitespace-nowrap text-lg font-black tracking-tight`}
            >
              RaceDay
            </span>
          </Link>
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className={`flex-1 space-y-4 overflow-y-auto py-5 ${
            collapsed ? "px-3 lg:px-2" : "px-3"
          }`}
        >
          {groups.map((group) => {
            const isOpen = openGroups[group.heading] !== false;
            const groupExpanded = isOpen || collapsed;
            return (
              <div key={group.heading} className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setOpenGroups((prev) => ({
                        ...prev,
                        [group.heading]: true,
                      }));
                    } else {
                      setOpenGroups((prev) => ({
                        ...prev,
                        [group.heading]: !isOpen,
                      }));
                    }
                  }}
                  className={`flex w-full items-center gap-1 px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)] ${
                    collapsed ? "lg:justify-center lg:px-0" : ""
                  }`}
                >
                  <span className={collapsed ? "lg:hidden" : ""}>
                    {group.heading}
                  </span>
                  <span className={collapsed ? "lg:hidden" : ""}>
                    {isOpen ? (
                      <ChevronDown className="h-3 w-3 opacity-80" />
                    ) : (
                      <ChevronDown className="h-3 w-3 rotate-[-90deg] opacity-80" />
                    )}
                  </span>
                </button>
                {groupExpanded &&
                  group.items.map((leaf) => {
                    const active =
                      leafActive(pathname, leaf.href) ||
                      (atHome && homeLeaf?.href === leaf.href);
                    const Icon = leaf.icon;
                    return (
                      <Link
                        key={leaf.href}
                        href={leaf.href}
                        onClick={closeMobile}
                        title={collapsed ? leaf.label : undefined}
                        className={linkClass(active)}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className={collapsed ? "lg:hidden" : ""}>
                          {leaf.label}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            );
          })}
        </nav>

        <div
          className={`mt-auto border-t border-white/10 py-3 ${
            collapsed ? "px-3 lg:px-2" : "px-3"
          }`}
        >
          <div
            className={`flex items-center rounded-xl text-sm font-semibold text-[var(--text-secondary)] ${
              collapsed
                ? "gap-3 px-3 py-3 lg:justify-center lg:px-0"
                : "gap-3 px-3 py-3"
            }`}
          >
            {FooterIcon ? (
              <FooterIcon className="h-[18px] w-[18px] shrink-0 text-orange-400" />
            ) : null}
            <span className={collapsed ? "lg:hidden" : ""}>{footerLabel}</span>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={closeMobile}
          aria-label="Đóng menu"
        />
      )}

      <div
        className={`flex h-dvh flex-col transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[272px]"
        }`}
      >
        <header className="z-40 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--header-bg)] px-5 text-[var(--text-primary)] backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-secondary)] lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-secondary)] hover:text-orange-600 lg:block"
              aria-label="Thu gọn sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span className="text-orange-600">{breadcrumbLabel}</span>
                <span className="font-semibold normal-case tracking-normal text-[var(--text-secondary)]">
                  / {activeLeaf?.label || ""}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle size="md" />
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((p) => !p)}
                className="flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-2 pr-3 text-sm shadow-xs transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-xs font-bold text-white">
                  {initial}
                </div>
                <span className="hidden max-w-[120px] truncate font-medium text-[var(--text-primary)] sm:inline">
                  {username}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-[var(--border)] bg-[var(--modal-bg)] p-1.5 shadow-xl ring-1 ring-black/5">
                  <div className="border-b border-[var(--border)] px-3 py-2">
                    <p className="text-xs text-[var(--text-secondary)]">Đã đăng nhập</p>
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {username}
                    </p>
                  </div>
                  <Link
                    href="/change-password"
                    onClick={() => setUserMenuOpen(false)}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <KeyRound className="h-4 w-4" />
                    Đổi mật khẩu
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6 pb-20 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
