<template>
  <div class="window-sync-test">
    <h1>窗口同步测试</h1>
    <div class="test-section">
      <h2>测试操作</h2>
      <div class="button-group">
        <el-button type="primary" @click="openNormalWindow">打开新窗口（普通用户）</el-button>
        <el-button type="warning" @click="openAdminWindow">打开新窗口（管理员）</el-button>
        <el-button type="info" @click="checkStatus">检查当前状态</el-button>
      </div>
    </div>
    
    <div class="status-section">
      <h2>当前状态</h2>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>登录状态信息</span>
          </div>
        </template>
        <div class="status-item">
          <span class="status-label">普通用户登录状态：</span>
          <span :class="['status-value', isUserLoggedIn ? 'status-active' : 'status-inactive']">
            {{ isUserLoggedIn ? '已登录' : '未登录' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">管理员登录状态：</span>
          <span :class="['status-value', isAdminLoggedIn ? 'status-active' : 'status-inactive']">
            {{ isAdminLoggedIn ? '已登录' : '未登录' }}
          </span>
        </div>
      </el-card>
    </div>
    
    <div class="instructions-section">
      <h2>测试说明</h2>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>测试步骤</span>
          </div>
        </template>
        <ol>
          <li>点击上方按钮打开新窗口</li>
          <li>在新窗口中进行登录/登出操作</li>
          <li>返回本页面，点击「检查当前状态」按钮</li>
          <li>观察状态是否同步更新</li>
        </ol>
        <p class="note">注意：两个系统使用不同的令牌存储，完全隔离，不会相互影响。</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式状态
const userToken = ref(sessionStorage.getItem('token'))
const adminToken = ref(sessionStorage.getItem('adminToken'))

// 计算普通用户登录状态
const isUserLoggedIn = computed(() => {
  return !!userToken.value
})

// 计算管理员登录状态
const isAdminLoggedIn = computed(() => {
  return !!adminToken.value
})

// 打开新窗口（普通用户页面）
const openNormalWindow = () => {
  window.open('/dashboard', '_blank')
  ElMessage.success('已打开新窗口（普通用户页面）')
}

// 打开新窗口（管理员页面）
const openAdminWindow = () => {
  window.open('/admin/dashboard', '_blank')
  ElMessage.success('已打开新窗口（管理员页面）')
}

// 检查当前状态
const checkStatus = () => {
  // 手动更新状态
  userToken.value = sessionStorage.getItem('token')
  adminToken.value = sessionStorage.getItem('adminToken')
  ElMessage.info('状态已更新')
  console.log('检查状态：', {
    userToken: userToken.value,
    adminToken: adminToken.value,
    isUserLoggedIn: isUserLoggedIn.value,
    isAdminLoggedIn: isAdminLoggedIn.value
  })
}

// 定期检查状态
let statusCheckInterval: number

// 组件挂载时初始化状态
onMounted(() => {
  console.log('窗口同步测试：已初始化')
  // 初始状态
  checkStatus()
  // 每秒钟检查一次状态
  statusCheckInterval = window.setInterval(() => {
    const currentUserToken = sessionStorage.getItem('token')
    const currentAdminToken = sessionStorage.getItem('adminToken')
    
    if (currentUserToken !== userToken.value || currentAdminToken !== adminToken.value) {
      userToken.value = currentUserToken
      adminToken.value = currentAdminToken
      console.log('定期检查发现状态变化：', {
        userToken: userToken.value,
        adminToken: adminToken.value
      })
    }
  }, 1000)
})

// 组件卸载时清理
onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
})
</script>

<style scoped>
.window-sync-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #666;
  margin: 20px 0 15px;
  font-size: 18px;
}

.test-section {
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-section, .instructions-section {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: 500;
  color: #666;
}

.status-value {
  color: #333;
}

.status-active {
  color: #67c23a;
  font-weight: 500;
}

.status-inactive {
  color: #909399;
}

ol {
  padding-left: 20px;
}

li {
  margin: 8px 0;
  line-height: 1.5;
}

.note {
  margin-top: 15px;
  padding: 10px;
  background-color: #ecf5ff;
  border-left: 4px solid #409eff;
  color: #409eff;
  font-size: 14px;
}
</style>