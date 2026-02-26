import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

// 用户角色类型
export type UserRole = 'user' | 'admin'

// 用户接口
export interface IUser extends Document {
  username: string
  email: string
  password: string
  role: UserRole
  verified: boolean
  avatar?: string
  bio?: string // 个人介绍
  verificationToken?: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
  updatedAt: Date
  
  // 方法
  comparePassword(candidatePassword: string): Promise<boolean>
}

// 用户模式
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    minlength: [3, '用户名至少3个字符'],
    maxlength: [50, '用户名最多50个字符'],
    unique: true
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      '请输入有效的邮箱地址'
    ]
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符'],
    select: false // 查询时不返回密码
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500 // 个人介绍最大长度500字符
  },
  verificationToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 密码加密中间件
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
    return
  }
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// 密码比较方法
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

// 导出用户模型
export default mongoose.model<IUser>('User', UserSchema)