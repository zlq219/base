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
    
    const { email, password } = req.body
    
    // Validate request body
    if (!email || !password) {
      console.log('后端登录 - 验证失败: 邮箱或密码为空')
      return res.status(400).json({ message: '邮箱和密码不能为空' })
    }

    // 转换邮箱为小写以匹配数据库存储
    const lowercaseEmail = email.toLowerCase()
    const user = await User.findOne({ email: lowercaseEmail }).select('+password')
    if (!user) {
      return res.status(401).json({ message: '未注册用户不能登录' })
    }
    
    if (!user.password) {
      return res.status(500).json({ message: '用户数据错误' })
    }

    if (!user.verified) {
      return res.status(401).json({ message: '请先验证邮箱' })
    }

    console.log('登录尝试 - 邮箱:', email, '密码长度:', password ? password.length : 0, '用户密码存在:', !!user.password, '用户密码长度:', user.password ? user.password.length : 0)
    const isMatch = await bcrypt.compare(password, user.password)
    console.log('登录尝试 - 密码匹配:', isMatch)
    if (!isMatch) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    return res.json({ token, user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified
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

    // 转换邮箱为小写以确保一致性
    const lowercaseEmail = email.toLowerCase()

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email: lowercaseEmail })
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' })
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
      role: 'user',
      verified: false,
      verificationToken
    })
    
    console.log('注册过程 - 原始密码:', password, '密码长度:', password.length)

    await user.save()

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

    return res.json({ user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified
    } })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user?.id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 验证当前密码
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' })
    }

    // 哈希新密码
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    await user.save()

    return res.json({ message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码错误:', error)
    return res.status(500).json({ message: '服务器错误' })
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    let { token } = req.params
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

    console.log('开始查询用户，token:', token)
    const user = await User.findOne({ verificationToken: token })
    console.log('查询结果，找到用户:', !!user)
    
    if (!user) {
      console.log('验证失败：未找到具有该token的用户')
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>邮箱验证结果</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 400px;
                    width: 100%;
                }
                .error {
                    color: #f44336;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                p {
                    color: #666;
                    margin-bottom: 30px;
                    line-height: 1.5;
                }
                .button {
                    background-color: #667eea;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    text-decoration: none;
                    display: inline-block;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #5a6fd8;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error">❌ 验证失败</div>
                <p>验证链接无效或已过期。</p>
                <a href="http://localhost:3000/register" class="button">重新注册</a>
            </div>
        </body>
        </html>
      `)
    }

    console.log('找到用户，准备验证:', user.email, '当前verified状态:', user.verified)
    user.verified = true
    user.verificationToken = undefined
    console.log('准备保存用户，更新后的verified状态:', user.verified)
    
    const savedUser = await user.save()
    console.log('保存结果:', !!savedUser)
    console.log('验证成功，用户:', savedUser.email, '的verified状态已更新为:', savedUser.verified)
    
    // 再次查询数据库，确认状态已更新
    const updatedUser = await User.findOne({ _id: user._id })
    console.log('再次查询数据库，用户:', updatedUser?.email, '的verified状态:', updatedUser?.verified)

    // 直接返回验证成功的HTML，而不是发送文件
    return res.send(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>邮箱验证结果</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  margin: 0;
                  padding: 20px;
              }
              .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                  text-align: center;
                  max-width: 400px;
                  width: 100%;
              }
              .success {
                  color: #4CAF50;
                  font-size: 24px;
                  margin-bottom: 20px;
              }
              p {
                  color: #666;
                  margin-bottom: 30px;
                  line-height: 1.5;
              }
              .button {
                  background-color: #667eea;
                  color: white;
                  padding: 12px 24px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 16px;
                  text-decoration: none;
                  display: inline-block;
                  transition: background-color 0.3s;
              }
              .button:hover {
                  background-color: #5a6fd8;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="success">✅ 邮箱验证成功</div>
              <p>您的邮箱已成功验证，现在可以登录系统了。</p>
              <a href="http://localhost:3002/login" class="button">去登录</a>
          </div>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('验证邮箱错误:', error)
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>邮箱验证结果</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  margin: 0;
                  padding: 20px;
              }
              .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                  text-align: center;
                  max-width: 400px;
                  width: 100%;
              }
              .error {
                  color: #f44336;
                  font-size: 24px;
                  margin-bottom: 20px;
              }
              p {
                  color: #666;
                  margin-bottom: 30px;
                  line-height: 1.5;
              }
              .button {
                  background-color: #667eea;
                  color: white;
                  padding: 12px 24px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 16px;
                  text-decoration: none;
                  display: inline-block;
                  transition: background-color 0.3s;
              }
              .button:hover {
                  background-color: #5a6fd8;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="error">❌ 服务器错误</div>
              <p>验证过程中发生服务器错误，请稍后重试。</p>
              <a href="http://localhost:3002/register" class="button">重新注册</a>
          </div>
      </body>
      </html>
    `)
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
