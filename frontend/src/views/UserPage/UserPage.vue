<template>
  <div class="dashboard-home">
    <div class="welcome-section">
      <h2>Welcome back, {{ userName }}!</h2>
      <p class="date">{{ currentDate }}</p>
    </div>
    
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon upcoming">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="stat-content">
          <h3>{{ upcomingEvents.length }}</h3>
          <p>Upcoming Events</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon announcements">
          <i class="pi pi-megaphone"></i>
        </div>
        <div class="stat-content">
          <h3>{{ unreadAnnouncements }}</h3>
          <p>New Announcements</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon messages">
          <i class="pi pi-envelope"></i>
        </div>
        <div class="stat-content">
          <h3>{{ unreadMessages }}</h3>
          <p>New Attendance</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon requests">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-content">
          <h3>{{ pendingRequests }}</h3>
          <p>Pending Requests</p>
        </div>
      </div>
    </div>
    
    <div class="section-container">
      <div class="section-header">
        <h2>Upcoming Events</h2>
        <router-link to="/userdash/events" class="view-all">
          View All <i class="pi pi-arrow-right"></i>
        </router-link>
      </div>
      
      <div class="events-container">
        <div v-if="loading" class="loading-container">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Loading events...</p>
        </div>
        
        <div v-else-if="upcomingEvents.length === 0" class="empty-state">
          <i class="pi pi-calendar-times"></i>
          <p>No upcoming events at the moment</p>
        </div>
        
        <div v-else class="events-list">
          <div 
            v-for="event in upcomingEvents" 
            :key="event.id" 
            class="event-card"
          >
            <div class="event-date">
              <span class="day">{{ formatDay(event.date) }}</span>
              <span class="month">{{ formatMonth(event.date) }}</span>
            </div>
            
            <div class="event-details">
              <h3 class="event-title">{{ event.title }}</h3>
              <p class="event-location">
                <i class="pi pi-map-marker"></i> {{ event.location }}
              </p>
              <p class="event-time">
                <i class="pi pi-clock"></i> {{ formatTime(event.date) }}
              </p>
              <p class="event-description">{{ event.description }}</p>
              
              <div class="event-actions">
                <button class="btn-rsvp" @click="rsvpEvent(event.id)">
                  RSVP
                </button>
                <button class="btn-details" @click="viewEventDetails(event.id)">
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section-container">
      <div class="section-header">
        <h2>Recent Announcements</h2>
        <router-link to="/userdash/announcements" class="view-all">
          View All <i class="pi pi-arrow-right"></i>
        </router-link>
      </div>
      
      <div class="announcements-container">
        <div v-if="loading" class="loading-container">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Loading announcements...</p>
        </div>
        
        <div v-else-if="recentAnnouncements.length === 0" class="empty-state">
          <i class="pi pi-info-circle"></i>
          <p>No recent announcements</p>
        </div>
        
        <div v-else class="announcements-list">
          <div 
            v-for="announcement in recentAnnouncements" 
            :key="announcement.id" 
            class="announcement-card"
          >
            <div class="announcement-header">
              <h3>{{ announcement.title }}</h3>
              <span class="announcement-date">{{ formatDate(announcement.date) }}</span>
            </div>
            <p class="announcement-content">{{ announcement.content }}</p>
            <div class="announcement-footer">
              <span class="announcement-author">
                Posted by: {{ announcement.author }}
              </span>
              <button class="btn-read-more" @click="viewAnnouncementDetails(announcement.id)">
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import { db } from "@/services/firebase"
import { collection, query, where, orderBy, limit, getDocs, Timestamp, getDoc, doc } from "firebase/firestore"

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const error = ref(null)

// Stats
const unreadAnnouncements = ref(0)
const unreadMessages = ref(0)
const pendingRequests = ref(0)

// Events and Announcements
const upcomingEvents = ref([])
const recentAnnouncements = ref([])

const userName = computed(() => {
  return userStore.user?.firstName || "User"
})

const currentDate = computed(() => {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  return new Date().toLocaleDateString("en-US", options)
})

