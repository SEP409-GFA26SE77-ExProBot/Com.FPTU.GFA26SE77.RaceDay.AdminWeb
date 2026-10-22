"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { changePassword } from "@/api/auth";
import { getApiErrorMessage } from "@/lib/error";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Mật khẩu đã được cập nhật.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể đổi mật khẩu. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-1 py-4 text-[var(--text-primary)]">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-black/5 sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-500">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
              Account security
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              Đổi mật khẩu
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Nhập mật khẩu hiện tại và chọn mật khẩu mới.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <label htmlFor="current-password" className="text-sm font-semibold">
              Mật khẩu hiện tại
            </label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--input)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-sm font-semibold">
              Mật khẩu mới
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--input)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-sm font-semibold">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--input)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
            />
          </div>

          {error ? (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}
          {success ? (
            <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/15 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {loading ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
          </button>
        </form>
      </section>
    </div>
  );
}
