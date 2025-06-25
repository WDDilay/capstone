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
            <button 
              @click="markAllAsRead" 
              class="mark-read-btn"
              :disabled="unreadCount === 0"
            >
              Mark all as read
            </button>
          </div>
          
          <div v-if="isLoadingNotifications" class="loading-notifications">
            <div class="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
          
          <div v-else-if="notifications.length === 0" class="empty-notifications">
            <Bell class="empty-icon" />
            <p>No notifications yet</p>
          </div>
          
          <div v-else class="notification-list">
            <div 
              v-for="notification in recentNotifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ 
                unread: !notification.read,
                [`unread-${notification.type}`]: !notification.read
              }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon-wrapper">
                <div 
                  class="notification-type-icon"
                  :class="notification.type"
                >
                  <Package v-if="notification.type === 'resource'" class="type-icon" />
                  <Calendar v-else-if="notification.type === 'attendance'" class="type-icon" />
                  <Clock v-else-if="notification.type === 'attendance-reminder'" class="type-icon" />
                  <Info v-else class="type-icon" />
                </div>
              </div>
              
              <div class="notification-content">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <p class="notification-text">{{ notification.message }}</p>
                <span class="notification-time">{{ formatNotificationTime(notification.createdAt) }}</span>
              </div>
              
              <div v-if="!notification.read" class="unread-indicator" :class="`indicator-${notification.type}`"></div>
            </div>
          </div>
          
          <div v-if="notifications.length > 10" class="view-all">
            <button @click="viewAllNotifications" class="view-all-btn">
              View all notifications
            </button>
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
            <router-link to="/profile" class="menu-item">
              <User class="menu-icon" />
              Profile
            </router-link>
            <router-link to="/user_settings" class="menu-item">
              <Settings class="menu-icon" />
              Settings
            </router-link>
            <button @click="handleLogout" class="menu-item logout">
              <LogOut class="menu-icon" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { signOut } from '@/services/firebase'
import { useToast } from 'primevue/usetoast'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  addDoc,
  or
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/services/firebase'
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Package,
  Calendar,
  Clock,
  Info
} from 'lucide-vue-next'

const props = defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

// Notification system - all in this component
const notifications = ref([])
const unreadCount = ref(0)
const isLoadingNotifications = ref(false)
const currentUser = ref(null)
const currentBarangay = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)
const currentUserReferenceId = ref('')

let unsubscribeNotifications = null

// ============================================
// 🔥 NOTIFICATION SENDING FUNCTIONS (All types)
// ============================================

// 1. Send resource notification (to specific member)
const sendResourceNotification = async (barangay, memberName, referenceId, resources) => {
  try {
    const resourceList = resources.map((r) => r.resourceName).join(", ")

    await addDoc(collection(db, "notifications"), {
      type: "resource",
      title: "Resources Received",
      message: `You have received resources: ${resourceList}`,
      barangay: barangay,
      recipientType: "member",
      recipientReferenceId: referenceId, // 🎯 TARGET SPECIFIC MEMBER
      data: {
        memberName,
        resources,
        action: "resource_received",
      },
      createdAt: serverTimestamp(),
      read: false,
    })

    console.log("✅ Resource notification sent to:", referenceId)
  } catch (error) {
    console.error("❌ Error sending resource notification:", error)
  }
}

// 2. Send attendance form creation notification (to all members in barangay)
const sendAttendanceFormNotification = async (barangay, eventName, eventDate, attendanceDate) => {
  try {
    await addDoc(collection(db, "notifications"), {
      type: "attendance",
      title: "New Attendance Form Created",
      message: `Upcoming event: "${eventName}" on ${eventDate}. Attendance form will be available on ${attendanceDate}.`,
      barangay: barangay,
      recipientType: "member",
      // NO recipientReferenceId = sent to ALL members in barangay
      data: {
        eventName,
        eventDate,
        attendanceDate,
        action: "attendance_form_created",
      },
      createdAt: serverTimestamp(),
      read: false,
    })

    console.log("✅ Attendance form notification sent to all members in:", barangay)
  } catch (error) {
    console.error("❌ Error sending attendance form notification:", error)
  }
}

