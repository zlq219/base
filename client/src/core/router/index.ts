import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../store/user'

// 路由配置
const routes: RouteRecordRaw[] = [
  // 根路径重定向到登录页
  {
    path: '/',
    redirect: '/login'
  },
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('../../modules/auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  // 管理员登录页
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../../modules/auth/AdminLogin.vue'),
    meta: { requiresAuth: false, title: '管理员登录' }
  },
  // 注册页
  {
    path: '/register',
    name: 'Register',
    component: () => import('../../modules/auth/Register.vue'),
    meta: { requiresAuth: false, title: '注册' }
  },
  // 验证邮箱页面
  {
    path: '/verify/:token',
    name: 'VerifyEmail',
    component: () => import('../../modules/auth/VerifyEmail.vue'),
    meta: { requiresAuth: false, title: '邮箱验证' }
  },
  // 首页
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../../modules/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true, title: '首页' }
  },
  // 公告管理
  {
    path: '/announcement/list',
    name: 'AnnouncementList',
    component: () => import('../../modules/announcement/List.vue'),
    meta: { requiresAuth: true, title: '公告列表' }
  },
  {
    path: '/announcement/create',
    name: 'AnnouncementCreate',
    component: () => import('../../modules/announcement/Create.vue'),
    meta: { requiresAuth: true, title: '发布公告' }
  },
  // 消息中心
  {
    path: '/message/list',
    name: 'MessageList',
    component: () => import('../../modules/message/List.vue'),
    meta: { requiresAuth: true, title: '消息列表' }
  },
  {
    path: '/message/settings',
    name: 'MessageSettings',
    component: () => import('../../modules/message/Settings.vue'),
    meta: { requiresAuth: true, title: '消息设置' }
  },
  // 个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../../modules/profile/Index.vue'),
    meta: { requiresAuth: true, title: '个人信息' }
  },
  {
    path: '/profile/password',
    name: 'PasswordChange',
    component: () => import('../../modules/profile/Password.vue'),
    meta: { requiresAuth: true, title: '修改密码' }
  },
  // 管理员首页
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../../modules/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '管理员首页' }
  },
  // 管理员公告管理
  {
    path: '/admin/announcement/list',
    name: 'AdminAnnouncementList',
    component: () => import('../../modules/announcement/List.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '公告列表' }
  },
  {
    path: '/admin/announcement/create',
    name: 'AdminAnnouncementCreate',
    component: () => import('../../modules/announcement/Create.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '发布公告' }
  },
  // 管理员消息中心
  {
    path: '/admin/message/list',
    name: 'AdminMessageList',
    component: () => import('../../modules/message/List.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '消息列表' }
  },
  {
    path: '/admin/message/settings',
    name: 'AdminMessageSettings',
    component: () => import('../../modules/message/Settings.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '消息设置' }
  },
  // 管理员个人中心
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('../../modules/profile/Index.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '个人信息' }
  },
  {
    path: '/admin/profile/password',
    name: 'AdminPasswordChange',
    component: () => import('../../modules/profile/Password.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '修改密码' }
  },
  // 系统管理
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('../../modules/admin/UserManagement.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '用户管理' }
  },
  {
    path: '/admin/unverified',
    name: 'UnverifiedUsers',
    component: () => import('../../modules/admin/UnverifiedUsers.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '未验证用户' }
  },
  {
    path: '/admin/menu',
    name: 'MenuConfig',
    component: () => import('../../modules/admin/MenuConfig.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: '菜单配置' }
  },
  // 窗口同步测试页面
  {
    path: '/test/window-sync',
    name: 'WindowSyncTest',
    component: () => import('../../modules/test/WindowSyncTest.vue'),
    meta: { requiresAuth: false, title: '窗口同步测试' }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../../components/NotFound.vue'),
    meta: { requiresAuth: false, title: '页面不存在' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 直接从sessionStorage读取状态，不依赖userStore
  const adminToken = sessionStorage.getItem('adminToken')
  const userToken = sessionStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth !== false

  // 设置页面标题
  document.title = `${to.meta.title || '基础应用'} - 脚手架`

  console.log('路由守卫：当前路径', to.path)
  console.log('路由守卫：adminToken存在', !!adminToken)
  console.log('路由守卫：userToken存在', !!userToken)

  // 检查是否已登录，如果已登录则重定向到相应的首页
  if (to.path === '/' || to.path === '/login' || to.path === '/admin/login') {
    // 检查是否已登录管理员（优先级高于普通用户）
    if (adminToken && to.path === '/admin/login') {
      next('/admin/users')
      return
    }
    // 检查是否已登录普通用户
    if (userToken && to.path === '/login') {
      next('/dashboard')
      return
    }
  }

  // 检查是否需要认证
  if (requiresAuth) {
    // 对于管理员路由，只检查管理员登录状态
    if (to.path.startsWith('/admin/')) {
      if (!adminToken) {
        next('/admin/login')
        return
      }
    } else {
      // 对于普通路由，只检查普通用户登录状态
      if (!userToken) {
        next('/login')
        return
      }
    }
  }

  next()
})

export default router