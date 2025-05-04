<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { db } from '@/services/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  Timestamp,
  startAfter,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc
} from 'firebase/firestore';

const router = useRouter();
const userStore = useUserStore();

// State variables
const notifications = ref([]);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('all');
const searchQuery = ref('');
const selectedDateRange = ref('all');
const lastVisible = ref(null);
const hasMore = ref(true);
const pageSize = 10;
const unsubscribers = ref([]);
const readNotificationsIds = ref([]);

// Filter options
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'event', label: 'Events' },
  { id: 'application', label: 'Applications' }
];

const dateRanges = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' }
];

// Computed properties
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value];
  
  // Filter by type (tab)
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(n => n.type === activeTab.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) || 
      (n.message && n.message.toLowerCase().includes(query))
    );
  }
  
  // Filter by date range
  if (selectedDateRange.value !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (selectedDateRange.value) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      filtered = filtered.filter(n => {
        const notifDate = n.timestamp instanceof Timestamp 
          ? n.timestamp.toDate() 
          : new Date(n.timestamp);
        return notifDate >= startDate;
      });
    }
  }
  
  return filtered;
});

const notificationStats = computed(() => {
  const total = notifications.value.length;
  const unread = notifications.value.filter(n => !n.read).length;
  const announcements = notifications.value.filter(n => n.type === 'announcement').length;
  const events = notifications.value.filter(n => n.type === 'event').length;
  const applications = notifications.value.filter(n => n.type === 'application').length;
  
  return { total, unread, announcements, events, applications };
});

// Format date for display
const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Format relative time
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return formatDate(timestamp);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Get notification icon based on type
const getNotificationIcon = (notification) => {
  switch (notification.type) {
    case 'announcement':
      return 'pi-megaphone';
    case 'event':
      return 'pi-calendar';
    case 'application':
      return 'pi-file';
    default:
      return 'pi-bell';
  }
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

// Get background color class based on notification type
const getNotificationBgColor = (type, read) => {
  if (!read) return 'bg-blue-50';
  
  switch (type) {
    case 'announcement':
      return 'hover:bg-purple-50';
    case 'event':
      return 'hover:bg-green-50';
    case 'application':
      return 'hover:bg-yellow-50';
    default:
      return 'hover:bg-gray-50';
  }
};

// Fetch user's read notifications
const fetchReadNotifications = async () => {
  if (!userStore.user?.uid) return;
  
  try {
    const readRef = doc(db, 'users', userStore.user.uid, 'metadata', 'notifications');
    const readDoc = await getDoc(readRef);
    
    if (readDoc.exists()) {
      readNotificationsIds.value = readDoc.data().read || [];
    } else {
      // Create the document if it doesn't exist
      await setDoc(readRef, { read: [] });
      readNotificationsIds.value = [];
    }
  } catch (error) {
    console.error('Error fetching read notifications:', error);
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  if (!userStore.user?.uid) return;
  
  try {
    // Update local state
    notifications.value = notifications.value.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    // Update in Firestore
    const readRef = doc(db, 'users', userStore.user.uid, 'metadata', 'notifications');
    await updateDoc(readRef, {
      read: arrayUnion(notificationId)
    });
    
    // Update local cache
    if (!readNotificationsIds.value.includes(notificationId)) {
      readNotificationsIds.value.push(notificationId);
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  if (!userStore.user?.uid) return;
  
  try {
    // Get all unread notification IDs
    const unreadIds = notifications.value
      .filter(n => !n.read)
      .map(n => n.id);
    
    if (unreadIds.length === 0) return;
    
    // Update local state
    notifications.value = notifications.value.map(notification => {
      return { ...notification, read: true };
    });
    
    // Update in Firestore - we need to update one by one because arrayUnion has limits
    const readRef = doc(db, 'users', userStore.user.uid, 'metadata', 'notifications');
    
    // Split into chunks to avoid Firestore limits
    const chunkSize = 500;
    for (let i = 0; i < unreadIds.length; i += chunkSize) {
      const chunk = unreadIds.slice(i, i + chunkSize);
      await updateDoc(readRef, {
        read: arrayUnion(...chunk)
      });
    }
    
    // Update local cache
    readNotificationsIds.value = [...new Set([...readNotificationsIds.value, ...unreadIds])];
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Navigate to the relevant page when a notification is clicked
const handleNotificationClick = (notification) => {
  markAsRead(notification.id);
  
  // Navigate based on notification type
  switch (notification.type) {
    case 'announcement':
      router.push(`/announcements/${notification.id}`);
      break;
    case 'event':
      router.push(`/events/${notification.id}`);
      break;
    case 'application':
      router.push(`/applications/${notification.id}`);
      break;
    default:
      router.push('/dashboard');
  }
};

// Set up listeners for different notification types
const setupNotificationListeners = () => {
  if (!userStore.user?.uid) return;
  
  loading.value = true;
  
  // Clear any existing listeners
  unsubscribers.value.forEach(unsub => unsub());
  unsubscribers.value = [];
  
  // 1. Listen for announcements
  const announcementsQuery = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
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
        read: readNotificationsIds.value.includes(doc.id),
        createdBy: data.createdBy,
        details: data
      };
    });
    
    // Update last visible for pagination
    if (snapshot.docs.length > 0) {
      lastVisible.value = snapshot.docs[snapshot.docs.length - 1];
    }
    
    // Merge with existing notifications, avoiding duplicates
    mergeNotifications(newAnnouncements);
    loading.value = false;
  }, (error) => {
    console.error('Error fetching announcements:', error);
    error.value = 'Failed to load announcements';
    loading.value = false;
  });
  
  unsubscribers.value.push(announcementsUnsubscribe);
  
  // 2. Listen for events
  const eventsQuery = query(
    collection(db, 'events'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const eventsUnsubscribe = onSnapshot(eventsQuery, (snapshot) => {
    const newEvents = snapshot.docs.map(doc => {
      const data = doc.data();
      const eventDate = data.eventDate instanceof Timestamp ? data.eventDate.toDate() : new Date(data.eventDate);
      
      return {
        id: doc.id,
        type: 'event',
        title: data.title || 'Event',
        message: data.description || '',
        timestamp: data.createdAt,
        eventDate: eventDate,
        read: readNotificationsIds.value.includes(doc.id),
        details: data
      };
    });
    
    // Merge with existing notifications, avoiding duplicates
    mergeNotifications(newEvents);
  }, (error) => {
    console.error('Error fetching events:', error);
  });
  
  unsubscribers.value.push(eventsUnsubscribe);
  
  // 3. Listen for applications
  const applicationsQuery = query(
    collection(db, 'applications'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const applicationsUnsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
    const newApplications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'application',
        title: 'Membership Application',
        message: `${data.name || 'Someone'} has applied for membership`,
        timestamp: data.createdAt,
        read: readNotificationsIds.value.includes(doc.id),
        applicantName: data.name,
        details: data
      };
    });
    
    // Merge with existing notifications, avoiding duplicates
    mergeNotifications(newApplications);
  }, (error) => {
    console.error('Error fetching applications:', error);
  });
  
  unsubscribers.value.push(applicationsUnsubscribe);
};

