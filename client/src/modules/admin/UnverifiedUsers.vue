<template>
  <div class="unverified-users">
    <el-card class="unverified-card">
      <template #header>
        <div class="card-header">
          <span>未验证用户管理</span>
          <el-button type="danger" @click="clearAllUnverified">清除所有未验证用户</el-button>
        </div>
      </template>
      <div class="unverified-content">
        <el-table :data="unverifiedUsers" style="width: 100%">
          <el-table-column prop="username" label="用户名" width="180"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="180"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="resendVerification(scope.row.id)">重发验证邮件</el-button>
              <el-button type="danger" size="small" @click="deleteUser(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="unverifiedUsers.length === 0" class="empty-state">
          <el-empty description="暂无未验证用户" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const unverifiedUsers = ref([
  {
    id: '1',
    username: 'user3',
    email: 'user3@example.com',
    createdAt: '2026-02-22 09:00:00'
  },
  {
    id: '2',
    username: 'user4',
    email: 'user4@example.com',
    createdAt: '2026-02-22 10:30:00'
  }
])

const resendVerification = (id: string) => {
  ElMessage.info(`重发验证邮件: ${id}`)
}

const deleteUser = (id: string) => {
  ElMessageBox.confirm('确定要删除这个未验证用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除用户
    const index = unverifiedUsers.value.findIndex(user => user.id === id)
    if (index > -1) {
      unverifiedUsers.value.splice(index, 1)
      ElMessage.success('用户删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

const clearAllUnverified = () => {
  if (unverifiedUsers.value.length === 0) {
    ElMessage.info('暂无未验证用户')
    return
  }

  ElMessageBox.confirm('确定要清除所有未验证用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟清除所有未验证用户
    unverifiedUsers.value = []
    ElMessage.success('已清除所有未验证用户')
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  // 可以在这里获取未验证用户列表数据
})
</script>

<style scoped lang="scss">
.unverified-users {
  padding: 20px;
}

.unverified-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unverified-content {
  padding: 20px 0;
}

.empty-state {
  margin-top: 40px;
  text-align: center;
}
</style>