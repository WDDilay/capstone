<template>
  <div class="app-container">
    <!-- Main Header / Navbar -->
    <header class="main-header">
      <div class="header-left">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i class="pi" :class="isSidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
        </button>
        <h1>Member Dashboard</h1>
      </div>
      <div class="header-right">
        <div class="notification-wrapper">
          <router-link to="/notifications" class="icon notification-icon" @click="clearNotifications">
            <i class="pi pi-bell"></i>
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
          </router-link>
        </div>
        <div class="profile-dropdown">
          <span class="icon profile-icon" @click="toggleDropdown">
            <i class="pi pi-user-circle"></i> {{ user.name }}
          </span>
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <router-link to="/profile">My Profile</router-link>
            <router-link to="/login">Logout</router-link>
          </div>
        </div>
      </div>
    </header>

    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside :class="{ 'sidebar': true, 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }">
        <!-- Sidebar Header with Logo -->
        <div class="sidebar-header">
          <img src="@/assets/SPFLOGO.png" alt="Logo" class="logo" />
          <h2 :class="{ 'fade-out': !isSidebarOpen }">Solo Parent Federation</h2>
        </div>
        
        <!-- Sidebar Navigation -->
        <nav>
          <ul>
            <li>
              <router-link to="/userdash" class="active">
                <i class="pi pi-home"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/userprofile">
                <i class="pi pi-user"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">My Profile</span>
              </router-link>
            </li>
            <li>
              <router-link to="/user_announcement">
                <i class="pi pi-megaphone"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">Announcements</span>
              </router-link>
            </li>
            <li>
              <router-link to="/available_resource">
                <i class="pi pi-box"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">Available Resources</span>
              </router-link>
            </li>
            <li>
              <router-link to="/usermessage">
                <i class="pi pi-envelope"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">Messages</span>
              </router-link>
            </li>
            <li>
              <router-link to="/resourcereq">
                <i class="pi pi-file"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">Request Resources</span>
              </router-link>
            </li>
            <li>
              <router-link to="/user_event">
                <i class="pi pi-calendar"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">Events</span>
              </router-link>
            </li>
            <li class="logout">
              <router-link to="/">
                <i class="pi pi-sign-out"></i> 
                <span :class="{ 'fade-out': !isSidebarOpen }">Logout</span>
              </router-link>
            </li>
          </ul>
        </nav>
        
        <!-- Sidebar Toggle Button -->
        <div class="sidebar-footer">
          <button class="toggle-button" @click="toggleSidebar">
            <i class="pi" :class="isSidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main :class="{ 'content': true, 'content-expanded': !isSidebarOpen }">
        <section class="stats">
          <router-link to="/resources" class="card">
            <div class="card-icon">
              <i class="pi pi-box"></i>
            </div>
            <div class="card-content">
              <h2>Available Resources</h2>
              <p>Resources you can request</p>
              <span class="card-value">{{ stats.resources }}</span>
            </div>
          </router-link>
          
          <router-link to="/my-requests" class="card">
            <div class="card-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="card-content">
              <h2>My Requests</h2>
              <p>Your pending resource requests</p>
              <span class="card-value">{{ stats.pending }}</span>
            </div>
          </router-link>
          
          <router-link to="/messages" class="card">
            <div class="card-icon">
              <i class="pi pi-envelope"></i>
            </div>
            <div class="card-content">
              <h2>Messages</h2>
              <p>Unread messages in your inbox</p>
              <span class="card-value">{{ stats.messages }}</span>
            </div>
          </router-link>
        </section>

        <section class="upcoming-events">
          <h2 class="section-title">Upcoming Events</h2>
          <div class="events-list">
            <div v-for="(event, index) in events" :key="index" class="event-card">
              <div class="event-date">
                <span class="day">{{ formatDay(event.date) }}</span>
                <span class="month">{{ formatMonth(event.date) }}</span>
              </div>
              <div class="event-details">
                <h3>{{ event.title }}</h3>
                <p class="event-location"><i class="pi pi-map-marker"></i> {{ event.location }}</p>
                <p class="event-time"><i class="pi pi-clock"></i> {{ formatTime(event.date) }}</p>
              </div>
              <button class="event-action">RSVP</button>
            </div>
            <div v-if="events.length === 0" class="no-events">
              No upcoming events at this time
            </div>
          </div>
        </section>

        <div class="chart-container">
          <div class="chart-box">
            <h3>My Resource Requests</h3>
            <div class="placeholder-chart">
              <div class="chart-placeholder-text">Request Status Chart</div>
              <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: #4CAF50;"></span>Approved</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #FFC107;"></span>Pending</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #F44336;"></span>Rejected</div>
              </div>
            </div>
          </div>

          <div class="chart-box">
            <h3>Resource Availability</h3>
            <div class="placeholder-chart">
              <div class="chart-placeholder-text">Resource Availability Chart</div>
              <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: #4CAF50;"></span>Food</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #2196F3;"></span>Supplies</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #FFC107;"></span>Financial Aid</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { db } from '@/services/firebase.js';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export default {
  data() {
    return {
      isSidebarOpen: true,
      isDropdownOpen: false,
      user: { 
        name: "Loading...", 
        id: null,
        barangay: ""
      },
      stats: { 
        resources: 0, 
        pending: 0, 
        messages: 0 
      },
      unreadCount: 0,
      events: [
        {
          title: "Solo Parent Support Group",
          location: "Community Center",
          date: new Date(Date.now() + 86400000 * 2), // 2 days from now
          description: "Weekly support group meeting"
        },
        {
          title: "Resource Distribution",
          location: "Barangay Hall",
          date: new Date(Date.now() + 86400000 * 5), // 5 days from now
          description: "Distribution of food packages"
        },
        {
          title: "Skills Training Workshop",
          location: "Training Center",
          date: new Date(Date.now() + 86400000 * 10), // 10 days from now
          description: "Free skills training for solo parents"
        }
      ]
    };
  },
  created() {
    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const barangay = localStorage.getItem('barangay');
    
    if (userId && userName) {
      this.user.id = userId;
      this.user.name = userName;
      this.user.barangay = barangay || "Unknown";
      
      this.fetchUserData();
    } else {
      // Sample data for demonstration
      this.stats.resources = 15;
      this.stats.pending = 3;
      this.stats.messages = 2;
      this.unreadCount = 2;
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    clearNotifications() {
      this.unreadCount = 0;
    },
    async fetchUserData() {
      if (!this.user.id) return;
      
      try {
        // Fetch user's pending requests
        const requestsRef = collection(db, "requests");
        const q = query(
          requestsRef, 
          where("userId", "==", this.user.id),
          where("status", "==", "pending")
        );
        const requestsSnapshot = await getDocs(q);
        this.stats.pending = requestsSnapshot.size;
        
        // Fetch unread messages
        const messagesRef = collection(db, "messages");
        const msgQuery = query(
          messagesRef,
          where("recipientId", "==", this.user.id),
          where("read", "==", false)
        );
        const messagesSnapshot = await getDocs(msgQuery);
        this.stats.messages = messagesSnapshot.size;
        this.unreadCount = messagesSnapshot.size;
        
        // Fetch available resources
        if (this.user.barangay) {
          const inventoryRef = collection(db, "inventory");
          const invQuery = query(
            inventoryRef, 
            where("barangay", "==", this.user.barangay),
            where("available", "==", true)
          );
          const inventorySnapshot = await getDocs(invQuery);
          this.stats.resources = inventorySnapshot.size;
        }
        
        // Fetch events
        this.fetchEvents();
        
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
        // Set fallback data
        this.stats.resources = 15;
        this.stats.pending = 3;
        this.stats.messages = 2;
      }
    },
    async fetchEvents() {
      if (!this.user.barangay) return;
      
      try {
        const eventsRef = collection(db, "events");
        const now = new Date();
        
        const q = query(
          eventsRef,
          where("barangay", "==", this.user.barangay),
          where("date", ">=", now),
          orderBy("date"),
          limit(3)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          this.events = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore timestamp to JS Date
            return {
              id: doc.id,
              title: data.title,
              location: data.location,
              date: data.date.toDate ? data.date.toDate() : new Date(data.date),
              description: data.description
            };
          });
        }
        
      } catch (error) {
        console.error("❌ Error fetching events:", error);
        // Keep the default events
      }
    },
    formatDay(date) {
      return date.getDate();
    },
    formatMonth(date) {
      return date.toLocaleString('default', { month: 'short' });
    },
    formatTime(date) {
      return date.toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  }
};
</script>

