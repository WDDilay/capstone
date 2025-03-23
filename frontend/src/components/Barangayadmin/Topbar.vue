<template>
  <div class="w-full bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <!-- Menu button slot -->
      <slot name="menu-button"></slot>
      <h1 class="text-xl font-semibold">{{ title }}</h1>
    </div>
    <div class="flex items-center gap-4">
      <!-- Notification System -->
      <div class="relative">
        <Button icon="pi pi-bell" 
                text 
                severity="secondary" 
                aria-label="Notification" 
                class="p-button-rounded text-white hover:bg-primary-700"
                @click="toggleNotifications" />
                
        <!-- Notification Badge -->
        <span v-if="unreadCount > 0" 
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
        
        <!-- Notification Panel -->
        <div v-if="showNotifications" 
             class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div class="p-3 border-b flex justify-between items-center">
            <h3 class="font-medium text-gray-800">Notifications</h3>
            <div class="flex gap-2">
              <Button v-if="unreadCount > 0"
                      label="Mark all as read" 
                      link 
                      size="small"
                      class="text-primary-600 p-0"
                      @click="markAllAsRead" />
            </div>
          </div>
          
          <div class="max-h-80 overflow-y-auto">
            <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
              No notifications
            </div>
            
            <div v-for="(notification, index) in notifications" 
                 :key="index"
                 class="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                 :class="{'bg-primary-50': !notification.read}"
                 @click="readNotification(index)">
              <div class="flex gap-3">
                <div class="flex-shrink-0">
                  <i :class="[notification.icon, 'text-xl', notification.iconClass]"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-800">{{ notification.title }}</p>
                  <p class="text-xs text-gray-500">{{ notification.message }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                </div>
                <div v-if="!notification.read" class="w-2 h-2 bg-primary-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div class="p-2 border-t text-center">
            <Button label="View all notifications" 
                    link
                    class="text-primary-600 w-full" />
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="hidden sm:inline">{{ userName }}</span>
        <i class="pi pi-user text-xl"></i>
      </div>
    </div>
  </div>
  
  <!-- Overlay to close notifications when clicking outside -->
  <div v-if="showNotifications" 
       class="fixed inset-0 z-40" 
       @click="showNotifications = false"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import Button from 'primevue/button';
import { auth } from '@/services/firebase'; // Import Firebase auth
import { onAuthStateChanged } from 'firebase/auth';

defineProps({
  title: {
    type: String,
    default: 'Data Information'
  }
});

// User state
const userName = ref('User');

// Notification state
const showNotifications = ref(false);
const notifications = ref([
  {
    title: 'New User Registration',
    message: 'Maria Santos has registered from Poblacion',
    time: '2 minutes ago',
    read: false,
    icon: 'pi pi-user-plus',
    iconClass: 'text-green-500'
  },
  {
    title: 'System Update',
    message: 'The system will undergo maintenance tonight',
    time: '1 hour ago',
    read: false,
    icon: 'pi pi-info-circle',
    iconClass: 'text-blue-500'
  },
  {
    title: 'Account Blocked',
    message: 'Jose Garcia has been blocked',
    time: '3 hours ago',
    read: true,
    icon: 'pi pi-ban',
    iconClass: 'text-red-500'
  },
  {
    title: 'New Announcement',
    message: 'Community meeting scheduled for next week',
    time: 'Yesterday',
    read: true,
    icon: 'pi pi-megaphone',
    iconClass: 'text-orange-500'
  }
]);

// Calculate unread notifications count
const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.read).length;
});

// Toggle notifications panel
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Mark a notification as read
const readNotification = (index) => {
  notifications.value[index].read = true;
};

// Mark all notifications as read
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};

// Close notifications panel when clicking escape key
const handleEscKey = (event) => {
  if (event.key === 'Escape' && showNotifications.value) {
    showNotifications.value = false;
  }
};

// Function to update user name from current auth state
const updateUserName = () => {
  const user = auth.currentUser;
  if (user) {
    // Use displayName if available, otherwise use email or uid
    userName.value = user.displayName || user.email || user.uid;
  } else {
    userName.value = 'User';
  }
};

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
  
  // Set up auth state listener
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      userName.value = user.displayName || user.email || user.uid;
    } else {
      // User is signed out
      userName.value = 'User';
    }
  });
  
  // Initial check for current user
  updateUserName();
  
  // Clean up auth listener on unmount
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscKey);
    unsubscribe();
  });
});
</script>