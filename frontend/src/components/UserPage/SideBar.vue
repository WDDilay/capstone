<template>
  <div>
    <!-- Added hamburger menu button for mobile devices -->
    <button 
      v-if="isMobile"
      @click="toggleSidebar"
      class="mobile-menu-btn fixed top-4 left-4 z-50 md:hidden"
      :class="{ 'menu-open': !isSidebarCollapsed }"
    >
      <div class="hamburger-lines">
        <span class="line line1"></span>
        <span class="line line2"></span>
        <span class="line line3"></span>
      </div>
    </button>

    <!-- Mobile overlay -->
    <div v-if="!isSidebarCollapsed && isMobile"
         class="fixed inset-0 bg-black bg-opacity-50 z-30"
         @click="toggleSidebar"></div>
         
    <div
      class="sidebar-container transition-all duration-300 ease-in-out"
      :class="{ 
        'sidebar-collapsed': isSidebarCollapsed,
        'mobile-open': !isSidebarCollapsed && isMobile 
      }"
    >
      <!-- Added mobile header with close button -->
      <div v-if="isMobile" class="mobile-header">
        <h3 class="mobile-title">Solo Parent Federation</h3>
        <button @click="toggleSidebar" class="mobile-close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Decorative gradient background -->
      <div class="sidebar-gradient"></div>
      
      <!-- Navigation menu -->
      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <!-- Added click handler to close mobile menu on navigation -->
            <router-link 
              :to="item.path"
              class="nav-link"
              :class="{ active: currentRoute.includes(item.path) }"
              @click="handleNavClick"
            >
              <div class="nav-item-content">
                <div class="nav-icon-wrapper">
                  <component :is="item.icon" class="nav-icon" />
                </div>
                <span v-if="!isSidebarCollapsed || isMobile" class="nav-text">{{ item.title }}</span>
                
                <!-- Enhanced notification badge -->
                <div v-if="item.path === '/user-dashboard/UseMessage' && totalUnreadCount > 0"
                     class="notification-badge"
                     :class="{ 'badge-collapsed': isSidebarCollapsed && !isMobile }">
                  <span>{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</span>
                  <div class="badge-pulse"></div>
                </div>
              </div>
              <div class="nav-link-glow"></div>
            </router-link>
          </li>
          
          <!-- Enhanced logout button -->
          <li>
            <div @click="confirmLogout"
                 class="nav-link logout-link cursor-pointer"
                :class="{ 'justify-center': isSidebarCollapsed && !isMobile }">
              <div class="nav-item-content">
                <div class="nav-icon-wrapper logout-icon-wrapper">
                  <LogOut class="nav-icon" />
                </div>
                <span v-if="!isSidebarCollapsed || isMobile" class="nav-text">Logout</span>
              </div>
              <div class="nav-link-glow logout-glow"></div>
            </div>
          </li>
        </ul>
      </nav>

      <!-- Enhanced sidebar footer -->
      <div class="sidebar-footer" v-if="!isMobile">
        <button @click="toggleSidebar" class="collapse-btn">
          <div class="collapse-btn-inner">
            <ChevronLeft v-if="!isSidebarCollapsed" class="collapse-icon" />
            <ChevronRight v-else class="collapse-icon" />
          </div>
          <div class="collapse-btn-bg"></div>
        </button>
      </div>
    </div>
    
    <!-- PrimeVue ConfirmDialog component -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { auth, db } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import ConfirmDialog from 'primevue/confirmdialog';
import {
  Home,
  Calendar,
  User,
  FileText,
  ClipboardCheck,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const toast = useToast();
const confirm = useConfirm();

const isSidebarCollapsed = ref(false);
const isMobile = ref(window.innerWidth <= 768);

// Message notification state
const currentUser = ref(null);
const totalUnreadCount = ref(0);
let unsubscribeMessages = null;

// Navigation items
const navItems = [
  {
    title: 'Dashboard',
    path: '/user-dashboard/UserPage',
    icon: Home
  },
  {
    title: 'Events',
    path: '/user-dashboard/Events',
    icon: Calendar
  },
  {
    title: 'Feedback',
    path: '/user-dashboard/Feedback',
    icon: FileText
  },
  {
    title: 'Resources',
    path: '/user-dashboard/user_resource',
    icon: FileText
  },
  {
    title: 'Attendance',
    path: '/user-dashboard/Attendance',
    icon: ClipboardCheck
  },
  {
    title: 'Message',
    path: '/user-dashboard/UseMessage',
    icon: FileText
  }
];

const currentRoute = computed(() => route.path);

const handleResize = () => {
  const newIsMobile = window.innerWidth <= 768;
  const wasDesktop = !isMobile.value;
  
  isMobile.value = newIsMobile;
  
  // Auto-collapse on mobile, expand on desktop
  if (newIsMobile) {
    isSidebarCollapsed.value = true;
  } else if (wasDesktop) {
    isSidebarCollapsed.value = false;
  }
};

const handleNavClick = () => {
  if (isMobile.value) {
    isSidebarCollapsed.value = true;
  }
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

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

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
    
    // Remove any additional data from localStorage if needed
    localStorage.removeItem('user-settings');
    
    // Show success toast notification
    toast.add({
      severity: 'success',
      summary: 'Logged Out',
      detail: 'You have been successfully logged out.',
      life: 3000
    });
    
    // Redirect to login page
    await router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'There was a problem logging out.',
      life: 3000
    });
  }
};

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize);
  setupMessageNotifications();
});