<style scoped>
/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header / Navbar */
.main-header {
  background: #6a0dad;
  color: white;
  padding: 15px 20px;
  font-weight: bold;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.chart-box {
  flex: 1;
  min-width: 300px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Placeholder for charts */
.placeholder-chart {
  height: 250px;
  background-color: #f9f4ff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.chart-placeholder-text {
  font-size: 16px;
  color: #6a0dad;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 3px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  font-size: 24px;
  margin: 0;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Header Right Icons */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon {
  font-size: 20px;
  cursor: pointer;
}

.profile-icon, .notification-icon {
  color: white;
  font-size: 18px;
}

.notification-wrapper {
  position: relative;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: red;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Profile Dropdown */
.profile-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 30px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 120px;
  z-index: 1001;
}

.dropdown-menu a {
  padding: 10px;
  text-decoration: none;
  color: black;
  display: block;
}

.dropdown-menu a:hover {
  background: #f4f0ff;
}

/* Dashboard Container */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  padding-top: 70px;
  background: #f0e6ff;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: white;
  position: fixed;
  top: 70px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  z-index: 900;
}

.sidebar-closed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 15px;
  border-bottom: 1px solid #f0e6ff;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.sidebar-header h2 {
  font-size: 16px;
  margin: 0;
  color: #6a0dad;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

nav {
  flex: 1;
  padding: 15px 0;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav li {
  margin-bottom: 5px;
}

nav li a {
  text-decoration: none;
  color: #6a0dad;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  transition: background 0.3s;
  border-radius: 0 20px 20px 0;
  margin-right: 10px;
}

nav li a span {
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

nav li a:hover {
  background: #f0e6ff;
}

nav li a.active {
  background: #f0e6ff;
  font-weight: bold;
}

.sidebar-footer {
  padding: 15px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0e6ff;
}

.toggle-button {
  background: #f0e6ff;
  border: none;
  color: #6a0dad;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-button:hover {
  background: #e0d0ff;
}

/* Main Content */
.content {
  flex: 1;
  padding: 20px;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.content-expanded {
  margin-left: 60px;
}

/* Stats Section */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: inherit;
  display: flex;
  gap: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-icon {
  background: #f0e6ff;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 24px;
  color: #6a0dad;
}

.card-content {
  flex: 1;
}

.card h2 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.card-value {
  display: block;
  margin-top: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #6a0dad;
}

/* Upcoming Events Section */
.upcoming-events {
  margin-top: 30px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.event-date {
  background: #6a0dad;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-date .day {
  font-size: 22px;
  font-weight: bold;
  line-height: 1;
}

.event-date .month {
  font-size: 14px;
  text-transform: uppercase;
}

.event-details {
  flex: 1;
}

.event-details h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.event-location, .event-time {
  margin: 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.event-action {
  background: #f0e6ff;
  color: #6a0dad;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.event-action:hover {
  background: #e0d0ff;
}

.no-events {
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  color: #666;
}

/* Utility Classes */
.fade-out {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 250px;
  }
  
  .sidebar-open {
    transform: translateX(0);
  }
  
  .content {
    margin-left: 0;
  }
  
  .content-expanded {
    margin-left: 0;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .card {
    padding: 20px;
  }
  
  .chart-container {
    flex-direction: column;
  }
  
  .chart-box {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 10px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .card {
    flex-direction: column;
    text-align: center;
  }
  
  .card-icon {
    margin: 0 auto;
  }
  
  .event-card {
    flex-direction: column;
    text-align: center;
  }
  
  .event-details {
    width: 100%;
  }
}
</style>