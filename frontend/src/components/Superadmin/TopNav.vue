<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebar';
import { useUserStore } from '@/stores/user';
import { db, auth } from '@/services/firebase';
import { 
  getDoc, 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useConfirm } from 'primevue/useconfirm';

const userStore = useUserStore();
const sidebarStore = useSidebarStore();
const route = useRoute();
const router = useRouter();
const confirm = useConfirm();

const userName = ref('User');
const showNotifications = ref(false);
const showUserMenu = ref(false);
const notifications = ref([]);
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

// Notification listeners/unsubscribers
const unsubscribers = ref([]);

// Fetch user details from Firestore
const fetchUserName = async () => {
  if (userStore.user?.uid) {
    try {
      const userRef = doc(db, 'admins', userStore.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userName.value = userSnap.data().name;
      } else {
        console.warn('User document not found in the admins collection.');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  }
};

// Format relative time for notifications
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  
  // Convert Firebase Timestamp to JS Date if needed
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Set up listeners for different notification types
const setupNotificationListeners = () => {
  if (!userStore.user?.uid) return;
  
  // Clear any existing listeners
  unsubscribers.value.forEach(unsub => unsub());
  unsubscribers.value = [];
  
  // 1. Listen for announcements created by BarangayPresident only
  const announcementsQuery = query(
    collection(db, 'announcements'),
    where('createdBy', '==', 'BarangayPresident'),
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
        read: false, // You might want to track this in a separate collection
        createdBy: data.createdBy,
        icon: 'pi-megaphone'
      };
    });
    
    // Merge with existing notifications, avoiding duplicates
    mergeNotifications(newAnnouncements);
  }, (error) => {
    console.error('Error fetching announcements:', error);
  });
  
  unsubscribers.value.push(announcementsUnsubscribe);
  
  // 2. Listen for upcoming events (events happening today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const eventsQuery = query(
    collection(db, 'events'),
    where('eventDate', '>=', today),
    orderBy('eventDate', 'asc'),
    limit(5)
  );
  
  const eventsUnsubscribe = onSnapshot(eventsQuery, (snapshot) => {
    const newEvents = snapshot.docs.map(doc => {
      const data = doc.data();
      const eventDate = data.eventDate instanceof Timestamp ? data.eventDate.toDate() : new Date(data.eventDate);
      
      // Check if event is today
      const isToday = eventDate.toDateString() === new Date().toDateString();
      
      return {
        id: doc.id,
        type: 'event',
        title: isToday ? `Today: ${data.title || 'Event'}` : data.title || 'Upcoming Event',
        message: data.description || '',
        timestamp: data.createdAt || data.eventDate,
        eventDate: eventDate,
        read: false,
        icon: 'pi-calendar',
        isToday
      };
    });
    
    // Only include events happening today for notifications
    const todayEvents = newEvents.filter(event => event.isToday);
    mergeNotifications(todayEvents);
  }, (error) => {
    console.error('Error fetching events:', error);
  });
  
  unsubscribers.value.push(eventsUnsubscribe);
  
  // 3. Listen for new membership applications
  const applicationsQuery = query(
    collection(db, 'applications'),
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
        icon: 'pi-file'
      };
    });
    
    mergeNotifications(newApplications);
  }, (error) => {
    console.error('Error fetching applications:', error);
  });
  
  unsubscribers.value.push(applicationsUnsubscribe);

  // 4. Listen for pre-registration notifications (new preregistration data)
  const preregistrationQuery = query(
  collection(db, 'preregistration'),
  orderBy('timestamp', 'desc'),
  limit(5)
);

const preregistrationUnsubscribe = onSnapshot(preregistrationQuery, (snapshot) => {
  const newPreregistration = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: 'preregistration',
      title: 'New Pre-registration Request',
      message: `${data.firstName} ${data.lastName} (${data.role || 'Visitor'}) has submitted a pre-registration request. Email: ${data.email}`,
      timestamp: data.timestamp,
      read: false,
      applicantName: `${data.firstName} ${data.lastName}`,
      role: data.role,
      address: data.address,
      contactNumber: data.contactNumber,
      facebookAccount: data.facebookAccount,
      icon: 'pi-id-card'
    };
  });
  
  mergeNotifications(newPreregistration);
}, (error) => {
  console.error('Error fetching preregistration data:', error);
});

unsubscribers.value.push(preregistrationUnsubscribe);
};


