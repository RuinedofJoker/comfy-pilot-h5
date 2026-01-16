<template>
  <div class="g-admin-sidebar">
    <!-- Logo -->
    <div class="m-logo">ComfyUI Pilot</div>

    <!-- 导航菜单 -->
    <nav class="m-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="f-nav-item"
        active-class="active"
      >
        {{ item.label }}
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
interface NavItem {
  path: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/admin/services', label: '服务管理' },
  { path: '/admin/agents', label: 'Agent配置' },
  { path: '/admin/models', label: '模型管理' }
]
</script>

<style scoped lang="scss">
.g-admin-sidebar {
  width: 240px;
  background: #282828;
  border-right: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.m-logo {
  padding: 16px;
  border-bottom: 1px solid #3a3a3a;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.m-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.f-nav-item {
  display: block;
  padding: 8px 16px;
  font-size: 12px;
  color: #999999;
  text-decoration: none;
  transition: all 0.15s;
  cursor: pointer;

  &:hover {
    background: #333333;
    color: #cccccc;
  }

  &.active {
    background: #3a3a3a;
    color: #ffffff;
    border-left: 2px solid #4a9eff;
  }
}
</style>
