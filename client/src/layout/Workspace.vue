<template>
  <div class="workspace">
    <!-- 顶部导航栏 -->
    <div class="workspace-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
            {{ item.label }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <!-- 消息通知 -->
        <el-dropdown>
          <el-button type="link" icon="el-icon-bell">
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="msg in recentMessages" :key="msg.id">
                <div class="message-item">
                  <div class="message-title">{{ msg.title }}</div>
                  <div class="message-content">{{ msg.content }}</div>
                  <div class="message-time">{{ msg.time }}</div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <span class="text-center block">查看全部</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- 用户头像 -->
        <el-dropdown v-if="isCurrentSystemLoggedIn">
          <div class="user-avatar">
              <img :src="(userInfo.avatar && userInfo.avatar.trim()) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userInfo.username" alt="头像" />
              <span class="user-name">{{ userInfo.username }}</span>
            </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="navigateTo('/profile')">个人中心</el-dropdown-item>
              <el-dropdown-item @click="navigateTo('/profile/password')">修改密码</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="workspace-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../core/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 面包屑导航
const breadcrumbList = ref([
  { label: '首页' }
])

// 未读消息数量
const unreadCount = ref(2)

// 最近消息
const recentMessages = ref([
  {
    id: 1,
    title: '系统通知',
    content: '您的账户已成功登录',
    time: '2026-02-22 10:00'
  },
  {
    id: 2,
    title: '公告通知',
    content: '系统将于明天进行维护',
    time: '2026-02-21 18:00'
  }
])

// 判断当前系统是否登录
const isCurrentSystemLoggedIn = computed(() => {
  // 检查当前是否在管理员系统中
  const isInAdminSystem = route.path.startsWith('/admin')
  // 如果在管理员系统中，检查管理员登录状态
  if (isInAdminSystem) {
    return userStore.isAdminLoggedIn
  } else {
    // 否则检查普通用户登录状态
    return userStore.isLoggedIn
  }
})

// 用户信息
const userInfo = computed(() => {
  return userStore.userInfo
})

// 导航到指定页面
const navigateTo = (path: string) => {
  // 检查当前是否在管理员系统中
  const isInAdminSystem = route.path.startsWith('/admin')
  // 如果在管理员系统中，并且路径不是以/admin开头，则添加/admin前缀
  if (isInAdminSystem && !path.startsWith('/admin')) {
    path = `/admin${path}`
  }
  router.push(path)
}

// 退出登录
const handleLogout = () => {
  // 检查当前是否在管理员系统中
  const isInAdminSystem = route.path.startsWith('/admin')
  const systemToLogout = isInAdminSystem ? 'admin' : 'user'
  userStore.logout(systemToLogout)
  // 根据当前所在系统重定向到不同的登录页面，使用window.location.href强制刷新
  if (isInAdminSystem) {
    window.location.href = '/admin/login'
  } else {
    window.location.href = '/login'
  }
  ElMessage.success('退出登录成功')
}

onMounted(() => {
  // 初始化用户状态
  userStore.initialize()
  
  // 监听localStorage变化，确保用户信息及时响应登录状态变化
  window.addEventListener('storage', (event) => {
    // 当登录状态相关数据变化时，重新初始化用户状态
    if (event.key === 'token' || event.key === 'adminToken' || event.key === 'userInfo' ||
        event.key === 'token_sync' || event.key === 'adminToken_sync' || event.key === 'userInfo_sync') {
      // 强制重新初始化用户状态
      userStore.initialize()
    }
  })
})
</script>

<style scoped lang="scss">
.workspace {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  .workspace-header {
    height: 60px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .header-left {
      .el-breadcrumb {
        line-height: 60px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        min-width: 18px;
        height: 18px;
        line-height: 18px;
        font-size: 12px;
        background-color: #f56c6c;
        color: #fff;
        border-radius: 9px;
        text-align: center;
        padding: 0 6px;
      }

      .user-avatar {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;

        img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }

  .workspace-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f5f7fa;

    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }

  .message-item {
    padding: 10px;
    min-width: 300px;

    .message-title {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .message-content {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .message-time {
      font-size: 11px;
      color: #999;
    }
  }

  .block {
    display: block;
  }

  .text-center {
    text-align: center;
  }
}
</style>