// Merge new notifications with existing ones, avoiding duplicates
const mergeNotifications = (newItems) => {
  // Add only notifications that don't already exist (by ID)
  const existingIds = notifications.value.map(n => n.id);
  const uniqueNewItems = newItems.filter(item => !existingIds.includes(item.id));
  
  if (uniqueNewItems.length > 0) {
    notifications.value = [...uniqueNewItems, ...notifications.value]
      .sort((a, b) => {
        const dateA = a.timestamp instanceof Timestamp ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Timestamp ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB - dateA; // Sort by most recent first
      })
      .slice(0, 10); // Keep only the 10 most recent notifications
  }
};

// Mark a notification as read
const markAsRead = (notificationId) => {
  notifications.value = notifications.value.map(notification => {
    if (notification.id === notificationId) {
      return { ...notification, read: true };
    }
    return notification;
  });
  
  // In a real app, you would also update this status in Firestore
  // For example, in a user-specific collection like 'users/{userId}/readNotifications/{notificationId}'
};

// Mark all notifications as read
const markAllAsRead = () => {
  notifications.value = notifications.value.map(notification => {
    return { ...notification, read: true };
  });
  
  // In a real app, update this in Firestore for the user
};

// Navigate to the relevant page when a notification is clicked
const handleNotificationClick = (notification) => {
  markAsRead(notification.id);
  
  // Close the notifications panel
  showNotifications.value = false;
  
  // Navigate based on notification type
  switch (notification.type) {
    case 'announcement':
      router.push('/super-admin/events');  // Navigates to the Events page
      break;
    case 'event':
      router.push(`/super-admin/events/${notification.id}`);  // Navigates to a specific event
      break;
    case 'application':
      router.push(`/super-admin/application/${notification.id}`);  // Navigates to the specific application page
      break;
    case 'preregistration':
      router.push('/super-admin/pre-register');  // Navigates to the Pre-registration page
      break;
    default:
      router.push('/super-admin/notification');  // Default: Go to notifications page
  }
};

// Toggle Notifications and User Menu
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) showNotifications.value = false;
};

// Sign Out Function
const handleSignOut = () => {
  confirm.require({
    message: 'Are you sure you want to sign out?',
    header: 'Sign Out',
    icon: 'pi pi-power-off',
    acceptLabel: 'Sign Out',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-outlined p-button-secondary',
    accept: async () => {
      try {
        await signOut(auth);
        userStore.setUser(null);
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    reject: () => {
      console.log('Sign out cancelled');
    }
  });
};

// Dynamic Page Title
const currentPage = computed(() => {
  const path = route.path;
  if (path.includes('/dashboard')) return 'Dashboard';
  if (path.includes('/members')) return 'Members';
  if (path.includes('/events')) return 'Events';
  if (path.includes('/applications')) return 'Applications';
  if (path.includes('/accounts')) return 'Accounts';
  if (path.includes('/settings')) return 'Settings';
  if (path.includes('/support')) return 'Support';
  if (path.includes('/backup')) return 'Backup & Recovery';
  return 'Dashboard';
});

// Get icon class based on notification type
const getNotificationIcon = (notification) => {
  return notification.icon || 'pi-bell';
};

// Get color class based on notification type
const getNotificationColor = (type) => {
  switch (type) {
    case 'announcement':
      return 'text-purple-500';
    case 'event':
      return 'text-green-500';
    case 'application':
      return 'text-yellow-500';
    default:
      return 'text-blue-500';
  }
};

const user = computed(() => userStore.user);

// Lifecycle hooks
onMounted(() => {
  fetchUserName();
  setupNotificationListeners();
});

onUnmounted(() => {
  // Clean up listeners when component is destroyed
  unsubscribers.value.forEach(unsub => unsub());
});

// Watch for user changes to refresh notifications
watch(user, (newUser) => {
  if (newUser) {
    fetchUserName();
    setupNotificationListeners();
  } else {
    // Clean up listeners if user logs out
    unsubscribers.value.forEach(unsub => unsub());
    notifications.value = [];
  }
});
</script>

<template>
  <div class="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b shadow-md">
    <div class="flex items-center">
      <button @click="sidebarStore.toggle" class="p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition md:hidden">
        <i class="pi pi-bars text-xl"></i>
      </button>
      <h1 class="ml-4 text-xl font-semibold text-gray-800">{{ currentPage }}</h1>
    </div>
    
    <div class="flex items-center gap-6">
      <div class="relative">
        <button @click="toggleNotifications" class="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
          <i class="pi pi-bell text-xl"></i>
          <span v-if="unreadCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>
        <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div class="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-sm font-semibold text-gray-700">Notifications</h3>
            <button 
              v-if="unreadCount > 0" 
              @click="markAllAsRead" 
              class="text-xs text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <template v-if="notifications.length > 0">
              <a 
                v-for="notification in notifications" 
                :key="notification.id"
                href="#" 
                @click.prevent="handleNotificationClick(notification)"
                class="block px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50': !notification.read }"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i :class="['pi', getNotificationIcon(notification), 'text-xl', getNotificationColor(notification.type)]"></i>
                  </div>
                  <div class="ml-3 flex-1">
                    <div class="flex justify-between">
                      <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                      <span v-if="!notification.read" class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    </div>
                    <p v-if="notification.message" class="text-xs text-gray-700 mt-1 line-clamp-2">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatRelativeTime(notification.timestamp) }}</p>
                  </div>
                </div>
              </a>
            </template>
            <div v-else class="py-8 text-center text-gray-500">
              <i class="pi pi-inbox text-3xl mb-2"></i>
              <p>No notifications</p>
            </div>
          </div>
          <a href="#" @click.prevent="router.push('/super-admin/notification')" class="block text-center text-sm font-medium text-blue-600 bg-gray-50 p-2 hover:bg-gray-100">
            View all notifications
          </a>
        </div>
      </div>
      <div class="relative">
        <button @click="toggleUserMenu" class="flex items-center text-sm font-medium text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg transition">
          <span>{{ userName }}</span>
          <i class="pi pi-chevron-down ml-2 text-sm"></i>
        </button>
        <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
          <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
            <i class="pi pi-user mr-2"></i> Profile
          </a>
          <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
            <i class="pi pi-cog mr-2"></i> Settings
          </a>
          <div class="border-t border-gray-100"></div>
          <button @click="handleSignOut" class="relative block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition group">
            <i class="pi pi-sign-out mr-2"></i> Sign out
            <span class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <i class="pi pi-arrow-right text-red-500"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog />
