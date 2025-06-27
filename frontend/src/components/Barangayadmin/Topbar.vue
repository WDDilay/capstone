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
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
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
            <!-- Loading State -->
            <div v-if="isLoadingNotifications" class="p-4 text-center text-gray-500">
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Loading notifications...
            </div>
            
            <!-- No Notifications -->
            <div v-else-if="notifications.length === 0" class="p-4 text-center text-gray-500">
              <i class="pi pi-bell-slash text-2xl mb-2 block"></i>
              No notifications yet
            </div>
            
            <!-- Notifications List -->
            <div v-else>
              <div v-for="(notification, index) in notifications" 
                   :key="notification.id"
                   class="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                   :class="{'bg-primary-50 border-l-4 border-l-primary-500': !notification.read}"
                   @click="handleNotificationClick(notification)">
                <div class="flex gap-3">
                  <div class="flex-shrink-0">
                    <i :class="[notification.icon, 'text-xl', notification.iconClass]"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-800">{{ notification.title }}</p>
                    <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                    <div class="flex justify-between items-center mt-2">
                      <p class="text-xs text-gray-400">{{ notification.time }}</p>
                      <span v-if="notification.status" 
                            :class="getStatusClass(notification.status)"
                            class="text-xs px-2 py-1 rounded-full">
                        {{ notification.status }}
                      </span>
                    </div>
                  </div>
                  <div v-if="!notification.read" class="w-2 h-2 bg-primary-600 rounded-full mt-1"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-2 border-t text-center">
            <Button label="View all notifications" 
                    link
                    class="text-primary-600 w-full"
                    @click="handleViewAll" />
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

  <!-- Notification Details Modal -->
  <div v-if="showNotificationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-4 border-b">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Resource Request Details</h3>
          <button @click="showNotificationModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
      
      <div class="p-4" v-if="selectedNotification">
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-600">From:</label>
            <p class="text-gray-800">Federation President</p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-600">Barangay:</label>
            <p class="text-gray-800">{{ selectedNotification.barangay }}</p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-600">Admin Name:</label>
            <p class="text-gray-800">{{ selectedNotification.adminName }}</p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-600">Resources:</label>
            <p class="text-gray-800">{{ selectedNotification.resourceCount }} items</p>
          </div>
          
          <div v-if="selectedNotification.purpose">
            <label class="text-sm font-medium text-gray-600">Purpose:</label>
            <p class="text-gray-800">{{ selectedNotification.purpose }}</p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-600">Status:</label>
            <span :class="getStatusClass(selectedNotification.status)" 
                  class="inline-block px-2 py-1 rounded-full text-xs">
              {{ selectedNotification.status }}
            </span>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-600">Time:</label>
            <p class="text-gray-800">{{ selectedNotification.time }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t flex justify-end">
        <Button label="Close" 
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                @click="showNotificationModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

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
const showNotificationModal = ref(false);
const selectedNotification = ref(null);
const notifications = ref([]);
const isLoadingNotifications = ref(false);
const notificationListener = ref(null);

// Calculate unread notifications count
const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.read).length;
});

// Get read notifications from localStorage
const getReadNotifications = () => {
  try {
    const stored = localStorage.getItem('readNotifications');
    return new Set(stored ? JSON.parse(stored) : []);
  } catch (error) {
    console.error('Error reading notifications from localStorage:', error);
    return new Set();
  }
};

// Mark notification as read in localStorage
const markNotificationAsRead = (notificationId) => {
  const readNotifications = getReadNotifications();
  readNotifications.add(notificationId);
  localStorage.setItem('readNotifications', JSON.stringify([...readNotifications]));
};

// Format timestamp to relative time
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';

  try {
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return time.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Recently';
  }
};

// Create notification object from request data
const createNotificationFromRequest = (requestData, requestId) => {
  const resourceCount = requestData.requestedItems?.length || 0;
  const resourceText = resourceCount === 1 ? 'resource' : 'resources';
  const readNotifications = getReadNotifications();

  return {
    id: requestId,
    title: 'New Resource Request',
    message: `${resourceCount} ${resourceText} sent to your barangay`,
    time: formatTimeAgo(requestData.createdAt),
    read: readNotifications.has(requestId),
    icon: 'pi pi-box',
    iconClass: 'text-blue-500',
    barangay: requestData.barangay,
    adminName: requestData.adminName,
    resourceCount,
    purpose: requestData.purpose,
    status: requestData.status || 'Pending',
    timestamp: requestData.createdAt
  };
};

// Setup Firebase listener for notifications
const setupNotificationListener = () => {
  isLoadingNotifications.value = true;

  try {
    // Query for all requests - you'll need to filter by barangay based on your existing logic
    const q = query(
      collection(db, 'request_history'),
      orderBy('createdAt', 'desc'),
      limit(50) // Get more to allow for filtering
    );

    notificationListener.value = onSnapshot(q, (snapshot) => {
      const allNotifications = [];
      
      snapshot.forEach((doc) => {
        const notification = createNotificationFromRequest(doc.data(), doc.id);
        allNotifications.push(notification);
      });

      // Sort by timestamp (newest first)
      allNotifications.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
        return timeB - timeA;
      });

      notifications.value = allNotifications;
      isLoadingNotifications.value = false;
    }, (error) => {
      console.error('Error listening to notifications:', error);
      isLoadingNotifications.value = false;
    });

  } catch (error) {
    console.error('Error setting up notification listener:', error);
    isLoadingNotifications.value = false;
  }
};

// Toggle notifications panel
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Handle notification click
const handleNotificationClick = (notification) => {
  // Mark as read
  if (!notification.read) {
    notification.read = true;
    markNotificationAsRead(notification.id);
  }
  
  // Show details modal
  selectedNotification.value = notification;
  showNotificationModal.value = true;
  showNotifications.value = false;
};

// Mark all notifications as read
const markAllAsRead = () => {
  const readNotifications = getReadNotifications();
  
  notifications.value.forEach(notification => {
    if (!notification.read) {
      notification.read = true;
      readNotifications.add(notification.id);
    }
  });
  
  localStorage.setItem('readNotifications', JSON.stringify([...readNotifications]));
};

// Handle view all notifications
const handleViewAll = () => {
  showNotifications.value = false;
  console.log('Navigate to notifications page');
};

// Get status styling class
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Close notifications panel when clicking escape key
const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    if (showNotificationModal.value) {
      showNotificationModal.value = false;
    } else if (showNotifications.value) {
      showNotifications.value = false;
    }
  }
};

// Function to update user name from current auth state
const updateUserName = () => {
  const user = auth.currentUser;
  if (user) {
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
    updateUserName();
    
    if (user) {
      // Setup notification listener when user is authenticated
      setupNotificationListener();
    } else {
      // Clear notifications when user logs out
      notifications.value = [];
      if (notificationListener.value) {
        notificationListener.value();
        notificationListener.value = null;
      }
    }
  });
  
  // Initial check for current user
  updateUserName();
  if (auth.currentUser) {
    setupNotificationListener();
  }
  
  // Clean up on unmount
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscKey);
    if (notificationListener.value) {
      notificationListener.value();
    }
    unsubscribe();
  });
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
