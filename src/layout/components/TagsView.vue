<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-view-wrapper">
      <div
        v-for="tag in visitedViews"
        :key="tag.path"
        class="tags-view-item"
        :class="{ active: isActive(tag) }"
        @click.middle="closeSelectedTag(tag)"
        @click="handleTagClick(tag)"
      >
        {{ tag.title }}
        <el-icon v-if="!isAffix(tag)" class="close-icon" @click.stop="closeSelectedTag(tag)">
          <Close />
        </el-icon>
      </div>
    </el-scrollbar>
    
    <!-- 右键菜单 -->
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新页面</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭当前</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const visitedViews = computed(() => appStore.visitedViews)
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({})

const isActive = (tag) => tag.path === route.path
const isAffix = (tag) => tag.meta?.affix

const handleTagClick = (tag) => {
  router.push(tag.fullPath)
}

const closeSelectedTag = (view) => {
  appStore.removeVisitedView(view)
  if (isActive(view)) {
    toLastView()
  }
}

const toLastView = () => {
  const latestView = visitedViews.value.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    router.push('/')
  }
}

const addTags = () => {
  const { name } = route
  if (name) {
    appStore.addVisitedView(route)
    appStore.addCachedView(route)
  }
}

const closeOthersTags = () => {
  router.push(selectedTag.value)
  visitedViews.value.forEach(tag => {
    if (tag.name !== selectedTag.value.name && !isAffix(tag)) {
      appStore.removeVisitedView(tag)
    }
  })
}

const closeAllTags = (view) => {
  visitedViews.value.forEach(tag => {
    if (!isAffix(tag)) {
      appStore.removeVisitedView(tag)
    }
  })
  if (isAffix(view)) {
    return
  }
  toLastView()
}

const refreshSelectedTag = () => {
  // 刷新页面逻辑
  window.location.reload()
}

const openMenu = (tag, e) => {
  const menuMinWidth = 105
  const offsetLeft = e.target.getBoundingClientRect().left
  const offsetWidth = e.target.getBoundingClientRect().width
  const maxLeft = offsetWidth - menuMinWidth
  const newLeft = e.clientX - offsetLeft
  
  left.value = newLeft > maxLeft ? maxLeft : newLeft
  top.value = e.clientY - 60
  visible.value = true
  selectedTag.value = tag
}

const closeMenu = () => {
  visible.value = false
}

watch(() => route.path, addTags, { immediate: true })
watch(visible, (val) => {
  if (val) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})
</script>

<style scoped>
.tags-view-container {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.tags-view-wrapper {
  height: 100%;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  border: 1px solid #d8dce5;
  color: #495060;
  background: #fff;
  padding: 0 12px;
  font-size: 13px;
  margin-left: 5px;
  margin-top: 5px;
  border-radius: 3px;
}

.tags-view-item.active {
  background-color: #409EFF;
  color: #fff;
  border-color: #409EFF;
}

.tags-view-item:hover {
  background-color: #f0f9ff;
}

.tags-view-item.active:hover {
  background-color: #409EFF;
}

.close-icon {
  margin-left: 6px;
  font-size: 12px;
}

.close-icon:hover {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background: #eee;
}
</style>
