<template>
  <div class="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-maroon-700 border-b border-maroon-700 shadow-lg px-2 sm:px-4 py-2 sm:py-4">
    <!-- Logo and title - responsive sizing -->
    <div class="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
      <!-- Logo with responsive sizing -->
      <img 
        :src="spfLogo" 
        alt="SPF Logo" 
        class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm flex-shrink-0" 
      />
      <!-- Title with responsive text and truncation on mobile -->
      <h2 class="text-white text-xs sm:text-sm md:text-lg font-semibold truncate max-w-32 sm:max-w-none">
        <span class="text-xl font-bold">Solo Parent</span>
          <span class="block text-sm -mt-1">Federation - Calapan City</span>
      </h2>
    </div>
    
    <!-- Profile and notifications - responsive spacing and sizing -->
    <div class="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
      <!-- Notifications -->
      <div class="relative">
        <button 
          @click="toggleNotifications" 
          class="p-2 sm:p-3 rounded-full text-maroon-100 hover:bg-maroon-500 focus:outline-none transition-colors"
        >
          <i class="pi pi-bell text-base sm:text-lg md:text-xl"></i>
          <span 
            v-if="unreadCount > 0" 
            class="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-xs font-bold text-white bg-red-600 rounded-full"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>
        
        <!-- Notifications dropdown - responsive width and positioning -->
        <div 
          v-if="showNotifications" 
          class="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-md shadow-lg overflow-hidden z-50 max-h-96"
        >
          <div class="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-sm font-semibold text-gray-700">Notifications</h3>
            <button 
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-xs text-maroon-600 hover:text-maroon-800"
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
                :class="{ 'bg-maroon-50': !notification.read }"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i :class="['pi', getNotificationIcon(notification), 'text-lg', getNotificationColor(notification.type)]"></i>
                  </div>
                  <div class="ml-3 flex-1 min-w-0">
                    <div class="flex justify-between">
                      <p class="text-sm font-medium text-gray-900 truncate pr-2">{{ notification.title }}</p>
                      <span v-if="!notification.read" class="inline-block w-2 h-2 bg-maroon-500 rounded-full flex-shrink-0"></span>
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
          <a href="#" @click.prevent="router.push('/super-admin/notification')" class="block text-center text-sm font-medium text-maroon-600 bg-gray-50 p-2 hover:bg-gray-100">
            View all notifications
          </a>
        </div>
      </div>
      
      <!-- User profile dropdown -->
      <div class="relative">
        <button 
          @click="toggleUserMenu" 
          class="flex items-center gap-1 sm:gap-2 md:gap-3 text-white hover:bg-maroon-500 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg transition-colors"
        >
          <!-- Profile Avatar with Initials - responsive sizing -->
          <div class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg flex-shrink-0">
            {{ getInitials(userName) }}
          </div>
          <!-- User Name and Role - hidden on mobile, shown on larger screens -->
          <div class="hidden sm:flex flex-col items-start min-w-0">
            <span class="text-xs sm:text-sm font-medium truncate max-w-24 md:max-w-none">{{ userName || 'Loading...' }}</span>
            <span class="text-xs text-maroon-100 opacity-90 truncate">Barangay Admin</span>
          </div>
          <i class="pi pi-chevron-down text-xs sm:text-sm flex-shrink-0"></i>
        </button>
        
        <!-- User menu dropdown - responsive positioning and width -->
        <div 
          v-if="showUserMenu" 
          class="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200"
        >
          <!-- Show user info on mobile since it's hidden in the button -->
          <div class="sm:hidden px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName || 'Loading...' }}</p>
            <p class="text-xs text-gray-600">Barangay Admin</p>
          </div>
          
          <div class="border-t border-gray-100"></div>
          <button 
            @click="handleSignOut" 
            class="relative block w-full text-left px-4 py-2 sm:py-3 text-sm text-red-600 hover:bg-red-50 transition group"
          >
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
import spfLogo from '@/assets/solologo.jpg';

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

const getInitials = (name) => {
  if (!name || name === 'User') return 'BA';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

const fetchUserName = async () => {
  if (userStore.user?.uid) {
    try {
      const userRef = doc(db, 'admins', userStore.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userName.value = userData.name || userData.firstName + ' ' + userData.lastName || 'Barangay Admin';
      } else {
        console.warn('User document not found in the admins collection.');
        userName.value = userStore.user.displayName || userStore.user.email?.split('@')[0] || 'Barangay Admin';
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      userName.value = userStore.user.displayName || userStore.user.email?.split('@')[0] || 'Barangay Admin';
    }
  } else {
    userName.value = 'Guest User';
  }
};

// Format relative time for notifications
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  
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
        read: false,
        createdBy: data.createdBy,
        icon: 'pi-megaphone'
      };
    });
    
    mergeNotifications(newAnnouncements);
  }, (error) => {
    console.error('Error fetching announcements:', error);
  });
  
  unsubscribers.value.push(announcementsUnsubscribe);
  
  // 2. Listen for upcoming events
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

  // 4. Listen for pre-registration notifications
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
  const existingIds = notifications.value.map(n => n.id);
  const uniqueNewItems = newItems.filter(item => !existingIds.includes(item.id));
  
  if (uniqueNewItems.length > 0) {
    notifications.value = [...uniqueNewItems, ...notifications.value]
      .sort((a, b) => {
        const dateA = a.timestamp instanceof Timestamp ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Timestamp ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB - dateA;
      })
      .slice(0, 10);
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
};

// Mark all notifications as read
const markAllAsRead = () => {
  notifications.value = notifications.value.map(notification => {
    return { ...notification, read: true };
  });
};

