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
    token: '',
    adminToken: '',
    isLoggedIn: false,
    isAdminLoggedIn: false,
    currentSystem: 'user', // 'user' 或 'admin'
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
          // 根据记住我选项选择存储方式
          const storage = remember ? localStorage : sessionStorage
          storage.setItem('adminToken', token)
          storage.setItem('token', token) // 同时保存普通token，确保访问普通路由时也能通过验证
          this.adminToken = token
          this.token = token // 同时设置普通token
          this.isAdminLoggedIn = true
          // 管理员登录时也设置isLoggedIn为true，确保isAdmin计算属性能正确工作
          this.isLoggedIn = true
          console.log('管理员登录：保存adminToken到', remember ? 'localStorage' : 'sessionStorage')
          console.log('管理员登录：同时保存token到', remember ? 'localStorage' : 'sessionStorage')
        } else {
          // 根据记住我选项选择存储方式
          const storage = remember ? localStorage : sessionStorage
          storage.setItem('token', token)
          this.token = token
          this.isLoggedIn = true
          console.log('普通用户登录：保存token到', remember ? 'localStorage' : 'sessionStorage')
        }
        
        this.userInfo = user
        this.currentSystem = system
        localStorage.setItem('currentSystem', system)
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        // 强制触发localStorage变化事件，确保其他标签页能够捕获到
        setTimeout(() => {
          const tempToken = localStorage.getItem('token')
          if (tempToken) {
            localStorage.removeItem('token')
            localStorage.setItem('token', tempToken)
          }
          const tempAdminToken = localStorage.getItem('adminToken')
          if (tempAdminToken) {
            localStorage.removeItem('adminToken')
            localStorage.setItem('adminToken', tempAdminToken)
          }
        }, 100)
        console.log('登录成功：保存用户信息到localStorage', user)
        console.log('登录成功：当前系统', system)
        console.log('登录成功：adminToken存在', !!this.adminToken)
        console.log('登录成功：isAdminLoggedIn', this.isAdminLoggedIn)
        console.log('登录成功：isLoggedIn', this.isLoggedIn)
        console.log('登录成功：isAdmin', this.isAdmin)
        
        // 登录成功，令牌已经保存到localStorage，其他标签页会通过storage事件监听到变化
        
        // 强制刷新localStorage，确保状态同步
        setTimeout(() => {
          console.log('登录成功：强制刷新localStorage状态')
          const updatedToken = localStorage.getItem('token')
          const updatedAdminToken = localStorage.getItem('adminToken')
          const updatedUserInfo = localStorage.getItem('userInfo')
          console.log('登录成功：更新后的token', !!updatedToken)
          console.log('登录成功：更新后的adminToken', !!updatedAdminToken)
          console.log('登录成功：更新后的userInfo', !!updatedUserInfo)
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
        
        // 清除本地存储
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        
        // 如果没有管理员登录，也清除用户信息
        if (!this.isAdminLoggedIn) {
          this.userInfo = {} as UserInfo
          localStorage.removeItem('userInfo')
          sessionStorage.removeItem('userInfo')
          this.currentSystem = 'user'
          localStorage.removeItem('currentSystem')
        }
      } else if (system === 'admin') {
        // 清除管理员状态
        this.adminToken = ''
        this.isAdminLoggedIn = false
        
        // 清除本地存储
        localStorage.removeItem('adminToken')
        sessionStorage.removeItem('adminToken')
        
        // 如果没有普通用户登录，也清除用户信息
        if (!this.isLoggedIn) {
          this.userInfo = {} as UserInfo
          localStorage.removeItem('userInfo')
          sessionStorage.removeItem('userInfo')
          this.currentSystem = 'user'
          localStorage.removeItem('currentSystem')
        }
      } else {
        // 清除所有状态
        this.token = ''
        this.adminToken = ''
        this.userInfo = {} as UserInfo
        this.isLoggedIn = false
        this.isAdminLoggedIn = false
        this.currentSystem = 'user'
        
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('currentSystem')
        
        // 清除会话存储
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('adminToken')
        sessionStorage.removeItem('userInfo')
      }
      
      // 强制触发localStorage变化事件，确保其他标签页能够捕获到
      setTimeout(() => {
        // 触发token变化事件
        const timestamp = Date.now().toString()
        localStorage.setItem('token', timestamp)
        localStorage.removeItem('token')
        // 触发adminToken变化事件
        localStorage.setItem('adminToken', timestamp)
        localStorage.removeItem('adminToken')
        // 触发userInfo变化事件
        localStorage.setItem('userInfo', timestamp)
        localStorage.removeItem('userInfo')
        // 触发一个专门的退出事件
        localStorage.setItem('logoutEvent', timestamp)
        setTimeout(() => {
          localStorage.removeItem('logoutEvent')
        }, 100)
      }, 100)
      
      ElMessage.success('退出登录成功')
      console.log('登出完成')
    },

    // 获取用户信息
    async fetchUserInfo() {
      const token = this.currentSystem === 'admin' ? this.adminToken : this.token
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
          this.logout(this.currentSystem as 'user' | 'admin')
        }
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(oldPassword: string, newPassword: string) {
      const token = this.currentSystem === 'admin' ? this.adminToken : this.token
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
      // 先从 localStorage 读取（记住我）
      let savedToken = localStorage.getItem('token')
      let savedAdminToken = localStorage.getItem('adminToken')
      let savedUserInfo = localStorage.getItem('userInfo')
      let savedCurrentSystem = localStorage.getItem('currentSystem')
      
      // 如果 localStorage 中没有，再从 sessionStorage 读取
      if (!savedToken) {
        savedToken = sessionStorage.getItem('token')
      }
      if (!savedAdminToken) {
        savedAdminToken = sessionStorage.getItem('adminToken')
      }
      if (!savedUserInfo) {
        savedUserInfo = sessionStorage.getItem('userInfo')
      }
      
      console.log('初始化用户状态：')
      console.log('savedToken:', !!savedToken)
      console.log('savedAdminToken:', !!savedAdminToken)
      console.log('savedUserInfo:', !!savedUserInfo)
      console.log('savedCurrentSystem:', savedCurrentSystem)
      
      // 重置状态
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
      
      if (savedUserInfo) {
        try {
          this.userInfo = JSON.parse(savedUserInfo)
          console.log('初始化：用户信息恢复，角色:', this.userInfo.role)
        } catch (e) {
          console.error('解析userInfo失败:', e)
        }
      }
      
      if (savedCurrentSystem) {
        this.currentSystem = savedCurrentSystem
        console.log('初始化：当前系统恢复:', this.currentSystem)
      }
      
      // 验证令牌是否有效
      if (this.currentSystem === 'admin' && this.isAdminLoggedIn) {
        console.log('初始化：验证管理员令牌')
        this.fetchUserInfo()
      } else if (this.currentSystem === 'user' && this.isLoggedIn) {
        console.log('初始化：验证普通用户令牌')
        this.fetchUserInfo()
      }
    }
  }
})