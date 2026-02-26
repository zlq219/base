<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">{{ getAppName() }}</h1>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapse"
      @select="handleMenuSelect"
    >
      <template v-for="item in menuList" :key="item.path">
        <!-- 一级菜单 -->
        <el-menu-item v-if="!item.children" :index="item.path">
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ item.label }}</span>
        </el-menu-item>
        <!-- 二级菜单 -->
        <el-sub-menu v-else :index="item.path">
          <template #title>
            <component :is="item.icon" v-if="item.icon" />
            <span>{{ item.label }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            <component :is="child.icon" v-if="child.icon" />
            <span>{{ child.label }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
    <div class="sidebar-footer">
      <el-button
        type="link"
        icon="el-icon-s-fold"
        @click="isCollapse = !isCollapse"
        class="collapse-btn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userMenuConfig, adminMenuConfig, guestMenuConfig } from '../config/menu'
import { useUserStore } from '../core/store/user'
import { getAppName } from '../config/app'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const userStore = useUserStore()

// 获取当前激活的菜单
const activeMenu = computed(() => {
  return route.path || '/'  
})

// 根据用户角色选择菜单
const menuList = computed(() => {
  let menus = []
  
  // 根据登录状态和角色选择菜单
  if (!userStore.isLoggedIn) {
    // 未登录用户
    menus = [...guestMenuConfig]
  } else if (userStore.isAdmin) {
    // 管理员用户
    menus = [...adminMenuConfig]
  } else {
    // 普通登录用户
    menus = [...userMenuConfig]
  }
  
  // 按order字段排序
  return sortMenus(menus)
})

// 递归排序菜单
const sortMenus = (menus: any[]) => {
  // 按order字段排序
  const sortedMenus = menus.sort((a, b) => {
    return (a.order || 999) - (b.order || 999)
  })
  
  // 递归排序子菜单
  sortedMenus.forEach(menu => {
    if (menu.children && menu.children.length > 0) {
      menu.children = sortMenus(menu.children)
    }
  })
  
  return sortedMenus
}

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  router.push(key)
}

onMounted(() => {
  // 初始化用户状态
  userStore.initialize()
})
</script>

<style scoped lang="scss">
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  &.collapsed {
    width: 64px;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo {
      font-size: 18px;
      font-weight: bold;
      color: #fff;
    }
  }

  .sidebar-menu {
    flex: 1;
    overflow-y: auto;
    background-color: transparent;
  }
}

/* 全局样式覆盖，确保菜单显示清晰 */
:deep(.el-menu) {
  background-color: transparent !important;
  border-right: none !important;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #ffffff !important;
  height: 56px !important;
  line-height: 56px !important;
  margin: 0 10px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
}

/* 调整图标大小 */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon),
:deep(.el-menu-item svg),
:deep(.el-sub-menu__title svg) {
  width: 20px !important;
  height: 20px !important;
  margin-right: 10px !important;
  font-size: 20px !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active),
:deep(.el-sub-menu__title.is-active) {
  color: #fff !important;
  background-color: #1890ff !important;
  font-weight: 600 !important;
}

:deep(.el-sub-menu .el-menu) {
  background-color: rgba(0, 0, 0, 0.3) !important;
}

:deep(.el-sub-menu .el-menu-item) {
  margin: 0 !important;
  padding-left: 60px !important;
  color: #ffffff !important;
  font-weight: 500 !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  color: #fff !important;
  background-color: rgba(24, 144, 255, 0.3) !important;
  font-weight: 600 !important;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .collapse-btn {
    color: rgba(255, 255, 255, 0.7);

    &:hover {
      color: #fff;
    }
  }
}
</style>