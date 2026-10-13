import axios, { AxiosRequestConfig } from "axios";
import { axiosInstance } from "@/config/axios";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const message =
      (typeof data === "object" && data !== null && "error" in data && typeof (data as Record<string, unknown>).error === "string"
        ? (data as Record<string, unknown>).error
        : null) ||
      (typeof data === "object" && data !== null && "message" in data && typeof (data as Record<string, unknown>).message === "string"
        ? (data as Record<string, unknown>).message
        : null) ||
      error.message ||
      `HTTP ${status}`;
    return new ApiError(status, message as string);
  }
  if (error instanceof Error) {
    return new ApiError(500, error.message);
  }
  return new ApiError(500, "Unknown API error");
}

export const api = {
  /** Authenticated GET */
  async get<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await axiosInstance.get<T>(path, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  /** Authenticated POST with JSON body */
  async post<T = unknown>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await axiosInstance.post<T>(path, body, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  /** Authenticated PUT with JSON body */
  async put<T = unknown>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await axiosInstance.put<T>(path, body, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  /** Authenticated DELETE */
  async delete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await axiosInstance.delete<T>(path, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  /** Public (no auth) POST — used for login */
  async publicPost<T = unknown>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await axiosInstance.post<T>(path, body, config);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },
};
