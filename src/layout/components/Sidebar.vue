<template>
  <el-aside
    :width="sidebarWidth"
    class="sidebar"
    :class="{ collapsed: appStore.sidebarCollapsed }"
  >
    <!-- Logo -->
    <div class="logo-container">
      <img src="@/assets/logo.svg" class="logo-img" alt="logo">
      <span v-show="!appStore.sidebarCollapsed" class="logo-text">智慧校园</span>
    </div>

    <!-- 菜单 -->
    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        router
        background-color="transparent"
        text-color="rgba(255,255,255,0.8)"
        active-text-color="#2997ff"
      >
        <SidebarItem
          v-for="route in menuRoutes"
          :key="route.path"
          :item="route"
          :base-path="'/'"
        />
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const menuRoutes = computed(() => {
  const layoutRoute = router.getRoutes().find(r => r.name === 'Layout')
  return layoutRoute?.children?.filter(r => !r.meta?.hidden) || []
})

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '210px'
})

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style scoped>
.sidebar {
  background: var(--apple-ink, #1d1d1f);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--apple-black, #000000);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo-img {
  width: 28px;
  height: 28px;
}

.logo-text {
  margin-left: 10px;
  color: var(--apple-on-dark, #ffffff);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.3px;
  white-space: nowrap;
  font-family: var(--apple-font-display, system-ui, -apple-system, sans-serif);
}

.menu-scrollbar {
  flex: 1;
}

:deep(.el-menu) {
  border-right: none;
  padding: 8px;
  background: transparent !important;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  border-radius: 8px;
  margin: 2px 0;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  letter-spacing: -0.224px;
  transition: background 0.2s ease;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-menu-item.is-active) {
  background: rgba(41, 151, 255, 0.12) !important;
  color: var(--apple-primary-on-dark, #2997ff) !important;
}

:deep(.el-sub-menu .el-menu) {
  padding: 0 0 0 8px;
}

:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  padding: 0 !important;
  text-align: center;
}
</style>
