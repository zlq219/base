<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      <div class="profile-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="profile-avatar">
              <img src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=200&d=mp&r=x" alt="头像" class="avatar-image" />
              <el-button type="primary" size="small" class="avatar-upload-button">
                更换头像
              </el-button>
            </div>
            <div class="profile-info">
              <h3>{{ userInfo.username }}</h3>
              <p class="user-email">{{ userInfo.email }}</p>
              <p class="user-role">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
              <p class="user-joined">注册时间: {{ formatDate(userInfo.createdAt) }}</p>
            </div>
          </el-col>
          <el-col :span="16">
            <el-card class="info-card">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                </div>
              </template>
              <el-form
                ref="infoFormRef"
                :model="infoForm"
                :rules="infoRules"
                class="info-form"
              >
                <el-form-item prop="username">
                  <el-input v-model="infoForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item prop="email">
                  <el-input v-model="infoForm.email" placeholder="请输入邮箱" type="email" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdate">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../../core/store/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const infoFormRef = ref()

// 获取用户信息
const userInfo = computed(() => {
  return userStore.userInfo || { 
    username: '测试用户', 
    email: 'test@example.com', 
    role: 'user',
    createdAt: new Date().toISOString()
  }
})

// 表单数据
const infoForm = reactive({
  username: userInfo.value.username,
  email: userInfo.value.email
})

// 验证规则
const infoRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 更新个人信息
const handleUpdate = async () => {
  if (!infoFormRef.value) return
  await infoFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 这里可以添加更新个人信息的API调用
        ElMessage.success('个人信息更新成功')
      } catch (error) {
        ElMessage.error('更新失败，请重试')
      }
    }
  })
}

onMounted(() => {
  // 初始化表单数据
  infoForm.username = userInfo.value.username
  infoForm.email = userInfo.value.email
})
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-content {
  padding: 20px;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.avatar-upload-button {
  margin-top: 10px;
}

.profile-info {
  text-align: center;
}

.profile-info h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.user-email {
  color: #666;
  margin-bottom: 5px;
}

.user-role {
  color: #409eff;
  margin-bottom: 5px;
}

.user-joined {
  color: #999;
  font-size: 12px;
}

.info-card {
  margin-bottom: 20px;
}

.info-form {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>