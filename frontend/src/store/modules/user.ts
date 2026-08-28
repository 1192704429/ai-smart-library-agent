import { defineStore } from "pinia";
import { store, router, resetRouter, routerArrays, storageLocal } from "../utils";
import { loginApi, logoutApi, getMeApi, type UserInfo } from "@/api/auth";
import { useMultiTagsStoreHook } from "./multiTags";
import { removeToken, userKey } from "@/utils/auth";
import Cookies from "js-cookie";
import { multipleTabsKey } from "@/utils/auth";

interface UserState {
  avatar: string;
  username: string;
  nickname: string;
  roles: string[];
  isRemembered: boolean;
  loginDay: number;
  userId: number | null;
  role: string;
}

export const useUserStore = defineStore("pure-user", {
  state: (): UserState => ({
    avatar: storageLocal().getItem<UserInfo>(userKey)?.avatarUrl ?? "",
    username: storageLocal().getItem<UserInfo>(userKey)?.username ?? "",
    nickname: storageLocal().getItem<UserInfo>(userKey)?.username ?? "",
    roles: storageLocal().getItem<UserInfo>(userKey)?.role
      ? [storageLocal().getItem<UserInfo>(userKey)!.role.toLowerCase()]
      : [],
    isRemembered: false,
    loginDay: 7,
    userId: storageLocal().getItem<UserInfo>(userKey)?.id ?? null,
    role: storageLocal().getItem<UserInfo>(userKey)?.role ?? ""
  }),

  actions: {
    SET_AVATAR(avatar: string) { this.avatar = avatar; },
    SET_USERNAME(username: string) { this.username = username; this.nickname = username; },
    SET_ROLES(roles: string[]) { this.roles = roles; },
    SET_ISREMEMBERED(bool: boolean) { this.isRemembered = bool; },
    SET_LOGINDAY(value: number) { this.loginDay = Number(value); },

    /** 登录 */
    async loginByUsername(data: { username: string; password: string }) {
      const res = await loginApi(data);
      if (res.code === 200) {
        const { token, username, role, avatar } = res.data;
        // 存 token
        localStorage.setItem("token", token);
        // 存用户信息到 localStorage（roles 数组供权限过滤使用）
        const roles = [role.toLowerCase()];
        storageLocal().setItem(userKey, { username, role, avatarUrl: avatar, roles });
        // 设置 cookie 让路由守卫识别已登录
        Cookies.set(multipleTabsKey, "true", { expires: this.loginDay });
        // 更新 store
        this.username = username;
        this.nickname = username;
        this.role = role;
        this.roles = [role.toLowerCase()];
        this.avatar = avatar ?? "";
        return { success: true };
      }
      return { success: false };
    },

    /** 登出 */
    async logOut() {
      try { await logoutApi(); } catch { /* ignore */ }
      this.username = "";
      this.roles = [];
      this.userId = null;
      this.role = "";
      localStorage.removeItem("token");
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },

    /** 刷新用户信息 */
    async fetchUserInfo() {
      const res = await getMeApi();
      if (res.code === 200) {
        const user = res.data;
        this.username = user.username;
        this.nickname = user.username;
        this.role = user.role;
        this.roles = [user.role.toLowerCase()];
        this.avatar = user.avatarUrl ?? "";
        this.userId = user.id;
        storageLocal().setItem(userKey, { ...user, roles: [user.role.toLowerCase()] });
      }
    },

    // 兼容旧代码调用
    async handRefreshToken(_data: any) {
      return { success: false, data: null };
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
