import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

// 路由配置
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
        meta: { title: '工作台', icon: 'HomeFilled' }
      },
      // 系统管理
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'user',
            name: 'User',
            component: () => import('@/views/system/user/index.vue'),
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: 'role',
            name: 'Role',
            component: () => import('@/views/system/role/index.vue'),
            meta: { title: '角色管理', icon: 'UserFilled' }
          },
          {
            path: 'menu',
            name: 'Menu',
            component: () => import('@/views/system/menu/index.vue'),
            meta: { title: '菜单管理', icon: 'Menu' }
          },
          {
            path: 'dict',
            name: 'Dict',
            component: () => import('@/views/system/dict/index.vue'),
            meta: { title: '字典管理', icon: 'Collection' }
          },
          {
            path: 'log',
            name: 'Log',
            component: () => import('@/views/system/log/index.vue'),
            meta: { title: '日志管理', icon: 'Document' }
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
            meta: { title: '课程管理', icon: 'Notebook' }
          },
          {
            path: 'timetable',
            name: 'Timetable',
            component: () => import('@/views/education/timetable/index.vue'),
            meta: { title: '课表管理', icon: 'Calendar' }
          },
          {
            path: 'attendance',
            name: 'Attendance',
            component: () => import('@/views/education/attendance/index.vue'),
            meta: { title: '考勤管理', icon: 'Checked' }
          },
          {
            path: 'score',
            name: 'Score',
            component: () => import('@/views/education/score/index.vue'),
            meta: { title: '成绩管理', icon: 'Trophy' }
          },
          {
            path: 'leave',
            name: 'Leave',
            component: () => import('@/views/education/leave/index.vue'),
            meta: { title: '请假管理', icon: 'Timer' }
          },
          {
            path: 'evaluation',
            name: 'Evaluation',
            component: () => import('@/views/education/evaluation/index.vue'),
            meta: { title: '课程评价', icon: 'Star' }
          }
        ]
      },
      // 校园服务
      {
        path: 'campus',
        name: 'Campus',
        redirect: '/campus/notice',
        meta: { title: '校园服务', icon: 'School' },
        children: [
          {
            path: 'notice',
            name: 'Notice',
            component: () => import('@/views/campus/notice/index.vue'),
            meta: { title: '公告通知', icon: 'Bell' }
          },
          {
            path: 'dorm',
            name: 'Dorm',
            component: () => import('@/views/campus/dorm/index.vue'),
            meta: { title: '宿舍管理', icon: 'House' }
          },
          {
            path: 'repair',
            name: 'Repair',
            component: () => import('@/views/campus/repair/index.vue'),
            meta: { title: '报修管理', icon: 'Tools' }
          },
          {
            path: 'card',
            name: 'Card',
            component: () => import('@/views/campus/card/index.vue'),
            meta: { title: '校园卡', icon: 'CreditCard' }
          },
          {
            path: 'book',
            name: 'Book',
            component: () => import('@/views/campus/book/index.vue'),
            meta: { title: '图书借阅', icon: 'Collection' }
          }
        ]
      },
      // 数据大屏
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '数据统计', icon: 'DataLine' }
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
      // 检查是否有用户信息
      if (!authStore.userInfo) {
        try {
          await authStore.fetchUserInfo()
          next({ ...to, replace: true })
        } catch (error) {
          await authStore.logoutAction()
          next('/login')
        }
      } else {
        next()
      }
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

export default router
