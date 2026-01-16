<template>
  <div class="g-user-profile-view">
    <TopNavBar />

    <div class="g-user-profile-view__container">
      <div class="g-user-profile-view__header">
        <h1 class="g-user-profile-view__title">个人信息</h1>
      </div>

      <div class="g-user-profile-view__content">
        <BaseCard>
          <div class="g-user-profile-view__section">
            <h3 class="g-user-profile-view__section-title">基本信息</h3>

            <form class="g-user-profile-view__form" @submit.prevent="handleSubmit">
              <div class="g-user-profile-view__avatar-section">
                <div class="g-user-profile-view__avatar">
                  <img v-if="formData.avatar" :src="formData.avatar" alt="用户头像" />
                  <BaseIcon v-else name="user" :size="48" />
                </div>
                <BaseButton variant="secondary" size="small">
                  更换头像
                </BaseButton>
              </div>

              <BaseInput
                v-model="formData.username"
                label="用户名"
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
                disabled
              />

              <BaseButton
                type="submit"
                variant="primary"
                :loading="loading"
              >
                保存修改
              </BaseButton>
            </form>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="g-user-profile-view__section">
            <h3 class="g-user-profile-view__section-title">修改密码</h3>

            <form class="g-user-profile-view__form" @submit.prevent="handleChangePassword">
              <PasswordInput
                v-model="passwordForm.oldPassword"
                label="当前密码"
                placeholder="请输入当前密码"
                required
                :error="passwordErrors.oldPassword"
              />

              <PasswordInput
                v-model="passwordForm.newPassword"
                label="新密码"
                placeholder="至少8位，包含字母和数字"
                required
                :error="passwordErrors.newPassword"
                @blur="validateNewPassword"
              />

              <PasswordInput
                v-model="passwordForm.confirmPassword"
                label="确认新密码"
                placeholder="请再次输入新密码"
                required
                :error="passwordErrors.confirmPassword"
                @blur="validateConfirmPassword"
              />

              <BaseButton
                type="submit"
                variant="primary"
                :loading="changingPassword"
              >
                修改密码
              </BaseButton>
            </form>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import TopNavBar from '@/components/user/TopNavBar.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import { useAuthStore } from '@/stores/auth'
import { getUserInfo, updateUserInfo, changePassword } from '@/services/user'
import { validateUsername as isValidUsername, validatePassword as isValidPassword } from '@/utils/validator'
import type { UserInfo } from '@/types/user'

const authStore = useAuthStore()

const formData = reactive({
  username: '',
  email: '',
  avatar: ''
})

const errors = reactive({
  username: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordErrors = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const changingPassword = ref(false)

onMounted(async () => {
  await loadUserInfo()
})

async function loadUserInfo(): Promise<void> {
  try {
    const userInfo: UserInfo = await getUserInfo()
    formData.username = userInfo.username
    formData.email = userInfo.email
    formData.avatar = userInfo.avatar || ''
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

function validateUsername(): void {
  if (!formData.username) {
    errors.username = '请输入用户名'
  } else if (!isValidUsername(formData.username)) {
    errors.username = '用户名为3-20位字母、数字或下划线'
  } else {
    errors.username = ''
  }
}

async function handleSubmit(): Promise<void> {
  validateUsername()

  if (errors.username) {
    return
  }

  loading.value = true

  try {
    await updateUserInfo({
      username: formData.username,
      avatar: formData.avatar
    })

    // 更新 Store 中的用户信息
    authStore.updateUserInfo({
      username: formData.username,
      avatar: formData.avatar
    })

    alert('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败')
  } finally {
    loading.value = false
  }
}

function validateNewPassword(): void {
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = '请输入新密码'
  } else if (!isValidPassword(passwordForm.newPassword)) {
    passwordErrors.newPassword = '密码至少8位，包含字母和数字'
  } else {
    passwordErrors.newPassword = ''
  }
}

function validateConfirmPassword(): void {
  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = '请再次输入新密码'
  } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    passwordErrors.confirmPassword = '两次输入的密码不一致'
  } else {
    passwordErrors.confirmPassword = ''
  }
}

async function handleChangePassword(): Promise<void> {
  validateNewPassword()
  validateConfirmPassword()

  if (passwordErrors.newPassword || passwordErrors.confirmPassword) {
    return
  }

  changingPassword.value = true

  try {
    await changePassword(passwordForm.oldPassword, passwordForm.newPassword)

    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    alert('密码修改成功')
  } catch (error) {
    console.error('密码修改失败:', error)
    passwordErrors.oldPassword = '当前密码错误'
  } finally {
    changingPassword.value = false
  }
}
</script>

<style scoped lang="scss">
.g-user-profile-view {
  min-height: 100vh;
  background: #1a1a1a;

  &__container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  &__header {
    margin-bottom: 32px;
  }

  &__title {
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__section {
    padding: 24px;
  }

  &__section-title {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 24px 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__avatar-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 8px;
  }

  &__avatar {
    width: 80px;
    height: 80px;
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
}
</style>