// Merge new notifications with existing ones, avoiding duplicates
const mergeNotifications = (newItems) => {
  // Add only notifications that don't already exist (by ID)
  const existingIds = notifications.value.map(n => n.id);
  const uniqueNewItems = newItems.filter(item => !existingIds.includes(item.id));
  
  if (uniqueNewItems.length > 0) {
    notifications.value = [...notifications.value, ...uniqueNewItems]
      .sort((a, b) => {
        const dateA = a.timestamp instanceof Timestamp ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Timestamp ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB - dateA; // Sort by most recent first
      });
  }
};

// Load more notifications (pagination)
const loadMore = async () => {
  if (!lastVisible.value || !userStore.user?.uid) return;
  
  loading.value = true;
  
  try {
    // Load more announcements
    const moreAnnouncementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible.value),
      limit(pageSize)
    );
    
    const announcementsSnapshot = await getDocs(moreAnnouncementsQuery);
    
    if (announcementsSnapshot.empty) {
      hasMore.value = false;
    } else {
      const moreAnnouncements = announcementsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'announcement',
          title: data.title || 'New Announcement',
          message: data.message || '',
          timestamp: data.createdAt,
          read: readNotificationsIds.value.includes(doc.id),
          createdBy: data.createdBy,
          details: data
        };
      });
      
      // Update last visible for pagination
      lastVisible.value = announcementsSnapshot.docs[announcementsSnapshot.docs.length - 1];
      
      // Merge with existing notifications
      mergeNotifications(moreAnnouncements);
    }
  } catch (error) {
    console.error('Error loading more notifications:', error);
    error.value = 'Failed to load more notifications';
  } finally {
    loading.value = false;
  }
};

// Change active tab
const changeTab = (tabId) => {
  activeTab.value = tabId;
};

// Reset filters
const resetFilters = () => {
  activeTab.value = 'all';
  searchQuery.value = '';
  selectedDateRange.value = 'all';
};

// Lifecycle hooks
onMounted(async () => {
  await fetchReadNotifications();
  setupNotificationListeners();
});

