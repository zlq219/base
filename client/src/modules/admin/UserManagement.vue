<template>
  <div class="user-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>
      <div class="management-content">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或邮箱"
          prefix-icon="el-icon-search"
          class="search-input"
          @keyup.enter="fetchUsers"
        />
        <el-table :data="users" style="width: 100%" v-loading="loading">
          <el-table-column prop="username" label="用户名" width="180"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="role" label="角色" width="120">
            <template #default="scope">
              <span>{{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="verified" label="验证状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.verified ? 'success' : 'warning'">
                {{ scope.row.verified ? '已验证' : '未验证' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewUser(scope.row.id)">查看</el-button>
              <el-button type="danger" size="small" @click="deleteUser(scope.row.id)" :disabled="scope.row.id === currentUserId">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useUserStore } from '../../core/store/user'

const searchQuery = ref('')
const users = ref<any[]>([])
const loading = ref(false)
const userStore = useUserStore()

// 当前用户ID
const currentUserId = computed(() => userStore.userInfo.id)

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    console.log('开始获取用户列表，搜索关键词:', searchQuery.value)
    const response = await axios.get('/api/admin/users', {
      params: {
        search: searchQuery.value
      },
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    console.log('获取用户列表成功:', response.data)
    users.value = response.data.users
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    ElMessage.error(error.response?.data?.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const viewUser = (id: string) => {
  ElMessage.info(`查看用户详情: ${id}`)
}

const deleteUser = (id: string) => {
  ElMessageBox.confirm('确定要删除这个用户吗？', '警告', {
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
      // 重新获取用户列表
      fetchUsers()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除用户失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  // 获取用户列表数据
  fetchUsers()
})
</script>

<style scoped lang="scss">
.user-management {
  padding: 20px;
}

.management-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.management-content {
  padding: 20px 0;
}

.search-input {
  margin-bottom: 20px;
  width: 300px;
}
</style>