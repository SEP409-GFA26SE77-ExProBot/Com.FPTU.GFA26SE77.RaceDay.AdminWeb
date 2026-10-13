export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}
