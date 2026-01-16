<template>
  <div class="g-workflow-editor-view">
    <div class="g-workflow-editor-view__placeholder">
      <h1>工作流编辑器</h1>
      <p>此页面将在 Phase 4 实现</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 占位组件，将在 Phase 4 实现
</script>

<style scoped lang="scss">
.g-workflow-editor-view {
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
