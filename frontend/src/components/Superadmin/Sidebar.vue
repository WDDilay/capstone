<template>
  <div class="fixed top-0 left-0 z-40 h-screen transition-all duration-300"
       :class="{ 'w-72': !sidebarStore.collapsed, 'w-16': sidebarStore.collapsed }">
    <div class="h-full px-3 py-4 overflow-y-auto bg-primary text-white">
      <div class="flex items-center justify-between mb-5 pl-2">
        <div class="flex items-center gap-3" v-if="!sidebarStore.collapsed">
          <img :src="spfLogo" alt="Logo" class="w-8 h-8" />
          <span class="text-xl font-semibold whitespace-nowrap">Solo Parent</span>
        </div>
        <button @click="sidebarStore.toggle" class="p-1 rounded-lg hover:bg-primary-600 focus:outline-none">
          <i :class="sidebarStore.collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" class="text-xl"></i>
        </button>
      </div>
      
      <ul class="space-y-2 font-medium">
        <li v-for="(item, index) in menuItems" :key="index">
          <router-link :to="item.route" class="flex items-center p-2 rounded-lg hover:bg-primary-600 group"
             :class="{ 'justify-center': sidebarStore.collapsed }">
            <i :class="item.icon" class="text-xl"></i>
            <span class="ml-3" v-if="!sidebarStore.collapsed">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSidebarStore } from '@/stores/sidebar';
import spfLogo from '@/assets/SPFLOGO.png'; // Import the logo

const sidebarStore = useSidebarStore();

const menuItems = ref([
  { name: 'Dashboard', icon: 'pi pi-home', route: '/super-admin/super-dashboard' },
  { name: 'Members', icon: 'pi pi-users', route: '/super-admin/members' },
  { name: 'Events', icon: 'pi pi-calendar', route: '/super-admin/events' },
  { name: 'Applications', icon: 'pi pi-file', route: '/super-admin/application' },
  { name: 'Notification', icon: 'pi pi-bell', route: '/super-admin/notification' },
  { name: 'Resources', icon: 'pi pi-envelope', route: '/super-admin/resources' },
  { name: 'Accounts', icon: 'pi pi-user', route: '/super-admin/accounts' },
  { name: 'Settings', icon: 'pi pi-cog', route: '/super-admin/settings' },
  { name: 'Support', icon: 'pi pi-question-circle', route: '/super-admin/support' },
  { name: 'Backup & Recovery', icon: 'pi pi-database', route: '/superadmin/backup' },
]);
</script>

