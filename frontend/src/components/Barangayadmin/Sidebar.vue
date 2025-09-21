<template>
  <div>
    <!-- Mobile overlay -->
    <div v-if="isOpen"
         class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
         @click="toggleSidebar"></div>
                 
    <aside class="w-64 bg-cream-100 h-screen shadow-lg fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out"
           :class="{
             'translate-x-0': isOpen,
             '-translate-x-full md:translate-x-0': !isOpen
           }">
      <div class="p-4 border-b bg-maroon-800">
        <div class="flex items-center gap-2">
          <img :src="spfLogo" alt="Logo" class="w-8 h-8 rounded-full" />
          <h1 class="text-white text-lg font-semibold">Solo Parent Federation</h1>
        </div>
      </div>
                  
      <nav class="p-4 space-y-2">
        <router-link v-for="item in regularMenuItems"
                     :key="item.path"
                     :to="item.path"
                     class="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-maroon-500 hover:text-black transition-colors relative"
                     :class="{'bg-maroon-500 text-white': isActive(item.path)}">
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
                    
          <!-- Notification badge for messages -->
          <div v-if="item.path === '/barangay-admin/Message' && totalUnreadCount > 0"
                class="notification-badge">
            {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
          </div>
        </router-link>
                        
        <!-- Logout button (separate from router-links) -->
        <div @click="confirmLogout"
             class="flex items-center gap-3 p-3 rounded-lg text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors cursor-pointer">
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
import { auth, db } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import ConfirmDialog from 'primevue/confirmdialog';
import spfLogo from '@/assets/solologo.jpg';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const confirm = useConfirm();

const isOpen = ref(window.innerWidth >= 768); // Default open on desktop, closed on mobile

// Message notification state
const currentUser = ref(null);
const totalUnreadCount = ref(0);
let unsubscribeMessages = null;

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

// Setup message notifications
const setupMessageNotifications = () => {
  currentUser.value = auth.currentUser;
    
  if (!currentUser.value) return;

  const messagesQuery = query(
    collection(db, "messages"),
    where("receiverId", "==", currentUser.value.uid),
    where("read", "==", false),
    orderBy("timestamp", "desc")
  );

  unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
    totalUnreadCount.value = snapshot.size;
  });
};

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

// Set up resize listener
onMounted(() => {
  window.addEventListener('resize', handleResize);
  setupMessageNotifications();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
});
</script>

<style scoped>
.notification-badge {
  background-color: #dc2626;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 8px;
  top: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Custom maroon and cream colors */
.bg-maroon-800 {
  background-color: #7f1d1d;
}

.bg-maroon-500 {
  background-color: #7f1d1d;
}

.hover\:bg-maroon-500:hover {
  background-color: #f18989ff;
}

.bg-cream-100 {
  background-color: #FEF7ED;
}

.hover\:bg-red-100:hover {
  background-color: #be4545ff;
}

.hover\:text-red-800:hover {
  color: #991B1B;
}
</style>