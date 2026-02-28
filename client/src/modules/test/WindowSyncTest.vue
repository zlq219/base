<template>
  <div class="window-sync-test">
    <h1>窗口同步测试</h1>
    <p>此页面用于测试新开窗口的登录状态同步功能</p>
    
    <div class="test-section">
      <h2>测试1：打开新窗口到普通用户页面</h2>
      <el-button type="primary" @click="openNewWindow('/dashboard')">打开新窗口 - 普通用户首页</el-button>
    </div>
    
    <div class="test-section">
      <h2>测试2：打开新窗口到管理员页面</h2>
      <el-button type="warning" @click="openNewWindow('/admin/users')">打开新窗口 - 管理员用户管理</el-button>
    </div>
    
    <div class="test-section">
      <h2>当前登录状态</h2>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>登录状态信息</span>
          </div>
        </template>
        <div class="status-info">
          <p>普通用户登录状态: <el-tag :type="userStore.isLoggedIn ? 'success' : 'danger'">{{ userStore.isLoggedIn ? '已登录' : '未登录' }}</el-tag></p>
          <p>管理员登录状态: <el-tag :type="userStore.isAdminLoggedIn ? 'success' : 'danger'">{{ userStore.isAdminLoggedIn ? '已登录' : '未登录' }}</el-tag></p>
          <p v-if="userStore.isLoggedIn || userStore.isAdminLoggedIn">
            当前用户: <el-tag type="info">{{ userStore.userInfo.username }}</el-tag>
          </p>
          <p v-if="userStore.isLoggedIn || userStore.isAdminLoggedIn">
            用户角色: <el-tag type="info">{{ userStore.userInfo.role }}</el-tag>
          </p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../core/store/user'

const userStore = useUserStore()

// 打开新窗口
const openNewWindow = (url: string) => {
  // 获取当前页面的基础URL
  const baseUrl = window.location.origin
  // 拼接完整的URL
  const fullUrl = baseUrl + url
  // 打开新窗口
  window.open(fullUrl, '_blank', 'width=800,height=600')
}
</script>

<style scoped lang="scss">
.window-sync-test {
  padding: 20px;
  
  h1 {
    margin-bottom: 20px;
    color: #333;
  }
  
  p {
    margin-bottom: 30px;
    color: #666;
    font-size: 16px;
  }
  
  .test-section {
    margin-bottom: 40px;
    
    h2 {
      margin-bottom: 15px;
      color: #444;
      font-size: 18px;
    }
  }
  
  .status-info {
    p {
      margin-bottom: 10px;
      font-size: 14px;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>