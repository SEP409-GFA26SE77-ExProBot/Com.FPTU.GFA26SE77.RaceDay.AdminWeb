import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { BASE_URL } from "./global-config";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const resData = error.response.data as
        | { error?: string; message?: string; title?: string }
        | undefined;
      const errorMsg =
        resData?.error ||
        resData?.message ||
        resData?.title ||
        (typeof resData === "string" ? resData : "");

      switch (status) {
        case 400:
        case 422:
          break;
        case 401:
          Cookies.remove("access_token");
          Cookies.remove("role");
          if (typeof window !== "undefined") {
            const path = window.location.pathname;
            if (path !== "/" && !path.startsWith("/login")) {
              window.location.href = `/?from=${encodeURIComponent(path)}`;
            }
          }
          break;
        case 403:
          console.error("Không có quyền truy cập.");
          break;
        case 500:
          console.error("Lỗi máy chủ nội bộ (500):", errorMsg);
          break;
        default:
          console.warn(`Lỗi API [${status}]:`, errorMsg || error.message);
      }
    } else if (error.request) {
      console.error("Không nhận được phản hồi từ server (Network Error)");
    }

    return Promise.reject(error);
  }
);

export default api;
