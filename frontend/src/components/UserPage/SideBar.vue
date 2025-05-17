<template>
  <div>
    <!-- Mobile overlay -->
    <div v-if="isSidebarCollapsed" 
         class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
         @click="toggleSidebar"></div>
         
    <div 
      class="sidebar-container transition-all duration-300 ease-in-out"
      :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
    >
      <!-- User profile summary -->
      <div class="sidebar-profile">
        <div class="profile-image">
          <img 
            :src="userStore.user?.photoURL || '/placeholder.svg?height=50&width=50'" 
            alt="Profile Image"
          />
        </div>
        <div v-if="!isSidebarCollapsed" class="profile-info">
          <h3>{{ userStore.user?.firstName || 'Solo Parent' }}</h3>
          <p>Member</p>
        </div>
      </div>

      <!-- Navigation menu -->
      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="nav-link"
              :class="{ active: currentRoute.includes(item.path) }"
            >
              <component :is="item.icon" class="nav-icon" />
              <span v-if="!isSidebarCollapsed" class="nav-text">{{ item.title }}</span>
            </router-link>
          </li>
          
          <!-- Logout button (separate from router-links) -->
          <li>
            <div @click="confirmLogout" 
                class="nav-link logout-link cursor-pointer"
                :class="{ 'justify-center': isSidebarCollapsed }">
              <LogOut class="nav-icon" />
              <span v-if="!isSidebarCollapsed" class="nav-text">Logout</span>
            </div>
          </li>
        </ul>
      </nav>

      <!-- Sidebar footer with collapse button -->
      <div class="sidebar-footer">
        <button @click="toggleSidebar" class="collapse-btn">
          <ChevronLeft v-if="!isSidebarCollapsed" />
          <ChevronRight v-else />
        </button>
      </div>
    </div>
    
    <!-- PrimeVue ConfirmDialog component -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';
import { 
  Home, 
  Calendar, 
  User, 
  FileText, 
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
    title: 'Profile', 
    path: '/user-dashboard/Profile', 
    icon: User 
  },
  { 
    title: 'Resources', 
    path: '/user-dashboard/user_resource', 
    icon: FileText 
  },
  { 
    title: 'Attendance', 
    path: '/user-dashboard/Attendance', 
    icon: FileText 
  },
  { 
    title: 'Settings', 
    path: '/user-dashboard/user_settings', 
    icon: FileText 
  }
];

const currentRoute = computed(() => route.path);

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
    // For example, you might want to remove user-specific settings
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
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  background-color: white;
  color: #333;
  height: 100vh;
  width: 250px;
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 995;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-profile {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.profile-image img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #8528d8;
}

.profile-info h3 {
  font-size: 16px;
  margin: 0;
  color: #333;
}

.profile-info p {
  font-size: 12px;
  margin: 0;
  color: #666;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
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
  padding: 12px 20px;
  text-decoration: none;
  color: #333;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 8px;
  gap: 12px;
}

.nav-link:hover {
  background-color: rgba(133, 40, 216, 0.1);
  color: #8528d8;
}

.nav-link.active {
  background-color: #8528d8;
  color: white;
}

.logout-link {
  color: #f44336;
}

.logout-link:hover {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.collapse-btn:hover {
  background-color: rgba(133, 40, 216, 0.1);
}

@media (max-width: 768px) {
  .sidebar-container {
    transform: translateX(-100%);
  }
  
  .sidebar-container.sidebar-collapsed {
    transform: translateX(0);
    width: 250px;
  }
  
  .nav-text, .profile-info {
    display: block;
  }
}
</style>