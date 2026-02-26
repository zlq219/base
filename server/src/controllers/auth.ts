import { Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from '../utils/email'

// 扩展 Request 接口，添加 user 属性
declare module 'express' {
  interface Request {
    user?: {
      id: string
    }
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    console.log('后端登录 - 接收到的请求体:', req.body)
    console.log('后端登录 - 邮箱:', req.body.email)
    console.log('后端登录 - 密码:', req.body.password)
    console.log('后端登录 - 请求头:', req.headers)
    
    const { email, username, password } = req.body
    
    // Validate request body
    if (!password || (!email && !username)) {
      console.log('后端登录 - 验证失败: 登录凭证或密码为空')
      return res.status(400).json({ message: '登录凭证和密码不能为空' })
    }

    // 根据邮箱或用户名查询用户
    let user
    if (email) {
      // 转换邮箱为小写以匹配数据库存储
      const lowercaseEmail = email.toLowerCase()
      user = await User.findOne({ email: lowercaseEmail }).select('+password')
    } else if (username) {
      user = await User.findOne({ username }).select('+password')
    }
    
    if (!user) {
      return res.status(401).json({ message: '未注册用户不能登录' })
    }
    
    if (!user.password) {
      return res.status(500).json({ message: '用户数据错误' })
    }

    if (!user.verified) {
      return res.status(401).json({ message: '请先验证邮箱' })
    }

    console.log('登录尝试 - 邮箱:', email, '用户名:', username, '密码长度:', password ? password.length : 0, '用户密码存在:', !!user.password, '用户密码长度:', user.password ? user.password.length : 0)
    const isMatch = await bcrypt.compare(password, user.password)
    console.log('登录尝试 - 密码匹配:', isMatch)
    if (!isMatch) {
      return res.status(401).json({ message: '登录凭证或密码错误' })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // 如果用户没有头像，设置默认头像
    if (!user.avatar || user.avatar.trim() === '') {
      user.avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      await user.save()
    }

    return res.json({ token, user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified,
      avatar: user.avatar
    } })
  } catch (error) {
    console.error('登录错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    // 验证请求体
    if (!username || !email || !password) {
      return res.status(400).json({ message: '用户名、邮箱和密码不能为空' })
    }

    // 验证用户名长度
    if (username.length < 3) {
      return res.status(400).json({ message: '用户名至少3个字符' })
    }

    // 转换邮箱为小写以确保一致性
    const lowercaseEmail = email.toLowerCase()

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email: lowercaseEmail })
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' })
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(400).json({ message: '该用户名已被使用' })
    }

    // 创建新用户
    const verificationToken = jwt.sign(
      { email: lowercaseEmail },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )
    
    const user = new User({
      username,
      email: lowercaseEmail,
      password: password, // 传递明文密码，由User模型的pre('save')中间件自动哈希
      role: 'user', // 默认为普通用户，第一个验证的用户会自动升级为管理员
      verified: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default', // 默认头像
      verificationToken
    })
    
    console.log('注册过程 - 原始密码:', password, '密码长度:', password.length)

    try {
      await user.save()
    } catch (error: any) {
      console.error('注册错误:', error)
      // 处理其他可能的验证错误
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => err.message)
        return res.status(400).json({ message: errors.join(', ') })
      }
      return res.status(500).json({ message: '服务器错误' })
    }

    // 验证密码是否正确存储
    const savedUser = await User.findOne({ email: lowercaseEmail }).select('+password')
    if (savedUser) {
      const isPasswordCorrect = await bcrypt.compare(password, savedUser.password)
      console.log('注册验证 - 密码存储正确:', isPasswordCorrect)
      if (!isPasswordCorrect) {
        console.error('注册验证 - 密码存储错误')
      }
    }

    // 发送验证邮件
    await sendVerificationEmail(lowercaseEmail, verificationToken)

    return res.status(201).json({ message: '注册成功，请检查邮箱进行验证' })
  } catch (error) {
    console.error('注册错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const logout = (_req: Request, res: Response) => {
  return res.json({ message: '登出成功' })
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    return res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { username, email, bio } = req.body
    const user = await User.findById(req.user?.id)
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 检查用户名是否已被使用
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username })
      if (existingUsername) {
        return res.status(400).json({ message: '该用户名已被使用' })
      }
      user.username = username
    }

    // 检查邮箱是否已被使用
    if (email && email !== user.email) {
      const lowercaseEmail = email.toLowerCase()
      const existingEmail = await User.findOne({ email: lowercaseEmail })
      if (existingEmail) {
        return res.status(400).json({ message: '该邮箱已被注册' })
      }
      user.email = lowercaseEmail
    }

    // 更新个人介绍
    if (bio !== undefined) {
      user.bio = bio
    }

    await user.save()

    return res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body
    const user = await User.findById(req.user?.id)
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    if (!avatar) {
      return res.status(400).json({ message: '请提供头像URL' })
    }

    // 检查头像数据大小（限制为2MB）
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (avatar.length > maxSize) {
      return res.status(400).json({ message: '头像大小不能超过2MB' })
    }

    // 使用前端提供的头像URL
    user.avatar = avatar
    
    await user.save()

    return res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified,
      avatar: user.avatar,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('上传头像错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user?.id).select('+password')
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 验证当前密码
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' })
    }

    // 直接设置新密码，让pre('save')中间件处理哈希
    user.password = newPassword
    await user.save()

    return res.json({ message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    // 支持GET请求（URL参数）和POST请求（表单提交）
    let token = req.params.token || req.body.token
    console.log('开始验证邮箱，token:', token)

    // 解码可能被编码的token
    try {
      if (token) {
        token = decodeURIComponent(token)
        console.log('解码后的token:', token)
      }
    } catch (e) {
      console.log('token解码失败，使用原始token:', token)
    }

    // 验证token是否存在
    if (!token) {
      console.log('验证失败：token不存在')
      return res.status(400).json({
        success: false,
        message: '验证链接无效或已过期'
      })
    }

    // 验证JWT token的有效性和过期时间
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      console.log('JWT token验证成功')
    } catch (error) {
      console.log('JWT token验证失败:', error)
      return res.status(400).json({
        success: false,
        message: '验证链接已过期'
      })
    }

    console.log('开始查询用户，token:', token)
    const user = await User.findOne({ verificationToken: token })
    console.log('查询结果，找到用户:', !!user)
    
    if (!user) {
      console.log('验证失败：未找到具有该token的用户')
      return res.status(400).json({
        success: false,
        message: '验证链接无效或已过期'
      })
    }

    console.log('找到用户，准备验证:', user.email, '当前verified状态:', user.verified)
    user.verified = true
    user.verificationToken = undefined
    
    // 检查是否是第一个被验证的用户
    const verifiedUserCount = await User.countDocuments({ verified: true })
    if (verifiedUserCount === 0) {
      user.role = 'admin'
      console.log('第一个被验证的用户，设置为管理员:', user.email)
    }
    
    console.log('准备保存用户，更新后的verified状态:', user.verified, '角色:', user.role)
    
    const savedUser = await user.save()
    console.log('保存结果:', !!savedUser)
    console.log('验证成功，用户:', savedUser.email, '的verified状态已更新为:', savedUser.verified, '角色:', savedUser.role)
    
    // 再次查询数据库，确认状态已更新
    const updatedUser = await User.findOne({ _id: user._id })
    console.log('再次查询数据库，用户:', updatedUser?.email, '的verified状态:', updatedUser?.verified)

    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '邮箱验证成功'
    })
  } catch (error) {
    console.error('验证邮箱错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 生成重置密码令牌
    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    )

    user.resetPasswordToken = resetToken
    user.resetPasswordExpire = new Date(Date.now() + 3600000) // 1小时后过期
    await user.save()

    // 发送重置密码邮件
    await sendVerificationEmail(email, resetToken)

    return res.json({ message: '重置密码链接已发送到您的邮箱' })
  } catch (error) {
    console.error('忘记密码错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ message: '重置密码链接无效或已过期' })
    }

    // 哈希新密码
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    return res.json({ message: '密码重置成功' })
  } catch (error) {
    console.error('重置密码错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}
