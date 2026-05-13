/**
 * 前端权限工具
 * 基于角色的路由过滤，与后端 roles 配合使用
 */

// 角色常量
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
}

// 各角色登录后的默认首页
export const ROLE_DEFAULT_PATH = {
  admin: '/system/user',
  teacher: '/education/course',
  student: '/dashboard'
}

/**
 * 检查用户角色是否匹配路由 meta.roles
 * 路由未设置 roles → 放行
 */
export function hasPermission(userRoles, route) {
  if (!route.meta?.roles) return true
  return route.meta.roles.some(role => userRoles.includes(role))
}

/**
 * 递归过滤路由树，移除无权访问的路由
 * 父路由的 children 全部被过滤后，父路由也移除
 */
export function filterRoutes(routes, userRoles) {
  return routes
    .filter(route => hasPermission(userRoles, route))
    .map(route => ({
      ...route,
      children: route.children ? filterRoutes(route.children, userRoles) : []
    }))
    .filter(route => !route.children?.length || route.children.length > 0)
}
