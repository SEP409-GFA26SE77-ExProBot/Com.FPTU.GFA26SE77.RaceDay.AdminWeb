"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import eventsData from "@/events.json";
import { login } from "@/api/auth";
import { getApiErrorMessage } from "@/lib/error";
import { isAdminRole } from "@/lib/role";
import { setStoredRole } from "@/lib/roleStorage";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PendingEventInfoModal } from "@/components/PendingEventInfoModal";
import { coerceRaceEvent } from "@/dto/event.dto";
import { Button } from "@/components/ui/button";
import {
  Flag,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Camera,
  Activity,
  Map,
  ShieldCheck,
  MapPin,
  Calendar,
  Users,
  Building2,
  Info,
} from "lucide-react";
import "./auth.css";

type DemoRoleId = "photographer" | "volunteer" | "coordinator";

interface DemoRole {
  id: DemoRoleId;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  glowColor: string;
}

const DEMO_ROLES: DemoRole[] = [
  {
    id: "photographer",
    name: "Photographer",
    description: "Upload ảnh, OCR BIB — vào thẳng, không cần login.",
    color: "#06B6D4",
    borderColor: "rgba(6,182,212,0.30)",
    glowColor: "rgba(6,182,212,0.12)",
  },
  {
    id: "volunteer",
    name: "Volunteer",
    description: "Scan QR / check-in — vào thẳng, không cần login.",
    color: "#10B981",
    borderColor: "rgba(16,185,129,0.30)",
    glowColor: "rgba(16,185,129,0.12)",
  },
  {
    id: "coordinator",
    name: "Coordinator",
    description: "Race-day map / SOS — vào thẳng, không cần login.",
    color: "#F59E0B",
    borderColor: "rgba(245,158,11,0.30)",
    glowColor: "rgba(245,158,11,0.12)",
  },
];

function demoIcon(id: DemoRoleId, color: string) {
  const props = { size: 22, strokeWidth: 1.75, style: { color } };
  if (id === "photographer") return <Camera {...props} />;
  if (id === "volunteer") return <Activity {...props} />;
  return <Map {...props} />;
}

function LoginHomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/administrator";

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDemo, setSelectedDemo] = useState<DemoRole | null>(null);
  const [infoEvent, setInfoEvent] = useState<(typeof eventsData)[0] | null>(
    null
  );

  useEffect(() => {
    const token = Cookies.get("access_token");
    const role = Cookies.get("role");
    if (token && isAdminRole(role)) {
      router.replace(
        fromPath.startsWith("/administrator") ? fromPath : "/administrator"
      );
    }
  }, [router, fromPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await login({
        username: form.username.trim(),
        password: form.password,
      });
      const role = Cookies.get("role") || res.role || "";
      if (!isAdminRole(role)) {
        Cookies.remove("access_token");
        Cookies.remove("role");
        Cookies.remove("username");
        Cookies.remove("user_id");
        setError(
          "Tài khoản này không có quyền Administrator. Dùng admin / MatKhau@123."
        );
        return;
      }
      setStoredRole("administrator");
      router.push(
        fromPath.startsWith("/administrator") ? fromPath : "/administrator"
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Tên đăng nhập hoặc mật khẩu không chính xác."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const enterDemoDashboard = (eventItem: (typeof eventsData)[0]) => {
    if (!selectedDemo) return;
    setStoredRole(selectedDemo.id);
    try {
      localStorage.setItem("raceday_selected_event_id", eventItem.id);
      localStorage.setItem(
        "raceday_selected_event",
        JSON.stringify(eventItem)
      );
    } catch {
      /* ignore */
    }
    router.push(`/${selectedDemo.id}?eventId=${eventItem.id}`);
  };

  return (
    <div className="auth-page">
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 40,
        }}
      >
        <ThemeToggle showLabel size="md" />
      </div>

      <div className="auth-bg" />
      <div className="auth-overlay" />
      <div className="auth-particles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      <div
        className="auth-content"
        style={{ maxWidth: 480, width: "100%", paddingBottom: "2rem" }}
      >
        <div className="auth-brand" title="RaceDay Admin">
          <div className="auth-brand-icon">
            <Flag size={28} />
          </div>
          <span className="auth-brand-name">RaceDay Admin</span>
        </div>

        {/* Login — bắt buộc cho Administrator */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Đăng nhập Admin</h1>
            <p className="auth-subtitle">
              Administrator cần đăng nhập IAM trước khi vào duyệt giải.
            </p>
          </div>

          <div className="auth-tabs">
            <span className="auth-tab auth-tab--active">Administrator</span>
            <span
              className="auth-tab"
              style={{ opacity: 0.45, cursor: "default" }}
              title="Demo roles bên dưới — không cần login"
            >
              Demo ops
            </span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && (
              <div className="auth-error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="login-username" className="auth-label">
                Tên đăng nhập
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                value={form.username}
                onChange={handleChange}
                className="auth-input"
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-label">
                  Mật khẩu
                </label>
              </div>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="MatKhau@123"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input auth-input--with-icon"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p
              className="text-[11px] text-slate-400 -mt-1 mb-1"
              style={{ lineHeight: 1.45 }}
            >
              Mẫu: <code className="text-orange-400">admin</code> /{" "}
              <code className="text-orange-400">MatKhau@123</code>
            </p>

            <button
              id="btn-login-submit"
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  Đang đăng nhập…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Đăng nhập Administrator
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo roles — không login */}
        <div
          className="w-full rounded-2xl border border-white/10 bg-slate-950/55 backdrop-blur-md p-4 sm:p-5"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">
            Vào nhanh (demo)
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Volunteer / Photographer / Coordinator — bấm là vào, chưa cần check
            login.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {DEMO_ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedDemo(role);
                  setStoredRole(role.id);
                }}
                className="text-left rounded-xl border bg-slate-900/70 p-3.5 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: role.borderColor,
                  boxShadow: `0 0 0 0 ${role.glowColor}`,
                }}
              >
                <div
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `${role.color}40`,
                    background: `${role.color}18`,
                  }}
                >
                  {demoIcon(role.id, role.color)}
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: role.color }}
                >
                  {role.name}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">
                  {role.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Admin API dùng cookie <code>access_token</code> + axios như User FE.
        </p>
      </div>

      {/* Event picker cho demo roles */}
      {selectedDemo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(2,6,23,0.72)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setSelectedDemo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "85vh",
              overflow: "auto",
              borderRadius: 20,
              border: `1px solid ${selectedDemo.borderColor}`,
              background: "var(--surface, #0f172a)",
              boxShadow: `0 0 48px ${selectedDemo.glowColor}`,
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                Chọn giải · {selectedDemo.name}
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                Demo ops — không cần IAM login.
              </p>
            </div>
            <div style={{ padding: 16, display: "grid", gap: 10 }}>
              {eventsData.map((evt) => {
                const isLive = evt.status === "live";
                const isPending = evt.status === "pending";
                return (
                  <div
                    key={evt.id}
                    onClick={() => enterDemoDashboard(evt)}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      cursor: "pointer",
                    }}
                    className="hover:border-orange-500/40"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <strong style={{ color: "var(--text-primary)", fontSize: 14 }}>
                        {evt.name}
                      </strong>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: isLive
                            ? "#EF4444"
                            : isPending
                              ? "#F59E0B"
                              : "#94A3B8",
                        }}
                      >
                        {evt.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-secondary)" }}>
                      {evt.tagline}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 10,
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {evt.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {evt.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} /> {evt.totalRunners.toLocaleString("en-US")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={12} /> {evt.organizer.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {evt.distances.map((d) => (
                          <span
                            key={d.type}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 6,
                              color: d.color,
                              border: `1px solid ${d.color}40`,
                            }}
                          >
                            {d.type}
                          </span>
                        ))}
                      </div>
                      {isPending && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInfoEvent(evt);
                          }}
                          className="h-7 px-2.5 text-xs gap-1"
                        >
                          <Info className="h-3.5 w-3.5" />
                          Info
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedDemo(null)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface-hover)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {infoEvent && (
        <PendingEventInfoModal
          event={coerceRaceEvent(infoEvent)}
          open={!!infoEvent}
          onOpenChange={(open) => {
            if (!open) setInfoEvent(null);
          }}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page flex items-center justify-center text-slate-400">
          <div className="auth-bg" />
          <div className="auth-overlay" />
          <div className="relative z-10 flex items-center gap-2">
            <Loader2 className="animate-spin text-orange-500" size={24} />
            <span>Đang tải…</span>
          </div>
        </div>
      }
    >
      <LoginHomeInner />
    </Suspense>
  );
}
