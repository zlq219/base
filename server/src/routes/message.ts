import express from 'express'
const router = express.Router()

// 消息相关路由
router.get('/', (_req, res) => {
  res.json({ message: '消息列表' })
})

router.get('/settings', (_req, res) => {
  res.json({ message: '消息设置' })
})

router.put('/settings', (_req, res) => {
  res.json({ message: '更新消息设置' })
})

export default router