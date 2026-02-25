<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">基础应用</h1>
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
import { menuConfig } from '../config/menu'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// 获取当前激活的菜单
const activeMenu = computed(() => {
  return route.path || '/'  
})

// 根据用户权限过滤菜单
const menuList = computed(() => {
  // 这里可以根据用户角色过滤菜单
  // 暂时返回全部菜单
  return menuConfig
})

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  router.push(key)
}

onMounted(() => {
  // 可以在这里添加初始化逻辑
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

    .el-menu {
      background-color: transparent;
      border-right: none;

      .el-menu-item,
      .el-sub-menu__title {
        color: rgba(255, 255, 255, 0.7);
        height: 56px;
        line-height: 56px;
        margin: 0 10px;
        border-radius: 6px;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        &.is-active {
          color: #fff;
          background-color: #1890ff;
        }
      }

      .el-sub-menu .el-menu {
        background-color: rgba(0, 0, 0, 0.3);

        .el-menu-item {
          margin: 0;
          padding-left: 40px !important;
        }
      }
    }
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
}
</style>