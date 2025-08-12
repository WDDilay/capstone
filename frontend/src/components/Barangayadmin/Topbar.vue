<template>
  <div class="w-full bg-purple-800 text-white px-10 py-8 flex justify-between items-center h-25">
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
                        
            <!-- No Barangay Found -->
            <div v-else-if="!currentUserBarangay" class="p-4 text-center text-red-500">
              <i class="pi pi-exclamation-triangle text-2xl mb-2 block"></i>
              <p class="font-medium">No barangay detected</p>
              <p class="text-xs mt-1">Please check if currentbarangayuser is set</p>
            </div>
                        
            <!-- No Notifications -->
            <div v-else-if="notifications.length === 0" class="p-4 text-center text-gray-500">
              <i class="pi pi-bell-slash text-2xl mb-2 block"></i>
              No notifications for {{ currentUserBarangay }}
              <p class="text-xs mt-2">Waiting for resources sent to your barangay...</p>
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
        <div class="flex items-center gap-1">
          <i class="pi pi-user text-xl"></i>
          <span v-if="currentUserBarangay" class="text-xs bg-primary-700 px-2 py-1 rounded">
            {{ currentUserBarangay }}
          </span>
        </div>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Button from 'primevue/button';
import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const userName = ref('User');
const currentUserBarangay = ref('');
const unsubscribers = ref([]);

// Notification state
const showNotifications = ref(false);
const showNotificationModal = ref(false);
const selectedNotification = ref(null);
const notifications = ref([]);
const isLoadingNotifications = ref(false);
const notificationListener = ref(null);

// Fetch the current user's barangay from Firestore
const fetchUserBarangay = async () => {
  const user = auth.currentUser; // Get the current logged-in user
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid); // Reference to the user document
      const userSnap = await getDoc(userRef); // Fetch the user document
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const barangay = userData.barangay; // Get the barangay from the user document
        currentUserBarangay.value = barangay; // Set the barangay to the reactive variable
        console.log('Barangay fetched from Firestore:', barangay);
      } else {
        console.warn('No user document found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching user barangay from Firestore:', error);
    }
  } else {
    console.log('User is not authenticated.');
  }
};

// Calculate unread notifications count
const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.read).length;
});

// Setup notifications listener from Firestore based on barangay
const setupNotificationListener = () => {
  if (!currentUserBarangay.value) {
    isLoadingNotifications.value = false;
    return;
  }
  isLoadingNotifications.value = true;
  try {
    if (notificationListener.value) {
      notificationListener.value();
    }
    // Fetch announcements made by FederationPresident for the current barangay
    const announcementsQuery = query(
      collection(db, 'announcements'),
      where('createdBy', '==', 'FederationPresident'),
      where('barangay', '==', currentUserBarangay.value),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const announcementsUnsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
      const newAnnouncements = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'announcement',
          title: data.title || 'New Announcement',
          message: data.message || '',
          timestamp: data.createdAt,
          read: false,
          createdBy: data.createdBy,
          barangay: data.barangay,
          icon: 'pi pi-megaphone'
        };
      });
      mergeNotifications(newAnnouncements);
    });
    unsubscribers.value.push(announcementsUnsubscribe);
    // Fetch applications specific to the current barangay
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('barangay', '==', currentUserBarangay.value),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const applicationsUnsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      const newApplications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'application',
          title: 'New Membership Application',
          message: `${data.name || 'Someone'} has applied for membership`,
          timestamp: data.createdAt,
          read: false,
          applicantName: data.name,
          barangay: data.barangay,
          icon: 'pi pi-file'
        };
      });
      mergeNotifications(newApplications);
    });
    unsubscribers.value.push(applicationsUnsubscribe);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    isLoadingNotifications.value = false;
  }
};

// Merge new notifications with existing ones
const mergeNotifications = (newNotifications) => {
  const existingIds = notifications.value.map(n => n.id);
  newNotifications.forEach(notification => {
    if (!existingIds.includes(notification.id)) {
      notifications.value.unshift(notification);
    }
  });
};

// Handle notification click
const handleNotificationClick = (notification) => {
  selectedNotification.value = notification;
  showNotificationModal.value = true;
  showNotifications.value = false;
};

// Mark all notifications as read
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};

// Handle "View All" button click
const handleViewAll = () => {
  showNotifications.value = false;
};

// Toggle notifications panel visibility
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Initialize user state and fetch barangay
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // Fetch the user name and barangay after login
      userName.value = user.displayName || user.email || user.uid;
      fetchUserBarangay(); // Fetch the barangay from Firestore after login
    } else {
      userName.value = 'User'; // Reset to default user name if not authenticated
      currentUserBarangay.value = ''; // Reset barangay if user logs out
    }
  });
  onUnmounted(() => {
    unsubscribe();
    unsubscribers.value.forEach(unsubscribe => unsubscribe());
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