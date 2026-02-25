<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <Workspace>
        <slot></slot>
      </Workspace>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Workspace from './Workspace.vue'
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>