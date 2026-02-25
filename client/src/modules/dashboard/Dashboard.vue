<template>
  <div class="dashboard">
    <el-card class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用基础应用脚手架</span>
        </div>
      </template>
      <div class="dashboard-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="stats-card">
              <template #header>
                <div class="card-header">
                  <span>系统信息</span>
                </div>
              </template>
              <div class="stats-content">
                <p>当前版本: 1.0.0</p>
                <p>登录用户: {{ userInfo.username }}</p>
                <p>用户角色: {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stats-card">
              <template #header>
                <div class="card-header">
                  <span>快速操作</span>
                </div>
              </template>
              <div class="quick-actions">
                <el-button type="primary" @click="navigateTo('/announcement/list')">
                  <i class="el-icon-message"></i> 查看公告
                </el-button>
                <el-button type="success" @click="navigateTo('/profile')">
                  <i class="el-icon-user"></i> 个人中心
                </el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stats-card">
              <template #header>
                <div class="card-header">
                  <span>系统状态</span>
                </div>
              </template>
              <div class="system-status">
                <el-progress :percentage="80" status="success" />
                <p>CPU 使用率: 80%</p>
                <el-progress :percentage="45" status="warning" />
                <p>内存使用率: 45%</p>
                <el-progress :percentage="20" status="info" />
                <p>磁盘使用率: 20%</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card class="recent-activities">
              <template #header>
                <div class="card-header">
                  <span>最近活动</span>
                </div>
              </template>
              <div class="activities-list">
                <el-timeline>
                  <el-timeline-item
                    v-for="(activity, index) in recentActivities"
                    :key="index"
                    :timestamp="activity.time"
                  >
                    <el-card>
                      <h4>{{ activity.title }}</h4>
                      <p>{{ activity.description }}</p>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../core/store/user'

const router = useRouter()
const userStore = useUserStore()

// 获取用户信息
const userInfo = computed(() => {
  return userStore.userInfo || { username: '测试用户', role: 'user' }
})

// 最近活动
const recentActivities = ref([
  {
    title: '系统更新',
    description: '系统已更新到最新版本 1.0.0',
    time: '2026-02-22 10:00'
  },
  {
    title: '用户登录',
    description: '您已成功登录系统',
    time: '2026-02-22 09:30'
  },
  {
    title: '公告发布',
    description: '管理员发布了新的系统公告',
    time: '2026-02-21 18:00'
  }
])

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
}

.dashboard-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-content {
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
}

.system-status {
  padding: 20px;
}

.system-status p {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 14px;
}

.recent-activities {
  margin-top: 20px;
}

.activities-list {
  padding: 10px;
}

.el-timeline-item {
  margin-bottom: 20px;
}

.el-card {
  margin-bottom: 20px;
}
</style>