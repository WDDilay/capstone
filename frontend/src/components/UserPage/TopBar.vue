<template>
  <div class="topbar">
    <div class="topbar-gradient"></div>
    
    <div class="left-section">
      
      <div class="page-title-wrapper">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="page-subtitle">Welcome back!</div>
      </div>
    </div>
    
    <div class="right-section">
      <div class="search-container">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input type="text" placeholder="Search anything..." class="search-input" />
          <div class="search-glow"></div>
        </div>
      </div>
      
      <div class="notifications">
        <div class="notification-icon" @click="showNotifications = !showNotifications">
          <div class="notification-inner">
            <Bell class="icon" />
            <span v-if="unreadCount > 0" class="notification-badge">
              {{ unreadCount }}
              <div class="badge-ripple"></div>
            </span>
          </div>
          <div class="notification-glow"></div>
        </div>
        
        <!-- Enhanced notification dropdown -->
        <div v-if="showNotifications" class="notification-dropdown">
          <div class="dropdown-gradient"></div>
          
          <div class="dropdown-header">
            <div class="header-content">
              <h3>Notifications</h3>
              <div class="notification-count">{{ unreadCount }} new</div>
            </div>
            <button 
              @click="markAllAsRead"
              class="mark-read-btn"
              :disabled="unreadCount === 0"
            >
              <span>Mark all read</span>
            </button>
          </div>
          
          <div v-if="isLoadingNotifications" class="loading-notifications">
            <div class="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
          
          <div v-else-if="notifications.length === 0" class="empty-notifications">
            <div class="empty-icon-wrapper">
              <Bell class="empty-icon" />
            </div>
            <p>No notifications yet</p>
            <span>You're all caught up!</span>
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
              <span>View all notifications</span>
              <div class="btn-glow"></div>
            </button>
          </div>
        </div>
      </div>
      
      <div class="user-profile" @click="showUserMenu = !showUserMenu">
        <div class="profile-wrapper">
          <img 
            :src="userStore.user?.photoURL || '/placeholder.svg?height=40&width=40'"
            alt="User Profile"
            class="profile-image"
          />
          <div class="profile-status-dot"></div>
        </div>
        
        <!-- Simplified user menu dropdown - Only user info, no menu items -->
        <div v-if="showUserMenu" class="user-menu">
          <div class="menu-gradient"></div>
          
          <div class="user-info">
            <div class="user-avatar-wrapper">
              <img 
                :src="userStore.user?.photoURL || '/placeholder.svg?height=60&width=60'"
                alt="User Profile"
                class="menu-profile-image"
              />
              <div class="avatar-glow"></div>
            </div>
            <div class="user-details">
              <h4>{{ userStore.user?.firstName || 'User' }} {{ userStore.user?.lastName || '' }}</h4>
              <p>{{ userStore.user?.email || 'user@example.com' }}</p>
            </div>
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

