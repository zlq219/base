<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2 class="login-title">用户登录</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="loginId">
          <el-input
            v-model="loginForm.loginId"
            placeholder="请输入邮箱或用户名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <div class="login-links">
            <el-link type="primary" :href="'/register'" class="register-link">立即注册</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../core/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

// 登录表单
const loginForm = reactive({
  loginId: '',
  password: ''
})

// 登录验证规则
const loginRules = {
  loginId: [
    { required: true, message: '请输入邮箱或用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  // 验证表单
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm.loginId, loginForm.password, 'user')
        // 等待一小段时间，确保sessionStorage状态更新
        setTimeout(() => {
          console.log('登录成功后跳转前检查sessionStorage状态：')
          console.log('token:', !!sessionStorage.getItem('token'))
          // 强制刷新页面，确保菜单重新计算
          window.location.href = '/dashboard'
        }, 200)
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form-wrapper {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

/* 调整记住我和登录链接的布局 */
.login-form :deep(.el-form-item__content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-links {
  display: flex;
  gap: 15px;
}

.register-link,
.admin-link {
  margin-top: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form-wrapper {
    padding: 30px;
    margin: 0 20px;
  }
}
</style>