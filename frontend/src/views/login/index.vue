<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ref, reactive, computed } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { useNav } from "@/layout/hooks/useNav";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { registerApi } from "@/api/auth";
import { useEventListener } from "@vueuse/core";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import Mail from "~icons/ri/mail-line";
import BookOpen from "~icons/ri/book-open-line";
import Robot from "~icons/ri/robot-2-line";
import Search from "~icons/ri/search-eye-line";

defineOptions({ name: "Login" });

type Mode = "login" | "register";
const mode = ref<Mode>("login");
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();
const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title, getLogo } = useNav();

const loginForm = reactive({ username: "", password: "" });
const registerForm = reactive({ username: "", password: "", email: "" });

const titleMap: Record<Mode, string> = {
  login: "欢迎回来",
  register: "读者注册"
};

const subtitleMap: Record<Mode, string> = {
  login: "登录您的账号，开启智慧阅读之旅",
  register: "创建读者账号，畅享图书馆服务"
};

const currentTitle = computed(() => titleMap[mode.value]);
const currentSubtitle = computed(() => subtitleMap[mode.value]);

const loginRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

const registerRules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 32, message: "用户名长度 3-32 位", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" }
  ]
};

const features = [
  { icon: BookOpen, title: "海量馆藏", desc: "便捷检索与在线借阅" },
  { icon: Robot, title: "智阅助手", desc: "对话式检索与借还服务" },
  { icon: Search, title: "语义搜索", desc: "以自然语言精准找书" }
];

function switchMode(m: Mode) {
  mode.value = m;
  ruleFormRef.value?.clearValidate();
}

async function onLogin(formEl: FormInstance | undefined) {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      const res = await useUserStoreHook().loginByUsername(loginForm);
      if (res.success) {
        await initRouter();
        const top = getTopMenu(true);
        await router.push(top?.path ?? "/welcome");
        ElMessage.success("登录成功");
      } else {
        ElMessage.error("用户名或密码错误");
      }
    } catch {
      ElMessage.error("登录失败，请检查网络");
    } finally {
      loading.value = false;
    }
  });
}

async function onRegister(formEl: FormInstance | undefined) {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      const res: any = await registerApi(registerForm);
      if (res.code === 200) {
        ElMessage.success("读者注册成功，请登录");
        loginForm.username = registerForm.username;
        loginForm.password = "";
        switchMode("login");
      } else {
        ElMessage.error(res.message ?? "注册失败");
      }
    } catch {
      ElMessage.error("注册失败，请检查网络");
    } finally {
      loading.value = false;
    }
  });
}

useEventListener(document, "keydown", ({ code }) => {
  if (["Enter", "NumpadEnter"].includes(code) && !loading.value) {
    if (mode.value === "login") onLogin(ruleFormRef.value);
    else onRegister(ruleFormRef.value);
  }
});
</script>

<template>
  <div class="auth-page select-none">
    <div class="auth-deco-ring auth-deco-ring--1" />
    <div class="auth-deco-ring auth-deco-ring--2" />

    <div class="auth-theme-toggle">
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>

    <div class="auth-layout">
      <!-- 左侧品牌展示 -->
      <div class="auth-brand">
        <Motion>
          <div class="auth-brand-logo">
            <img :src="getLogo()" alt="logo" />
            <h1>{{ title }}</h1>
          </div>
        </Motion>
        <Motion :delay="80">
          <p class="auth-brand-slogan">
            融合人工智能与向量检索技术，<br />
            为您提供更智能、更便捷的图书馆体验。
          </p>
        </Motion>
        <div class="auth-features">
          <Motion
            v-for="(feat, idx) in features"
            :key="feat.title"
            :delay="120 + idx * 60"
          >
            <div class="auth-feature-item">
              <div class="auth-feature-icon">
                <IconifyIconOffline :icon="feat.icon" />
              </div>
              <div class="auth-feature-text">
                <strong>{{ feat.title }}</strong>
                <span>{{ feat.desc }}</span>
              </div>
            </div>
          </Motion>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-panel">
        <div class="auth-card">
          <Motion>
            <h2 class="auth-card-title">{{ currentTitle }}</h2>
            <p class="auth-card-subtitle">{{ currentSubtitle }}</p>
          </Motion>

          <!-- 模式切换 -->
          <Motion :delay="60">
            <div class="auth-mode-tabs">
              <button
                class="auth-mode-tab"
                :class="{ 'is-active': mode === 'login' }"
                @click="switchMode('login')"
              >
                登录
              </button>
              <button
                class="auth-mode-tab"
                :class="{ 'is-active': mode === 'register' }"
                @click="switchMode('register')"
              >
                读者注册
              </button>
            </div>
          </Motion>

          <!-- 登录表单 -->
          <el-form
            v-if="mode === 'login'"
            ref="ruleFormRef"
            class="auth-form"
            :model="loginForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  clearable
                  placeholder="请输入用户名"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  clearable
                  show-password
                  placeholder="请输入密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="200">
              <el-button
                class="auth-submit-btn"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                登 录
              </el-button>
            </Motion>
          </el-form>

          <!-- 读者注册 -->
          <el-form
            v-else
            ref="ruleFormRef"
            class="auth-form"
            :model="registerForm"
            :rules="registerRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item prop="username">
                <el-input
                  v-model="registerForm.username"
                  clearable
                  placeholder="用户名（3-32位）"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  clearable
                  show-password
                  placeholder="密码（至少6位）"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="200">
              <el-form-item>
                <el-input
                  v-model="registerForm.email"
                  clearable
                  placeholder="邮箱（可选）"
                  :prefix-icon="useRenderIcon(Mail)"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="250">
              <el-button
                class="auth-submit-btn"
                type="primary"
                :loading="loading"
                @click="onRegister(ruleFormRef)"
              >
                注册读者账号
              </el-button>
            </Motion>
          </el-form>

          <Motion :delay="300">
            <div class="auth-footer">
              <template v-if="mode === 'login'">
                还没有账号？
                <el-link type="primary" @click="switchMode('register')">
                  立即注册
                </el-link>
              </template>
              <template v-else>
                已有账号？
                <el-link type="primary" @click="switchMode('login')">
                  返回登录
                </el-link>
              </template>
            </div>
          </Motion>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>
