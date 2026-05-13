<template>
  <el-header class="header">
    <div class="header-left">
      <!-- 折叠按钮 -->
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>

      <!-- 面包屑 -->
      <Breadcrumb />
    </div>

    <div class="header-right">
      <!-- 搜索 -->
      <el-icon class="action-icon"><Search /></el-icon>

      <!-- 全屏 -->
      <el-icon class="action-icon" @click="toggleFullScreen">
        <FullScreen v-if="!isFullscreen" />
        <Aim v-else />
      </el-icon>

      <!-- 主题切换 -->
      <el-icon class="action-icon" @click="appStore.toggleTheme()">
        <Moon v-if="appStore.theme === 'light'" />
        <Sunny v-else />
      </el-icon>

      <!-- 消息通知 -->
      <el-badge :value="3" class="action-icon">
        <el-icon><Bell /></el-icon>
      </el-badge>

      <!-- 用户信息 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="30" :src="authStore.avatar" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">{{ authStore.nickname || authStore.username }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import Breadcrumb from './Breadcrumb.vue'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const isFullscreen = ref(false)

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        authStore.logoutAction()
      })
      break
  }
}
</script>

<style scoped>
.header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--apple-hairline, #e0e0e0);
  box-shadow: none;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 18px;
  cursor: pointer;
  color: var(--apple-ink-muted-48, #7a7a7a);
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: var(--apple-primary, #0066cc);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.action-icon {
  font-size: 17px;
  color: var(--apple-ink-muted-48, #7a7a7a);
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.action-icon:hover {
  color: var(--apple-primary, #0066cc);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: var(--apple-radius-pill, 9999px);
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--apple-parchment, #f5f5f7);
}

.user-avatar {
  background: var(--apple-parchment, #f5f5f7);
  color: var(--apple-ink-muted-48, #7a7a7a);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--apple-ink, #1d1d1f);
  letter-spacing: -0.224px;
}

.arrow-icon {
  font-size: 12px;
  color: var(--apple-ink-muted-48, #7a7a7a);
}
</style>
