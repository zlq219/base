import { defineStore } from 'pinia'
import axios from 'axios'

interface UserInfo {
  _id: string
  email: string
  username: string
  role: string
  avatar: string
  bio?: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

interface UserState {
  userInfo: UserInfo
  token: string | null
  adminToken: string | null
  isLoggedIn: boolean
  isAdminLoggedIn: boolean
  currentSystem: 'user' | 'admin' | null
  loading: boolean
  error: string | null
}

const defaultUserInfo: UserInfo = {
  _id: '',
  email: '',
  username: '',
  role: '',
  avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=200x200',
  verified: false,
  createdAt: '',
  updatedAt: ''
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: { ...defaultUserInfo },
    token: sessionStorage.getItem('token') || null,
    adminToken: sessionStorage.getItem('adminToken') || null,
    isLoggedIn: !!sessionStorage.getItem('token'),
    isAdminLoggedIn: !!sessionStorage.getItem('adminToken'),
    currentSystem: sessionStorage.getItem('currentSystem') as 'user' | 'admin' | null,
    loading: false,
    error: null
  }),

  getters: {
    isAdmin(): boolean {
      return this.userInfo.role === 'admin'
    }
  },

  actions: {
    // 登录
    async login(loginId: string, password: string, system: 'user' | 'admin' = 'user') {
      this.loading = true
      this.error = null
      
      try {
        // 检查loginId是否包含@符号，判断是邮箱还是用户名
        const isEmail = loginId.includes('@')
        const requestData = isEmail ? { email: loginId, password } : { username: loginId, password }
        
        const response = await axios.post('http://localhost:4000/api/auth/login', requestData)

        const { token, user } = response.data
        
        // 保存用户信息和令牌
        this.userInfo = user
        
        if (system === 'admin') {
          // 管理员登录
          sessionStorage.setItem('adminToken', token)
          localStorage.setItem('adminToken', token)
          sessionStorage.setItem('currentSystem', 'admin')
          localStorage.setItem('currentSystem', 'admin')
          this.adminToken = token
          this.isAdminLoggedIn = true
          this.currentSystem = 'admin'
        } else {
          // 普通用户登录
          sessionStorage.setItem('token', token)
          localStorage.setItem('token', token)
          sessionStorage.setItem('currentSystem', 'user')
          localStorage.setItem('currentSystem', 'user')
          this.token = token
          this.isLoggedIn = true
          this.currentSystem = 'user'
        }

        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || '登录失败，请检查邮箱和密码'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 登出
    logout(system?: 'user' | 'admin') {
      if (system === 'admin') {
        // 管理员登出
        sessionStorage.removeItem('adminToken')
        localStorage.removeItem('adminToken')
        this.adminToken = null
        this.isAdminLoggedIn = false
      } else if (system === 'user' || !system) {
        // 普通用户登出
        sessionStorage.removeItem('token')
        localStorage.removeItem('token')
        this.token = null
        this.isLoggedIn = false
      }
      
      // 如果两个系统都登出，清空用户信息
      if (!this.token && !this.adminToken) {
        this.userInfo = { ...defaultUserInfo }
        sessionStorage.removeItem('currentSystem')
        localStorage.removeItem('currentSystem')
        this.currentSystem = null
      }
    },

    // 注册
    async register(username: string, email: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post('http://localhost:4000/api/auth/register', {
          username,
          email,
          password
        })
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || '注册失败，请稍后重试'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 验证邮箱
    async verifyEmail(token: string) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`http://localhost:4000/api/auth/verify/${token}`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || '验证失败，请稍后重试'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取用户信息
    async getUserInfo() {
      if (!this.token && !this.adminToken) return
      
      this.loading = true
      this.error = null
      
      try {
        // 只获取当前系统的用户信息
        if (this.currentSystem === 'admin' && this.adminToken) {
          const response = await axios.get('http://localhost:4000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${this.adminToken}`
            }
          })
          this.userInfo = response.data
          return response.data
        } else if (this.currentSystem === 'user' && this.token) {
          const response = await axios.get('http://localhost:4000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          })
          this.userInfo = response.data
          return response.data
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || '获取用户信息失败'
        // 如果获取失败，可能是令牌过期，只登出当前系统的token
        if (this.currentSystem === 'admin') {
          this.logout('admin')
        } else if (this.currentSystem === 'user') {
          this.logout('user')
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新用户信息
    async updateUserInfo(data: Partial<UserInfo>) {
      if (!this.token && !this.adminToken) return
      
      this.loading = true
      this.error = null
      
      try {
        const token = this.adminToken || this.token
        const response = await axios.put('http://localhost:4000/api/auth/profile', data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        this.userInfo = response.data
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || '更新用户信息失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(oldPassword: string, newPassword: string) {
      if (!this.token && !this.adminToken) return
      
      this.loading = true
      this.error = null
      
      try {
        const token = this.adminToken || this.token
        const response = await axios.post('http://localhost:4000/api/auth/change-password', {
          oldPassword,
          newPassword
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || '修改密码失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 初始化用户状态
    initialize() {
      this.checkToken()
    },

    // 检查令牌状态
    checkToken() {
      const token = sessionStorage.getItem('token')
      const adminToken = sessionStorage.getItem('adminToken')
      
      this.token = token
      this.adminToken = adminToken
      this.isLoggedIn = !!token
      this.isAdminLoggedIn = !!adminToken
      this.currentSystem = sessionStorage.getItem('currentSystem') as 'user' | 'admin' | null
      
      // 如果没有设置 currentSystem，根据令牌情况设置
      if (!this.currentSystem) {
        if (adminToken) {
          this.currentSystem = 'admin'
          sessionStorage.setItem('currentSystem', 'admin')
        } else if (token) {
          this.currentSystem = 'user'
          sessionStorage.setItem('currentSystem', 'user')
        }
      }
      
      // 如果有令牌，获取用户信息
      if (token || adminToken) {
        this.getUserInfo()
      }
    },

    // 移除triggerStorageEvent方法，确保两个系统完全隔离
    triggerStorageEvent(event: string, data: any) {
      // 不触发任何事件，确保两个系统完全隔离
    },

    // 移除handleStorageEvent方法，确保两个系统完全隔离
  }
})

// 设置axios默认配置
axios.defaults.baseURL = 'http://localhost:4000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 请求拦截器，添加认证令牌
axios.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.adminToken || userStore.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器，处理401错误
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
    }
    return Promise.reject(error)
  }
)

// 添加localStorage事件监听器，用于同一系统的多标签页同步
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    const userStore = useUserStore()
    // 只处理当前系统的事件
    if (event.key === 'token' || event.key === 'adminToken') {
      // 同步到sessionStorage
      if (event.newValue) {
        sessionStorage.setItem(event.key, event.newValue)
      } else {
        sessionStorage.removeItem(event.key)
      }
      // 更新store状态
      userStore.checkToken()
    }
  })
}