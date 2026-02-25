import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/database'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import announcementRoutes from './routes/announcement'
import messageRoutes from './routes/message'
import adminRoutes from './routes/admin'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

// 加载环境变量
dotenv.config()

// 创建Express应用
const app = express()

// 连接数据库
connectDB()

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' })
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/admin', adminRoutes)

// 错误处理中间件
app.use(errorHandler)

// 启动服务器
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  logger.info(`服务器运行在 http://localhost:${PORT}`)
  logger.info(`健康检查: http://localhost:${PORT}/health`)
})

export default app