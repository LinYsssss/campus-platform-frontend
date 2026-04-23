<template>
  <div class="register-container">
    <!-- 背景动画 -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="register-wrapper">
      <!-- 左侧卡通人物区域 -->
      <div class="characters-section">
        <div class="greeting-text">
          <h2>加入我们</h2>
          <p>开启智慧校园之旅</p>
        </div>
        <CartoonCharacters :is-password-input="isPasswordInput" />
      </div>

      <!-- 右侧注册表单 -->
      <div class="form-section">
        <div class="form-card">
          <div class="logo-area">
            <div class="logo-icon">🎓</div>
            <h1 class="title">创建账号</h1>
            <p class="subtitle">填写信息完成注册</p>
          </div>

          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            @keyup.enter="handleRegister"
          >
            <!-- 账号 -->
            <el-form-item prop="username">
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入学号/工号/账号"
                  size="large"
                  clearable
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <!-- 真实姓名 -->
            <el-form-item prop="realName">
              <div class="input-wrapper">
                <span class="input-icon">📝</span>
                <el-input
                  v-model="registerForm.realName"
                  placeholder="请输入真实姓名"
                  size="large"
                  clearable
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <!-- 手机号 -->
            <el-form-item prop="phone">
              <div class="input-wrapper">
                <span class="input-icon">📱</span>
                <el-input
                  v-model="registerForm.phone"
                  placeholder="请输入手机号"
                  size="large"
                  clearable
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <!-- 邮箱 -->
            <el-form-item prop="email">
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <el-input
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                  clearable
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password">
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <el-input
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  size="large"
                  class="custom-input"
                  @focus="isPasswordInput = true"
                  @blur="isPasswordInput = false"
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

            <!-- 确认密码 -->
            <el-form-item prop="confirmPassword">
              <div class="input-wrapper">
                <span class="input-icon">🔐</span>
                <el-input
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="请确认密码"
                  size="large"
                  class="custom-input"
                  @focus="isPasswordInput = true"
                  @blur="isPasswordInput = false"
                >
                  <template #suffix>
                    <span 
                      class="eye-icon" 
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
                    </span>
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <!-- 角色 -->
            <el-form-item prop="userType">
              <div class="input-wrapper select-wrapper">
                <span class="input-icon">🎯</span>
                <el-select
                  v-model="registerForm.userType"
                  placeholder="请选择角色"
                  size="large"
                  class="custom-select"
                >
                  <el-option label="👨‍🎓 学生" :value="0" />
                  <el-option label="👨‍🏫 教师" :value="1" />
                </el-select>
              </div>
            </el-form-item>

            <!-- 院系 -->
            <el-form-item prop="deptName">
              <div class="input-wrapper">
                <span class="input-icon">🏛️</span>
                <el-input
                  v-model="registerForm.deptName"
                  placeholder="请输入院系/部门"
                  size="large"
                  clearable
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <!-- 班级（学生时显示） -->
            <el-form-item v-if="registerForm.userType === 0" prop="className">
              <div class="input-wrapper">
                <span class="input-icon">📚</span>
                <el-input
                  v-model="registerForm.className"
                  placeholder="请输入班级名称"
                  size="large"
                  clearable
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <!-- 验证码 -->
            <el-form-item prop="captchaCode">
              <div class="captcha-wrapper">
                <div class="input-wrapper captcha-input">
                  <span class="input-icon">🔢</span>
                  <el-input
                    v-model="registerForm.captchaCode"
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

            <el-form-item prop="agreement">
              <el-checkbox v-model="registerForm.agreement" class="agreement-checkbox">
                <span class="agreement-text">
                  我已阅读并同意
                  <a href="#" class="link">用户协议</a>
                  和
                  <a href="#" class="link">隐私政策</a>
                </span>
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                size="large"
                class="register-btn"
                @click="handleRegister"
              >
                注 册
              </el-button>
            </el-form-item>

            <div class="login-link">
              <span>已有账号？</span>
              <router-link to="/login" class="link">立即登录</router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import CartoonCharacters from '@/components/CartoonCharacters.vue'

const router = useRouter()
const authStore = useAuthStore()

const registerFormRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isPasswordInput = ref(false)
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
  right: -200px;
  animation-delay: -5s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.4) 0%, rgba(124, 58, 237, 0.4) 100%);
  bottom: -150px;
  left: -150px;
  animation-delay: -12s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(252, 211, 77, 0.3) 0%, rgba(251, 191, 36, 0.3) 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -18s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(-50px, 50px) scale(1.1);
  }
  50% {
    transform: translate(30px, -30px) scale(0.9);
  }
  75% {
    transform: translate(-30px, -50px) scale(1.05);
  }
}

.register-wrapper {
  display: flex;
  width: 950px;
  min-height: 600px;
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
  flex: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-card {
  width: 100%;
  max-width: 400px;
}

.logo-area {
  text-align: center;
  margin-bottom: 25px;
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
.register-form :deep(.el-form-item) {
  margin-bottom: 12px;
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

.select-wrapper {
  padding-right: 0;
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
  height: 46px;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.custom-select {
  flex: 1;
}

.custom-select :deep(.el-input__wrapper) {
  background: transparent !important;
  box-shadow: none !important;
}

.custom-select :deep(.el-input__inner) {
  color: white;
  font-size: 15px;
  height: 46px;
}

.custom-select :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.eye-icon {
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
  margin-right: 10px;
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
  height: 46px;
  min-width: 130px;
  min-height: 46px;
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
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}

/* 用户协议 */
.agreement-checkbox :deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.8);
}

.agreement-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #ff9a56;
  border-color: #ff9a56;
}

.agreement-text {
  font-size: 13px;
}

.agreement-text .link {
  color: #fcd34d;
  text-decoration: none;
  font-weight: 500;
}

.agreement-text .link:hover {
  text-decoration: underline;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
}

.register-btn:active {
  transform: translateY(0);
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.login-link .link {
  color: #fcd34d;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: color 0.3s;
}

.login-link .link:hover {
  color: #fbbf24;
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .register-wrapper {
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
