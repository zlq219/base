import { Request, Response, NextFunction } from 'express'
import { getUserIdFromToken } from '../utils/token'
import User from '../models/User'

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
      }
    }
  }
}

// 认证中间件
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '请先登录' })
    }

    // 提取令牌
    const token = authHeader.split(' ')[1]

    // 验证令牌并获取用户ID
    const userId = getUserIdFromToken(token as string)
    if (!userId) {
      return res.status(401).json({ message: '登录已过期，请重新登录' })
    }

    // 查找用户
    const user = await User.findById(userId)
    if (!user) {
      return res.status(401).json({ message: '用户不存在' })
    }

    // 将用户信息附加到请求对象
    req.user = {
      id: user._id.toString()
    }

    return next()
  } catch (error: any) {
    return res.status(401).json({ message: '认证失败，请重新登录' })
  }
}

// 管理员权限中间件
export const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 查找用户
    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 检查用户角色
    if (user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足' })
    }

    return next()
  } catch (error: any) {
    return res.status(500).json({ message: '服务器错误' })
  }
}