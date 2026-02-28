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
        type="primary"
        icon="el-icon-s-fold"
        @click="isCollapse = !isCollapse"
        class="collapse-btn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
  // 强制从localStorage重新读取状态，确保与其他标签页同步
  const adminToken = localStorage.getItem('adminToken')
  const userToken = localStorage.getItem('token')
  
  // 依赖userStore的状态，确保状态变化时重新计算
  const isLoggedIn = userStore.isLoggedIn
  const isAdminLoggedIn = userStore.isAdminLoggedIn
  
  console.log('Sidebar菜单计算：adminToken存在', !!adminToken)
  console.log('Sidebar菜单计算：userToken存在', !!userToken)
  console.log('Sidebar菜单计算：userStore.isLoggedIn', isLoggedIn)
  console.log('Sidebar菜单计算：userStore.isAdminLoggedIn', isAdminLoggedIn)
  console.log('Sidebar菜单计算：当前路径', route.path)
  
  // 检查当前路径
  if (route.path.startsWith('/admin')) {
    // 当前路径是管理员路径，检查是否有adminToken
    if (adminToken) {
      // 有adminToken，显示管理员菜单
      menus = [...adminMenuConfig]
      console.log('Sidebar菜单计算：当前在管理员系统且有adminToken，显示管理员菜单')
    } else {
      // 没有adminToken，显示访客菜单
      menus = [...guestMenuConfig]
      console.log('Sidebar菜单计算：当前在管理员系统但没有adminToken，显示访客菜单')
    }
  } else {
    // 当前路径是普通用户路径，检查是否有userToken
    if (userToken) {
      // 有userToken，显示普通用户菜单
      menus = [...userMenuConfig]
      console.log('Sidebar菜单计算：当前在普通用户系统且有userToken，显示普通用户菜单')
      console.log('Sidebar菜单计算：userToken值', userToken.substring(0, 20) + '...')
    } else {
      // 没有userToken，显示访客菜单
      menus = [...guestMenuConfig]
      console.log('Sidebar菜单计算：当前在普通用户系统但没有userToken，显示访客菜单')
    }
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

// 监听路由变化，确保菜单及时更新
watch(() => route.path, () => {
  console.log('路由变化，重新计算菜单')
  // 强制重新计算菜单
  menuList.value = sortMenus(menuList.value)
})

// 监听localStorage变化，确保菜单及时响应登录状态变化
onMounted(() => {
  // 初始化用户状态
  userStore.initialize()
  
  // 监听localStorage变化，确保菜单及时响应登录状态变化
  window.addEventListener('storage', (event) => {
    console.log('收到localStorage变化事件:', event.key, ' newValue:', event.newValue, ' oldValue:', event.oldValue)
    // 当登录状态相关数据变化时，重新计算菜单
    if (event.key === 'token' || event.key === 'adminToken' || event.key === 'userInfo' ||
        event.key === 'token_sync' || event.key === 'adminToken_sync' || event.key === 'userInfo_sync') {
      console.log('登录状态相关数据变化，重新初始化用户状态')
      // 强制重新初始化用户状态
      userStore.initialize()
      // 菜单会自动重新计算，因为它依赖于localStorage的状态
      console.log('令牌同步成功，菜单已更新')
      console.log('同步后的状态：')
      console.log('adminToken (localStorage):', !!localStorage.getItem('adminToken'))
      console.log('token (localStorage):', !!localStorage.getItem('token'))
      console.log('userInfo:', !!localStorage.getItem('userInfo'))
    }
  })
  
  // 添加定期检查，确保菜单状态与localStorage保持同步
  setInterval(() => {
    const adminToken = localStorage.getItem('adminToken')
    const userToken = localStorage.getItem('token')
    const userInfoStr = localStorage.getItem('userInfo')
    
    console.log('定期检查登录状态：')
    console.log('localStorage adminToken:', !!adminToken)
    console.log('localStorage userToken:', !!userToken)
    console.log('localStorage userInfo:', !!userInfoStr)
    console.log('store adminToken:', !!userStore.adminToken)
    console.log('store userToken:', !!userStore.token)
    console.log('store isLoggedIn:', userStore.isLoggedIn)
    console.log('store isAdmin:', userStore.isAdmin)
    
    // 检查当前store中的token与localStorage中的token是否一致
    if (adminToken !== userStore.adminToken || userToken !== userStore.token) {
      console.log('登录状态不一致，重新初始化')
      userStore.initialize()
      // 菜单会自动重新计算，因为它依赖于userStore的状态
    }
  }, 1000) // 每1秒检查一次
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
      margin-bottom: 10px;
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
:deep(.el-sub-menu__title svg),
:deep(.el-menu-item component),
:deep(.el-sub-menu__title component),
:deep(.el-menu-item > *:first-child:not(.el-icon)),
:deep(.el-sub-menu__title > *:first-child:not(.el-icon)) {
  width: 20px !important;
  height: 20px !important;
  margin-right: 10px !important;
  font-size: 20px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  min-width: 20px !important;
  min-height: 20px !important;
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

/* 确保菜单项内容对齐 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  display: flex !important;
  align-items: center !important;
  padding-left: 20px !important;
}

:deep(.el-sub-menu .el-menu-item) {
  padding-left: 60px !important;
}
</style>