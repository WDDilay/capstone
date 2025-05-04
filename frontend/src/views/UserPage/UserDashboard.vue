<template>
  <div class="dashboard-container">
    <Sidebar :class="{ 'sidebar-open': !isSidebarCollapsed }" />
    
    <div class="main-content" :class="{ 'sidebar-open': !isSidebarCollapsed }">
      <Topbar @toggle-sidebar="toggleSidebar" :sidebar-collapsed="isSidebarCollapsed" />
      
      <div class="page-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '@/components/UserPage/SideBar.vue';
import Topbar from '@/components/UserPage/TopBar.vue';

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.main-content {
  flex: 1;
  margin-left: 70px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-open {
  margin-left: 250px;
}

.page-content {
  padding: 24px;
  margin-top: 64px;
}

@media (max-width: 768px) {
  .main-content, .main-content.sidebar-open {
    margin-left: 70px;
  }
}
</style>