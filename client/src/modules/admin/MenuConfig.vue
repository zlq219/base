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

    <!-- 添加/编辑菜单项对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuRules"
        label-width="80px"
      >
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入菜单路径，如 /dashboard" />
        </el-form-item>
        <el-form-item label="菜单名称" prop="label">
          <el-input v-model="menuForm.label" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="menuForm.icon" placeholder="请输入图标名称，如 el-icon-s-home" />
        </el-form-item>
        <el-form-item label="角色权限">
          <el-select
            v-model="menuForm.roles"
            multiple
            placeholder="请选择角色权限"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="父菜单">
          <el-select
            v-model="menuForm.parentPath"
            placeholder="选择父菜单（可选）"
          >
            <el-option label="无（作为一级菜单）" value="" />
            <el-option
              v-for="item in menuData"
              :key="item.path"
              :label="item.label"
              :value="item.path"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveMenuItem">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { menuConfig } from '../../config/menu'

// 菜单数据
const menuData = ref([...menuConfig])

// 树节点配置
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加菜单项')
const menuFormRef = ref()

// 表单数据
const menuForm = reactive({
  path: '',
  label: '',
  icon: '',
  roles: [] as string[],
  parentPath: ''
})

// 表单验证规则
const menuRules = {
  path: [
    { required: true, message: '请输入菜单路径', trigger: 'blur' },
    { pattern: /^\/[a-zA-Z0-9\-\/]+$/, message: '路径必须以 / 开头，只能包含字母、数字、- 和 /', trigger: 'blur' }
  ],
  label: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ]
}

// 编辑中的菜单项
const editingItem = ref<any>(null)

// 添加菜单项
const addMenuItem = () => {
  dialogTitle.value = '添加菜单项'
  editingItem.value = null
  Object.assign(menuForm, {
    path: '',
    label: '',
    icon: '',
    roles: [],
    parentPath: ''
  })
  dialogVisible.value = true
}

// 编辑菜单项
const editMenuItem = (data: any) => {
  dialogTitle.value = '编辑菜单项'
  editingItem.value = data
  Object.assign(menuForm, {
    path: data.path,
    label: data.label,
    icon: data.icon || '',
    roles: data.roles || [],
    parentPath: ''
  })
  dialogVisible.value = true
}

// 删除菜单项
const deleteMenuItem = async (path: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该菜单项吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 递归删除菜单项
    const deleteItem = (items: any[]) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === path) {
          items.splice(i, 1)
          return true
        }
        if (items[i].children) {
          if (deleteItem(items[i].children)) {
            return true
          }
        }
      }
      return false
    }

    if (deleteItem(menuData.value)) {
      ElMessage.success('菜单项删除成功')
    } else {
      ElMessage.error('菜单项不存在')
    }
  } catch (error) {
    // 用户取消删除
  }
}

// 保存菜单项
const handleSaveMenuItem = async () => {
  if (!menuFormRef.value) return
  await menuFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (editingItem.value) {
        // 编辑现有菜单项
        const updateItem = (items: any[]) => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].path === editingItem.value.path) {
              items[i].label = menuForm.label
              items[i].icon = menuForm.icon
              items[i].roles = menuForm.roles.length > 0 ? menuForm.roles : undefined
              return true
            }
            if (items[i].children) {
              if (updateItem(items[i].children)) {
                return true
              }
            }
          }
          return false
        }

        if (updateItem(menuData.value)) {
          ElMessage.success('菜单项更新成功')
        } else {
          ElMessage.error('菜单项不存在')
        }
      } else {
        // 添加新菜单项
        const newItem: any = {
          path: menuForm.path,
          label: menuForm.label
        }
        if (menuForm.icon) {
          newItem.icon = menuForm.icon
        }
        if (menuForm.roles.length > 0) {
          newItem.roles = menuForm.roles
        }

        if (menuForm.parentPath) {
          // 添加为子菜单项
          const findParent = (items: any[]) => {
            for (let i = 0; i < items.length; i++) {
              if (items[i].path === menuForm.parentPath) {
                if (!items[i].children) {
                  items[i].children = []
                }
                items[i].children.push(newItem)
                return true
              }
              if (items[i].children) {
                if (findParent(items[i].children)) {
                  return true
                }
              }
            }
            return false
          }

          if (findParent(menuData.value)) {
            ElMessage.success('子菜单项添加成功')
          } else {
            ElMessage.error('父菜单不存在')
          }
        } else {
          // 添加为一级菜单项
          menuData.value.push(newItem)
          ElMessage.success('菜单项添加成功')
        }
      }
      dialogVisible.value = false
    }
  })
}

// 保存配置
const saveMenuConfig = () => {
  // 这里可以添加保存到后端的逻辑
  // 暂时只在前端保存
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