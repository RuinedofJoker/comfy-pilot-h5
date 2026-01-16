<template>
  <AuthLayout>
    <div class="g-register-view">
      <h2 class="g-register-view__title">注册</h2>
      <p class="g-register-view__description">创建您的 Comfy Pilot 账户</p>

      <form class="g-register-view__form" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="formData.username"
          label="用户名"
          type="text"
          placeholder="请输入用户名"
          required
          :error="errors.username"
          @blur="validateUsername"
        />

        <BaseInput
          v-model="formData.email"
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          required
          :error="errors.email"
          @blur="validateEmail"
        />

        <PasswordInput
          v-model="formData.password"
          label="密码"
          placeholder="至少8位，包含字母和数字"
          required
          :error="errors.password"
          @blur="validatePassword"
        />

        <PasswordInput
          v-model="formData.confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          required
          :error="errors.confirmPassword"
          @blur="validateConfirmPassword"
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="large"
          block
          :loading="loading"
        >
          注册
        </BaseButton>
      </form>

      <div class="g-register-view__footer">
        <span class="g-register-view__footer-text">已有账户？</span>
        <router-link to="/login" class="g-register-view__link">
          立即登录
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
import {
  validateEmail as isValidEmail,
  validatePassword as isValidPassword,
  validateUsername as isValidUsername
} from '@/utils/validator'
import { register } from '@/services/auth'
import { toast } from '@/utils/toast'
import type { RegisterFormData } from '@/types/auth'

const router = useRouter()

const formData = reactive<RegisterFormData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

function validateUsername(): void {
  if (!formData.username) {
    errors.username = '请输入用户名'
  } else if (!isValidUsername(formData.username)) {
    errors.username = '用户名为3-20位字母、数字或下划线'
  } else {
    errors.username = ''
  }
}

function validateEmail(): void {
  if (!formData.email) {
    errors.email = '请输入邮箱'
  } else if (!isValidEmail(formData.email)) {
    errors.email = '邮箱格式不正确'
  } else {
    errors.email = ''
  }
}

function validatePassword(): void {
  if (!formData.password) {
    errors.password = '请输入密码'
  } else if (!isValidPassword(formData.password)) {
    errors.password = '密码至少8位，包含字母和数字'
  } else {
    errors.password = ''
  }
}

function validateConfirmPassword(): void {
  if (!formData.confirmPassword) {
    errors.confirmPassword = '请再次输入密码'
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.confirmPassword = ''
  }
}

async function handleSubmit(): Promise<void> {
  // 验证表单
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()

  if (errors.username || errors.email || errors.password || errors.confirmPassword) {
    return
  }

  loading.value = true

  try {
    await register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    })

    // 显示注册成功提示
    toast.success('注册成功！正在跳转...')

    // 立即跳转到登录页面
    await router.push('/login')
  } catch (error) {
    // 错误已由 HTTP 拦截器处理并显示 Toast
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.g-register-view {
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
