<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Logo -->
      <div class="logo-area">
        <div class="logo-icon">&#127891;</div>
        <h1 class="title">创建账号</h1>
        <p class="subtitle">填写信息完成注册</p>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="学号 / 工号 / 账号" size="large" clearable />
        </el-form-item>

        <el-form-item prop="realName">
          <el-input v-model="registerForm.realName" placeholder="真实姓名" size="large" clearable />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input v-model="registerForm.phone" placeholder="手机号" size="large" clearable />
        </el-form-item>

        <el-form-item prop="email">
          <el-input v-model="registerForm.email" placeholder="邮箱" size="large" clearable />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
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

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="确认密码"
            size="large"
          >
            <template #suffix>
              <el-icon class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
                <View v-if="showConfirmPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="userType">
          <el-select v-model="registerForm.userType" placeholder="选择角色" size="large" style="width: 100%;">
            <el-option label="学生" :value="0" />
            <el-option label="教师" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item prop="deptName">
          <el-input v-model="registerForm.deptName" placeholder="院系 / 部门" size="large" clearable />
        </el-form-item>

        <el-form-item v-if="registerForm.userType === 0" prop="className">
          <el-input v-model="registerForm.className" placeholder="班级名称" size="large" clearable />
        </el-form-item>

        <el-form-item prop="captchaCode">
          <div class="captcha-wrapper">
            <el-input v-model="registerForm.captchaCode" placeholder="验证码" size="large" clearable class="captcha-input" />
            <div class="captcha-img" @click="refreshCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码">
              <span v-else class="refresh-text">刷新</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            <span class="agreement-text">
              我已阅读并同意
              <a href="#" class="text-link">用户协议</a>
              和
              <a href="#" class="text-link">隐私政策</a>
            </span>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button :loading="loading" type="primary" size="large" class="register-btn" @click="handleRegister">
            注 册
          </el-button>
        </el-form-item>

        <div class="login-link">
          已有账号？
          <router-link to="/login" class="text-link">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const registerFormRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const captchaImage = ref('')

const registerForm = reactive({
  username: '',
  realName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: undefined,
  deptName: '',
  className: '',
  captchaCode: '',
  agreement: false
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
    return
  }
  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入学号/工号/账号', trigger: 'blur' },
    { min: 4, max: 50, message: '账号长度4-50位', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
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

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const payload = {
        username: registerForm.username,
        realName: registerForm.realName,
        password: registerForm.password,
        phone: registerForm.phone,
        email: registerForm.email,
        userType: registerForm.userType,
        deptName: registerForm.deptName,
        className: registerForm.userType === 0 ? registerForm.className : undefined,
        captchaKey: authStore.captchaKey,
        captchaCode: registerForm.captchaCode
      }
      await authStore.registerAction(payload)
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch (error) {
      console.error('注册失败', error)
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
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--apple-canvas, #ffffff);
  padding: 24px;
}

.register-card {
  width: 100%;
  max-width: 420px;
}

.logo-area {
  text-align: center;
  margin-bottom: 32px;
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

.register-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 9999px !important;
  padding: 4px 20px;
  height: 46px;
  background: var(--apple-parchment, #f5f5f7);
  box-shadow: none !important;
}

.register-form :deep(.el-input__wrapper:hover) {
  background: #ececee;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  background: var(--apple-canvas, #ffffff);
  box-shadow: 0 0 0 2px var(--apple-primary, #0066cc) inset !important;
}

.register-form :deep(.el-input__inner) {
  font-size: 17px;
  letter-spacing: -0.374px;
}

.register-form :deep(.el-select .el-input__wrapper) {
  border-radius: 9999px !important;
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
  height: 46px;
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

.agreement-text {
  font-size: 13px;
  color: var(--apple-ink-muted-48, #7a7a7a);
}

.register-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
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

.register-btn {
  width: 100%;
  height: 46px;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: -0.374px;
  border-radius: 9999px !important;
  background: var(--apple-primary, #0066cc) !important;
  border: none !important;
}

.register-btn:hover {
  background: var(--apple-primary-focus, #0071e3) !important;
}

.register-btn:active {
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

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--apple-ink-muted-48, #7a7a7a);
  letter-spacing: -0.224px;
}

/* 响应式 */
@media (max-width: 480px) {
  .register-card {
    max-width: 100%;
  }

  .title {
    font-size: 28px;
  }
}
</style>
