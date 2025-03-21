<template>
    <div class="min-h-screen bg-gray-50">
      <Sidebar ref="sidebarRef" />
      
      <div class="lg:ml-64 min-h-screen flex flex-col">
        <Topbar :title="currentRoute" />
        
        <!-- Mobile menu button -->
        <button @click="toggleSidebar"
                class="lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary-600 text-white shadow-lg">
          <i class="pi pi-bars"></i>
        </button>
        
        <!-- Main content -->
        <main class="flex-1 p-4">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import Sidebar from '@/components/Barangayadmin/Sidebar.vue';
  import Topbar from '@/components/Barangayadmin/Topbar.vue';
  
  const route = useRoute();
  const sidebarRef = ref(null);
  
  const currentRoute = computed(() => {
    return route.name || 'Dashboard';
  });
  
  const toggleSidebar = () => {
    sidebarRef.value?.toggleSidebar();
  };
  </script>