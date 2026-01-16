<template>
  <div class="g-admin-layout">
    <div class="g-admin-layout__placeholder">
      <h1>管理后台</h1>
      <p>此页面将在 Phase 6 实现</p>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
// 占位组件，将在 Phase 6 实现
</script>

<style scoped lang="scss">
.g-admin-layout {
  min-height: 100vh;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;

  &__placeholder {
    text-align: center;
    color: #ffffff;

    h1 {
      font-size: 32px;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #999999;
    }
  }
}
</style>
