<template>
  <div class="announcement-create">
    <el-card class="create-card">
      <template #header>
        <div class="card-header">
          <span>发布公告</span>
        </div>
      </template>
      <div class="create-content">
        <el-form
          ref="createFormRef"
          :model="createForm"
          :rules="createRules"
          class="create-form"
        >
          <el-form-item prop="title">
            <el-input v-model="createForm.title" placeholder="请输入公告标题" />
          </el-form-item>
          <el-form-item prop="content">
            <el-input
              v-model="createForm.content"
              placeholder="请输入公告内容"
              type="textarea"
              :rows="5"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">发布公告</el-button>
            <el-button @click="navigateTo('/announcement/list')">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const createFormRef = ref()

const createForm = reactive({
  title: '',
  content: ''
})

const createRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2-100个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 10, message: '内容至少10个字符', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 这里可以添加发布公告的API调用
        ElMessage.success('公告发布成功')
        router.push('/announcement/list')
      } catch (error) {
        ElMessage.error('发布失败，请重试')
      }
    }
  })
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.announcement-create {
  padding: 20px;
}

.create-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-content {
  padding: 20px 0;
}

.create-form {
  width: 100%;
}
</style>