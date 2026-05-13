<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <Sidebar />

    <el-container class="main-container">
      <!-- 顶部导航 -->
      <Header />

      <!-- 标签页 -->
      <TagsView v-if="showTagsView" />

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="$route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import TagsView from './components/TagsView.vue'

const appStore = useAppStore()
const cachedViews = computed(() => appStore.cachedViews)
const showTagsView = true
</script>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 24px;
  background: var(--apple-parchment, #f5f7fa);
  overflow-y: auto;
}
</style>
