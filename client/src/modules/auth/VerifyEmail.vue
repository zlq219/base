<template>
  <div class="verify-container">
    <div class="verify-content">
      <!-- 加载状态 -->
      <div v-if="status === 'verifying'" class="loading-state">
        <div class="loader"></div>
        <h2>正在验证您的邮箱...</h2>
        <p>请稍候，验证过程正在进行中</p>
      </div>
      
      <!-- 成功状态 -->
      <div v-else-if="status === 'success'" class="success-state">
        <div class="success-icon">✓</div>
        <h2>邮箱验证成功！</h2>
        <p>您的邮箱已成功验证，现在可以登录系统了。</p>
        <p class="countdown">将在 {{ countdown }} 秒后自动跳转到登录页面...</p>
        <button @click="goToLogin" class="btn primary">立即登录</button>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="status === 'error'" class="error-state">
        <div class="error-icon">✗</div>
        <h2>验证失败</h2>
        <p>{{ message }}</p>
        <div class="help">
          <p class="help-text">
            如果您遇到问题，请尝试重新注册或
            <a href="/contact" class="help-link">联系我们</a>
          </p>
        </div>
        <button @click="goToHome" class="btn secondary">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const status = ref('verifying')
const message = ref('')
const countdown = ref(5)
let countdownTimer: number | null = null

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
  router.push('/')
}

const startCountdown = () => {
  countdownTimer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer!)
      goToLogin()
    }
  }, 1000)
}

onMounted(async () => {
  console.log('验证页面加载，路由参数:', route.params)
  const token = route.params.token as string
  console.log('验证token:', token)
  
  if (!token) {
    console.log('没有找到token')
    status.value = 'error'
    message.value = '验证链接无效'
    return
  }

  try {
    console.log('开始调用验证API')
    // 使用相对路径，通过Vite代理调用后端API
    const response = await axios.get(`/api/auth/verify/${token}`)
    console.log('API响应:', response.data)
    
    if (response.data.success) {
      console.log('验证成功')
      status.value = 'success'
      startCountdown()
    } else {
      console.log('验证失败:', response.data.message)
      status.value = 'error'
      message.value = response.data.message || '验证失败'
    }
  } catch (error: any) {
    console.error('API调用错误:', error)
    console.error('错误详情:', error.response)
    status.value = 'error'
    message.value = error.response?.data?.message || '网络错误，请稍后重试'
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.verify-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: Arial, sans-serif;
}

.verify-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  text-align: center;
  transition: all 0.3s ease;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 成功状态 */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 10px;
}

.countdown {
  font-size: 14px;
  color: #718096;
  margin: 10px 0;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.error-icon {
  width: 80px;
  height: 80px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 10px;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
}

p {
  font-size: 16px;
  color: #4a5568;
  margin: 0;
  line-height: 1.5;
}

/* 按钮样式 */
.btn {
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn.primary {
  background-color: #667eea;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn.secondary {
  background-color: #edf2f7;
  color: #4a5568;
  text-decoration: none;
}

/* 帮助文本 */
.help {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.help-text {
  font-size: 14px;
  color: #718096;
}

.help-link {
  color: #667eea;
  text-decoration: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .verify-content {
    padding: 30px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  p {
    font-size: 14px;
  }
}
</style>