<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 左侧背景 -->
      <div class="login-left">
        <div class="brand">
          <img src="@/assets/logo.svg" class="logo" alt="logo">
          <h1 class="title">智慧校园系统</h1>
          <p class="subtitle">一体化校园管理平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>智能教学管理</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>高效后勤服务</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>数据可视分析</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧表单 -->
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-subtitle">请使用您的账号密码登录系统</p>
          
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
                placeholder="请输入学号/工号/账号"
                size="large"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                clearable
              />
            </el-form-item>
            
            <el-form-item prop="captchaCode">
              <div class="captcha-row">
                <el-input
                  v-model="loginForm.captchaCode"
                  placeholder="请输入验证码"
                  size="large"
                  :prefix-icon="Key"
                  clearable
                  class="captcha-input"
                />
                <div class="captcha-img" @click="refreshCaptcha">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码">
                  <el-icon v-else class="refresh-icon"><Refresh /></el-icon>
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <div class="login-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>
            </el-form-item>
            
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
          </el-form>
          
          <div class="login-footer">
            <p>© 2024 智慧校园系统 版权所有</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Check, Refresh } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)
const captchaImage = ref('')

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

// 刷新验证码
const refreshCaptcha = async () => {
  try {
    await authStore.fetchCaptcha()
    captchaImage.value = authStore.captchaImage
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

// 登录
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  display: flex;
  width: 900px;
  min-height: 500px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 左侧 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #409EFF 0%, #2c5cc9 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}

.brand {
  text-align: center;
  margin-bottom: 60px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.feature-item .el-icon {
  font-size: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
}

/* 右侧 */
.login-right {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin-bottom: 30px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 4px 15px;
}

.captcha-row {
  display: flex;
  gap: 12px;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 44px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.refresh-icon {
  font-size: 20px;
  color: #909399;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-box {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }
  
  .login-left {
    padding: 30px;
    min-height: 200px;
  }
  
  .login-right {
    padding: 30px;
  }
}
</style>
