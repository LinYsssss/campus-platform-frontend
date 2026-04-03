import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const device = ref('desktop')
  const visitedViews = ref([])
  const cachedViews = ref([])
  const theme = ref(localStorage.getItem('theme') || 'light')

  // Getters
  const isMobile = computed(() => device.value === 'mobile')
  const isDark = computed(() => theme.value === 'dark')

  // Actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed
  }

  function toggleDevice(val) {
    device.value = val
    if (val === 'mobile') {
      sidebarCollapsed.value = true
    }
  }

  function addVisitedView(view) {
    if (visitedViews.value.some(v => v.path === view.path)) return
    visitedViews.value.push({
      name: view.name,
      path: view.path,
      title: view.meta?.title || 'no-name',
      fullPath: view.fullPath
    })
  }

  function removeVisitedView(view) {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index > -1) visitedViews.value.splice(index, 1)
  }

  function addCachedView(view) {
    if (cachedViews.value.includes(view.name)) return
    if (view.meta?.keepAlive) {
      cachedViews.value.push(view.name)
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    updateHtmlClass()
  }

  function setTheme(val) {
    theme.value = val
    localStorage.setItem('theme', val)
    updateHtmlClass()
  }

  function updateHtmlClass() {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  return {
    sidebarCollapsed,
    device,
    visitedViews,
    cachedViews,
    theme,
    isMobile,
    isDark,
    toggleSidebar,
    setSidebarCollapsed,
    toggleDevice,
    addVisitedView,
    removeVisitedView,
    addCachedView,
    toggleTheme,
    setTheme
  }
})
