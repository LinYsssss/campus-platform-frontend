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
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
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
  // 从路由配置中获取 layout 的子路由
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
  background: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b3649;
  border-bottom: 1px solid #1f2d3d;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  margin-left: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.menu-scrollbar {
  flex: 1;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
