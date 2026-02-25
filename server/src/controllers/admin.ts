import { Request, Response } from 'express'
import User from '../models/User'
import { logger } from '../utils/logger'

// 获取用户列表
export const getUserList = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query

    // 构建查询条件
    const query: any = {}
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // 计算分页
    const skip = (Number(page) - 1) * Number(limit)

    // 查询用户
    const users = await User.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })

    // 获取总用户数
    const total = await User.countDocuments(query)

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    logger.error('获取用户列表失败:', error.message)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 删除用户
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 查找用户
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 禁止删除管理员自己
    if (user._id.toString() === req.user!.id) {
      return res.status(400).json({ message: '不能删除自己的账户' })
    }

    // 删除用户
    await user.deleteOne()

    return res.json({ message: '用户删除成功' })
  } catch (error: any) {
    logger.error('删除用户失败:', error.message)
    return res.status(500).json({ message: '服务器错误' })
  }
}

// 获取未验证用户列表
export const getUnverifiedUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query

    // 计算分页
    const skip = (Number(page) - 1) * Number(limit)

    // 查询未验证用户
    const users = await User.find({ verified: false })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })

    // 获取总未验证用户数
    const total = await User.countDocuments({ verified: false })

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    logger.error('获取未验证用户列表失败:', error.message)
    res.status(500).json({ message: '服务器错误' })
  }
}

// 清理未验证用户
export const deleteUnverifiedUsers = async (_req: Request, res: Response) => {
  try {
    // 删除所有未验证用户
    const result = await User.deleteMany({ verified: false })

    return res.json({
      message: `成功清理 ${result.deletedCount} 个未验证用户`
    })
  } catch (error: any) {
    logger.error('清理未验证用户失败:', error.message)
    return res.status(500).json({ message: '服务器错误' })
  }
}