import axios from "axios";
import { getToken, clearAuth, isAllowedRole, extractRoleFromToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const BASE_ENDPOINT = "/api/v1"

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach Bearer token & verify allowed role
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      const role = extractRoleFromToken(token);
      if (role && !isAllowedRole(role)) {
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?error=403";
        }
        return Promise.reject(new Error("Lỗi 403: Tài khoản không có quyền truy cập."));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle status errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      } else if (status === 403) {
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?error=403";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
