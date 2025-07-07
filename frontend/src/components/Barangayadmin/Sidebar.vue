<template>
  <div>
    <!-- Mobile overlay -->
    <div v-if="isOpen" 
         class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
         @click="toggleSidebar"></div>
         
    <aside class="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out"
           :class="{
             'translate-x-0': isOpen,
             '-translate-x-full md:translate-x-0': !isOpen
           }">
      <div class="p-4 border-b">
        <div class="flex items-center gap-2">
          <img :src="spfLogo" alt="Logo" class="w-8 h-8 rounded-full" />
          <h1 class="text-primary-600 text-lg font-semibold">Solo Parent Federation</h1>
        </div>
      </div>
      
      <nav class="p-4 space-y-2">
        <router-link v-for="item in regularMenuItems" 
                     :key="item.path" 
                     :to="item.path"
                     class="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                     :class="{'bg-primary-50 text-primary-600': isActive(item.path)}">
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
        
        <!-- Logout button (separate from router-links) -->
        <div @click="confirmLogout" 
             class="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer">
          <i class="pi pi-sign-out"></i>
          <span>Logout</span>
        </div>
      </nav>
    </aside>
    
    <!-- PrimeVue ConfirmDialog component -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';
import spfLogo from '@/assets/SPFLOGO.png';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const confirm = useConfirm();
const isOpen = ref(window.innerWidth >= 768); // Default open on desktop, closed on mobile

// Watch for window resize to handle responsive behavior
const handleResize = () => {
  if (window.innerWidth >= 768) {
    isOpen.value = true;
  } else if (!wasManuallyToggled.value) {
    isOpen.value = false;
  }
};

// Track if sidebar was manually toggled
const wasManuallyToggled = ref(false);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  wasManuallyToggled.value = true;
  
  // Reset the manual toggle flag after a delay
  setTimeout(() => {
    wasManuallyToggled.value = false;
  }, 1000);
};

// Set up resize listener
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Regular menu items (excluding logout)
const regularMenuItems = [
  { label: 'Dashboard', path: '/barangay-admin/dashboard', icon: 'pi pi-home' },
  { label: 'Data Information', path: '/barangay-admin/data', icon: 'pi pi-database' },
  { label: 'Application', path: '/barangay-admin/application', icon: 'pi pi-file' },
  { label: 'Announcement', path: '/barangay-admin/announcements', icon: 'pi pi-megaphone' },
  { label: 'Create Attendance', path: '/barangay-admin/attendance_form', icon: 'pi pi-calendar' },
  { label: 'Resource Inventory', path: '/barangay-admin/BarangayInventory', icon: 'pi pi-box' },
  { label: 'Message', path: '/barangay-admin/Message', icon: 'pi pi-comments' },
  { label: 'Block', path: '/barangay-admin/Block', icon: 'pi pi-ban' }
];

// Show PrimeVue confirmation dialog
const confirmLogout = () => {
  confirm.require({
    message: 'Are you sure you want to log out?',
    header: 'Logout Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => handleLogout(),
    reject: () => {
      // User canceled logout - do nothing
    }
  });
};

// Logout handler function
const handleLogout = async () => {
  try {
    // Clear user data from store
    userStore.clearUser();
    
    // Remove any additional data from localStorage
    localStorage.removeItem('barangay');
    
    // Redirect to login page
    await router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const isActive = (path) => route.path === path;

defineExpose({ toggleSidebar, isOpen });
</script>