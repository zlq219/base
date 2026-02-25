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
        />
        <el-table :data="filteredUsers" style="width: 100%">
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
          <el-table-column prop="createdAt" label="注册时间" width="180"></el-table-column>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const searchQuery = ref('')

// 模拟用户数据
const users = ref([
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    verified: true,
    createdAt: '2026-02-22 00:00:00'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    verified: true,
    createdAt: '2026-02-21 12:00:00'
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    verified: false,
    createdAt: '2026-02-20 18:00:00'
  }
])

// 当前用户ID
const currentUserId = ref('1') // 模拟当前登录用户ID

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value
  }
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query)
  )
})

const viewUser = (id: string) => {
  ElMessage.info(`查看用户详情: ${id}`)
}

const deleteUser = (id: string) => {
  ElMessageBox.confirm('确定要删除这个用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除用户
    const index = users.value.findIndex(user => user.id === id)
    if (index > -1) {
      users.value.splice(index, 1)
      ElMessage.success('用户删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  // 可以在这里获取用户列表数据
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