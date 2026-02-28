import { defineStore } from 'pinia'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface UserInfo {
  id: string
  username: string
  email: string
  role: string
  verified: boolean
  avatar?: string
  bio?: string
  createdAt: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: '',
      username: '',
      email: '',
      role: '',
      verified: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      bio: '',
      createdAt: new Date().toISOString()
    } as UserInfo,
    token: sessionStorage.getItem('token') || '',
    adminToken: sessionStorage.getItem('adminToken') || '',
    isLoggedIn: !!sessionStorage.getItem('token'),
    isAdminLoggedIn: !!sessionStorage.getItem('adminToken'),
    currentSystem: 'user' as 'user' | 'admin',
    loading: false
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
    getToken: (state) => state.token,
    getIsLoggedIn: (state) => state.isLoggedIn,
    isAdmin: (state) => state.userInfo.role === 'admin',
    isVerified: (state) => state.userInfo.verified
  },

  actions: {
    async login(loginId: string, password: string, remember: boolean = false, system: 'user' | 'admin' = 'user') {
      this.loading = true
      try {
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(loginId)
        const payload = isEmail ? { email: loginId, password } : { username: loginId, password }
        const response = await axios.post('/api/auth/login', payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const { token, user } = response.data
        
        if (system === 'admin') {
          if (user.role !== 'admin') {
            ElMessage.error('您不是管理员，无法登录管理员系统')
            return false
          }
          sessionStorage.setItem('adminToken', token)
          this.adminToken = token
          this.isAdminLoggedIn = true
        } else {
          sessionStorage.setItem('token', token)
          this.token = token
          this.isLoggedIn = true
        }
      
        this.userInfo = user
        sessionStorage.setItem('userInfo', JSON.stringify(user))
      
        localStorage.setItem('adminToken', sessionStorage.getItem('adminToken') || '')
        localStorage.setItem('token', sessionStorage.getItem('token') || '')
        localStorage.setItem('userInfo', sessionStorage.getItem('userInfo') || '')
      
        // 触发localStorage事件，用于多标签页同步
        localStorage.setItem('login-event', Date.now().toString())
      
        ElMessage.success('登录成功')
        return true
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败')
      return false
    } finally {
      this.loading = false
    }
  },

  async register(username: string, email: string, password: string) {
    this.loading = true
    try {
      await axios.post('/api/auth/register', {
        username,
        email,
        password
      })
      ElMessage.success('注册成功，请检查邮箱进行验证')
      return true
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '注册失败')
      return false
    } finally {
      this.loading = false
    }
  },

  logout(system?: 'user' | 'admin') {
    if (system === 'user') {
      this.token = ''
      this.isLoggedIn = false
      sessionStorage.removeItem('token')
      if (!this.isAdminLoggedIn) {
        this.userInfo = {} as UserInfo
        sessionStorage.removeItem('userInfo')
        this.currentSystem = 'user'
        sessionStorage.removeItem('currentSystem')
      }
    } else if (system === 'admin') {
      this.adminToken = ''
      this.isAdminLoggedIn = false
      sessionStorage.removeItem('adminToken')
      if (!this.isLoggedIn) {
        this.userInfo = {} as UserInfo
        sessionStorage.removeItem('userInfo')
        this.currentSystem = 'user'
        sessionStorage.removeItem('currentSystem')
      }
    } else {
      this.token = ''
      this.adminToken = ''
      this.userInfo = {} as UserInfo
      this.isLoggedIn = false
      this.isAdminLoggedIn = false
      this.currentSystem = 'user'
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('adminToken')
      sessionStorage.removeItem('userInfo')
      sessionStorage.removeItem('currentSystem')
    }
    
    localStorage.setItem('adminToken', sessionStorage.getItem('adminToken') || '')
    localStorage.setItem('token', sessionStorage.getItem('token') || '')
    localStorage.setItem('userInfo', sessionStorage.getItem('userInfo') || '')
    
    // 触发localStorage事件，用于多标签页同步
    localStorage.setItem('logout-event', Date.now().toString())
    
    ElMessage.success('退出登录成功')
  },

  async fetchUserInfo() {
    let token = ''
    let system = 'user'
    
    if (this.isAdminLoggedIn) {
      token = this.adminToken
      system = 'admin'
    } else if (this.isLoggedIn) {
      token = this.token
      system = 'user'
    }
    
    if (!token) return
    
    this.loading = true
    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      this.userInfo = response.data
      localStorage.setItem('userInfo', JSON.stringify(response.data))
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout(system as 'user' | 'admin')
      }
    } finally {
      this.loading = false
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    let token = ''
    if (this.isAdminLoggedIn) {
      token = this.adminToken
    } else if (this.isLoggedIn) {
      token = this.token
    }
    
    if (!token) {
      ElMessage.error('请先登录')
      return false
    }
    
    this.loading = true
    try {
      await axios.post('/api/auth/change-password', {
        currentPassword: oldPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      ElMessage.success('密码修改成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '密码修改失败')
      return false
    } finally {
      this.loading = false
    }
  },

  initialize() {
    const savedToken = sessionStorage.getItem('token')
    const savedAdminToken = sessionStorage.getItem('adminToken')
    const savedUserInfo = sessionStorage.getItem('userInfo')
    const savedCurrentSystem = sessionStorage.getItem('currentSystem') as 'user' | 'admin' || 'user'
    
    this.token = ''
    this.adminToken = ''
    this.userInfo = {
      id: '',
      username: '',
      email: '',
      role: '',
      verified: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      bio: '',
      createdAt: new Date().toISOString()
    } as UserInfo
    this.isLoggedIn = false
    this.isAdminLoggedIn = false
    this.currentSystem = 'user'
    
    if (savedToken) {
      this.token = savedToken
      this.isLoggedIn = true
    }
    
    if (savedAdminToken) {
      this.adminToken = savedAdminToken
      this.isAdminLoggedIn = true
    }
    
    if (savedUserInfo && (this.isLoggedIn || this.isAdminLoggedIn)) {
      try {
        this.userInfo = JSON.parse(savedUserInfo)
      } catch (e) {
        console.error('解析userInfo失败:', e)
      }
    }
    
    if (savedCurrentSystem) {
      this.currentSystem = savedCurrentSystem
    }
    
    if (this.token || this.adminToken) {
      this.fetchUserInfo()
    }
  }
})