</template>

<style>
/* Enhanced Styling for PrimeVue ConfirmDialog */
.p-dialog {
  border-radius: 12px !important;
  box-shadow: 0px 15px 35px rgba(0, 0, 0, 0.2) !important;
  overflow: hidden !important;
  border: none !important;
  max-width: 400px !important;
}

.p-dialog .p-dialog-header {
  background-color: white !important;
  padding: 1.5rem 1.5rem 0.75rem !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #111827 !important; /* Dark text */
  border-bottom: none !important;
}

.p-dialog .p-dialog-content {
  padding: 0.75rem 1.5rem 1.5rem !important;
  font-size: 1rem !important;
  color: #4b5563 !important;
  background-color: white !important;
}

.p-dialog .p-dialog-footer {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 0.75rem !important;
  padding: 1rem 1.5rem 1.5rem !important;
  border-top: none !important;
  background-color: white !important;
}

/* Icon styling */
.p-confirm-dialog-icon {
  font-size: 1.5rem !important;
  color: #ef4444 !important;
  margin-right: 0.75rem !important;
  background-color: rgba(239, 68, 68, 0.1) !important;
  padding: 0.75rem !important;
  border-radius: 50% !important;
}

/* Customize Buttons */
.p-confirm-dialog-accept {
  background-color: #ef4444 !important; /* Red for danger */
  border: none !important;
  padding: 0.625rem 1.25rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2) !important;
}

.p-confirm-dialog-accept:hover {
  background-color: #dc2626 !important; /* Darker red on hover */
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25) !important;
}

.p-confirm-dialog-reject {
  background-color: transparent !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  padding: 0.625rem 1.25rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  transition: all 0.2s ease !important;
}

.p-confirm-dialog-reject:hover {
  background-color: #f3f4f6 !important;
  border-color: #9ca3af !important;
}

/* Animation for dialog */
.p-dialog-enter-active {
  transition: all 0.3s ease-out !important;
}

.p-dialog-leave-active {
  transition: all 0.2s ease-in !important;
}

.p-dialog-enter-from,
.p-dialog-leave-to {
  opacity: 0 !important;
  transform: scale(0.95) !important;
}

/* Overlay styling */
.p-dialog-mask {
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(2px) !important;
}

/* Additional styles for notifications */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>