<script setup lang="ts">
import { ref } from 'vue'
import { Button, Cell, CellGroup } from 'vant'
import 'vant/lib/index.css'

const count = ref(0)

const handleClick = () => {
  count.value++
}
</script>

<template>
  <div class="g-home-view min-h-screen bg-gray-50">
    <div class="p-4">
      <h1 class="text-2xl font-bold text-center mb-6">
        Comfy Pilot H5
      </h1>

      <CellGroup inset class="mb-4">
        <Cell title="计数器" :value="count.toString()" />
      </CellGroup>

      <div class="flex justify-center">
        <Button type="primary" size="large" @click="handleClick">
          点击 +1
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.g-home-view {
  h1 {
    color: var(--primary-color);
  }
}
</style>
