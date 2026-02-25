<template>
  <div class="message-settings">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>消息设置</span>
        </div>
      </template>
      <div class="settings-content">
        <el-form
          ref="settingsFormRef"
          :model="settingsForm"
          class="settings-form"
        >
          <el-form-item label="系统通知">
            <el-switch v-model="settingsForm.systemNotifications" />
          </el-form-item>
          <el-form-item label="邮件通知">
            <el-switch v-model="settingsForm.emailNotifications" />
          </el-form-item>
          <el-form-item label="站内信通知">
            <el-switch v-model="settingsForm.siteNotifications" />
          </el-form-item>
          <el-form-item label="消息提醒声音">
            <el-switch v-model="settingsForm.soundNotifications" />
          </el-form-item>
          <el-form-item label="消息免打扰时间">
            <el-time-select
              v-model="settingsForm.doNotDisturbStart"
              placeholder="开始时间"
              start="00:00"
              step="00:30"
              end="23:30"
            />
            <span class="time-separator">至</span>
            <el-time-select
              v-model="settingsForm.doNotDisturbEnd"
              placeholder="结束时间"
              start="00:00"
              step="00:30"
              end="23:30"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存设置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const settingsFormRef = ref()

const settingsForm = reactive({
  systemNotifications: true,
  emailNotifications: true,
  siteNotifications: true,
  soundNotifications: true,
  doNotDisturbStart: '22:00',
  doNotDisturbEnd: '08:00'
})

const handleSave = async () => {
  try {
    // 这里可以添加保存设置的API调用
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  }
}

onMounted(() => {
  // 可以在这里获取用户的消息设置
})
</script>

<style scoped lang="scss">
.message-settings {
  padding: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-content {
  padding: 20px 0;
}

.settings-form {
  width: 100%;
}

.time-separator {
  margin: 0 10px;
}
</style>