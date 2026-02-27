<template>
  <div class="unverified-users">
    <el-card class="unverified-card">
      <template #header>
        <div class="card-header">
          <span>未验证用户管理</span>
          <el-button type="danger" @click="clearAllUnverified" :disabled="unverifiedUsers.length === 0">清除所有未验证用户</el-button>
        </div>
      </template>
      <div class="unverified-content">
        <el-table :data="unverifiedUsers" style="width: 100%" v-loading="loading">
          <el-table-column prop="username" label="用户名" width="180"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="resendVerification(scope.row.id)">重发验证邮件</el-button>
              <el-button type="danger" size="small" @click="deleteUser(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="unverifiedUsers.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无未验证用户" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../../core/store/user'

const unverifiedUsers = ref<any[]>([])
const loading = ref(false)
const userStore = useUserStore()

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取未验证用户列表
const fetchUnverifiedUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/unverified', {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    unverifiedUsers.value = response.data.users
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取未验证用户列表失败')
  } finally {
    loading.value = false
  }
}

const resendVerification = (id: string) => {
  ElMessage.info(`重发验证邮件: ${id}`)
}

const deleteUser = (id: string) => {
  ElMessageBox.confirm('确定要删除这个未验证用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      })
      ElMessage.success('用户删除成功')
      // 重新获取未验证用户列表
      fetchUnverifiedUsers()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除用户失败')
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
  }).then(async () => {
    try {
      await axios.delete('/api/admin/unverified', {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      })
      ElMessage.success('已清除所有未验证用户')
      // 重新获取未验证用户列表
      fetchUnverifiedUsers()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '清除未验证用户失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  // 获取未验证用户列表数据
  fetchUnverifiedUsers()
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