onUnmounted(() => {
  // Clean up listeners when component is destroyed
  unsubscribers.value.forEach(unsub => unsub());
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
          <button 
            @click="markAllAsRead" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="!notifications.some(n => !n.read)"
            :class="{ 'opacity-50 cursor-not-allowed': !notifications.some(n => !n.read) }"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total</p>
            <p class="text-2xl font-semibold">{{ notificationStats.total }}</p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <i class="pi pi-bell text-blue-600 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Unread</p>
            <p class="text-2xl font-semibold">{{ notificationStats.unread }}</p>
          </div>
          <div class="bg-red-100 p-3 rounded-full">
            <i class="pi pi-envelope text-red-600 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Announcements</p>
            <p class="text-2xl font-semibold">{{ notificationStats.announcements }}</p>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <i class="pi pi-megaphone text-purple-600 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Events</p>
            <p class="text-2xl font-semibold">{{ notificationStats.events }}</p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <i class="pi pi-calendar text-green-600 text-xl"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Applications</p>
            <p class="text-2xl font-semibold">{{ notificationStats.applications }}</p>
          </div>
          <div class="bg-yellow-100 p-3 rounded-full">
            <i class="pi pi-file text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-4 border-b">
          <h2 class="text-lg font-medium">Filters</h2>
        </div>
        <div class="p-4">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <!-- Search -->
            <div class="flex-1">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-search text-gray-400"></i>
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search notifications..."
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <!-- Date range filter -->
            <div class="w-full md:w-64">
              <select
                v-model="selectedDateRange"
                class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option v-for="range in dateRanges" :key="range.id" :value="range.id">
                  {{ range.label }}
                </option>
              </select>
            </div>
            
            <!-- Reset button -->
            <button
              @click="resetFilters"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="px-4 border-t">
          <div class="flex overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="changeTab(tab.id)"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 focus:outline-none"
              :class="activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Notifications list -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading && notifications.length === 0" class="p-8 text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-blue-500 mb-4"></i>
          <p class="text-gray-500">Loading notifications...</p>
        </div>
        
        <div v-else-if="error" class="p-8 text-center">
          <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-4"></i>
          <p class="text-gray-700">{{ error }}</p>
          <button
            @click="setupNotificationListeners"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
        
        <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center">
          <i class="pi pi-inbox text-5xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg">No notifications found</p>
          <p class="text-gray-400 mt-2">
            {{ activeTab !== 'all' || searchQuery || selectedDateRange !== 'all' 
              ? 'Try changing your filters' 
              : 'You\'ll see notifications here when there\'s activity' }}
          </p>
        </div>
        
        <div v-else>
          <div class="divide-y divide-gray-200">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              class="p-4 cursor-pointer transition-colors"
              :class="[
                notification.read ? getNotificationBgColor(notification.type, true) : 'bg-blue-50',
              ]"
            >
              <div class="flex items-start">
                <!-- Icon -->
                <div class="flex-shrink-0 mt-1">
                  <div :class="['p-2 rounded-full', notification.type === 'announcement' ? 'bg-purple-100' : notification.type === 'event' ? 'bg-green-100' : 'bg-yellow-100']">
                    <i :class="['pi', getNotificationIcon(notification), getNotificationColor(notification.type)]"></i>
                  </div>
                </div>
                
                <!-- Content -->
                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                    <span v-if="!notification.read" class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  </div>
                  
                  <p v-if="notification.message" class="mt-1 text-sm text-gray-700">
                    {{ notification.message }}
                  </p>
                  
                  <!-- Event specific info -->
                  <div v-if="notification.type === 'event' && notification.details" class="mt-2 text-xs text-gray-500">
                    <div class="flex items-center">
                      <i class="pi pi-calendar-plus mr-1"></i>
                      <span>Event Date: {{ formatDate(notification.details.eventDate) }}</span>
                    </div>
                    <div v-if="notification.details.location" class="flex items-center mt-1">
                      <i class="pi pi-map-marker mr-1"></i>
                      <span>{{ notification.details.location }}</span>
                    </div>
                  </div>
                  
                  <!-- Application specific info -->
                  <div v-if="notification.type === 'application' && notification.details" class="mt-2 text-xs text-gray-500">
                    <div class="flex items-center">
                      <i class="pi pi-user mr-1"></i>
                      <span>Applicant: {{ notification.details.name }}</span>
                    </div>
                    <div v-if="notification.details.status" class="flex items-center mt-1">
                      <i class="pi pi-info-circle mr-1"></i>
                      <span>Status: {{ notification.details.status }}</span>
                    </div>
                  </div>
                  
                  <!-- Announcement specific info -->
                  <div v-if="notification.type === 'announcement' && notification.details" class="mt-2 text-xs text-gray-500">
                    <div class="flex items-center">
                      <i class="pi pi-user mr-1"></i>
                      <span>Posted by: {{ notification.details.createdBy }}</span>
                    </div>
                  </div>
                  
                  <!-- Footer with timestamp and actions -->
                  <div class="mt-2 flex items-center justify-between">
                    <p class="text-xs text-gray-500">{{ formatRelativeTime(notification.timestamp) }}</p>
                    
                    <div class="flex items-center">
                      <button
                        v-if="notification.read"
                        class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                        @click.stop
                      >
                        View Details
                      </button>
                      <button
                        v-else
                        class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                        @click.stop="markAsRead(notification.id)"
                      >
                        Mark as Read
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Load more -->
          <div v-if="hasMore" class="p-4 border-t text-center">
            <button
              @click="loadMore"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              <span v-if="loading">
                <i class="pi pi-spin pi-spinner mr-2"></i>
                Loading...
              </span>
              <span v-else>Load More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles for the notifications page */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hover effects for notification items */
.notification-item:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

/* Custom scrollbar for notification list */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>