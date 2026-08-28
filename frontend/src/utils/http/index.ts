import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";

const defaultConfig: AxiosRequestConfig = {
  timeout: 30000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  private static initConfig: PureHttpRequestConfig = {};
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 请求拦截：注入 JWT Token 和设备ID */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        // 从 localStorage 读取 token
        const token = localStorage.getItem("token");
        if (token) {
          config.headers["Authorization"] = "Bearer " + token;
        }
        
        // 添加设备ID到请求头
        const deviceId = localStorage.getItem("deviceId");
        if (deviceId) {
          config.headers["X-Device-Id"] = deviceId;
        }
        
        return config;
      },
      error => Promise.reject(error)
    );
  }

  /** 响应拦截：401 自动跳转登录，处理被踢下线 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: PureHttpError) => {
        if (error?.response?.status === 401) {
          const message = error.response.data?.message || "";
          
          // 检查是否是设备被踢下线
          if (message.includes("设备") || message.includes("下线") || message.includes("device")) {
            // 使用 Element Plus 的消息提示（如果可用）
            if (typeof window !== "undefined" && (window as any).ElMessage) {
              (window as any).ElMessage.error("您的账号在其他设备登录，已被强制下线");
            } else {
              alert("您的账号在其他设备登录，已被强制下线");
            }
          }
          
          localStorage.removeItem("token");
          storageLocal().removeItem(userKey);
          window.location.href = "/#/login";
        }
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        return Promise.reject($error);
      }
    );
  }

  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();

// 兼容旧的 getToken / formatToken 调用（pure-admin-thin 内部使用）
export function getToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return { accessToken: token, expires: Date.now() + 86400000, refreshToken: "" };
}

export function formatToken(token: string): string {
  return "Bearer " + token;
}
