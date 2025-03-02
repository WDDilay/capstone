<template>
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <div class="flex flex-col flex-1 min-h-screen transition-all duration-300"
     :class="{ 'ml-72': !sidebarStore.collapsed, 'ml-16': sidebarStore.collapsed }">

        <!-- Top Navigation -->
        <TopNav />
        
        <!-- Page Content -->
        <div class="p-4 md:p-6">
          <router-view /> <!-- Loads Dashboard or other components dynamically -->
        </div>
      </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Sidebar from '@/components/Superadmin/Sidebar.vue';
import TopNav from '@/components/Superadmin/TopNav.vue';
import { useSidebarStore } from '@/stores/sidebar';

const sidebarStore = useSidebarStore();

onMounted(() => {
  document.title = 'Solo Parent System - Admin Dashboard';
});
</script>