// 3. Send attendance reminder notification (to all members in barangay)
const sendAttendanceReminderNotification = async (barangay, eventName, eventDate) => {
  try {
    await addDoc(collection(db, "notifications"), {
      type: "attendance-reminder",
      title: "Attendance Required",
      message: `Please submit your attendance for "${eventName}" today. Don't forget to mark your presence!`,
      barangay: barangay,
      recipientType: "member",
      // NO recipientReferenceId = sent to ALL members in barangay
      data: {
        eventName,
        eventDate,
        action: "attendance_reminder",
      },
      createdAt: serverTimestamp(),
      read: false,
    })

    console.log("✅ Attendance reminder sent to all members in:", barangay)
  } catch (error) {
    console.error("❌ Error sending attendance reminder:", error)
  }
}

// 4. Send general notification (flexible)
const sendGeneralNotification = async (barangay, title, message, type = "general", referenceId = null, data = {}) => {
  try {
    const notificationData = {
      type,
      title,
      message,
      barangay,
      recipientType: "member",
      data,
      createdAt: serverTimestamp(),
      read: false,
    }

    // Add specific recipient if provided
    if (referenceId) {
      notificationData.recipientReferenceId = referenceId
    }

    await addDoc(collection(db, "notifications"), notificationData)

    console.log("✅ General notification sent successfully")
  } catch (error) {
    console.error("❌ Error sending general notification:", error)
  }
}

// ============================================
// 🔥 EXPOSE NOTIFICATION FUNCTIONS FOR OTHER COMPONENTS
// ============================================

// Expose notification functions so other components can use them
defineExpose({
  sendResourceNotification,
  sendAttendanceFormNotification,
  sendAttendanceReminderNotification,
  sendGeneralNotification
})

// Initialize user and barangay data
const initializeUser = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      console.error('No authenticated user found')
      return
    }

    currentUser.value = user

    // Get user's barangay AND reference ID from solo_parents collection
    const soloParentsCollection = collection(db, 'solo_parents')
    const userQuery = query(soloParentsCollection, where('uid', '==', user.uid))
    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data()
      currentBarangay.value = userData.barangay || userData.Barangay || ''
      currentUserReferenceId.value = userData.referenceCode || userData.reference_code || ''
      console.log('User barangay:', currentBarangay.value)
      console.log('User reference ID:', currentUserReferenceId.value)
    }
  } catch (error) {
    console.error('Error initializing user:', error)
  }
}

// Load notifications for current user - UPDATED to handle both specific and general notifications
const loadNotifications = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    await initializeUser()
  }

  if (!currentUser.value || !currentBarangay.value) {
    console.error('User or barangay not found')
    return
  }

  isLoadingNotifications.value = true

  try {
    const notificationsCollection = collection(db, 'notifications')
    
    // Create query to get both:
    // 1. Notifications specifically for this user (with recipientReferenceId)
    // 2. General notifications for all members in this barangay (without recipientReferenceId)
    const q = query(
      notificationsCollection,
      where('barangay', '==', currentBarangay.value),
      where('recipientType', '==', 'member'),
      orderBy('createdAt', 'desc')
    )

    // Set up real-time listener
    unsubscribeNotifications = onSnapshot(
      q,
      (snapshot) => {
        const notificationsList = []

        snapshot.forEach((doc) => {
          const data = doc.data()
          
          // Include notification if:
          // 1. It's specifically for this user (has recipientReferenceId matching current user)
          // 2. It's a general notification (no recipientReferenceId = for all members)
          if (!data.recipientReferenceId || data.recipientReferenceId === currentUserReferenceId.value) {
            notificationsList.push({
              id: doc.id,
              ...data,
            })
          }
        })

        notifications.value = notificationsList
        updateUnreadCount()
        isLoadingNotifications.value = false
        console.log('✅ Loaded', notificationsList.length, 'notifications for user:', currentUserReferenceId.value)
      },
      (error) => {
        console.error('Error loading notifications:', error)
        isLoadingNotifications.value = false
      }
    )
  } catch (error) {
    console.error('Error setting up notifications listener:', error)
    isLoadingNotifications.value = false
  }
}

// Update unread count
const updateUnreadCount = () => {
  unreadCount.value = notifications.value.filter((n) => !n.read).length
}

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    const unreadNotifications = notifications.value.filter((n) => !n.read)

    const updatePromises = unreadNotifications.map((notification) => {
      const notificationRef = doc(db, 'notifications', notification.id)
      return updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      })
    })

    await Promise.all(updatePromises)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'All notifications marked as read',
      life: 3000
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to mark notifications as read',
      life: 3000
    })
  }
}

// Format notification time
const formatNotificationTime = (timestamp) => {
  if (!timestamp) return 'Just now'

  try {
    let date

    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }

    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'Unknown'
  }
}