// Format functions
const formatDay = (dateString) => {
  const date = new Date(dateString)
  return date.getDate()
}

const formatMonth = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString("default", { month: "short" })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

// Event actions
const rsvpEvent = (eventId) => {
  // Implement RSVP functionality
  console.log("RSVP for event:", eventId)
}

const viewEventDetails = (eventId) => {
  router.push(`/userdash/events/${eventId}`)
}

const viewAnnouncementDetails = (announcementId) => {
  router.push(`/userdash/announcements/${announcementId}`)
}

// Check if user is authenticated
const checkAuth = async () => {
  const user = userStore.user
  if (!user) {
    router.push("/login")
    return null
  }
  return user
}

// Fetch events with error handling
const fetchEvents = async (userBarangay) => {
  try {
    const currentDate = new Date()

    // First try with visibility filter
    try {
      const eventsQuery = query(
        collection(db, "events"),
        where("date", ">=", currentDate),
        where("visibility", "array-contains-any", ["all", userBarangay]),
        orderBy("date", "asc"),
        limit(3),
      )

      const eventsSnapshot = await getDocs(eventsQuery)
      return eventsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        }
      })
    } catch (err) {
      console.warn("Visibility filter failed, trying without filter:", err)

      // Fallback: try without visibility filter
      const eventsQuery = query(
        collection(db, "events"),
        where("date", ">=", currentDate),
        orderBy("date", "asc"),
        limit(3),
      )

      const eventsSnapshot = await getDocs(eventsQuery)
      return eventsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        }
      })
    }
  } catch (err) {
    console.error("Error fetching events:", err)
    error.value = "Failed to load events. Please try again later."
    return []
  }
}

// Fetch announcements with error handling
const fetchAnnouncements = async (userBarangay) => {
  try {
    // First try with visibility filter
    try {
      const announcementsQuery = query(
        collection(db, "announcements"),
        where("visibility", "array-contains-any", ["all", userBarangay]),
        orderBy("date", "desc"),
        limit(3),
      )

      const announcementsSnapshot = await getDocs(announcementsQuery)
      return announcementsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        }
      })
    } catch (err) {
      console.warn("Visibility filter failed, trying without filter:", err)

      // Fallback: try without visibility filter
      const announcementsQuery = query(collection(db, "announcements"), orderBy("date", "desc"), limit(3))

      const announcementsSnapshot = await getDocs(announcementsQuery)
      return announcementsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        }
      })
    }
  } catch (err) {
    console.error("Error fetching announcements:", err)
    error.value = "Failed to load announcements. Please try again later."
    return []
  }
}

// Fetch counts with error handling
const fetchCounts = async (userId, announcements) => {
  try {
    // Count unread announcements from already fetched announcements
    unreadAnnouncements.value = announcements.filter(
      (announcement) => !announcement.readBy || !announcement.readBy.includes(userId),
    ).length

    // Try to fetch unread messages count
    try {
      const messagesQuery = query(
        collection(db, "messages"),
        where("recipientId", "==", userId),
        where("read", "==", false),
      )

      const messagesSnapshot = await getDocs(messagesQuery)
      unreadMessages.value = messagesSnapshot.size
    } catch (err) {
      console.warn("Error fetching messages count:", err)
      unreadMessages.value = 0
    }

    // Try to fetch pending resource requests
    try {
      const requestsQuery = query(
        collection(db, "resourceRequests"),
        where("userId", "==", userId),
        where("status", "==", "pending"),
      )

      const requestsSnapshot = await getDocs(requestsQuery)
      pendingRequests.value = requestsSnapshot.size
    } catch (err) {
      console.warn("Error fetching requests count:", err)
      pendingRequests.value = 0
    }
  } catch (err) {
    console.error("Error fetching counts:", err)
  }
}

