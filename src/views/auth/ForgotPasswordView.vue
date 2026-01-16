<template>
  <AuthLayout>
    <div class="g-forgot-password-view">
      <h2 class="g-forgot-password-view__title">忘记密码</h2>
      <p class="g-forgot-password-view__description">
        请输入您的邮箱地址，我们将发送重置密码链接
      </p>

      <form v-if="!emailSent" class="g-forgot-password-view__form" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="formData.email"
          label="邮箱"
          type="email"
          placeholder="请输入注册时使用的邮箱"
          required
          :error="errors.email"
          @blur="validateEmail"
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="large"
          block
          :loading="loading"
        >
          发送重置链接
        </BaseButton>
      </form>

      <div v-else class="g-forgot-password-view__success">
        <BaseIcon name="check-circle" :size="48" color="#52c41a" />
        <p class="g-forgot-password-view__success-text">
          重置密码链接已发送到您的邮箱
        </p>
        <p class="g-forgot-password-view__success-hint">
          请查收邮件并点击链接重置密码
        </p>
      </div>

      <div class="g-forgot-password-view__footer">
        <router-link to="/login" class="g-forgot-password-view__link">
          返回登录
        </router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { validateEmail as isValidEmail } from '@/utils/validator'
import { forgotPassword } from '@/services/auth'

const formData = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const loading = ref(false)
const emailSent = ref(false)

function validateEmail(): void {
  if (!formData.email) {
    errors.email = '请输入邮箱'
  } else if (!isValidEmail(formData.email)) {
    errors.email = '邮箱格式不正确'
  } else {
    errors.email = ''
  }
}

async function handleSubmit(): Promise<void> {
  validateEmail()

  if (errors.email) {
    return
  }

  loading.value = true

  try {
    await forgotPassword({ email: formData.email })
    emailSent.value = true
  } catch (error) {
    console.error('发送重置链接失败:', error)
    errors.email = '该邮箱未注册'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.g-forgot-password-view {
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
    line-height: 1.6;
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
    margin: 0;
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
