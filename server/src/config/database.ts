import mongoose from 'mongoose'
import { logger } from '../utils/logger'

// 连接数据库
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/base-app'
    
    await mongoose.connect(mongoURI)
    
    logger.info('数据库连接成功')
  } catch (error: any) {
    logger.error('数据库连接失败:', error.message)
    process.exit(1)
  }
}

// 断开数据库连接
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    logger.info('数据库连接已断开')
  } catch (error: any) {
    logger.error('数据库断开失败:', error.message)
  }
}

// 数据库连接状态
export const getDBStatus = () => {
  return mongoose.connection.readyState
}

// 数据库连接状态描述
export const getDBStatusDescription = () => {
  const status = getDBStatus()
  const statusMap: Record<number, string> = {
    0: '断开',
    1: '连接',
    2: '连接中',
    3: '断开中'
  }
  return statusMap[status] || '未知'
}