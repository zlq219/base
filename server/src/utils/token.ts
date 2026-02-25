import jwt, { SignOptions } from 'jsonwebtoken'

// 生成JWT令牌
export const generateToken = (userId: string, expiresIn: string = '7d') => {
  const payload = {
    id: userId
  }
  
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  const options: SignOptions = {
    expiresIn: expiresIn as any
  }
  
  const token = jwt.sign(payload, secret as string, options)
  
  return token
}

// 验证JWT令牌
export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    return decoded
  } catch (error) {
    return null
  }
}

// 从令牌中提取用户ID
export const getUserIdFromToken = (token: string) => {
  const decoded = verifyToken(token)
  if (decoded && typeof decoded === 'object' && 'id' in decoded) {
    return decoded.id as string
  }
  return null
}