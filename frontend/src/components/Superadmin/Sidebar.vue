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
        <router-link v-for="item in filteredMenuItems" 
                     :key="item.path" 
                     :to="item.path"
                     class="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                     :class="{'bg-primary-50 text-primary-600': isActive(item.path)}">
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import spfLogo from '@/assets/SPFLOGO.png';
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const isOpen = ref(window.innerWidth >= 768); // Default open on desktop, closed on mobile
const currentUser = ref(null);

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
  
  // Set up auth state listener
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    
    // If user is not logged in and trying to access protected route, redirect to login
    if (!user && route.meta.requiresAuth) {
      router.push('/login');
    }
  });
  
  // Clean up auth listener on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    unsubscribe();
  });
});

const menuItems = [
  { label: 'Dashboard', path: '/barangay-admin/dashboard', icon: 'pi pi-home' },
  { label: 'Data Information', path: '/barangay-admin/data', icon: 'pi pi-database' },
  { label: 'Announcement', path: '/barangay-admin/announcement', icon: 'pi pi-megaphone' },
  { label: 'Resource Inventory', path: '/barangay-admin/inventory', icon: 'pi pi-box' },
  { label: 'Message', path: '/barangay-admin/messages', icon: 'pi pi-comments' },
  { label: 'Block', path: '/barangay-admin/block', icon: 'pi pi-ban' },
  { label: 'Logout', path: '/logout', icon: 'pi pi-sign-out' }
];

// Only show menu items if user is authenticated
const filteredMenuItems = computed(() => {
  return currentUser.value ? menuItems : [];
});

const isActive = (path) => route.path === path;

defineExpose({ toggleSidebar, isOpen });
</script>