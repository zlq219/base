import express from 'express'
import { protect, admin } from '../middleware/auth'
import { 
  getUserList, 
  deleteUser, 
  getUnverifiedUsers, 
  deleteUnverifiedUsers 
} from '../controllers/admin'

const router = express.Router()

// 应用认证中间件
router.use(protect)
router.use(admin)

// 管理员路由
router.get('/users', getUserList) // 获取用户列表
router.delete('/users/:id', deleteUser) // 删除用户
router.get('/unverified', getUnverifiedUsers) // 获取未验证用户列表
router.delete('/unverified', deleteUnverifiedUsers) // 清理未验证用户

export default router