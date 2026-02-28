import { defineStore } from 'pinia'

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
        // 简化版登录逻辑
        this.token = 'test-token'
        this.isLoggedIn = true
        this.userInfo = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          verified: true,
          createdAt: new Date().toISOString()
        }
        
        // 保存到sessionStorage
        sessionStorage.setItem('token', this.token)
        sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        
        // 触发localStorage事件，用于多标签页同步
        localStorage.setItem('login-event', Date.now().toString())
        
        return true
      } catch (error) {
        return false
      } finally {
        this.loading = false
      }
    },

    logout(system?: 'user' | 'admin') {
      this.token = ''
      this.adminToken = ''
      this.isLoggedIn = false
      this.isAdminLoggedIn = false
      
      // 清除sessionStorage
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('adminToken')
      sessionStorage.removeItem('userInfo')
      
      // 触发localStorage事件，用于多标签页同步
      localStorage.setItem('logout-event', Date.now().toString())
    },

    initialize() {
      const savedToken = sessionStorage.getItem('token')
      const savedAdminToken = sessionStorage.getItem('adminToken')
      if (savedToken) {
        this.token = savedToken
        this.isLoggedIn = true
      }
      if (savedAdminToken) {
        this.adminToken = savedAdminToken
        this.isAdminLoggedIn = true
      }
    }
  }
})
