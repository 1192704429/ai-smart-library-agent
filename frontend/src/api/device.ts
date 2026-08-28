import { http } from "@/utils/http";

export interface DeviceInfo {
  id: number;
  userId: number;
  username: string;
  deviceId: string;
  deviceType: string;
  token: string;
  ip: string;
  location: string;
  userAgent: string;
  loginTime: string;
  lastAccessTime: string;
  expireTime: string;
  createTime: string;
  updateTime: string;
}

export interface ApiResult<T = void> {
  code: number;
  message: string;
  data: T;
}

/** 获取当前用户的在线设备列表 */
export const getMyOnlineDevicesApi = () =>
  http.request<ApiResult<DeviceInfo[]>>("get", "/api/devices/online");

/** 踢下线指定设备 */
export const kickOffDeviceApi = (deviceId: string) =>
  http.request<ApiResult>("delete", `/api/devices/${deviceId}`);

/** 踢下线所有设备 */
export const kickOffAllDevicesApi = () =>
  http.request<ApiResult>("delete", "/api/devices/all");

/** 管理员：查询指定用户的在线设备 */
export const getUserOnlineDevicesApi = (userId: number) =>
  http.request<ApiResult<DeviceInfo[]>>("get", `/api/devices/admin/${userId}`);

/** 管理员：强制踢下线指定用户的设备 */
export const adminKickOffDeviceApi = (userId: number, deviceId: string) =>
  http.request<ApiResult>("delete", `/api/devices/admin/${userId}/${deviceId}`);
