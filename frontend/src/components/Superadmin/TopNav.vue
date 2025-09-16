<template>
  <div class="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-maroon-700 border-b border-maroon-700 shadow-lg">
    <div class="flex items-center">
      <button @click="sidebarStore.toggle" class="p-2 rounded-lg text-maroon-100 hover:bg-maroon-500 transition md:hidden">
        <i class="pi pi-bars text-lg sm:text-xl"></i>
      </button>
    </div>
        
    <div class="flex items-center gap-2 sm:gap-4 lg:gap-6">
      <!-- Notifications -->
      <div class="relative">
        <button @click="toggleNotifications" class="p-2 sm:p-3 rounded-full text-maroon-100 hover:bg-maroon-500 focus:outline-none transition-colors">
          <i class="pi pi-bell text-lg sm:text-xl"></i>
          <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-xs font-bold text-white bg-red-600 rounded-full">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>
        <!-- Made notifications dropdown responsive with proper mobile sizing -->
        <div v-if="showNotifications" class="absolute right-0 mt-2 w-72 sm:w-80 lg:w-96 bg-white rounded-md shadow-lg overflow-hidden z-50 max-w-[calc(100vw-2rem)]">
          <div class="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-sm font-semibold text-gray-700">Notifications</h3>
            <button 
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-xs text-maroon-600 hover:text-maroon-800 px-2 py-1 rounded hover:bg-maroon-50 transition-colors"
            >
              Mark all as read
            </button>
          </div>
          <div class="max-h-64 sm:max-h-80 overflow-y-auto">
            <template v-if="notifications.length > 0">
              <a 
                v-for="notification in notifications"
                :key="notification.id"
                href="#"
                @click.prevent="handleNotificationClick(notification)"
                class="block px-3 sm:px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation"
                :class="{ 'bg-maroon-50': !notification.read }"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    <i :class="['pi', getNotificationIcon(notification), 'text-base sm:text-lg', getNotificationColor(notification.type)]"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start gap-2">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ notification.title }}</p>
                      <span v-if="!notification.read" class="inline-block w-2 h-2 bg-maroon-500 rounded-full flex-shrink-0 mt-1"></span>
                    </div>
                    <p v-if="notification.message" class="text-xs text-gray-700 mt-1 line-clamp-2">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatRelativeTime(notification.timestamp) }}</p>
                  </div>
                </div>
              </a>
            </template>
            <div v-else class="py-8 text-center text-gray-500">
              <i class="pi pi-inbox text-2xl sm:text-3xl mb-2"></i>
              <p class="text-sm">No notifications</p>
            </div>
          </div>
          <a href="#" @click.prevent="router.push('/super-admin/notification')" class="block text-center text-sm font-medium text-maroon-600 bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
            View all notifications
          </a>
        </div>
      </div>
      
      <!-- User Menu -->
      <div class="relative">
        <!-- Made user menu button more responsive with better mobile sizing -->
        <button @click="toggleUserMenu" class="flex items-center text-sm sm:text-base lg:text-lg font-medium text-white hover:bg-maroon-500 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg transition-colors min-w-0">
          <span class="truncate max-w-[120px] sm:max-w-none">{{ userName }}</span>
          <i class="pi pi-chevron-down ml-1 sm:ml-2 text-sm sm:text-lg flex-shrink-0"></i>
        </button>
        <!-- Made user dropdown responsive with proper mobile positioning -->
        <div v-if="showUserMenu" class="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
          <a href="#" class="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-700 hover:bg-maroon-50 transition touch-manipulation">
            <i class="pi pi-user mr-2 text-maroon-600 text-sm"></i> 
            <span>Profile</span>
          </a>
          <a href="#" class="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-700 hover:bg-maroon-50 transition touch-manipulation">
            <i class="pi pi-cog mr-2 text-maroon-600 text-sm"></i> 
            <span>Settings</span>
          </a>
          <div class="border-t border-gray-100"></div>
          <button @click="handleSignOut" class="relative flex items-center w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-sm text-red-600 hover:bg-red-50 transition group touch-manipulation">
            <i class="pi pi-sign-out mr-2 text-sm"></i> 
            <span>Sign out</span>
            <span class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <i class="pi pi-arrow-right text-red-500 text-xs"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog />
</template>

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
      return 'text-maroon-500';
    case 'event':
      return 'text-green-500';
    case 'application':
      return 'text-amber-500';
    case 'preregistration':
      return 'text-blue-500';
    default:
      return 'text-maroon-500';
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

<style>
/* Custom Maroon Color Variables */
:root {
  --maroon-50: #fdf2f3;
  --maroon-100: #fce7e9;
  --maroon-200: #f9d0d7;
  --maroon-300: #f5a8b5;
  --maroon-400: #f0758d;
  --maroon-500: #e6455a;
  --maroon-600: #d2304a;
  --maroon-700: #7f1d1d;
  --maroon-800: #9f1a39;
  --maroon-900: #881a37;
}

/* Maroon Utility Classes */
.bg-maroon-50 { background-color: var(--maroon-50); }
.bg-maroon-100 { background-color: var(--maroon-100); }
.bg-maroon-200 { background-color: var(--maroon-200); }
.bg-maroon-300 { background-color: var(--maroon-300); }
.bg-maroon-400 { background-color: var(--maroon-400); }
.bg-maroon-500 { background-color: var(--maroon-500); }
.bg-maroon-600 { background-color: var(--maroon-600); }
.bg-maroon-700 { background-color: var(--maroon-700); }
.bg-maroon-800 { background-color: var(--maroon-800); }
.bg-maroon-900 { background-color: var(--maroon-900); }

