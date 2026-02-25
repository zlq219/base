import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

// 错误接口
interface AppError {
  statusCode: number
  message: string
  isOperational?: boolean
  errors?: any[]
  stack?: string
}

// 错误处理中间件
export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  // 记录错误
  logger.error('错误:', err.message)
  if (err.errors) {
    logger.error('错误详情:', err.errors)
  }

  // 设置默认错误状态码和消息
  const statusCode = err.statusCode || 500
  const message = err.message || '服务器错误'

  // 返回错误响应
  res.status(statusCode).json({
    message,
    errors: err.errors || [],
    // 在开发环境中返回错误堆栈
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

