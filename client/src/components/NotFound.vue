<template>
  <div class="not-found">
    <el-card class="not-found-card">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <div class="error-message">页面不存在</div>
        <div class="error-description">抱歉，您访问的页面不存在或已被删除</div>
        <el-button type="primary" @click="navigateTo('/dashboard')">返回首页</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.not-found-card {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.not-found-content {
  padding: 40px 20px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 20px;
}

.error-message {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.error-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}
</style>