// Computed properties
const recentNotifications = computed(() => notifications.value.slice(0, 10))

// Handle notification click
const handleNotificationClick = async (notification) => {
  // Mark as read
  if (!notification.read) {
    await markAsRead(notification.id)
  }
  
  // Handle navigation based on notification type
  if (notification.type === 'resource') {
    router.push('/resources')
  } else if (notification.type === 'attendance' || notification.type === 'attendance-reminder') {
    router.push('/events')
  }
  
  // Close dropdown
  showNotifications.value = false
  
  // Show toast with different colors based on type
  const toastSeverity = notification.type === 'resource' ? 'success' : 
                       notification.type === 'attendance' ? 'info' : 
                       notification.type === 'attendance-reminder' ? 'warn' : 'info'
  
  toast.add({
    severity: toastSeverity,
    summary: notification.title,
    detail: notification.message,
    life: 5000
  })
}

const viewAllNotifications = () => {
  router.push('/notifications')
  showNotifications.value = false
}

// Close dropdowns when clicking outside
const closeDropdowns = (event) => {
  if (!event.target.closest('.notifications') && showNotifications.value) {
    showNotifications.value = false
  }
  
  if (!event.target.closest('.user-profile') && showUserMenu.value) {
    showUserMenu.value = false
  }
}

// Add event listener for clicks
const addClickListener = () => {
  window.addEventListener('click', closeDropdowns)
}

// Clean up event listener on component unmount
const removeClickListener = () => {
  window.removeEventListener('click', closeDropdowns)
}

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleLogout = async () => {
  try {
    await signOut()
    userStore.clearUser()
    toast.add({ 
      severity: 'success', 
      summary: 'Logged Out', 
      detail: 'You have been successfully logged out.', 
      life: 3000 
    })
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'There was a problem logging out.', 
      life: 3000 
    })
  }
}

// Dynamic page title based on current route
const pageTitle = computed(() => {
  const path = route.path
  if (path === '/userdash') return 'Dashboard'
  if (path.includes('/events')) return 'Events'
  if (path.includes('/profile')) return 'Profile Settings'
  if (path.includes('/announcements')) return 'Announcements'
  if (path.includes('/messages')) return 'Messages'
  if (path.includes('/user_settings')) return 'Settings'
  if (path.includes('/resources')) return 'Resource Requests'
  return 'Solo Parent Dashboard'
})

// Initialize notifications on mount
onMounted(() => {
  loadNotifications()
  addClickListener()
})

onBeforeUnmount(() => {
  removeClickListener()
  if (unsubscribeNotifications) {
    unsubscribeNotifications()
  }
})
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
  transition: background-color 0.2s;
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
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  background-color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  margin-top: 8px;
  z-index: 100;
  border: 1px solid #e5e7eb;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #8528d8;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mark-read-btn:hover:not(:disabled) {
  background-color: rgba(133, 40, 216, 0.1);
}

.mark-read-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.loading-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #8528d8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: rgba(133, 40, 216, 0.05);
}

/* 🎨 Different background colors for unread notifications based on type */
.notification-item.unread {
  background-color: rgba(133, 40, 216, 0.08);
}

.notification-item.unread-resource {
  background-color: rgba(16, 185, 129, 0.08); /* Green for resources */
}

.notification-item.unread-attendance {
  background-color: rgba(59, 130, 246, 0.08); /* Blue for attendance */
}

.notification-item.unread-attendance-reminder {
  background-color: rgba(245, 158, 11, 0.08); /* Orange for reminders */
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon-wrapper {
  flex-shrink: 0;
}

.notification-type-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-type-icon.resource {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.notification-type-icon.attendance {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.notification-type-icon.attendance-reminder {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.notification-type-icon.general {
  background-color: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.type-icon {
  width: 18px;
  height: 18px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.notification-text {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

/* 🎨 Different colored unread indicators based on notification type */
.unread-indicator {
  position: absolute;
  top: 20px;
  right: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator-resource {
  background-color: #10b981; /* Green for resources */
}

.indicator-attendance {
  background-color: #3b82f6; /* Blue for attendance */
}

.indicator-attendance-reminder {
  background-color: #f59e0b; /* Orange for reminders */
}

.indicator-general {
  background-color: #8528d8; /* Purple for general */
}

.view-all {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.view-all-btn {
  background: none;
  border: none;
  color: #8528d8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.view-all-btn:hover {
  background-color: rgba(133, 40, 216, 0.1);
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
  
  .notification-dropdown {
    width: 320px;
  }
}
</style>
