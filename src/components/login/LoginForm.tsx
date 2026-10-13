"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { iamApi, ApiError } from "@/app/api";
import { setAuth, extractRoleFromToken, isAllowedRole } from "@/lib/auth";
import { setStoredRole } from "@/lib/roleStorage";
import { LoginHeader } from "./LoginHeader";
import { SeedAccountSelector } from "./SeedAccountSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardShadcn, CardContent } from "@/components/ui/card-shadcn";
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const urlError = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (urlError === "403") {
      setError("Lỗi 403: Tài khoản của bạn không có quyền truy cập vào hệ thống Quản trị (Chỉ dành cho Admin, Coordinator, Photographer, Volunteer).");
    }
  }, [urlError]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await iamApi.login(username.trim(), password.trim());
      const roleFromToken = extractRoleFromToken(data?.accessToken || "");
      const userRole = data?.user?.role || roleFromToken || "";

      // Validate allowed role
      if (!isAllowedRole(userRole)) {
        setError("Lỗi 403: Tài khoản của bạn không có quyền truy cập vào hệ thống Quản trị (Chỉ dành cho Admin, Coordinator, Photographer, Volunteer).");
        return;
      }

      const savedSuccess = setAuth(data.accessToken, data?.user || { userId: "", username: username.trim(), email: "", role: userRole });
      if (!savedSuccess) {
        setError("Lỗi 403: Tài khoản của bạn không có quyền truy cập vào hệ thống Quản trị.");
        return;
      }

      if (userRole) {
        setStoredRole(userRole.toLowerCase());
      }

      setSuccess(true);
      setTimeout(() => {
        if (redirectPath && redirectPath !== "/login") {
          router.push(redirectPath);
        } else {
          const roleLower = userRole.toLowerCase();
          if (roleLower === "admin" || roleLower === "administrator") {
            router.push("/administrator");
          } else if (roleLower === "coordinator") {
            router.push("/coordinator");
          } else if (roleLower === "photographer") {
            router.push("/photographer");
          } else if (roleLower === "volunteer") {
            router.push("/volunteer");
          } else {
            router.push("/administrator");
          }
        }
      }, 500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
        } else if (err.status === 403) {
          setError("Lỗi 403: Tài khoản của bạn không có quyền truy cập vào hệ thống Quản trị.");
        } else {
          setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
      } else if (err instanceof Error) {
        setError(err.message || "Không thể kết nối đến máy chủ backend.");
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeedAccount = (usr: string, pwd = "MatKhau@123") => {
    setUsername(usr);
    setPassword(pwd);
    setError(null);
  };

  return (
    <CardShadcn className="w-full max-w-[460px] p-8 shadow-2xl border-border bg-card/90 backdrop-blur-2xl relative z-10 animate-slide-up">
      <LoginHeader />

      <CardContent className="p-0">
        {/* Error Feedback */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback */}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>Đăng nhập thành công! Đang chuyển hướng...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username (ví dụ: admin)"
                autoComplete="username"
                className="pl-10"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (ví dụ: MatKhau@123)"
                autoComplete="current-password"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || success}
            className="w-full h-11 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-purple-500/25 transition-all active:scale-[0.99]"
          >
            {loading ? (
              <span>Đang đăng nhập...</span>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        {/* Quick Fill Seed Accounts */}
        <SeedAccountSelector onSelectAccount={handleSelectSeedAccount} />
      </CardContent>
    </CardShadcn>
  );
}
