<template>
  <div class="dashboard-container">
    <Sidebar :class="{ 'sidebar-open': !isSidebarCollapsed }" />
    
    <div class="main-content" :class="{ 'sidebar-open': !isSidebarCollapsed }">
      <Topbar @toggle-sidebar="toggleSidebar" :sidebar-collapsed="isSidebarCollapsed" />
      
      <div class="page-content">
        <div class="content-wrapper">
          <router-view></router-view>
        </div>
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
  min-height: 150vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  position: relative;
}

.main-content {
  flex: 1;
  margin-left: 70px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100vh;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.main-content.sidebar-open {
  margin-left: 280px;
}

.page-content {
  flex: 1;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-open {
    margin-left: 0;
  }
  
  .page-content {
    padding: 20px 16px;
    min-height: 100vh;
  }
  
  .content-wrapper {
    padding: 0;
  }
}
</style>
