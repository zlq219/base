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
    currentSystem: 'user' as 'user' | 'admin', // 'user' 或 'admin'
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
  async login(loginId: string, password: string, remember: boolean = false, system: 'user' | 'admin' = 'user') {
    console.log('前端登录 - 登录凭证:', loginId, '密码:', password, '密码长度:', password.length, '记住我:', remember, '系统:', system)
    this.loading = true
    try {
      // 判断是邮箱还是用户名
      const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(loginId)
      const payload = isEmail ? { email: loginId, password } : { username: loginId, password }
      
      const response = await axios.post('/api/auth/login', payload, {
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
      if (system === 'admin') {
          // 检查是否为管理员角色
          if (user.role !== 'admin') {
            ElMessage.error('您不是管理员，无法登录管理员系统')
            return false
          }
          // 保存到sessionStorage，确保浏览器关闭后需要重新登录
          sessionStorage.setItem('adminToken', token)
          this.adminToken = token
          this.isAdminLoggedIn = true
          // 管理员登录时不修改普通用户状态
          console.log('管理员登录：保存adminToken到sessionStorage')
        } else {
          // 保存到sessionStorage，确保浏览器关闭后需要重新登录
          sessionStorage.setItem('token', token)
          this.token = token
          this.isLoggedIn = true
          // 普通用户登录时不修改管理员状态
          console.log('普通用户登录：保存token到sessionStorage')
        }
      
      this.userInfo = user
      sessionStorage.setItem('userInfo', JSON.stringify(user))
      console.log('登录成功：保存用户信息到sessionStorage', user)
      
      // 保存到localStorage作为跨标签页通信的桥梁
      localStorage.setItem('adminToken', sessionStorage.getItem('adminToken') || '')
      localStorage.setItem('token', sessionStorage.getItem('token') || '')
      localStorage.setItem('userInfo', sessionStorage.getItem('userInfo') || '')
      
      // 强制触发localStorage变化事件，确保其他标签页能够捕获到
      setTimeout(() => {
        // 无论token保存在localStorage还是sessionStorage，都触发localStorage事件
        // 因为sessionStorage是标签页隔离的，无法直接同步
        // 所以我们通过localStorage事件来通知其他标签页重新检查sessionStorage
        localStorage.setItem('token_sync', Date.now().toString())
        setTimeout(() => {
          localStorage.removeItem('token_sync')
        }, 10)
        localStorage.setItem('adminToken_sync', Date.now().toString())
        setTimeout(() => {
          localStorage.removeItem('adminToken_sync')
        }, 10)
        localStorage.setItem('userInfo_sync', Date.now().toString())
        setTimeout(() => {
          localStorage.removeItem('userInfo_sync')
        }, 10)
      }, 100)
      
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
    logout(system?: 'user' | 'admin') {
      console.log('开始登出，系统:', system)
      if (system === 'user') {
        // 清除普通用户状态
        this.token = ''
        this.isLoggedIn = false
        
        // 清除session存储
        sessionStorage.removeItem('token')
        
        // 如果没有管理员登录，也清除用户信息
        if (!this.isAdminLoggedIn) {
          this.userInfo = {} as UserInfo
          sessionStorage.removeItem('userInfo')
          this.currentSystem = 'user'
          sessionStorage.removeItem('currentSystem')
        }
      } else if (system === 'admin') {
        // 清除管理员状态
        this.adminToken = ''
        this.isAdminLoggedIn = false
        
        // 清除session存储
        sessionStorage.removeItem('adminToken')
        
        // 不清除普通token，因为管理员系统和普通用户系统是完全独立的
        
        // 如果没有普通用户登录，也清除用户信息
        if (!this.isLoggedIn) {
          this.userInfo = {} as UserInfo
          sessionStorage.removeItem('userInfo')
          this.currentSystem = 'user'
          sessionStorage.removeItem('currentSystem')
        }
      } else {
        // 清除所有状态
        this.token = ''
        this.adminToken = ''
        this.userInfo = {} as UserInfo
        this.isLoggedIn = false
        this.isAdminLoggedIn = false
        this.currentSystem = 'user'
        
        // 清除session存储
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('adminToken')
        sessionStorage.removeItem('userInfo')
        sessionStorage.removeItem('currentSystem')
      }
      
      // 同步到localStorage作为跨标签页通信的桥梁
      localStorage.setItem('adminToken', sessionStorage.getItem('adminToken') || '')
      localStorage.setItem('token', sessionStorage.getItem('token') || '')
      localStorage.setItem('userInfo', sessionStorage.getItem('userInfo') || '')
    
    // 强制触发localStorage变化事件，确保其他标签页能够捕获到
    setTimeout(() => {
      // 无论token保存在localStorage还是sessionStorage，都触发localStorage事件
      // 因为sessionStorage是标签页隔离的，无法直接同步
      // 所以我们通过localStorage事件来通知其他标签页重新检查sessionStorage
      localStorage.setItem('token_sync', Date.now().toString())
      setTimeout(() => {
        localStorage.removeItem('token_sync')
      }, 10)
      localStorage.setItem('adminToken_sync', Date.now().toString())
      setTimeout(() => {
        localStorage.removeItem('adminToken_sync')
      }, 10)
      localStorage.setItem('userInfo_sync', Date.now().toString())
      setTimeout(() => {
        localStorage.removeItem('userInfo_sync')
      }, 10)
    }, 100)
    
    ElMessage.success('退出登录成功')
    console.log('登出完成')
  },

    // 获取用户信息
    async fetchUserInfo() {
      // 根据当前系统类型使用正确的token
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
        // 令牌失效，清除登录状态
        if (error.response?.status === 401) {
          this.logout(system as 'user' | 'admin')
        }
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(oldPassword: string, newPassword: string) {
      // 根据当前系统类型使用正确的token
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

    // 初始化用户状态
    initialize() {
      // 只从sessionStorage读取，确保浏览器关闭后需要重新登录
      const savedToken = sessionStorage.getItem('token')
      const savedAdminToken = sessionStorage.getItem('adminToken')
      const savedUserInfo = sessionStorage.getItem('userInfo')
      
      console.log('初始化用户状态：')
      console.log('savedToken:', !!savedToken)
      console.log('savedAdminToken:', !!savedAdminToken)
      console.log('savedUserInfo:', !!savedUserInfo)
      
      // 重置状态
      this.token = ''
      this.adminToken = ''
      this.userInfo = {
        id: '',
        username: '',
        email: '',
        role: '',
        verified: false,
        avatar: '',
        bio: '',
        createdAt: new Date().toISOString()
      } as UserInfo
      this.isLoggedIn = false
      this.isAdminLoggedIn = false
      
      // 恢复状态
      if (savedToken) {
        this.token = savedToken
        this.isLoggedIn = true
        console.log('初始化：普通用户登录状态恢复')
      }
      
      if (savedAdminToken) {
        this.adminToken = savedAdminToken
        this.isAdminLoggedIn = true
        console.log('初始化：管理员登录状态恢复')
      }
      
      if (savedUserInfo && (this.isLoggedIn || this.isAdminLoggedIn)) {
        try {
          this.userInfo = JSON.parse(savedUserInfo)
          console.log('初始化：用户信息恢复，角色:', this.userInfo.role)
        } catch (e) {
          console.error('解析userInfo失败:', e)
        }
      }
      
      // 验证令牌是否有效
      if (this.token || this.adminToken) {
        console.log('初始化：验证令牌')
        this.fetchUserInfo()
      }
    }
  }
})