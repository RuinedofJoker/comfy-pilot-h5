<template>
  <AuthLayout>
    <div class="g-login-view">
      <h2 class="g-login-view__title">登录</h2>
      <p class="g-login-view__description">欢迎回来，请登录您的账户</p>

      <form class="g-login-view__form" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="formData.email"
          label="邮箱"
          type="text"
          placeholder="请输入邮箱"
          required
          :error="errors.email"
          @blur="validateEmail"
        />

        <PasswordInput
          v-model="formData.password"
          label="密码"
          placeholder="请输入密码"
          required
          :error="errors.password"
          @blur="validatePassword"
        />

        <div class="g-login-view__options">
          <label class="g-login-view__checkbox">
            <input v-model="formData.rememberMe" type="checkbox" />
            <span>记住我</span>
          </label>
          <router-link to="/forgot-password" class="g-login-view__link">
            忘记密码？
          </router-link>
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="large"
          block
          :loading="loading"
        >
          登录
        </BaseButton>
      </form>

      <div class="g-login-view__footer">
        <span class="g-login-view__footer-text">还没有账户？</span>
        <router-link to="/register" class="g-login-view__link">
          立即注册
        </router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import { login } from '@/services/auth'
import { setToken, setRefreshToken } from '@/utils/storage'
import type { LoginParams } from '@/types/auth'

const router = useRouter()

const formData = reactive<LoginParams>({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

function validateEmail(): void {
  if (!formData.email) {
    errors.email = '请输入邮箱'
  } else {
    errors.email = ''
  }
}

function validatePassword(): void {
  if (!formData.password) {
    errors.password = '请输入密码'
  } else {
    errors.password = ''
  }
}

async function handleSubmit(): Promise<void> {
  // 验证表单
  validateEmail()
  validatePassword()

  if (errors.email || errors.password) {
    return
  }

  loading.value = true

  try {
    const response = await login(formData)

    // 保存 Token
    setToken(response.accessToken)
    setRefreshToken(response.refreshToken)

    // 跳转到服务选择页面
    await router.push('/services')
  } catch (error) {
    // 错误已由 HTTP 拦截器处理并显示 Toast
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.g-login-view {
  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 8px 0;
    text-align: center;
  }

  &__description {
    font-size: 14px;
    color: #999999;
    margin: 0 0 32px 0;
    text-align: center;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -8px;
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #cccccc;
    cursor: pointer;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }

  &__link {
    font-size: 14px;
    color: #4a9eff;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #6bb0ff;
    }
  }

  &__footer {
    margin-top: 24px;
    text-align: center;
  }

  &__footer-text {
    font-size: 14px;
    color: #999999;
    margin-right: 8px;
  }
}
</style>