onUnmounted(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Enhanced mobile-first responsive design */
.mobile-menu-btn {
  background: linear-gradient(135deg, #800000 0%, #8b0000 100%);
  border: none;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(128, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(128, 0, 0, 0.4);
}

.hamburger-lines {
  width: 24px;
  height: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.line {
  width: 100%;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.menu-open .line1 {
  transform: rotate(45deg) translate(6px, 6px);
}

.menu-open .line2 {
  opacity: 0;
  transform: scaleX(0);
}

.menu-open .line3 {
  transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(128, 0, 0, 0.1);
  background: linear-gradient(135deg, rgba(128, 0, 0, 0.05) 0%, rgba(139, 0, 0, 0.03) 100%);
}

.mobile-title {
  font-size: 18px;
  font-weight: 600;
  color: #800000;
  margin: 0;
}

.mobile-close-btn {
  background: none;
  border: none;
  color: #800000;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-close-btn:hover {
  background: rgba(128, 0, 0, 0.1);
}

.sidebar-container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fdf2f2 0%, #fffeff 100%);
  color: #2d3748;
  height: calc(100vh - 80px); /* Reduced height to account for topbar */
  width: 280px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px rgba(128, 0, 0, 0.1), 0 4px 12px rgba(128, 0, 0, 0.05);
  position: fixed;
  left: 0;
  top: 80px; /* Added top margin to avoid covering topbar */
  z-index: 40;
  border-right: 1px solid rgba(128, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.sidebar-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, rgba(128, 0, 0, 0.05) 0%, rgba(139, 0, 0, 0.03) 100%);
  pointer-events: none;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  text-decoration: none;
  color: #4a5568;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 6px 12px;
  gap: 16px;
  position: relative;
  overflow: hidden;
  font-weight: 500;
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(128, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.nav-link:hover .nav-icon-wrapper {
  background: rgba(128, 0, 0, 0.1);
  transform: translateY(-1px);
}

.nav-link.active .nav-icon-wrapper {
  background: linear-gradient(135deg, #800000 0%, #8b0000 100%);
  box-shadow: 0 4px 12px rgba(128, 0, 0, 0.3);
}

.nav-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.nav-link.active .nav-icon {
  color: white;
}

.nav-link-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(128, 0, 0, 0.05) 0%, rgba(139, 0, 0, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.nav-link:hover .nav-link-glow {
  opacity: 1;
}

.nav-link.active {
  background: linear-gradient(135deg, rgba(128, 0, 0, 0.1) 0%, rgba(139, 0, 0, 0.1) 100%);
  color: #800000;
  border: 1px solid rgba(128, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(128, 0, 0, 0.1);
}

.nav-link.active .nav-link-glow {
  opacity: 1;
  background: linear-gradient(135deg, rgba(128, 0, 0, 0.1) 0%, rgba(139, 0, 0, 0.1) 100%);
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-link {
  color: #e53e3e !important;
  margin-top: 8px;
}

.logout-icon-wrapper {
  background: rgba(239, 68, 68, 0.05) !important;
}

.logout-link:hover .logout-icon-wrapper {
  background: rgba(239, 68, 68, 0.1) !important;
}

.logout-glow {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%) !important;
}

.notification-badge {
  position: relative;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  overflow: hidden;
}

.badge-collapsed {
  right: -8px;
  top: -8px;
  transform: none;
}

.badge-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(128, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(128, 0, 0, 0.02) 0%, rgba(139, 0, 0, 0.01) 100%);
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.collapse-btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.collapse-btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(128, 0, 0, 0.1) 0%, rgba(139, 0, 0, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.collapse-btn:hover .collapse-btn-bg {
  opacity: 1;
}

.collapse-icon {
  width: 20px;
  height: 20px;
  color: #800000;
  transition: all 0.3s ease;
}

.collapse-btn:hover .collapse-icon {
  transform: scale(1.1);
}

/* Enhanced responsive breakpoints and mobile styles */
@media (max-width: 1024px) {
  .sidebar-container {
    width: 260px;
    top: 80px; /* Maintain top spacing on tablet */
    height: calc(100vh - 80px);
  }
  
  .sidebar-collapsed {
    width: 65px;
  }
}

@media (max-width: 768px) {
  .sidebar-container {
    transform: translateX(-100%);
    z-index: 40;
    width: 280px;
    height: 100vh; /* Full height on mobile since topbar behavior may differ */
    top: 0; /* Reset to top on mobile for full overlay */
  }
  
  /* Added mobile-open class to show sidebar on mobile */
  .sidebar-container.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-header {
    padding: 16px 20px;
  }
  
  .mobile-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .sidebar-container {
    width: 100vw;
  }
  
  .mobile-header {
    padding: 16px 20px;
  }
  
  .mobile-title {
    font-size: 16px;
  }
}

@media (max-width: 320px) {
  .nav-link {
    padding: 14px 16px;
    margin: 3px 8px;
  }
  
  .nav-text {
    font-size: 13px;
  }
}

/* Enhanced touch interactions for mobile */
@media (hover: none) and (pointer: coarse) {
  .nav-link {
    -webkit-tap-highlight-color: transparent;
  }
  
  .nav-link:active {
    transform: scale(0.98);
    background: rgba(128, 0, 0, 0.15);
  }
  
  .mobile-menu-btn:active {
    transform: scale(0.95);
  }
}

/* Custom scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(128, 0, 0, 0.05);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(128, 0, 0, 0.2);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 0, 0, 0.3);
}
</style>
