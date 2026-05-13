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
  window.location.reload()
}

const openMenu = (tag, e) => {
  const menuMinWidth = 105
  const offsetLeft = e.target.getBoundingClientRect().left
  const offsetWidth = e.target.getBoundingClientRect().width
  const maxLeft = offsetWidth - menuMinWidth
  const newLeft = e.clientX - offsetLeft

  left.value = newLeft > maxLeft ? maxLeft : newLeft
  top.value = e.clientY - 52
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
  height: 36px;
  background: var(--apple-parchment, #f5f5f7);
  border-bottom: 1px solid var(--apple-divider-soft, #f0f0f0);
  box-shadow: none;
  display: flex;
  align-items: center;
}

.tags-view-wrapper {
  height: 100%;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 24px;
  line-height: 24px;
  border: none;
  color: var(--apple-ink-muted-48, #7a7a7a);
  background: transparent;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.12px;
  margin-left: 4px;
  margin-top: 5px;
  border-radius: var(--apple-radius-pill, 9999px);
  transition: all 0.2s ease;
}

.tags-view-item.active {
  background: var(--apple-ink, #1d1d1f);
  color: var(--apple-on-primary, #ffffff);
}

.tags-view-item:hover:not(.active) {
  background: var(--apple-hairline, #e0e0e0);
  color: var(--apple-ink, #1d1d1f);
}

.close-icon {
  margin-left: 4px;
  font-size: 10px;
  border-radius: 50%;
  transition: background 0.15s;
}

.close-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.tags-view-item.active .close-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}

.contextmenu {
  margin: 0;
  background: var(--apple-canvas, #ffffff);
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 4px;
  border-radius: var(--apple-radius-md, 11px);
  font-size: 13px;
  font-weight: 400;
  color: var(--apple-ink, #1d1d1f);
  border: 1px solid var(--apple-hairline, #e0e0e0);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}

.contextmenu li:hover {
  background: var(--apple-parchment, #f5f5f7);
}
</style>
