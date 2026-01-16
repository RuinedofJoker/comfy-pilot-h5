<template>
  <nav class="f-top-nav-bar">
    <div class="f-top-nav-bar__container">
      <div class="f-top-nav-bar__left">
        <router-link to="/services" class="f-top-nav-bar__logo">
          <BaseIcon name="logo" :size="32" />
          <span class="f-top-nav-bar__title">Comfy Pilot</span>
        </router-link>
      </div>

      <div class="f-top-nav-bar__center">
        <div class="f-top-nav-bar__nav">
          <router-link
            to="/services"
            class="f-top-nav-bar__nav-item"
            active-class="f-top-nav-bar__nav-item--active"
          >
            服务选择
          </router-link>
          <router-link
            to="/workflows"
            class="f-top-nav-bar__nav-item"
            active-class="f-top-nav-bar__nav-item--active"
          >
            我的工作流
          </router-link>
        </div>
      </div>

      <div class="f-top-nav-bar__right">
        <UserMenu />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/base/BaseIcon.vue'
import UserMenu from './UserMenu.vue'
</script>

<style scoped lang="scss">
.f-top-nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__left {
    flex-shrink: 0;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }

  &__center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  &__nav {
    display: flex;
    gap: 8px;
  }

  &__nav-item {
    padding: 8px 16px;
    font-size: 14px;
    color: #cccccc;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #3a3a3a;
      color: #ffffff;
    }

    &--active {
      background: #4a9eff;
      color: #ffffff;

      &:hover {
        background: #6bb0ff;
      }
    }
  }

  &__right {
    flex-shrink: 0;
  }
}
</style>
