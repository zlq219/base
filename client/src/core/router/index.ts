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
  const requiresAuth = to.meta.requiresAuth !== false
  const requiredRoles = to.meta.roles as string[] || []

  // 设置页面标题
  document.title = `${to.meta.title || '基础应用'} - 脚手架`

  // 检查是否需要认证
  if (requiresAuth) {
    // 强制从localStorage和sessionStorage读取最新的token
    const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
    const userToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
    
    console.log('路由守卫：检查认证状态')
    console.log('路由守卫：adminToken存在', !!adminToken)
    console.log('路由守卫：userToken存在', !!userToken)
    console.log('路由守卫：userInfo存在', !!userInfoStr)
    console.log('路由守卫：当前路径', to.path)
    
    // 检查是否有任何有效token
    if (!adminToken && !userToken) {
      console.log('路由守卫：未找到任何token，重定向到登录页')
      // 根据路径决定重定向到哪个登录页
      if (to.path.startsWith('/admin/')) {
        next('/admin/login')
      } else {
        next('/login')
      }
      return
    }
    
    // 检查用户信息
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        console.log('路由守卫：用户角色', userInfo.role)
        
        // 对于管理员路由，检查用户角色是否为admin
        if (to.path.startsWith('/admin/') && !to.path.endsWith('/login')) {
          if (userInfo.role !== 'admin') {
            console.log('路由守卫：角色权限不足，重定向到dashboard')
            next('/dashboard')
            return
          }
          // 对于管理员路由，需要adminToken
          if (!adminToken) {
            console.log('路由守卫：管理员路由需要adminToken，重定向到登录页')
            next('/admin/login')
            return
          }
        } else {
          // 对于普通路由，需要userToken
          if (!userToken) {
            console.log('路由守卫：普通路由需要userToken，重定向到登录页')
            next('/login')
            return
          }
        }
        
        console.log('路由守卫：认证通过')
      } catch (e) {
        console.log('路由守卫：解析userInfo失败', e)
        // 解析失败，重定向到登录页
        if (to.path.startsWith('/admin/')) {
          next('/admin/login')
        } else {
          next('/login')
        }
        return
      }
    } else {
      console.log('路由守卫：未找到userInfo，重定向到登录页')
      // 没有用户信息，重定向到登录页
      if (to.path.startsWith('/admin/')) {
        next('/admin/login')
      } else {
        next('/login')
      }
      return
    }
  }

  next()
})

export default router