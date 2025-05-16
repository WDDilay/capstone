<template>
  <div class="topbar">
    <div class="left-section">
      <button @click="toggleSidebar" class="menu-toggle">
        <Menu class="icon" />
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="right-section">
      <div class="search-container">
        <Search class="search-icon" />
        <input type="text" placeholder="Search..." class="search-input" />
      </div>

      <div class="notifications">
        <div class="notification-icon" @click="showNotifications = !showNotifications">
          <Bell class="icon" />
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </div>
        
        <!-- Notification dropdown -->
        <div v-if="showNotifications" class="notification-dropdown">
          <div class="dropdown-header">
            <h3>Notifications</h3>
            <button @click="markAllAsRead" class="mark-read-btn">Mark all as read</button>
          </div>
          
          <div v-if="notifications.length === 0" class="empty-notifications">
            No new notifications
          </div>
          
          <div v-else class="notification-list">
            <div 
              v-for="(notification, index) in notifications" 
              :key="index"
              class="notification-item"
              :class="{ unread: !notification.read }"
              @click="readNotification(index)"
            >
              <div class="notification-content">
                <p class="notification-text">{{ notification.message }}</p>
                <span class="notification-time">{{ notification.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="user-profile" @click="showUserMenu = !showUserMenu">
        <img 
          :src="userStore.user?.photoURL || '/placeholder.svg?height=40&width=40'" 
          alt="User Profile" 
          class="profile-image"
        />
        
        <!-- User menu dropdown -->
        <div v-if="showUserMenu" class="user-menu">
          <div class="user-info">
            <img 
              :src="userStore.user?.photoURL || '/placeholder.svg?height=60&width=60'" 
              alt="User Profile" 
              class="menu-profile-image"
            />
            <div class="user-details">
              <h4>{{ userStore.user?.firstName || 'User' }} {{ userStore.user?.lastName || '' }}</h4>
              <p>{{ userStore.user?.email || 'user@example.com' }}</p>
            </div>
          </div>
          
          <div class="menu-items">
            <router-link to="/userdash/profile" class="menu-item" @click="showUserMenu = false">
              <User class="menu-icon" />
              <span>My Profile</span>
            </router-link>
            
            <router-link to="/userdash/settings" class="menu-item" @click="showUserMenu = false">
              <Settings class="menu-icon" />
              <span>Settings</span>
            </router-link>
            
            <button @click="handleLogout" class="menu-item logout">
              <LogOut class="menu-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { signOut } from '@/services/firebase';
import { useToast } from 'primevue/usetoast';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-vue-next';

const props = defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-sidebar']);

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const toast = useToast();

const showNotifications = ref(false);
const showUserMenu = ref(false);
const notifications = ref([
  {
    message: 'New event: Community Support Group at 10 AM',
    time: '2 hours ago',
    read: false
  },
  {
    message: 'Your resource request has been approved',
    time: '1 day ago',
    read: false
  },
  {
    message: 'Registration for summer program now open',
    time: '3 days ago',
    read: true
  }
]);

// Close dropdowns when clicking outside
const closeDropdowns = (event) => {
  if (!event.target.closest('.notifications') && showNotifications.value) {
    showNotifications.value = false;
  }
  
  if (!event.target.closest('.user-profile') && showUserMenu.value) {
    showUserMenu.value = false;
  }
};

// Add event listener for clicks
window.addEventListener('click', closeDropdowns);

// Clean up event listener on component unmount
onBeforeUnmount(() => {
  window.removeEventListener('click', closeDropdowns);
});

// Compute unread notifications count
const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.read).length;
});

// Dynamic page title based on current route
const pageTitle = computed(() => {
  const path = route.path;
  if (path === '/userdash') return 'Dashboard';
  if (path.includes('/events')) return 'Events';
  if (path.includes('/profile')) return 'Profile Settings';
  if (path.includes('/announcements')) return 'Announcements';
  if (path.includes('/messages')) return 'Messages';
  if (path.includes('/resources')) return 'Resource Requests';
  return 'Solo Parent Dashboard';
});

const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const readNotification = (index) => {
  notifications.value[index].read = true;
};

const markAllAsRead = () => {
  notifications.value = notifications.value.map(notification => {
    return { ...notification, read: true };
  });
};

const handleLogout = async () => {
  try {
    await signOut();
    userStore.clearUser();
    toast.add({ 
      severity: 'success', 
      summary: 'Logged Out', 
      detail: 'You have been successfully logged out.', 
      life: 3000 
    });
    router.push('/login');
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
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  height: 64px;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 8px;
  border-radius: 8px;
}

.menu-toggle:hover {
  background-color: rgba(133, 40, 216, 0.1);
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-container {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #666;
}

.search-input {
  width: 100%;
  padding: 8px 8px 8px 36px;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #8528d8;
}

.notifications {
  position: relative;
}

.notification-icon {
  cursor: pointer;
  position: relative;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon:hover {
  background-color: rgba(133, 40, 216, 0.1);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #f44336;
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  margin-top: 8px;
  z-index: 100;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #8528d8;
  font-size: 12px;
  cursor: pointer;
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: rgba(133, 40, 216, 0.05);
}

.notification-item.unread {
  background-color: rgba(133, 40, 216, 0.1);
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-text {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #666;
}

.empty-notifications {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.user-profile {
  position: relative;
  cursor: pointer;
}

.profile-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #8528d8;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  margin-top: 8px;
  z-index: 100;
}

.user-info {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #8528d8;
}

.user-details h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.user-details p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.menu-items {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
}

.menu-item:hover {
  background-color: rgba(133, 40, 216, 0.1);
}

.menu-icon {
  width: 16px;
  height: 16px;
}

.logout {
  color: #f44336;
}

.icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .search-container {
    display: none;
  }
}
</style>