<template>
  <van-action-sheet
    v-model:show="isMenuOpen"
    :actions="menuActions"
    cancel-text="取消"
    close-on-click-action
    @select="onSelect"
  >
    <template #description>
      <div class="m-user-menu-header">
        <van-image
          v-if="userInfo?.avatarUrl"
          :src="userInfo.avatarUrl"
          round
          width="60"
          height="60"
          fit="cover"
        />
        <van-icon
          v-else
          name="user-circle-o"
          size="60"
          color="#999"
        />
        <div class="f-user-info">
          <div class="f-username">{{ userInfo?.username || '用户' }}</div>
          <div class="f-email">{{ userInfo?.email }}</div>
        </div>
      </div>
    </template>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import type { ActionSheetAction } from 'vant'

interface Props {
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const isMenuOpen = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const userInfo = computed(() => userStore.userInfo)

const menuActions = computed<ActionSheetAction[]>(() => [
  {
    name: '个人信息',
    icon: 'user-o',
    callback: () => router.push('/user/profile')
  },
  {
    name: '退出登录',
    icon: 'sign',
    color: '#ee0a24',
    callback: handleLogout
  }
])

function onSelect(action: ActionSheetAction): void {
  action.callback?.()
}

async function handleLogout(): Promise<void> {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？'
    })
    await authStore.logout()
    router.push('/auth/login')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.m-user-menu-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  gap: 12px;

  .f-user-info {
    text-align: center;
  }

  .f-username {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .f-email {
    font-size: 14px;
    color: #999;
  }
}
</style>
