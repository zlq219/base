import express from 'express'
const router = express.Router()

// 公告相关路由
router.get('/', (_req, res) => {
  res.json({ message: '公告列表' })
})

router.post('/', (_req, res) => {
  res.json({ message: '创建公告' })
})

router.get('/:id', (_req, res) => {
  res.json({ message: '公告详情' })
})

router.put('/:id', (_req, res) => {
  res.json({ message: '更新公告' })
})

router.delete('/:id', (_req, res) => {
  res.json({ message: '删除公告' })
})

export default router