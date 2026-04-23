<template>
  <div class="login-container">
    <!-- 背景动画 -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧卡通人物区域 -->
      <div class="characters-section">
        <div class="greeting-text">
          <h2>欢迎回来</h2>
          <p>智慧校园，让学习更有趣</p>
        </div>
        <CartoonCharacters :is-password-input="isPasswordInput" />
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-card">
          <div class="logo-area">
            <div class="logo-icon">🏫</div>
            <h1 class="title">智慧校园</h1>
            <p class="subtitle">校园管理系统</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入学号/工号/账号"
                  size="large"
                  clearable
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <el-input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  size="large"
                  class="custom-input"
                  @focus="isPasswordInput = true"
                  @blur="isPasswordInput = false"
                  @input="isPasswordInput = true"
                >
                  <template #suffix>
                    <span 
                      class="eye-icon" 
                      @click="showPassword = !showPassword"
                    >
                      {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                    </span>
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="captchaCode">
              <div class="captcha-wrapper">
                <div class="input-wrapper captcha-input">
                  <span class="input-icon">🔢</span>
                  <el-input
                    v-model="loginForm.captchaCode"
                    placeholder="请输入验证码"
                    size="large"
                    class="custom-input"
                  />
                </div>
                <div class="captcha-img" @click="refreshCaptcha">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码">
                  <span v-else class="refresh-text">点击刷新</span>
                </div>
              </div>
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="rememberMe" class="remember-checkbox">
                记住我
              </el-checkbox>
              <a href="#" class="forgot-link">忘记密码？</a>
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
              <span>还没有账号？</span>
              <router-link to="/register" class="link">立即注册</router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import CartoonCharacters from '@/components/CartoonCharacters.vue'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)
const captchaImage = ref('')
const showPassword = ref(false)
const isPasswordInput = ref(false)

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
    console.log('[登录验证码] captchaKey:', authStore.captchaKey)
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
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景动画 */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, rgba(255, 154, 86, 0.4) 0%, rgba(255, 107, 107, 0.4) 100%);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.4) 0%, rgba(124, 58, 237, 0.4) 100%);
  bottom: -150px;
  right: -150px;
  animation-delay: -7s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(252, 211, 77, 0.3) 0%, rgba(251, 191, 36, 0.3) 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, -50px) scale(1.1);
  }
  50% {
    transform: translate(-30px, 30px) scale(0.9);
  }
  75% {
    transform: translate(30px, 50px) scale(1.05);
  }
}

.login-wrapper {
  display: flex;
  width: 900px;
  min-height: 550px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;
}

/* 左侧卡通区域 */
.characters-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.greeting-text {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.greeting-text h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.greeting-text p {
  font-size: 16px;
  opacity: 0.9;
}

/* 右侧表单区域 */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-card {
  width: 100%;
  max-width: 360px;
}

.logo-area {
  text-align: center;
  margin-bottom: 30px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 表单样式 */
.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.input-wrapper:hover,
.input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.input-icon {
  font-size: 18px;
  margin-left: 15px;
  margin-right: 10px;
}

.custom-input :deep(.el-input__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 15px 0 0;
}

.custom-input :deep(.el-input__inner) {
  color: white;
  font-size: 15px;
  height: 48px;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.custom-input :deep(.el-input__suffix-inner) {
  color: rgba(255, 255, 255, 0.7);
}

.eye-icon {
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
}

.eye-icon:hover {
  transform: scale(1.2);
}

/* 验证码 */
.captcha-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 130px;
  height: 48px;
  min-width: 130px;
  min-height: 48px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
  padding: 2px;
}

.captcha-img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.refresh-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

/* 选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.8);
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #ff9a56;
  border-color: #ff9a56;
}

.forgot-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: white;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

.login-btn:active {
  transform: translateY(0);
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.register-link .link {
  color: #fcd34d;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: color 0.3s;
}

.register-link .link:hover {
  color: #fbbf24;
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    width: 90%;
    max-width: 400px;
  }

  .characters-section {
    display: none;
  }

  .form-section {
    padding: 30px;
  }
}
</style>