// All the notification functions from your original code...
const sendResourceNotification = async (barangay, memberName, referenceId, resources) => {
  try {
    const resourceList = resources.map((r) => r.resourceName).join(", ")
    await addDoc(collection(db, "notifications"), {
      type: "resource",
      title: "Resources Received",
      message: `You have received resources: ${resourceList}`,
      barangay: barangay,
      recipientType: "member",
      recipientReferenceId: referenceId,
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

const sendAttendanceFormNotification = async (barangay, eventName, eventDate, attendanceDate) => {
  try {
    await addDoc(collection(db, "notifications"), {
      type: "attendance",
      title: "New Attendance Form Created",
      message: `Upcoming event: "${eventName}" on ${eventDate}. Attendance form will be available on ${attendanceDate}.`,
      barangay: barangay,
      recipientType: "member",
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

const sendAttendanceReminderNotification = async (barangay, eventName, eventDate) => {
  try {
    await addDoc(collection(db, "notifications"), {
      type: "attendance-reminder",
      title: "Attendance Required",
      message: `Please submit your attendance for "${eventName}" today. Don't forget to mark your presence!`,
      barangay: barangay,
      recipientType: "member",
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
    if (referenceId) {
      notificationData.recipientReferenceId = referenceId
    }
    await addDoc(collection(db, "notifications"), notificationData)
    console.log("✅ General notification sent successfully")
  } catch (error) {
    console.error("❌ Error sending general notification:", error)
  }
}

defineExpose({
  sendResourceNotification,
  sendAttendanceFormNotification,
  sendAttendanceReminderNotification,
  sendGeneralNotification
})

const initializeUser = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      console.error('No authenticated user found')
      return
    }
    currentUser.value = user
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
    const q = query(
      notificationsCollection,
      where('barangay', '==', currentBarangay.value),
      where('recipientType', '==', 'member'),
      orderBy('createdAt', 'desc')
    )
    unsubscribeNotifications = onSnapshot(
      q,
      (snapshot) => {
        const notificationsList = []
        snapshot.forEach((doc) => {
          const data = doc.data()
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

const updateUnreadCount = () => {
  unreadCount.value = notifications.value.filter((n) => !n.read).length
}

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

const recentNotifications = computed(() => notifications.value.slice(0, 10))

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    await markAsRead(notification.id)
  }
  if (notification.type === 'resource') {
    router.push('/resources')
  } else if (notification.type === 'attendance' || notification.type === 'attendance-reminder') {
    router.push('/events')
  }
  showNotifications.value = false
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

const closeDropdowns = (event) => {
  if (!event.target.closest('.notifications') && showNotifications.value) {
    showNotifications.value = false
  }
  if (!event.target.closest('.user-profile') && showUserMenu.value) {
    showUserMenu.value = false
  }
}

const addClickListener = () => {
  window.addEventListener('click', closeDropdowns)
}

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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(20px);
  height: 80px;
  padding: 0 32px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.08), 0 1px 3px rgba(139, 92, 246, 0.05);
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 30;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  overflow: visible;
}

.topbar-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(168, 85, 247, 0.01) 100%);
  pointer-events: none;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 12px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-toggle-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.menu-toggle:hover .menu-toggle-ripple {
  opacity: 1;
}

.page-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.search-container {
  position: relative;
  width: 320px;
}

.search-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #8b5cf6;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border-radius: 16px;
  border: 2px solid rgba(139, 92, 246, 0.1);
  font-size: 14px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-weight: 500;
  position: relative;
  z-index: 2;
}

.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.search-input:focus {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.search-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.search-input:focus + .search-glow {
  opacity: 1;
}

.notifications {
  position: relative;
}

.notification-icon {
  cursor: pointer;
  position: relative;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.notification-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.notification-icon:hover .notification-glow {
  opacity: 1;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 11px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  border: 2px solid white;
  overflow: hidden;
}

.badge-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15), 0 8px 24px rgba(139, 92, 246, 0.1);
  border-radius: 20px;
  z-index: 1000;
  border: 1px solid rgba(139, 92, 246, 0.1);
  overflow: hidden;
}

.dropdown-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(168, 85, 247, 0.02) 100%);
  pointer-events: none;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  position: relative;
  z-index: 2;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
}

.notification-count {
  font-size: 12px;
  color: #8b5cf6;
  font-weight: 600;
}

.mark-read-btn {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  font-size: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.mark-read-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.mark-read-btn:disabled {
  color: #94a3b8;
  cursor: not-allowed;
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}

.loading-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  color: #64748b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(139, 92, 246, 0.1);
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  color: #64748b;
  text-align: center;
}

.empty-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon {
  width: 32px;
  height: 32px;
  color: #8b5cf6;
  opacity: 0.6;
}

.empty-notifications p {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #374151;
}

.empty-notifications span {
  font-size: 14px;
  color: #9ca3af;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.notification-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-item:hover::before {
  opacity: 1;
}

.notification-item.unread {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%);
}

.notification-item.unread-resource {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.03) 100%);
}

.notification-item.unread-attendance {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.03) 100%);
}

.notification-item.unread-attendance-reminder {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.03) 100%);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon-wrapper {
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.notification-type-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.notification-type-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 12px;
}

.notification-type-icon.resource {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.notification-type-icon.attendance {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.notification-type-icon.attendance-reminder {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%);
  color: #d97706;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.notification-type-icon.general {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.type-icon {
  width: 20px;
  height: 20px;
  position: relative;
  z-index: 2;
}

.notification-content {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 2;
}

.notification-title {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.3;
}

.notification-text {
  margin: 0 0 8px 0;
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

.unread-indicator {
  position: absolute;
  top: 24px;
  right: 20px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.indicator-resource {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.indicator-attendance {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.indicator-attendance-reminder {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.indicator-general {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.view-all {
  padding: 20px 24px;
  border-top: 1px solid rgba(139, 92, 246, 0.1);
  text-align: center;
}

.view-all-btn {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.view-all-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.view-all-btn:hover .btn-glow {
  opacity: 1;
}

.user-profile {
  position: relative;
  cursor: pointer;
}

.profile-wrapper {
  position: relative;
  padding: 4px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
}

.profile-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.profile-image {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.profile-status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 3;
}

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15), 0 8px 24px rgba(139, 92, 246, 0.1);
  border-radius: 20px;
  z-index: 1000;
  border: 1px solid rgba(139, 92, 246, 0.1);
  overflow: hidden;
}

.menu-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(168, 85, 247, 0.02) 100%);
  pointer-events: none;
}

.user-info {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.user-avatar-wrapper {
  position: relative;
}

.menu-profile-image {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
}

.avatar-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-info:hover .avatar-glow {
  opacity: 1;
}

.user-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.user-details p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.icon {
  width: 20px;
  height: 20px;
  color: #8b5cf6;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .topbar {
    padding: 0 20px;
    height: 70px;
  }
  
  .search-container {
    display: none;
  }
  
  .notification-dropdown {
    width: 360px;
    right: -20px;
  }
  
  .user-menu {
    width: 260px;
    right: -20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .right-section {
    gap: 16px;
  }
}

/* Custom scrollbar for notification list */
.notification-list::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-track {
  background: rgba(139, 92, 246, 0.05);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.3);
}
</style>
