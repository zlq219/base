import express from 'express'
const router = express.Router()

// 用户相关路由
router.get('/profile', (_req, res) => {
  res.json({ message: '用户个人信息' })
})

router.put('/profile', (_req, res) => {
  res.json({ message: '更新用户信息' })
})

export default router