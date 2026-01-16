<template>
  <div class="f-user-menu" v-click-outside="closeMenu">
    <button class="f-user-menu__trigger" @click="toggleMenu">
      <div class="f-user-menu__avatar">
        <img v-if="userInfo?.avatar" :src="userInfo.avatar" alt="用户头像" />
        <BaseIcon v-else name="user" :size="20" />
      </div>
      <span class="f-user-menu__name">{{ userInfo?.username || '用户' }}</span>
      <BaseIcon name="chevron-down" :size="16" />
    </button>

    <Transition name="menu-fade">
      <div v-if="isMenuOpen" class="f-user-menu__dropdown">
        <router-link to="/profile" class="f-user-menu__item" @click="closeMenu">
          <BaseIcon name="user" :size="18" />
          <span>个人信息</span>
        </router-link>
        <div class="f-user-menu__divider"></div>
        <button class="f-user-menu__item" @click="handleLogout">
          <BaseIcon name="logout" :size="18" />
          <span>退出登录</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isMenuOpen = ref(false)

const userInfo = computed(() => authStore.userInfo)

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu(): void {
  isMenuOpen.value = false
}

async function handleLogout(): Promise<void> {
  await authStore.logout()
  router.push('/login')
}

// 点击外部关闭菜单的指令
const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped lang="scss">
.f-user-menu {
  position: relative;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #3a3a3a;
      border-color: #4a9eff;
    }
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #3a3a3a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__name {
    font-size: 14px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    padding: 8px 0;
    z-index: 1000;
  }

  &__item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    color: #cccccc;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #3a3a3a;
      color: #ffffff;
    }
  }

  &__divider {
    height: 1px;
    background: #3a3a3a;
    margin: 8px 0;
  }
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
