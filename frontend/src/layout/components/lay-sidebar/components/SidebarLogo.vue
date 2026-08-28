<script setup lang="ts">
import { getTopMenu } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";

defineProps({
  collapse: Boolean
});

const { title, getLogo } = useNav();
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: var(--pure-sidebar-logo-height);
  overflow: hidden;

  &::after {
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 1px;
    content: "";
    background: linear-gradient(
      90deg,
      transparent,
      rgb(129 140 248 / 30%),
      transparent
    );
  }

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
    padding-left: 16px;
    transition: opacity var(--pure-transition-duration);

    &:hover {
      opacity: 0.88;
    }

    img {
      display: inline-block;
      height: 32px;
      filter: drop-shadow(0 2px 6px rgb(99 102 241 / 25%));
    }

    .sidebar-title {
      display: inline-block;
      height: 32px;
      margin: 0 0 0 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 16px;
      font-weight: 700;
      line-height: 32px;
      color: var(--pure-theme-sub-menu-active-text);
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
  }
}
</style>
