<template>
  <div class="menu-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>菜单配置</span>
        </div>
      </template>
      <div class="config-content">
        <el-button type="primary" @click="addMenuItem">添加菜单项</el-button>
        <el-tree
          v-model="menuData"
          :props="defaultProps"
          node-key="path"
          default-expand-all
          class="menu-tree"
        >
          <template #default="{ data }">
            <span class="menu-item">
              <span>{{ data.label }}</span>
              <span class="menu-actions">
                <el-button type="primary" size="small" @click="editMenuItem(data)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteMenuItem(data.path)">删除</el-button>
              </span>
            </span>
          </template>
        </el-tree>
        <div class="config-footer">
          <el-button type="primary" @click="saveMenuConfig">保存配置</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { menuConfig } from '../../config/menu'

// 菜单数据
const menuData = ref([...menuConfig])

// 树节点配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 编辑对话框功能开发中

const addMenuItem = () => {
  ElMessage.info('添加菜单项功能开发中')
}

const editMenuItem = (data: any) => {
  ElMessage.info(`编辑菜单项: ${data.label}`)
}

const deleteMenuItem = (path: string) => {
  ElMessage.info(`删除菜单项: ${path}`)
}

const saveMenuConfig = () => {
  ElMessage.success('菜单配置保存成功')
}
</script>

<style scoped lang="scss">
.menu-config {
  padding: 20px;
}

.config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-content {
  padding: 20px 0;
}

.menu-tree {
  margin: 20px 0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.menu-actions {
  margin-left: 20px;
}

.config-footer {
  margin-top: 20px;
  text-align: right;
}
</style>