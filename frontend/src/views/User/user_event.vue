<template>
<div class="app-container">
  <!-- Main Header / Navbar -->
  <header class="main-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="pi" :class="isSidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
      </button>
      <h1>Events</h1>
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
            <router-link to="/userdash">
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
            <router-link to="/user_event" class="active">
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
      <div class="events-container">
        <!-- Events Header with Filters -->
        <div class="events-header">
          <div class="view-toggle">
            <button 
              class="view-btn" 
              :class="{ 'active': viewMode === 'calendar' }"
              @click="viewMode = 'calendar'"
            >
              <i class="pi pi-calendar"></i> Calendar View
            </button>
            <button 
              class="view-btn" 
              :class="{ 'active': viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <i class="pi pi-list"></i> List View
            </button>
          </div>
          
          <div class="filters">
            <div class="month-selector">
              <button class="month-nav" @click="previousMonth">
                <i class="pi pi-chevron-left"></i>
              </button>
              <h2>{{ currentMonthYear }}</h2>
              <button class="month-nav" @click="nextMonth">
                <i class="pi pi-chevron-right"></i>
              </button>
            </div>
            
            <div class="category-filter">
              <div class="select-wrapper">
                <select v-model="selectedCategory" class="filter-select">
                  <option value="all">All Categories</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
                <i class="pi pi-chevron-down select-icon"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Calendar View -->
        <div v-if="viewMode === 'calendar'" class="calendar-view">
          <div class="calendar-header">
            <div v-for="day in weekDays" :key="day" class="calendar-day-header">
              {{ day }}
            </div>
          </div>
          
          <div class="calendar-body">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index" 
              class="calendar-day"
              :class="{ 
                'other-month': day.otherMonth, 
                'today': day.isToday,
                'has-events': day.events.length > 0
              }"
            >
              <div class="day-number">{{ day.date }}</div>
              
              <div v-if="day.events.length > 0" class="day-events">
                <div 
                  v-for="event in day.events.slice(0, 2)" 
                  :key="event.id" 
                  class="day-event"
                  :class="'event-category-' + event.category.toLowerCase().replace(' ', '-')"
                  @click="showEventDetails(event)"
                >
                  <div class="event-time">{{ formatTime(event.startTime) }}</div>
                  <div class="event-title">{{ event.title }}</div>
                </div>
                
                <div v-if="day.events.length > 2" class="more-events" @click="showDayEvents(day)">
                  +{{ day.events.length - 2 }} more
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- List View -->
        <div v-else class="events-list">
          <div v-if="filteredEvents.length === 0" class="no-events">
            <div class="no-events-icon">
              <i class="pi pi-calendar-times"></i>
            </div>
            <h3>No Events Found</h3>
            <p>There are no events scheduled for the selected filters.</p>
          </div>
          
          <div v-else>
            <!-- Upcoming Events Section -->
            <div v-if="upcomingEvents.length > 0" class="events-section">
              <h3 class="section-title">
                <i class="pi pi-calendar-plus"></i> Upcoming Events
              </h3>
              
              <div class="events-grid">
                <div 
                  v-for="event in upcomingEvents" 
                  :key="event.id" 
                  class="event-card"
                  :class="'event-category-' + event.category.toLowerCase().replace(' ', '-')"
                >
                  <div class="event-card-header">
                    <div class="event-date">
                      <div class="event-month">{{ formatMonth(event.date) }}</div>
                      <div class="event-day">{{ formatDay(event.date) }}</div>
                    </div>
                    <div class="event-title-wrapper">
                      <h3 class="event-title">{{ event.title }}</h3>
                      <div class="event-category">{{ event.category }}</div>
                    </div>
                  </div>
                  
                  <div class="event-card-body">
                    <div class="event-detail">
                      <i class="pi pi-clock"></i>
                      <span>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
                    </div>
                    
                    <div class="event-detail">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ event.location }}</span>
                    </div>
                    
                    <div class="event-description">
                      {{ event.description }}
                    </div>
                    
                    <div v-if="event.requirements && event.requirements.length > 0" class="event-requirements">
                      <h4>What to Bring:</h4>
                      <ul>
                        <li v-for="(req, index) in event.requirements" :key="index">
                          {{ req }}
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="event-card-footer">
                    <button class="event-action-btn" @click="registerForEvent(event)">
                      <i class="pi pi-check-circle"></i> Register
                    </button>
                    <button class="event-action-btn secondary" @click="addToCalendar(event)">
                      <i class="pi pi-calendar-plus"></i> Add to Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Today's Events Section -->
            <div v-if="todayEvents.length > 0" class="events-section">
              <h3 class="section-title">
                <i class="pi pi-calendar"></i> Today's Events
              </h3>
              
              <div class="events-grid">
                <div 
                  v-for="event in todayEvents" 
                  :key="event.id" 
                  class="event-card today-event"
                  :class="'event-category-' + event.category.toLowerCase().replace(' ', '-')"
                >
                  <div class="event-card-header">
                    <div class="event-status">Happening Today</div>
                    <div class="event-title-wrapper">
                      <h3 class="event-title">{{ event.title }}</h3>
                      <div class="event-category">{{ event.category }}</div>
                    </div>
                  </div>
                  
                  <div class="event-card-body">
                    <div class="event-detail">
                      <i class="pi pi-clock"></i>
                      <span>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
                    </div>
                    
                    <div class="event-detail">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ event.location }}</span>
                    </div>
                    
                    <div class="event-description">
                      {{ event.description }}
                    </div>
                    
                    <div v-if="event.requirements && event.requirements.length > 0" class="event-requirements">
                      <h4>What to Bring:</h4>
                      <ul>
                        <li v-for="(req, index) in event.requirements" :key="index">
                          {{ req }}
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="event-card-footer">
                    <button class="event-action-btn" @click="registerForEvent(event)">
                      <i class="pi pi-check-circle"></i> Register
                    </button>
                    <button class="event-action-btn secondary" @click="getDirections(event)">
                      <i class="pi pi-map-marker"></i> Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Past Events Section -->
            <div v-if="pastEvents.length > 0" class="events-section">
              <h3 class="section-title">
                <i class="pi pi-calendar-minus"></i> Past Events
              </h3>
              
              <div class="events-grid">
                <div 
                  v-for="event in pastEvents" 
                  :key="event.id" 
                  class="event-card past-event"
                  :class="'event-category-' + event.category.toLowerCase().replace(' ', '-')"
                >
                  <div class="event-card-header">
                    <div class="event-date">
                      <div class="event-month">{{ formatMonth(event.date) }}</div>
                      <div class="event-day">{{ formatDay(event.date) }}</div>
                    </div>
                    <div class="event-title-wrapper">
                      <h3 class="event-title">{{ event.title }}</h3>
                      <div class="event-category">{{ event.category }}</div>
                    </div>
                  </div>
                  
                  <div class="event-card-body">
                    <div class="event-detail">
                      <i class="pi pi-clock"></i>
                      <span>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
                    </div>
                    
                    <div class="event-detail">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ event.location }}</span>
                    </div>
                    
                    <div class="event-description">
                      {{ event.description }}
                    </div>
                  </div>
                  
                  <div class="event-card-footer">
                    <button class="event-action-btn" @click="viewEventPhotos(event)">
                      <i class="pi pi-images"></i> View Photos
                    </button>
                    <button class="event-action-btn secondary" @click="viewEventFeedback(event)">
                      <i class="pi pi-comment"></i> View Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  
  <!-- Event Details Modal -->
  <div v-if="selectedEvent" class="modal-overlay" @click="closeEventDetails">
    <div class="modal-content event-modal" @click.stop>
      <div class="modal-header">
        <h2>Event Details</h2>
        <button class="modal-close" @click="closeEventDetails">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="event-modal-header">
          <h3>{{ selectedEvent.title }}</h3>
          <div class="event-category-badge" :class="'event-category-' + selectedEvent.category.toLowerCase().replace(' ', '-')">
            {{ selectedEvent.category }}
          </div>
        </div>
        
        <div class="event-modal-details">
          <div class="event-detail-item">
            <i class="pi pi-calendar"></i>
            <div>
              <strong>Date:</strong>
              <div>{{ formatFullDate(selectedEvent.date) }}</div>
            </div>
          </div>
          
          <div class="event-detail-item">
            <i class="pi pi-clock"></i>
            <div>
              <strong>Time:</strong>
              <div>{{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}</div>
            </div>
          </div>
          
          <div class="event-detail-item">
            <i class="pi pi-map-marker"></i>
            <div>
              <strong>Location:</strong>
              <div>{{ selectedEvent.location }}</div>
            </div>
          </div>
          
          <div class="event-detail-item">
            <i class="pi pi-user"></i>
            <div>
              <strong>Organizer:</strong>
              <div>{{ selectedEvent.organizer }}</div>
            </div>
          </div>
        </div>
        
        <div class="event-modal-description">
          <h4>About this Event</h4>
          <p>{{ selectedEvent.description }}</p>
        </div>
        
        <div v-if="selectedEvent.requirements && selectedEvent.requirements.length > 0" class="event-modal-requirements">
          <h4>What to Bring</h4>
          <ul>
            <li v-for="(req, index) in selectedEvent.requirements" :key="index">
              {{ req }}
            </li>
          </ul>
        </div>
        
        <div v-if="selectedEvent.agenda && selectedEvent.agenda.length > 0" class="event-modal-agenda">
          <h4>Event Agenda</h4>
          <div class="agenda-timeline">
            <div v-for="(item, index) in selectedEvent.agenda" :key="index" class="agenda-item">
              <div class="agenda-time">{{ item.time }}</div>
              <div class="agenda-content">
                <div class="agenda-title">{{ item.title }}</div>
                <div v-if="item.description" class="agenda-description">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="event-action-btn secondary" @click="closeEventDetails">
          Close
        </button>
        <button class="event-action-btn" @click="registerForEvent(selectedEvent)">
          <i class="pi pi-check-circle"></i> Register for Event
        </button>
      </div>
    </div>
  </div>
  
  <!-- Day Events Modal -->
  <div v-if="selectedDay" class="modal-overlay" @click="closeDayEvents">
    <div class="modal-content day-events-modal" @click.stop>
      <div class="modal-header">
        <h2>Events on {{ formatFullDate(selectedDay.fullDate) }}</h2>
        <button class="modal-close" @click="closeDayEvents">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div v-if="selectedDay.events.length === 0" class="no-events-message">
          No events scheduled for this day.
        </div>
        <div v-else class="day-events-list">
          <div 
            v-for="event in selectedDay.events" 
            :key="event.id" 
            class="day-event-item"
            :class="'event-category-' + event.category.toLowerCase().replace(' ', '-')"
            @click="showEventDetails(event)"
          >
            <div class="day-event-time">
              {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
            </div>
            <div class="day-event-content">
              <div class="day-event-title">{{ event.title }}</div>
              <div class="day-event-location">
                <i class="pi pi-map-marker"></i> {{ event.location }}
              </div>
            </div>
            <div class="day-event-category">{{ event.category }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { db } from '@/services/firebase.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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
      unreadCount: 0,
      viewMode: 'calendar', // 'calendar' or 'list'
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      selectedCategory: 'all',
      categories: ['Workshop', 'Seminar', 'Meeting', 'Distribution', 'Celebration', 'Training'],
      events: [],
      selectedEvent: null,
      selectedDay: null,
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  },
  computed: {
    currentMonthYear() {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[this.currentMonth]} ${this.currentYear}`;
    },
    filteredEvents() {
      let filtered = this.events;
      
      // Filter by category if not 'all'
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(event => event.category === this.selectedCategory);
      }
      
      // Filter by current month if in calendar view
      if (this.viewMode === 'calendar') {
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === this.currentMonth && 
                 eventDate.getFullYear() === this.currentYear;
        });
      }
      
      return filtered;
    },
    calendarDays() {
      const days = [];
      const today = new Date();
      
      // First day of the month
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      // Last day of the month
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      
      // Get the day of the week for the first day (0-6, where 0 is Sunday)
      const firstDayOfWeek = firstDay.getDay();
      
      // Add days from previous month to fill the first week
      const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i;
        const fullDate = new Date(this.currentYear, this.currentMonth - 1, date);
        
        days.push({
          date,
          fullDate,
          otherMonth: true,
          isToday: this.isSameDay(fullDate, today),
          events: this.getEventsForDay(fullDate)
        });
      }
      
      // Add days of the current month
      for (let date = 1; date <= lastDay.getDate(); date++) {
        const fullDate = new Date(this.currentYear, this.currentMonth, date);
        
        days.push({
          date,
          fullDate,
          otherMonth: false,
          isToday: this.isSameDay(fullDate, today),
          events: this.getEventsForDay(fullDate)
        });
      }
      
      // Add days from next month to complete the last week
      const remainingDays = 42 - days.length; // 6 rows of 7 days
      for (let date = 1; date <= remainingDays; date++) {
        const fullDate = new Date(this.currentYear, this.currentMonth + 1, date);
        
        days.push({
          date,
          fullDate,
          otherMonth: true,
          isToday: this.isSameDay(fullDate, today),
          events: this.getEventsForDay(fullDate)
        });
      }
      
      return days;
    },
    upcomingEvents() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.filteredEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate > today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6); // Limit to 6 upcoming events
    },
    todayEvents() {
      const today = new Date();
      
      return this.filteredEvents
        .filter(event => this.isSameDay(new Date(event.date), today))
        .sort((a, b) => {
          const timeA = this.parseTime(a.startTime);
          const timeB = this.parseTime(b.startTime);
          return timeA - timeB;
        });
    },
    pastEvents() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.filteredEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by most recent first
        .slice(0, 3); // Limit to 3 past events
    }
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
      
      this.fetchEvents();
      this.fetchNotifications();
    } else {
      // Sample data for demonstration
      this.loadSampleData();
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
    previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    },
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    },
    getEventsForDay(date) {
      return this.filteredEvents.filter(event => this.isSameDay(new Date(event.date), date));
    },
    formatTime(time) {
      if (!time) return '';
      
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      
      return `${formattedHour}:${minutes} ${period}`;
    },
    parseTime(timeString) {
      if (!timeString) return 0;
      
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    },
    formatMonth(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[date.getMonth()];
    },
    formatDay(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.getDate();
    },
    formatFullDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    },
    showEventDetails(event) {
      this.selectedEvent = event;
    },
    closeEventDetails() {
      this.selectedEvent = null;
    },
    showDayEvents(day) {
      this.selectedDay = day;
    },
    closeDayEvents() {
      this.selectedDay = null;
    },
    registerForEvent(event) {
      // In a real app, you would implement registration logic here
      alert(`You have registered for: ${event.title}`);
    },
    addToCalendar(event) {
      // In a real app, you would implement calendar integration here
      alert(`Event added to your calendar: ${event.title}`);
    },
    getDirections(event) {
      // In a real app, you would implement map integration here
      alert(`Getting directions to: ${event.location}`);
    },
    viewEventPhotos(event) {
      // In a real app, you would show a photo gallery
      alert(`Viewing photos from: ${event.title}`);
    },
    viewEventFeedback(event) {
      // In a real app, you would show feedback and comments
      alert(`Viewing feedback for: ${event.title}`);
    },
    async fetchEvents() {
      try {
        const eventsRef = collection(db, "events");
        let q;
        
        // If barangay is specified, get events for that barangay or global events
        if (this.user.barangay !== "Unknown") {
          q = query(
            eventsRef,
            where("barangay", "in", [this.user.barangay, "All"]),
            orderBy("date", "asc")
          );
        } else {
          // If no barangay, just get global events
          q = query(
            eventsRef,
            where("barangay", "==", "All"),
            orderBy("date", "asc")
          );
        }
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          this.events = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
              startTime: data.startTime || '09:00',
              endTime: data.endTime || '12:00',
              location: data.location || 'Barangay Hall',
              category: data.category || 'Meeting',
              organizer: data.organizer || 'Solo Parent Federation',
              requirements: data.requirements || [],
              agenda: data.agenda || [],
              barangay: data.barangay || 'All'
            };
          });
        } else {
          // Load sample data if no events found
          this.loadSampleData();
        }
      } catch (error) {
        console.error("❌ Error fetching events:", error);
        // Load sample data on error
        this.loadSampleData();
      }
    },
    async fetchNotifications() {
      if (!this.user.id) return;
      
      try {
        const notificationsRef = collection(db, "notifications");
        const q = query(
          notificationsRef,
          where("userId", "==", this.user.id),
          where("read", "==", false)
        );
        
        const snapshot = await getDocs(q);
        this.unreadCount = snapshot.size;
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        this.unreadCount = 2; // Default value
      }
    },
    loadSampleData() {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // Sample events for demonstration
      this.events = [
        {
          id: 'e1',
          title: 'Solo Parent Support Group Meeting',
          description: 'Monthly support group meeting for solo parents to share experiences, challenges, and solutions. This is a safe space for open discussion and mutual support.',
          date: today,
          startTime: '10:00',
          endTime: '12:00',
          location: 'Barangay Hall - Conference Room',
          category: 'Meeting',
          organizer: 'Solo Parent Federation',
          requirements: [
            'Solo Parent ID',
            'Notebook and pen (optional)'
          ],
          agenda: [
            { time: '10:00 AM', title: 'Welcome and Introduction' },
            { time: '10:15 AM', title: 'Group Sharing Session' },
            { time: '11:00 AM', title: 'Guest Speaker: Stress Management' },
            { time: '11:45 AM', title: 'Announcements and Closing' }
          ],
          barangay: 'All'
        },
        {
          id: 'e2',
          title: 'School Supplies Distribution',
          description: 'Distribution of school supplies for children of solo parents. Each package contains notebooks, pencils, pens, crayons, and other essential school materials.',
          date: tomorrow,
          startTime: '09:00',
          endTime: '15:00',
          location: 'Barangay Covered Court',
          category: 'Distribution',
          organizer: 'Education Committee',
          requirements: [
            'Solo Parent ID',
            'Child\'s School ID or Enrollment Form',
            'Claim stub (if pre-registered)'
          ],
          agenda: [
            { time: '09:00 AM', title: 'Registration Opens' },
            { time: '09:30 AM', title: 'Opening Remarks' },
            { time: '10:00 AM', title: 'Start of Distribution' },
            { time: '12:00 PM', title: 'Lunch Break' },
            { time: '13:00 PM', title: 'Continuation of Distribution' },
            { time: '15:00 PM', title: 'End of Distribution' }
          ],
          barangay: 'All'
        },
        {
          id: 'e3',
          title: 'Financial Literacy Workshop',
          description: 'Learn essential financial skills including budgeting, saving, and managing debt. This workshop is designed specifically for solo parents facing financial challenges.',
          date: nextWeek,
          startTime: '13:00',
          endTime: '16:00',
          location: 'Barangay Multi-Purpose Hall',
          category: 'Workshop',
          organizer: 'Financial Empowerment Committee',
          requirements: [
            'Solo Parent ID',
            'Notebook and pen',
            'Calculator (optional)'
          ],
          agenda: [
            { time: '13:00 PM', title: 'Registration' },
            { time: '13:30 PM', title: 'Introduction to Financial Literacy' },
            { time: '14:00 PM', title: 'Budgeting Techniques' },
            { time: '14:45 PM', title: 'Break' },
            { time: '15:00 PM', title: 'Saving Strategies' },
            { time: '15:30 PM', title: 'Q&A Session' },
            { time: '16:00 PM', title: 'Workshop Conclusion' }
          ],
          barangay: 'All'
        },
        {
          id: 'e4',
          title: 'Children\'s Day Celebration',
          description: 'A fun-filled day for children of solo parents with games, activities, entertainment, and snacks. This event aims to provide a day of joy and connection for families.',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
          startTime: '14:00',
          endTime: '17:00',
          location: 'Barangay Plaza',
          category: 'Celebration',
          organizer: 'Youth and Family Committee',
          requirements: [
            'Solo Parent ID',
            'Children must be accompanied by parent'
          ],
          agenda: [
            { time: '14:00 PM', title: 'Registration and Welcome' },
            { time: '14:30 PM', title: 'Games and Activities' },
            { time: '15:30 PM', title: 'Snack Break' },
            { time: '16:00 PM', title: 'Entertainment Show' },
            { time: '16:45 PM', title: 'Closing Ceremony' }
          ],
          barangay: 'All'
        },
        {
          id: 'e5',
          title: 'Job Skills Training Seminar',
          description: 'Enhance your employability with this comprehensive job skills training covering resume writing, interview techniques, and workplace communication.',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
          startTime: '09:00',
          endTime: '16:00',
          location: 'Barangay Training Center',
          category: 'Training',
          organizer: 'Livelihood Committee',
          requirements: [
            'Solo Parent ID',
            'Resume (if available)',
            'Notebook and pen'
          ],
          agenda: [
            { time: '09:00 AM', title: 'Registration' },
            { time: '09:30 AM', title: 'Resume Writing Workshop' },
            { time: '11:00 AM', title: 'Interview Skills' },
            { time: '12:00 PM', title: 'Lunch Break' },
            { time: '13:00 PM', title: 'Workplace Communication' },
            { time: '14:30 PM', title: 'Job Search Strategies' },
            { time: '15:30 PM', title: 'Q&A and Networking' }
          ],
          barangay: 'All'
        },
        {
          id: 'e6',
          title: 'Health and Wellness Seminar',
          description: 'Learn about maintaining physical and mental health as a solo parent. Topics include stress management, nutrition, and self-care practices.',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 28),
          startTime: '13:30',
          endTime: '16:30',
          location: 'Barangay Health Center',
          category: 'Seminar',
          organizer: 'Health Committee',
          requirements: [
            'Solo Parent ID',
            'Water bottle',
            'Comfortable clothing'
          ],
          agenda: [
            { time: '13:30 PM', title: 'Registration' },
            { time: '14:00 PM', title: 'Mental Health for Solo Parents' },
            { time: '14:45 PM', title: 'Nutrition on a Budget' },
            { time: '15:30 PM', title: 'Simple Exercise Routines' },
            { time: '16:00 PM', title: 'Q&A Session' }
          ],
          barangay: 'All'
        },
        {
          id: 'e7',
          title: 'Solo Parents\' Rights Seminar',
          description: 'Informational seminar about the legal rights and benefits available to solo parents under Philippine law.',
          date: lastWeek,
          startTime: '13:00',
          endTime: '15:00',
          location: 'Barangay Hall - Function Room',
          category: 'Seminar',
          organizer: 'Legal Affairs Committee',
          requirements: [
            'Solo Parent ID',
            'Notebook and pen'
          ],
          agenda: [
            { time: '13:00 PM', title: 'Registration' },
            { time: '13:30 PM', title: 'Overview of Solo Parents\' Welfare Act' },
            { time: '14:00 PM', title: 'Benefits and Privileges' },
            { time: '14:30 PM', title: 'Q&A Session' }
          ],
          barangay: 'All'
        }
      ];
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
  background: #f5f0fa;
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

/* Events Container */
.events-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Events Header */
.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.view-toggle {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 8px 15px;
  background: white;
  border: 1px solid #e0d0ff;
  border-radius: 20px;
  color: #6a0dad;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #f0e6ff;
}

.view-btn.active {
  background: #6a0dad;
  color: white;
  border-color: #6a0dad;
}

.filters {
  display: flex;
  align-items: center;
  gap: 15px;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.month-selector h2 {
  margin: 0;
  font-size: 18px;
  color: #6a0dad;
  white-space: nowrap;
}

.month-nav {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0d0ff;
  color: #6a0dad;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.month-nav:hover {
  background: #f0e6ff;
}

.category-filter {
  position: relative;
}

.select-wrapper {
  position: relative;
}

.filter-select {
  padding: 8px 35px 8px 15px;
  border: 1px solid #e0d0ff;
  border-radius: 20px;
  background: white;
  color: #6a0dad;
  font-weight: 600;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #6a0dad;
  box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.1);
}

.select-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6a0dad;
  pointer-events: none;
}

/* Calendar View */
.calendar-view {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f0e6ff;
  padding: 10px 0;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  color: #6a0dad;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  min-height: 600px;
}

.calendar-day {
  border: 1px solid #f0e6ff;
  padding: 8px;
  min-height: 100px;
  position: relative;
  transition: background 0.2s;
}

.calendar-day:hover {
  background: #f9f5ff;
}

.calendar-day.other-month {
  background: #f9f5ff;
  color: #a0a0a0;
}

.calendar-day.today {
  background: #f0e6ff;
}

.calendar-day.today .day-number {
  background: #6a0dad;
  color: white;
}

.day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-bottom: 5px;
  font-weight: 600;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.day-event {
  background: #f0e6ff;
  border-left: 3px solid #6a0dad;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
}

.day-event:hover {
  transform: translateY(-2px);
}

.event-time {
  font-size: 10px;
  color: #6a0dad;
  font-weight: 600;
}

.event-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-events {
  font-size: 11px;
  color: #6a0dad;
  text-align: center;
  cursor: pointer;
  padding: 2px;
  background: #f0e6ff;
  border-radius: 4px;
}

.more-events:hover {
  background: #e0d0ff;
}

/* Event Categories */
.event-category-workshop {
  border-left-color: #2196f3 !important;
}

.event-category-seminar {
  border-left-color: #4caf50 !important;
}

.event-category-meeting {
  border-left-color: #ff9800 !important;
}

.event-category-distribution {
  border-left-color: #9c27b0 !important;
}

.event-category-celebration {
  border-left-color: #e91e63 !important;
}

.event-category-training {
  border-left-color: #00bcd4 !important;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.no-events {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.no-events-icon {
  font-size: 48px;
  color: #e0d0ff;
  margin-bottom: 15px;
}

.no-events h3 {
  margin: 0 0 10px 0;
  color: #6a0dad;
}

.no-events p {
  margin: 0;
  color: #65676b;
}

.events-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  color: #6a0dad;
  display: flex;
  align-items: center;
  gap: 10px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.event-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  border-top: 5px solid #6a0dad;
}

.event-card:hover {
  transform: translateY(-5px);
}

.event-card.today-event {
  border-top-color: #4caf50;
}

.event-card.past-event {
  border-top-color: #9e9e9e;
  opacity: 0.8;
}

.event-card-header {
  padding: 15px;
  display: flex;
  gap: 15px;
  border-bottom: 1px solid #f0e6ff;
}

.event-date {
  width: 60px;
  height: 60px;
  background: #f0e6ff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-month {
  font-size: 14px;
  font-weight: 600;
  color: #6a0dad;
  text-transform: uppercase;
}

.event-day {
  font-size: 24px;
  font-weight: 700;
  color: #6a0dad;
}

.event-status {
  background: #4caf50;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 10px;
}

.event-title-wrapper {
  flex: 1;
  min-width: 0;
}

.event-title {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #1c1e21;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-category {
  font-size: 12px;
  color: #65676b;
  background: #f5f0fa;
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-block;
}

.event-card-body {
  padding: 15px;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #65676b;
}

.event-detail i {
  color: #6a0dad;
}

.event-description {
  margin: 15px 0;
  color: #1c1e21;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.event-requirements {
  background: #f5f0fa;
  padding: 10px;
  border-radius: 8px;
  margin-top: 15px;
}

.event-requirements h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6a0dad;
}

.event-requirements ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #1c1e21;
}

.event-requirements li {
  margin-bottom: 5px;
}

.event-card-footer {
  padding: 15px;
  border-top: 1px solid #f0e6ff;
  display: flex;
  gap: 10px;
}

.event-action-btn {
  flex: 1;
  padding: 8px 0;
  background: #6a0dad;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.event-action-btn:hover {
  background: #5a0b8d;
  transform: translateY(-2px);
}

.event-action-btn.secondary {
  background: white;
  color: #6a0dad;
  border: 1px solid #e0d0ff;
}

.event-action-btn.secondary:hover {
  background: #f0e6ff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0e6ff;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #6a0dad;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #65676b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #f0e6ff;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #f0e6ff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Event Modal */
.event-modal {
  width: 700px;
}

.event-modal-header {
  margin-bottom: 20px;
}

.event-modal-header h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #1c1e21;
}

.event-category-badge {
  display: inline-block;
  padding: 5px 10px;
  background: #f0e6ff;
  color: #6a0dad;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.event-modal-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.event-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.event-detail-item i {
  color: #6a0dad;
  font-size: 18px;
  margin-top: 3px;
}

.event-modal-description {
  margin-bottom: 20px;
}

.event-modal-description h4, 
.event-modal-requirements h4,
.event-modal-agenda h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #6a0dad;
}

.event-modal-description p {
  margin: 0;
  line-height: 1.6;
  color: #1c1e21;
}

.event-modal-requirements ul {
  margin: 0;
  padding-left: 20px;
  color: #1c1e21;
}

.event-modal-requirements li {
  margin-bottom: 8px;
}

.agenda-timeline {
  margin-top: 15px;
  border-left: 2px solid #e0d0ff;
  padding-left: 20px;
}

.agenda-item {
  position: relative;
  padding-bottom: 20px;
}

.agenda-item:last-child {
  padding-bottom: 0;
}

.agenda-item::before {
  content: '';
  position: absolute;
  left: -26px;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6a0dad;
}

.agenda-time {
  font-weight: 600;
  color: #6a0dad;
  margin-bottom: 5px;
}

.agenda-title {
  font-weight: 600;
  color: #1c1e21;
}

.agenda-description {
  color: #65676b;
  font-size: 14px;
  margin-top: 5px;
}

/* Day Events Modal */
.day-events-modal {
  width: 500px;
}

.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-event-item {
  padding: 12px;
  border-radius: 8px;
  background: #f5f0fa;
  border-left: 4px solid #6a0dad;
  cursor: pointer;
  transition: transform 0.2s;
}

.day-event-item:hover {
  transform: translateY(-2px);
}

.day-event-time {
  font-size: 12px;
  font-weight: 600;
  color: #6a0dad;
  margin-bottom: 5px;
}

.day-event-title {
  font-weight: 600;
  color: #1c1e21;
  margin-bottom: 5px;
}

.day-event-location {
  font-size: 12px;
  color: #65676b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.day-event-category {
  font-size: 12px;
  color: #6a0dad;
  background: white;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 5px;
}

.no-events-message {
  text-align: center;
  padding: 20px;
  color: #65676b;
}

/* Utility Classes */
.fade-out {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Responsive Styles */
@media (max-width: 992px) {
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
  
  .events-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters {
    width: 100%;
    justify-content: space-between;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 80px;
  }
  
  .day-event {
    padding: 3px 5px;
  }
  
  .event-time, .event-title {
    font-size: 10px;
  }
  
  .event-card-footer {
    flex-direction: column;
  }
  
  .event-modal-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 10px;
  }

  .header-left h1 {
    font-size: 20px;
  }
  
  .view-toggle {
    width: 100%;
  }
  
  .view-btn {
    flex: 1;
    justify-content: center;
  }
  
  .month-selector h2 {
    font-size: 16px;
  }
  
  .calendar-day-header {
    font-size: 12px;
  }
  
  .calendar-day {
    padding: 5px;
    min-height: 60px;
  }
  
  .day-number {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
  
  .more-events {
    display: none;
  }
  
  .day-event:nth-child(n+2) {
    display: none;
  }
}
</style>