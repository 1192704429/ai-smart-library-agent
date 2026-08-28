<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarBreadCrumb from "../lay-sidebar/components/SidebarBreadCrumb.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";

import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";

const {
  layout,
  device,
  logout,
  pureApp,
  username,
  userAvatar,
  avatarsStyle,
  toggleSideBar
} = useNav();
</script>

<template>
  <div class="navbar">
    <LaySidebarTopCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <LaySidebarBreadCrumb
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="breadcrumb-container"
    />

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="userAvatar" :style="avatarsStyle" />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <IconifyIconOffline
                :icon="LogoutCircleRLine"
                style="margin: 5px"
              />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: var(--pure-header-height);
  overflow: hidden;
  background: rgb(255 255 255 / 82%);
  border-bottom: 1px solid rgb(99 102 241 / 10%);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 12px rgb(99 102 241 / 6%);

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: var(--pure-header-height);
    cursor: pointer;
    border-radius: 10px;
    transition: background-color var(--pure-transition-duration);

    &:hover {
      background: rgb(99 102 241 / 8%);
    }
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 280px;
    height: var(--pure-header-height);
    padding-right: 8px;
    color: #312e81;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 8px;
      height: 40px;
      padding: 0 12px;
      color: #312e81;
      cursor: pointer;
      border-radius: 10px;
      transition: background-color var(--pure-transition-duration);

      &:hover {
        background: rgb(99 102 241 / 8%);
      }

      p {
        font-size: 14px;
        font-weight: 500;
      }

      img {
        width: 28px;
        height: 28px;
        border: 2px solid rgb(99 102 241 / 20%);
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 20px;
  }
}

.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
