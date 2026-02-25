import nodemailer from 'nodemailer'

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
  // 修改：指向前端页面，而不是直接指向API
  // 根据你的前端端口修改（通常是3000）
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const verificationUrl = `${frontendUrl}/verify/${token}`
  
  await transporter.sendMail({
    from: process.env.MAIL_DEFAULT_SENDER || '4969825@qq.com',
    to: email,
    subject: '请验证您的邮箱',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>邮箱验证</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- 头部 -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">邮箱验证</h1>
          </div>
          
          <!-- 内容 -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">亲爱的用户：</p>
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">感谢您注册我们的系统！请点击下方按钮验证您的邮箱地址：</p>
            
            <!-- 按钮 -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                验证邮箱地址
              </a>
            </div>
            
            <!-- 备用链接 -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">在开发环境中，请直接复制以下链接到浏览器地址栏访问：</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #667eea; font-size: 14px; text-decoration: underline;">${verificationUrl}</a>
              </div>
              <p style="font-size: 14px; color: #ff6b6b; margin-top: 10px;"><strong>注意：</strong>由于QQ邮箱的安全限制，点击邮件中的按钮或链接可能无法直接访问localhost地址，请手动复制上面的链接到浏览器地址栏。</p>
            </div>
            
            <!-- 提示 -->
            <div style="margin-top: 40px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">如果您没有注册账号，请忽略此邮件，您的邮箱地址不会收到任何其他邮件。</p>
            </div>
          </div>
          
          <!-- 底部 -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 12px; color: #999;">此邮件由系统自动发送，请勿直接回复。</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #999;">&copy; 2026 您的系统名称. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}