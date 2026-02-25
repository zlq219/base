<template>
  <div class="announcement-list">
    <el-card class="announcement-card">
      <template #header>
        <div class="card-header">
          <span>公告列表</span>
          <el-button type="primary" @click="navigateTo('/announcement/create')">发布公告</el-button>
        </div>
      </template>
      <div class="announcement-content">
        <el-table :data="announcements" style="width: 100%">
          <el-table-column prop="title" label="标题" width="300"></el-table-column>
          <el-table-column prop="content" label="内容"></el-table-column>
          <el-table-column prop="createdAt" label="发布时间" width="180"></el-table-column>
          <el-table-column prop="author" label="发布人" width="120"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewDetail(scope.row.id)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const announcements = ref([
  {
    id: 1,
    title: '系统更新公告',
    content: '系统已更新到最新版本，新增了多项功能',
    createdAt: '2026-02-22 10:00:00',
    author: '管理员'
  },
  {
    id: 2,
    title: '欢迎使用基础应用脚手架',
    content: '这是一个模块化的基础应用脚手架，包含用户认证、角色管理等功能',
    createdAt: '2026-02-21 18:00:00',
    author: '管理员'
  }
])

const viewDetail = (id: number) => {
  ElMessage.info(`查看公告详情: ${id}`)
}

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  // 可以在这里获取公告列表数据
})
</script>

<style scoped lang="scss">
.announcement-list {
  padding: 20px;
}

.announcement-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announcement-content {
  padding: 20px 0;
}
</style>