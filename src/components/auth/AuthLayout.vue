<template>
  <div class="f-auth-layout">
    <div class="f-auth-layout__container">
      <div class="f-auth-layout__header">
        <h1 class="f-auth-layout__title">Comfy Pilot</h1>
        <p class="f-auth-layout__subtitle">AI 驱动的 ComfyUI 工作流助手</p>
      </div>

      <div class="f-auth-layout__content">
        <slot />
      </div>

      <div class="f-auth-layout__footer">
        <p class="f-auth-layout__copyright">
          © 2024 Comfy Pilot. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// AuthLayout 组件 - 认证页面布局
</script>

<style scoped lang="scss">
.f-auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 20px;

  &__container {
    width: 100%;
    max-width: 420px;
  }

  &__header {
    text-align: center;
    margin-bottom: 32px;
  }

  &__title {
    font-size: 28px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 12px 0;
  }

  &__subtitle {
    font-size: 14px;
    color: #999999;
    margin: 0;
  }

  &__content {
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  &__footer {
    text-align: center;
    margin-top: 24px;
  }

  &__copyright {
    font-size: 12px;
    color: #666666;
    margin: 0;
  }
}
</style>
