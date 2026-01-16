<template>
  <AuthLayout>
    <div class="g-reset-password-view">
      <h2 class="g-reset-password-view__title">重置密码</h2>
      <p class="g-reset-password-view__description">请输入您的新密码</p>

      <form v-if="!resetSuccess" class="g-reset-password-view__form" @submit.prevent="handleSubmit">
        <PasswordInput
          v-model="formData.password"
          label="新密码"
          placeholder="至少8位，包含字母和数字"
          required
          :error="errors.password"
          @blur="validatePassword"
        />

        <PasswordInput
          v-model="formData.confirmPassword"
          label="确认新密码"
          placeholder="请再次输入新密码"
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
          重置密码
        </BaseButton>
      </form>

      <div v-else class="g-reset-password-view__success">
        <BaseIcon name="check-circle" :size="48" color="#52c41a" />
        <p class="g-reset-password-view__success-text">密码重置成功</p>
        <p class="g-reset-password-view__success-hint">请使用新密码登录</p>
        <BaseButton variant="primary" size="large" block @click="goToLogin">
          前往登录
        </BaseButton>
      </div>

      <div v-if="!resetSuccess" class="g-reset-password-view__footer">
        <router-link to="/login" class="g-reset-password-view__link">
          返回登录
        </router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import { validatePassword as isValidPassword } from '@/utils/validator'
import { resetPassword } from '@/services/auth'

const router = useRouter()
const route = useRoute()

const formData = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const resetSuccess = ref(false)
const token = ref('')

onMounted(() => {
  // 从 URL 获取重置 token
  token.value = route.query.token as string
  if (!token.value) {
    router.push('/login')
  }
})

function validatePassword(): void {
  if (!formData.password) {
    errors.password = '请输入新密码'
  } else if (!isValidPassword(formData.password)) {
    errors.password = '密码至少8位，包含字母和数字'
  } else {
    errors.password = ''
  }
}

function validateConfirmPassword(): void {
  if (!formData.confirmPassword) {
    errors.confirmPassword = '请再次输入新密码'
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.confirmPassword = ''
  }
}

async function handleSubmit(): Promise<void> {
  validatePassword()
  validateConfirmPassword()

  if (errors.password || errors.confirmPassword) {
    return
  }

  loading.value = true

  try {
    await resetPassword({
      token: token.value,
      newPassword: formData.password
    })
    resetSuccess.value = true
  } catch (error) {
    console.error('重置密码失败:', error)
    errors.password = '重置链接已失效，请重新申请'
  } finally {
    loading.value = false
  }
}

function goToLogin(): void {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.g-reset-password-view {
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

  &__success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 0;
  }

  &__success-text {
    font-size: 16px;
    color: #ffffff;
    margin: 0;
    text-align: center;
  }

  &__success-hint {
    font-size: 14px;
    color: #999999;
    margin: 0 0 16px 0;
    text-align: center;
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
}
</style>