onMounted(async () => {
  try {
    const user = await checkAuth()
    if (!user) return

    const userBarangay = user.barangay
    const userId = user.userId

    if (!userBarangay) {
      console.warn("User does not have a barangay assigned")
    }

    console.log(`Fetching data for user in barangay: ${userBarangay}`)

    // Fetch data in parallel
    const [events, announcements] = await Promise.all([fetchEvents(userBarangay), fetchAnnouncements(userBarangay)])

    upcomingEvents.value = events
    recentAnnouncements.value = announcements

    console.log(`Found ${upcomingEvents.value.length} upcoming events`)
    console.log(`Found ${recentAnnouncements.value.length} recent announcements`)

    // Fetch counts after initial data load
    if (userId) {
      await fetchCounts(userId, recentAnnouncements.value)
    } else {
      console.warn("User ID is not available. Skipping count fetches.")
    }
  } catch (err) {
    console.error("Error in dashboard initialization:", err)
    error.value = "Failed to load dashboard data. Please try again later."
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Dashboard Container - Now flexible and responsive */
.dashboard-home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
}

/* Welcome Section */
.welcome-section {
   margin: 0 0 1rem 0;
  padding-top: 0;
}

.welcome-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.date {
  color: #666;
  font-size: 1rem;
}

/* Stats Cards - Responsive Grid */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
  width: 100%;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 0; /* Prevent flex items from overflowing */
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.stat-icon.upcoming {
  background-color: rgba(134, 40, 216, 0.07);
  color: #8528d8;
}

.stat-icon.announcements {
  background-color: rgba(255, 159, 67, 0.1);
  color: #ff9f43;
}

.stat-icon.messages {
  background-color: rgba(0, 207, 232, 0.1);
  color: #00cfe8;
}

.stat-icon.requests {
  background-color: rgba(40, 199, 111, 0.1);
  color: #28c76f;
}

.stat-content {
  flex: 1;
  min-width: 0; /* Allow text to wrap if needed */
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Section Containers */
.section-container {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
}

.section-container:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.view-all {
  color: #8528d8;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.view-all:hover {
  color: #7020b9;
  text-decoration: underline;
}

/* Loading and Empty States */
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
  gap: 1rem;
}

.loading-container i,
.empty-state i {
  font-size: 2rem;
  color: #8528d8;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.event-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: #8528d8;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0.5rem;
  background-color: #8528d8;
  color: white;
  border-radius: 8px;
  flex-shrink: 0;
}

.event-date .day {
  font-size: 1.5rem;
  font-weight: 700;
}

.event-date .month {
  font-size: 0.9rem;
  text-transform: uppercase;
}

.event-details {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.event-location, .event-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.event-description {
  margin: 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
  line-height: 1.5;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-rsvp, .btn-details {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-rsvp {
  background-color: #8528d8;
  color: white;
}

.btn-rsvp:hover {
  background-color: #7020b9;
}

.btn-details {
  background-color: transparent;
  color: #8528d8;
  border: 1px solid #8528d8;
}

.btn-details:hover {
  background-color: rgba(133, 40, 216, 0.1);
}

/* Announcements List */
.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.announcement-card {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.announcement-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: #8528d8;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.announcement-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
  flex: 1;
  min-width: 0;
}

.announcement-date {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

.announcement-content {
  margin: 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
  line-height: 1.5;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.announcement-author {
  font-size: 0.8rem;
  color: #666;
  flex: 1;
  min-width: 0;
}

.btn-read-more {
  background-color: transparent;
  color: #8528d8;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.btn-read-more:hover {
  background-color: rgba(133, 40, 216, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .dashboard-home {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-home {
    gap: 1.5rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .section-container {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .event-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .event-date {
    flex-direction: row;
    gap: 0.5rem;
    width: fit-content;
    align-self: flex-start;
  }
  
  
  .welcome-section h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-home {
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .section-container {
    padding: 0.75rem;
  }
  
  .welcome-section h2 {
    font-size: 1.25rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
  
  .announcement-header,
  .announcement-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .event-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-rsvp,
  .btn-details {
    width: 100%;
    justify-content: center;
  }
}

/* Enhanced focus states for accessibility */
.view-all:focus,
.btn-rsvp:focus,
.btn-details:focus,
.btn-read-more:focus {
  outline: 2px solid #8528d8;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Smooth animations for better UX */
@media (prefers-reduced-motion: no-preference) {
  .stat-card,
  .section-container,
  .event-card,
  .announcement-card {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>