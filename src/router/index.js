import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import { filterRoutes, ROLE_DEFAULT_PATH } from '@/utils/permission'

// 路由配置（meta.roles 标记允许访问的角色）
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册', hidden: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'HomeFilled', roles: ['admin', 'teacher', 'student'] }
      },
      // 系统管理 — 仅管理员
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting', roles: ['admin'] },
        children: [
          {
            path: 'user',
            name: 'User',
            component: () => import('@/views/system/user/index.vue'),
            meta: { title: '用户管理', icon: 'User', roles: ['admin'] }
          },
          {
            path: 'role',
            name: 'Role',
            component: () => import('@/views/system/role/index.vue'),
            meta: { title: '角色管理', icon: 'UserFilled', roles: ['admin'] }
          },
          {
            path: 'menu',
            name: 'Menu',
            component: () => import('@/views/system/menu/index.vue'),
            meta: { title: '菜单管理', icon: 'Menu', roles: ['admin'] }
          },
          {
            path: 'dict',
            name: 'Dict',
            component: () => import('@/views/system/dict/index.vue'),
            meta: { title: '字典管理', icon: 'Collection', roles: ['admin'] }
          },
          {
            path: 'log',
            name: 'Log',
            component: () => import('@/views/system/log/index.vue'),
            meta: { title: '日志管理', icon: 'Document', roles: ['admin'] }
          }
        ]
      },
      // 教学管理
      {
        path: 'education',
        name: 'Education',
        redirect: '/education/course',
        meta: { title: '教学管理', icon: 'Reading' },
        children: [
          {
            path: 'course',
            name: 'Course',
            component: () => import('@/views/education/course/index.vue'),
            meta: { title: '课程管理', icon: 'Notebook', roles: ['admin', 'teacher'] }
          },
          {
            path: 'timetable',
            name: 'Timetable',
            component: () => import('@/views/education/timetable/index.vue'),
            meta: { title: '课表管理', icon: 'Calendar', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'attendance',
            name: 'Attendance',
            component: () => import('@/views/education/attendance/index.vue'),
            meta: { title: '考勤管理', icon: 'Checked', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'score',
            name: 'Score',
            component: () => import('@/views/education/score/index.vue'),
            meta: { title: '成绩管理', icon: 'Trophy', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'leave',
            name: 'Leave',
            component: () => import('@/views/education/leave/index.vue'),
            meta: { title: '请假管理', icon: 'Timer', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'evaluation',
            name: 'Evaluation',
            component: () => import('@/views/education/evaluation/index.vue'),
            meta: { title: '课程评价', icon: 'Star', roles: ['admin', 'teacher', 'student'] }
          }
        ]
      },
      // 校园服务 — 全员
      {
        path: 'campus',
        name: 'Campus',
        redirect: '/campus/notice',
        meta: { title: '校园服务', icon: 'School', roles: ['admin', 'teacher', 'student'] },
        children: [
          {
            path: 'notice',
            name: 'Notice',
            component: () => import('@/views/campus/notice/index.vue'),
            meta: { title: '公告通知', icon: 'Bell', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'dorm',
            name: 'Dorm',
            component: () => import('@/views/campus/dorm/index.vue'),
            meta: { title: '宿舍管理', icon: 'House', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'repair',
            name: 'Repair',
            component: () => import('@/views/campus/repair/index.vue'),
            meta: { title: '报修管理', icon: 'Tools', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'card',
            name: 'Card',
            component: () => import('@/views/campus/card/index.vue'),
            meta: { title: '校园卡', icon: 'CreditCard', roles: ['admin', 'teacher', 'student'] }
          },
          {
            path: 'book',
            name: 'Book',
            component: () => import('@/views/campus/book/index.vue'),
            meta: { title: '图书借阅', icon: 'Collection', roles: ['admin', 'teacher', 'student'] }
          }
        ]
      },
      // 数据统计 — 仅管理员
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '数据统计', icon: 'DataLine', roles: ['admin'] }
      }
    ]
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 白名单
const whiteList = ['/login', '/register', '/404']

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title + ' - 智慧校园系统'
  }

  if (authStore.token) {
    if (to.path === '/login') {
      next('/')
    } else {
      const appStore = useAppStore()

      // 过滤路由：只要 permissionRoutes 为空就执行（覆盖登录后首次跳转 和 页面刷新两种场景）
      if (appStore.permissionRoutes.length === 0) {
        try {
          // userInfo 可能在 loginAction 中已提前加载，未加载则在此补充
          if (!authStore.userInfo) {
            await authStore.fetchUserInfo()
          }

          const userRoles = authStore.roles
          const layoutRoute = routes.find(r => r.name === 'Layout')
          const filtered = filterRoutes(layoutRoute.children, userRoles)
          appStore.setPermissionRoutes(filtered)

          // 权限校验：目标路由不在可访问列表中则重定向
          if (to.name && !isRouteAccessible(to, filtered)) {
            const defaultPath = ROLE_DEFAULT_PATH[userRoles[0]] || '/dashboard'
            next(defaultPath)
            return
          }
        } catch (error) {
          await authStore.logoutAction()
          next('/login')
          return
        }
      } else {
        // 路由已过滤，仅做权限校验
        if (to.name && !isRouteAccessible(to, appStore.permissionRoutes)) {
          const defaultPath = ROLE_DEFAULT_PATH[authStore.roles[0]] || '/dashboard'
          next(defaultPath)
          return
        }
      }

      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      ElMessage.warning('请先登录')
      next('/login')
    }
  }
})

/**
 * 检查目标路由是否在可访问路由列表中
 */
function isRouteAccessible(to, accessibleRoutes) {
  const matched = to.matched
  // 遍历路由层级，每层都在可访问列表中
  for (const record of matched) {
    if (record.name === 'Layout') continue
    const found = findRouteByName(accessibleRoutes, record.name)
    if (!found) return false
  }
  return true
}

function findRouteByName(routes, name) {
  for (const route of routes) {
    if (route.name === name) return route
    if (route.children) {
      const found = findRouteByName(route.children, name)
      if (found) return found
    }
  }
  return null
}

export default router