.text-maroon-50 { color: var(--maroon-50); }
.text-maroon-100 { color: var(--maroon-100); }
.text-maroon-200 { color: var(--maroon-200); }
.text-maroon-300 { color: var(--maroon-300); }
.text-maroon-400 { color: var(--maroon-400); }
.text-maroon-500 { color: var(--maroon-500); }
.text-maroon-600 { color: var(--maroon-600); }
.text-maroon-700 { color: var(--maroon-700); }
.text-maroon-800 { color: var(--maroon-800); }
.text-maroon-900 { color: var(--maroon-900); }

.border-maroon-50 { border-color: var(--maroon-50); }
.border-maroon-100 { border-color: var(--maroon-100); }
.border-maroon-200 { border-color: var(--maroon-200); }
.border-maroon-300 { border-color: var(--maroon-300); }
.border-maroon-400 { border-color: var(--maroon-400); }
.border-maroon-500 { border-color: var(--maroon-500); }
.border-maroon-600 { border-color: var(--maroon-600); }
.border-maroon-700 { border-color: var(--maroon-700); }
.border-maroon-800 { border-color: var(--maroon-800); }
.border-maroon-900 { border-color: var(--maroon-900); }

.hover\:bg-maroon-50:hover { background-color: var(--maroon-50); }
.hover\:bg-maroon-100:hover { background-color: var(--maroon-100); }
.hover\:bg-maroon-200:hover { background-color: var(--maroon-200); }
.hover\:bg-maroon-300:hover { background-color: var(--maroon-300); }
.hover\:bg-maroon-400:hover { background-color: var(--maroon-400); }
.hover\:bg-maroon-500:hover { background-color: var(--maroon-500); }
.hover\:bg-maroon-600:hover { background-color: var(--maroon-600); }
.hover\:bg-maroon-700:hover { background-color: var(--maroon-700); }
.hover\:bg-maroon-800:hover { background-color: var(--maroon-800); }
.hover\:bg-maroon-900:hover { background-color: var(--maroon-900); }

.hover\:text-maroon-600:hover { color: var(--maroon-600); }
.hover\:text-maroon-700:hover { color: var(--maroon-700); }
.hover\:text-maroon-800:hover { color: var(--maroon-800); }

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
  color: var(--maroon-600) !important;
  margin-right: 0.75rem !important;
  background-color: var(--maroon-100) !important;
  padding: 0.75rem !important;
  border-radius: 50% !important;
}

/* Customize Buttons */
.p-confirm-dialog-accept {
  background-color: var(--maroon-600) !important; /* Maroon for primary action */
  border: none !important;
  padding: 0.625rem 1.25rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(210, 48, 74, 0.2) !important;
}

.p-confirm-dialog-accept:hover {
  background-color: var(--maroon-700) !important; /* Darker maroon on hover */
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 6px rgba(210, 48, 74, 0.25) !important;
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

/* Z-index hierarchy:
   - Sidebar (z-40) - highest priority, can overlap topbar
   - Topbar (z-30) - medium priority, above regular content
   - Regular content (z-1 to z-20) - lowest priority
*/

/* Ensure main content doesn't overlap with fixed topbar */
html, body {
  margin: 0;
  padding: 0;
}

body {
  padding-top: 5rem; /* Space for the fixed topbar */
}

/* Alternative: Add this class to your main content wrapper */
.main-content {
  margin-top: 5rem; /* Space for the fixed topbar */
  min-height: calc(100vh - 5rem);
  position: relative;
  z-index: 1; /* Ensure it stays below topbar */
}

/* Ensure all content respects the topbar */
.page-content {
  padding-top: 1rem;
  position: relative;
  z-index: 1; /* Keep below topbar and sidebar */
}

/* Prevent other overlays from going above topbar (except sidebar) */
.modal, .dropdown, .tooltip {
  z-index: 25; /* Below topbar but above regular content */
}

/* Enhanced mobile responsiveness */
@media (max-width: 640px) {
  .p-dialog {
    max-width: calc(100vw - 2rem) !important;
    margin: 1rem !important;
  }
  
  .p-dialog .p-dialog-header {
    padding: 1rem 1rem 0.5rem !important;
    font-size: 1.125rem !important;
  }
  
  .p-dialog .p-dialog-content {
    padding: 0.5rem 1rem 1rem !important;
    font-size: 0.875rem !important;
  }
  
  .p-dialog .p-dialog-footer {
    padding: 0.75rem 1rem 1rem !important;
    gap: 0.5rem !important;
  }
  
  .p-confirm-dialog-accept,
  .p-confirm-dialog-reject {
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
  }
}

/* Improved touch targets for mobile */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Better mobile spacing */
@media (max-width: 480px) {
  body {
    padding-top: 4rem; /* Reduced space for smaller topbar on mobile */
  }
  
  .main-content {
    margin-top: 4rem;
    min-height: calc(100vh - 4rem);
  }
}

/* Ensure dropdowns don't go off-screen on mobile */
@media (max-width: 640px) {
  .absolute.right-0 {
    right: 0.5rem;
  }
}
</style>
