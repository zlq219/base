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
              <img :src="(userInfo.avatar && userInfo.avatar.trim()) || defaultAvatar" alt="头像" class="avatar-image" />
              <el-button type="primary" size="small" class="avatar-upload-button" @click="showAvatarDialog = true">
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
                <el-form-item prop="bio">
                  <el-input
                    v-model="infoForm.bio"
                    placeholder="请输入个人介绍"
                    type="textarea"
                    :rows="4"
                    maxlength="500"
                    show-word-limit
                  />
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

    <!-- 更换头像对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="更换头像"
      width="500px"
    >
      <div class="avatar-dialog-content">
        <!-- 方式1：选择本地文件 -->
        <div class="avatar-upload-section">
          <h4>选择本地图片</h4>
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-change="handleFileUpload"
            accept="image/*"
            :auto-upload="false"
            :before-upload="beforeUpload"
          >
            <el-button size="small" type="primary">选择图片</el-button>
          </el-upload>
          <div v-if="localAvatar" class="preview-container">
            <img :src="localAvatar" alt="预览" class="preview-image" />
            <el-button size="small" type="primary" @click="uploadLocalAvatar">上传</el-button>
            <el-button size="small" @click="localAvatar = ''">取消</el-button>
          </div>
        </div>

        <!-- 方式2：输入网络URL -->
        <div class="avatar-url-section">
          <h4>输入网络头像URL</h4>
          <el-input
            v-model="avatarUrl"
            placeholder="请输入头像图片URL"
            style="width: 80%"
          />
          <el-button size="small" type="primary" @click="useUrlAvatar">使用URL</el-button>
        </div>

        <!-- 方式3：从预设头像中选择 -->
        <div class="avatar-presets-section">
          <h4>从预设头像中选择</h4>
          <div class="preset-avatars">
            <div
              v-for="(avatar, index) in presetAvatars"
              :key="index"
              class="preset-avatar-item"
              :class="{ active: selectedPresetAvatar === avatar }"
              @click="selectedPresetAvatar = avatar"
            >
              <img :src="avatar" alt="预设头像" />
            </div>
          </div>
          <el-button
            v-if="selectedPresetAvatar"
            size="small"
            type="primary"
            @click="usePresetAvatar"
          >
            使用选中头像
          </el-button>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAvatarDialog = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../../core/store/user'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'

const userStore = useUserStore()
const infoFormRef = ref()

// 头像相关变量
const showAvatarDialog = ref(false)
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
const localAvatar = ref('')
const selectedPresetAvatar = ref('')
const avatarUrl = ref('')

// 预设头像列表
const presetAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=11',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=12',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=13',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=14',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=15',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=16',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=17',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=18',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=19',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=20'
]

// 获取用户信息
const userInfo = computed(() => {
  return userStore.userInfo || { 
    id: '',
    username: '测试用户', 
    email: 'test@example.com', 
    role: 'user',
    verified: false,
    avatar: '',
    bio: '',
    createdAt: new Date().toISOString()
  }
})

// 表单数据
const infoForm = reactive({
  username: userInfo.value.username,
  email: userInfo.value.email,
  bio: userInfo.value.bio
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
  ],
  bio: [
    { max: 500, message: '个人介绍不能超过500字符', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 检查文件大小
const beforeUpload = (file: any) => {
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过2MB')
    return false
  }
  return true
}

// 处理本地文件上传
const handleFileUpload = (file: any) => {
  // 先检查文件大小
  if (!beforeUpload(file)) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    localAvatar.value = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

// 上传本地头像
const uploadLocalAvatar = async () => {
  if (!localAvatar.value) return
  
  const loading = ElLoading.service({ text: '上传中...' })
  try {
    // 这里可以添加文件上传到服务器的逻辑
    // 暂时使用本地图片的DataURL作为头像
    const response = await axios.post('/api/auth/avatar', { avatar: localAvatar.value }, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    
    // 更新用户信息
    userStore.userInfo = response.data
    ElMessage.success('头像更换成功')
    showAvatarDialog.value = false
    localAvatar.value = ''
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '头像上传失败')
  } finally {
    loading.close()
  }
}

// 使用预设头像
const usePresetAvatar = async () => {
  if (!selectedPresetAvatar.value) return
  
  const loading = ElLoading.service({ text: '更新中...' })
  try {
    console.log('选择的预设头像:', selectedPresetAvatar.value)
    const response = await axios.post('/api/auth/avatar', { avatar: selectedPresetAvatar.value }, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    
    console.log('服务器返回的用户信息:', response.data)
    // 更新用户信息
    userStore.userInfo = response.data
    ElMessage.success('头像更换成功')
    showAvatarDialog.value = false
    selectedPresetAvatar.value = ''
  } catch (error: any) {
    console.error('预设头像更新错误:', error)
    ElMessage.error(error.response?.data?.message || '头像更新失败')
  } finally {
    loading.close()
  }
}

// 使用URL头像
const useUrlAvatar = async () => {
  if (!avatarUrl.value) {
    ElMessage.warning('请输入头像URL')
    return
  }
  
  // 验证URL格式
  try {
    new URL(avatarUrl.value)
  } catch {
    ElMessage.error('请输入有效的URL格式')
    return
  }
  
  const loading = ElLoading.service({ text: '更新中...' })
  try {
    const response = await axios.post('/api/auth/avatar', { avatar: avatarUrl.value }, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    
    // 更新用户信息
    userStore.userInfo = response.data
    ElMessage.success('头像更换成功')
    showAvatarDialog.value = false
    avatarUrl.value = ''
  } catch (error: any) {
    console.error('URL头像更新错误:', error)
    ElMessage.error(error.response?.data?.message || '头像更新失败')
  } finally {
    loading.close()
  }
}

// 更新个人信息
const handleUpdate = async () => {
  if (!infoFormRef.value) return
  await infoFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const loading = ElLoading.service({ text: '更新中...' })
      try {
        const response = await axios.put('/api/auth/profile', infoForm, {
          headers: {
            Authorization: `Bearer ${userStore.token}`
          }
        })
        
        // 更新用户信息
        userStore.userInfo = response.data
        ElMessage.success('个人信息更新成功')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '更新失败，请重试')
      } finally {
        loading.close()
      }
    }
  })
}

onMounted(async () => {
  // 获取用户信息
  await userStore.fetchUserInfo()
  // 初始化表单数据
  infoForm.username = userInfo.value.username
  infoForm.email = userInfo.value.email
  infoForm.bio = userInfo.value.bio
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

/* 头像对话框样式 */
.avatar-dialog-content {
  padding: 20px 0;
}

.avatar-upload-section,
.avatar-presets-section,
.avatar-url-section {
  margin-bottom: 30px;
}

.avatar-upload-section h4,
.avatar-presets-section h4,
.avatar-url-section h4 {
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.preview-container {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.preset-avatars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.preset-avatar-item {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
  }

  &.active {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-url-section {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>