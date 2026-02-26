import express from 'express'
import { login, register, logout, getMe, changePassword, verifyEmail, forgotPassword, resetPassword, updateProfile, uploadAvatar } from '../controllers/auth'
import { protect } from '../middleware/auth'

const router = express.Router()

// 认证相关路由
router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.post('/avatar', protect, uploadAvatar)
router.post('/change-password', protect, changePassword)
router.get('/verify/:token', verifyEmail)
router.post('/verify', verifyEmail) // 支持POST请求验证
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router