// Navigate to the relevant page when a notification is clicked
const handleNotificationClick = (notification) => {
  markAsRead(notification.id);
  
  showNotifications.value = false;
  
  switch (notification.type) {
    case 'announcement':
      router.push('/super-admin/events');
      break;
    case 'event':
      router.push(`/super-admin/events/${notification.id}`);
      break;
    case 'application':
      router.push(`/super-admin/application/${notification.id}`);
      break;
    case 'preregistration':
      router.push('/super-admin/pre-register');
      break;
    default:
      router.push('/super-admin/notification');
  }
};

// Toggle functions with click outside handling
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) showNotifications.value = false;
};

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showNotifications.value = false;
    showUserMenu.value = false;
  }
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
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  unsubscribers.value.forEach(unsub => unsub());
  document.removeEventListener('click', handleClickOutside);
});

// Watch for user changes to refresh notifications
watch(user, (newUser) => {
  if (newUser) {
    fetchUserName();
    setupNotificationListeners();
  } else {
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

/* Enhanced PrimeVue ConfirmDialog Styling */
.p-dialog {
  border-radius: 12px !important;
  box-shadow: 0px 15px 35px rgba(0, 0, 0, 0.2) !important;
  overflow: hidden !important;
  border: none !important;
  max-width: 90vw !important;
  width: 400px !important;
}

.p-dialog .p-dialog-header {
  background-color: white !important;
  padding: 1.5rem 1.5rem 0.75rem !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #111827 !important;
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
  background-color: var(--maroon-600) !important;
  border: none !important;
  padding: 0.625rem 1.25rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(210, 48, 74, 0.2) !important;
}

.p-confirm-dialog-accept:hover {
  background-color: var(--maroon-700) !important;
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

/* Line clamp utility for notification text */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive body padding for fixed topbar */
html, body {
  margin: 0;
  padding: 0;
}
/* Responsive topbar spacing continued */
@media (max-width: 640px) {
  body {
    padding-top: 3.5rem; /* 56px for mobile */
  }
  
  .main-content {
    margin-top: 3.5rem;
    min-height: calc(100vh - 3.5rem);
    position: relative;
    z-index: 1;
  }
  
  /* Make dropdowns full width on very small screens */
  .absolute.right-0 {
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  body {
    padding-top: 4rem; /* 64px for tablet */
  }
  
  .main-content {
    margin-top: 4rem;
    min-height: calc(100vh - 4rem);
    position: relative;
    z-index: 1;
  }
}

@media (min-width: 1025px) {
  body {
    padding-top: 5rem; /* 80px for desktop */
  }
  
  .main-content {
    margin-top: 5rem;
    min-height: calc(100vh - 5rem);
    position: relative;
    z-index: 1;
  }
}

/* Ensure content respects the topbar across all devices */
.page-content {
  padding-top: 1rem;
  position: relative;
  z-index: 1;
}

/* Dropdown positioning fixes for mobile */
@media (max-width: 480px) {
  .absolute.right-0 {
    position: fixed !important;
    right: 0.25rem !important;
    left: 0.25rem !important;
    width: auto !important;
    max-width: none !important;
  }
  
  /* Notification dropdown adjustments */
  .absolute.right-0.w-72 {
    width: calc(100vw - 1rem) !important;
  }
  
  /* User menu adjustments */
  .absolute.right-0.w-40 {
    width: calc(50vw - 1rem) !important;
    min-width: 160px !important;
  }
}

/* Prevent dropdown overflow on small screens */
@media (max-width: 640px) {
  .overflow-y-auto {
    max-height: 50vh;
  }
}

/* Enhanced hover effects for touch devices */
@media (hover: hover) {
  button:hover {
    transform: translateY(-1px);
  }
}

/* Touch-friendly button sizing */
@media (max-width: 768px) {
  button {
    min-height: 44px; /* iOS recommended touch target size */
    min-width: 44px;
  }
  
  /* Larger touch targets for notification and user buttons */
  .p-2 {
    padding: 0.75rem;
  }
}

/* Modal and overlay z-index management */
.modal, .dropdown, .tooltip {
  z-index: 25; /* Below topbar but above regular content */
}

/* Notification badge responsive sizing */
@media (max-width: 480px) {
  .absolute.-top-1.-right-1 {
    top: -0.125rem;
    right: -0.125rem;
  }
}

/* Text truncation improvements */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive max-width utilities */
.max-w-32 {
  max-width: 8rem;
}

@media (min-width: 640px) {
  .sm\:max-w-none {
    max-width: none;
  }
}

.max-w-24 {
  max-width: 6rem;
}

@media (min-width: 768px) {
  .md\:max-w-none {
    max-width: none;
  }
}

/* Flex utilities for responsive behavior */
.flex-shrink-0 {
  flex-shrink: 0;
}

.min-w-0 {
  min-width: 0;
}

/* Animation and transition improvements */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus improvements for accessibility */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--maroon-500);
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  :root {
    --maroon-700: #7f1d1d;
    --maroon-600: #991b1b;
    --maroon-500: #dc2626;
  }
}

/* Print styles */
@media print {
  .fixed {
    position: static !important;
  }
  
  .shadow-lg {
    box-shadow: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-maroon-700 {
    background-color: #000000;
  }
  
  .text-white {
    color: #ffffff;
  }
  
  .border-maroon-700 {
    border-color: #000000;
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-colors,
  .transition-opacity,
  button {
    transition: none !important;
    animation: none !important;
  }
  
  .transform {
    transform: none !important;
  }
}
</style>