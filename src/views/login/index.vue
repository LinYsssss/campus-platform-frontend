<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-area">
        <div class="logo-icon">&#127979;</div>
        <h1 class="title">智慧校园</h1>
        <p class="subtitle">校园管理系统</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="学号 / 工号 / 账号"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            size="large"
          >
            <template #suffix>
              <el-icon class="eye-icon" @click="showPassword = !showPassword">
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="captchaCode">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captchaCode"
              placeholder="验证码"
              size="large"
              clearable
              class="captcha-input"
            />
            <div class="captcha-img" @click="refreshCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码">
              <span v-else class="refresh-text">刷新</span>
            </div>
          </div>
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <a href="#" class="text-link">忘记密码？</a>
        </div>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-btn"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>

        <div class="register-link">
          还没有账号？
          <router-link to="/register" class="text-link">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)
const captchaImage = ref('')
const showPassword = ref(false)

const loginForm = ref({
  username: '',
  password: '',
  captchaCode: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const refreshCaptcha = async () => {
  try {
    await authStore.fetchCaptcha()
    captchaImage.value = authStore.captchaImage
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await authStore.loginAction(loginForm.value)
      ElMessage.success('登录成功')
      router.push('/')
    } catch (error) {
      refreshCaptcha()
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--apple-canvas, #ffffff);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.logo-area {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.title {
  font-family: var(--apple-font-display, "SF Pro Display", system-ui, -apple-system, sans-serif);
  font-size: 34px;
  font-weight: 600;
  letter-spacing: -0.374px;
  line-height: 1.1;
  color: var(--apple-ink, #1d1d1f);
  margin: 0 0 6px;
}

.subtitle {
  font-size: 17px;
  font-weight: 400;
  color: var(--apple-ink-muted-48, #7a7a7a);
  margin: 0;
  letter-spacing: -0.374px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 9999px !important;
  padding: 4px 20px;
  height: 48px;
  background: var(--apple-parchment, #f5f5f7);
  box-shadow: none !important;
}

.login-form :deep(.el-input__wrapper:hover) {
  background: #ececee;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background: var(--apple-canvas, #ffffff);
  box-shadow: 0 0 0 2px var(--apple-primary, #0066cc) inset !important;
}

.login-form :deep(.el-input__inner) {
  font-size: 17px;
  letter-spacing: -0.374px;
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 48px;
  min-width: 120px;
  border-radius: var(--apple-radius-sm, 8px);
  overflow: hidden;
  cursor: pointer;
  background: var(--apple-parchment, #f5f5f7);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--apple-divider-soft, #f0f0f0);
  transition: border-color 0.2s;
}

.captcha-img:hover {
  border-color: var(--apple-chip, #d2d2d7);
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.refresh-text {
  color: var(--apple-ink-muted-48, #7a7a7a);
  font-size: 12px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-options :deep(.el-checkbox__label) {
  font-size: 14px;
  color: var(--apple-ink-muted-48, #7a7a7a);
  letter-spacing: -0.224px;
}

.form-options :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--apple-primary, #0066cc);
  border-color: var(--apple-primary, #0066cc);
}

.text-link {
  color: var(--apple-primary, #0066cc);
  text-decoration: none;
  font-size: 14px;
  letter-spacing: -0.224px;
  transition: color 0.2s;
}

.text-link:hover {
  color: var(--apple-primary-focus, #0071e3);
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: -0.374px;
  border-radius: 9999px !important;
  background: var(--apple-primary, #0066cc) !important;
  border: none !important;
}

.login-btn:hover {
  background: var(--apple-primary-focus, #0071e3) !important;
}

.login-btn:active {
  transform: scale(0.97);
}

.eye-icon {
  cursor: pointer;
  color: var(--apple-ink-muted-48, #7a7a7a);
  transition: color 0.2s;
}

.eye-icon:hover {
  color: var(--apple-ink, #1d1d1f);
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--apple-ink-muted-48, #7a7a7a);
  letter-spacing: -0.224px;
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    max-width: 100%;
  }

  .title {
    font-size: 28px;
  }
}
</style>
