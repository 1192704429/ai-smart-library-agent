import { http } from "@/utils/http";
import { getDeviceId, getDeviceType } from "@/utils/device";

export interface LoginResult {
  code: number;
  message: string;
  data: {
    token: string;
    username: string;
    role: string;
    avatar: string;
  };
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;
  email: string;
  avatarUrl: string;
}

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

/** 登录 */
export const loginApi = (data: { username: string; password: string }) =>
  http.request<LoginResult>("post", "/api/auth/login", { 
    data: {
      ...data,
      deviceId: getDeviceId(),
      deviceType: getDeviceType()
    }
  });

/** 注册（读者） */
export const registerApi = (data: {
  username: string;
  password: string;
  email?: string;
}) => http.request<ApiResult>("post", "/api/auth/register", { data });

/** 登出 */
export const logoutApi = () =>
  http.request<ApiResult>("post", "/api/auth/logout");

/** 获取当前用户信息 */
export const getMeApi = () =>
  http.request<ApiResult<UserInfo>>("get", "/api/auth/me");

/** 修改密码 */
export const changePasswordApi = (data: {
  oldPassword: string;
  newPassword: string;
}) => http.request<ApiResult>("put", "/api/auth/password", { data });
