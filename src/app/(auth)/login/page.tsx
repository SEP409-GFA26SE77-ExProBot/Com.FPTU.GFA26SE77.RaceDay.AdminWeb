"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { login } from "@/api/auth";
import { getApiErrorMessage } from "@/lib/error";
import { setStoredRole } from "@/lib/roleStorage";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Flag,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import "./auth.css";

function LoginHomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mustChangePasswordHint, setMustChangePasswordHint] = useState(false);

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
      const role = (Cookies.get("role") || res.role || "").toUpperCase();
      const roleId = {
        ADMIN: "admin",
        COORDINATOR: "coordinator",
        PHOTOGRAPHER: "photographer",
        VOLUNTEER: "volunteer",
      }[role];

      if (!roleId) {
        Cookies.remove("accessToken");
        Cookies.remove("role");
        Cookies.remove("username");
        Cookies.remove("user_id");
        setError(
          "Tài khoản không thuộc Admin / Coordinator / Photographer / Volunteer."
        );
        return;
      }

      setStoredRole(roleId);

      if (res.mustChangePassword) {
        setMustChangePasswordHint(true);
        return;
      }
      router.push(fromPath);
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
      </div>

      {mustChangePasswordHint ? (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-orange-500/30 bg-[var(--surface)] p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Kích hoạt thành công
            </p>
            <h2 className="mt-1 text-lg font-extrabold">
              Nên đổi mật khẩu mặc định
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Tài khoản nhân sự đã kích hoạt (không phải đăng ký). Mật khẩu được
              cấp qua email — hãy đổi sớm trong phần đổi mật khẩu của hệ thống.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold"
                onClick={() => {
                  setMustChangePasswordHint(false);
                  router.push(fromPath);
                }}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
