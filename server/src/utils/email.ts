﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || 'smtp.qq.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME || '4969825@qq.com',
    pass: process.env.MAIL_PASSWORD || 'dymlvpwsegmhcaaa'
  }
})

export const sendVerificationEmail = async (email: string, token: string) => {
  // 确保链接格式正确，不包含可能被QQ邮箱安全系统拦截的字符
  const verificationUrl = `http://localhost:4000/api/auth/verify/${encodeURIComponent(token)}`
  
  await transporter.sendMail({
    from: process.env.MAIL_DEFAULT_SENDER || '4969825@qq.com',
    to: email,
    subject: '邮箱验证',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">邮箱验证</h2>
        <p>亲爱的用户：</p>
        <p>感谢您注册我们的系统，请点击以下按钮验证您的邮箱：</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px;">验证邮箱</a>
        </p>
        <p>如果点击按钮无效，请复制以下地址到浏览器地址栏打开：</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
        <p>如果您没有注册，请忽略此邮件。</p>
      </div>
    `
  })
}
