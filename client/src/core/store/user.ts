import { defineStore } from 'pinia'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface UserInfo {
  id: string
  username: string
  email: string
  role: string
  verified: boolean
  createdAt: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {} as UserInfo,
    token: localStorage.getItem('token') || '',
    isLoggedIn: !!localStorage.getItem('token'),
    loading: false
  }),

  getters: {
    // 获取用户信息
    getUserInfo: (state) => state.userInfo,
    // 获取认证令牌
    getToken: (state) => state.token,
    // 检查是否登录
    getIsLoggedIn: (state) => state.isLoggedIn,
    // 检查是否为管理员
    isAdmin: (state) => state.userInfo.role === 'admin',
    // 检查用户是否已验证
    isVerified: (state) => state.userInfo.verified
  },

  actions: {
    // 登录
    async login(email: string, password: string) {
      console.log('前端登录 - 邮箱:', email, '密码:', password, '密码长度:', password.length)
      this.loading = true
      try {
        const response = await axios.post('/api/auth/login', {
          email,
          password
        }, {
          // 添加请求拦截器，查看发送的数据
          transformRequest: [function (data) {
            console.log('前端登录 - 发送数据:', data)
            return JSON.stringify(data)
          }],
          // 显式设置Content-Type
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const { token, user } = response.data
        
        // 保存令牌和用户信息
        this.token = token
        this.userInfo = user
        this.isLoggedIn = true
        
        // 持久化存储
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        ElMessage.success('登录成功')
        return true
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '登录失败')
        return false
      } finally {
        this.loading = false
      }
    },

    // 注册
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

    // 登出
    logout() {
      // 清除状态
      this.token = ''
      this.userInfo = {} as UserInfo
      this.isLoggedIn = false
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      ElMessage.success('退出登录成功')
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) return
      
      this.loading = true
      try {
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        this.userInfo = response.data
        localStorage.setItem('userInfo', JSON.stringify(response.data))
      } catch (error: any) {
        // 令牌失效，清除登录状态
        if (error.response?.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(oldPassword: string, newPassword: string) {
      this.loading = true
      try {
        await axios.post('/api/auth/change-password', {
          oldPassword,
          newPassword
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`
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

    // 初始化用户状态
    initialize() {
      const savedToken = localStorage.getItem('token')
      const savedUserInfo = localStorage.getItem('userInfo')
      
      if (savedToken && savedUserInfo) {
        this.token = savedToken
        this.userInfo = JSON.parse(savedUserInfo)
        this.isLoggedIn = true
        
        // 验证令牌是否有效
        this.fetchUserInfo()
      }
    }
  }
})