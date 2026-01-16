<template>
  <div class="g-admin-layout">
    <!-- 侧边栏 -->
    <AdminSidebar />

    <!-- 主内容区 -->
    <div class="m-main">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
</script>

<style scoped lang="scss">
.g-admin-layout {
  display: flex;
  height: 100vh;
  background: #252525;
  overflow: hidden;
}

.m-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
