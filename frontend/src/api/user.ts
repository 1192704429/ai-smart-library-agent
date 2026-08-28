import { http } from "@/utils/http";

export interface UserInfo {
  id: number;
  username: string;
  role: string;
  email: string;
  avatarUrl: string;
  status: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

export const listUsers = (params: { page?: number; size?: number; keyword?: string }) =>
  http.request<ApiResult<PageResult<UserInfo>>>("get", "/api/admin/users", { params });

export const updateUserStatus = (id: number, enabled: boolean) =>
  http.request<ApiResult>("put", `/api/admin/users/${id}/status`, { data: { enabled } });
