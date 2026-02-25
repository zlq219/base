<template>
  <div class="message-list">
    <el-card class="message-card">
      <template #header>
        <div class="card-header">
          <span>消息列表</span>
        </div>
      </template>
      <div class="message-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="全部消息" name="all">
            <el-table :data="allMessages" style="width: 100%">
              <el-table-column prop="title" label="标题" width="300"></el-table-column>
              <el-table-column prop="content" label="内容"></el-table-column>
              <el-table-column prop="createdAt" label="发送时间" width="180"></el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewDetail(scope.row.id)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="未读消息" name="unread">
            <el-table :data="unreadMessages" style="width: 100%">
              <el-table-column prop="title" label="标题" width="300"></el-table-column>
              <el-table-column prop="content" label="内容"></el-table-column>
              <el-table-column prop="createdAt" label="发送时间" width="180"></el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewDetail(scope.row.id)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="系统通知" name="system">
            <el-table :data="systemMessages" style="width: 100%">
              <el-table-column prop="title" label="标题" width="300"></el-table-column>
              <el-table-column prop="content" label="内容"></el-table-column>
              <el-table-column prop="createdAt" label="发送时间" width="180"></el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewDetail(scope.row.id)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('all')

// 模拟消息数据
const allMessages = ref([
  {
    id: 1,
    title: '系统更新通知',
    content: '系统已更新到最新版本，新增了多项功能',
    createdAt: '2026-02-22 10:00:00',
    type: 'system',
    read: false
  },
  {
    id: 2,
    title: '欢迎使用',
    content: '欢迎使用基础应用脚手架系统',
    createdAt: '2026-02-21 18:00:00',
    type: 'system',
    read: true
  }
])

// 未读消息
const unreadMessages = computed(() => {
  return allMessages.value.filter(msg => !msg.read)
})

// 系统消息
const systemMessages = computed(() => {
  return allMessages.value.filter(msg => msg.type === 'system')
})

const viewDetail = (id: number) => {
  ElMessage.info(`查看消息详情: ${id}`)
  // 标记消息为已读
  const message = allMessages.value.find(msg => msg.id === id)
  if (message) {
    message.read = true
  }
}

onMounted(() => {
  // 可以在这里获取消息列表数据
})
</script>

<style scoped lang="scss">
.message-list {
  padding: 20px;
}

.message-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-content {
  padding: 20px 0;
}
</style>