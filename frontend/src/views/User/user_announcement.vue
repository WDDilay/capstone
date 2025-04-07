<template>
<div class="app-container">
  <!-- Main Header / Navbar -->
  <header class="main-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="pi" :class="isSidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
      </button>
      <h1>Announcements</h1>
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
            <router-link to="/user_announcement" class="active">
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
      <!-- Announcements Header -->
      <div class="announcements-header">
        <div class="search-filter-container">
          <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search announcements..." 
              v-model="searchQuery"
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-search">
              <i class="pi pi-times"></i>
            </button>
          </div>
          
          <div class="filter-container">
            <div class="filter-item">
              <select v-model="categoryFilter" class="filter-select">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div class="filter-item">
              <select v-model="timeFilter" class="filter-select">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Announcements List -->
      <div class="announcements-container">
        <div v-if="filteredAnnouncements.length === 0" class="no-announcements">
          <div class="empty-state">
            <i class="pi pi-megaphone empty-icon"></i>
            <h3>No Announcements Found</h3>
            <p>There are no announcements matching your search criteria.</p>
            <button @click="resetFilters" class="reset-btn">Reset Filters</button>
          </div>
        </div>
        
        <div v-else class="announcements-list">
          <div 
            v-for="announcement in filteredAnnouncements" 
            :key="announcement.id" 
            class="announcement-card"
            :class="{ 'expanded': expandedAnnouncements.includes(announcement.id) }"
          >
            <div class="announcement-header">
              <div class="announcement-category" :class="getCategoryClass(announcement.category)">
                {{ announcement.category }}
              </div>
              <div class="announcement-date">
                <i class="pi pi-calendar"></i> {{ formatDate(announcement.date) }}
              </div>
            </div>
            
            <h2 class="announcement-title">{{ announcement.title }}</h2>
            
            <div class="announcement-content">
              <div v-if="announcement.image" class="announcement-image">
                <img :src="announcement.image" :alt="announcement.title">
              </div>
              
              <div class="announcement-text">
                <p v-if="!expandedAnnouncements.includes(announcement.id) && announcement.content.length > 200">
                  {{ announcement.content.substring(0, 200) }}...
                </p>
                <div v-else v-html="formatContent(announcement.content)"></div>
              </div>
            </div>
            
            <div class="announcement-footer">
              <div class="announcement-author">
                <i class="pi pi-user"></i> Posted by: {{ announcement.author }}
              </div>
              
              <button 
                v-if="announcement.content.length > 200" 
                @click="toggleExpand(announcement.id)" 
                class="expand-btn"
              >
                {{ expandedAnnouncements.includes(announcement.id) ? 'Show Less' : 'Read More' }}
                <i :class="['pi', expandedAnnouncements.includes(announcement.id) ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </button>
            </div>
            
            <div v-if="announcement.attachments && announcement.attachments.length > 0" class="announcement-attachments">
              <h4><i class="pi pi-paperclip"></i> Attachments</h4>
              <div class="attachments-list">
                <a 
                  v-for="(attachment, index) in announcement.attachments" 
                  :key="index"
                  :href="attachment.url"
                  target="_blank"
                  class="attachment-item"
                >
                  <i :class="['pi', getAttachmentIcon(attachment.type)]"></i>
                  <span>{{ attachment.name }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="pagination-container" v-if="totalPages > 1">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <i class="pi pi-chevron-left"></i>
          </button>
          
          <div class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>
    </main>
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
      announcements: [],
      expandedAnnouncements: [],
      searchQuery: '',
      categoryFilter: '',
      timeFilter: 'all',
      currentPage: 1,
      itemsPerPage: 5,
      categories: ['Important', 'Event', 'Resource', 'Community', 'Health', 'Education']
    };
  },
  computed: {
    filteredAnnouncements() {
      let filtered = [...this.announcements];
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(announcement => 
          announcement.title.toLowerCase().includes(query) || 
          announcement.content.toLowerCase().includes(query) ||
          announcement.author.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (this.categoryFilter) {
        filtered = filtered.filter(announcement => 
          announcement.category === this.categoryFilter
        );
      }
      
      // Apply time filter
      if (this.timeFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        filtered = filtered.filter(announcement => {
          const announcementDate = new Date(announcement.date);
          
          if (this.timeFilter === 'today') {
            return announcementDate >= today;
          } else if (this.timeFilter === 'week') {
            return announcementDate >= weekStart;
          } else if (this.timeFilter === 'month') {
            return announcementDate >= monthStart;
          }
          
          return true;
        });
      }
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      
      return filtered.slice(startIndex, endIndex);
    },
    totalPages() {
      // Calculate total pages based on filtered announcements before pagination
      let filtered = [...this.announcements];
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(announcement => 
          announcement.title.toLowerCase().includes(query) || 
          announcement.content.toLowerCase().includes(query) ||
          announcement.author.toLowerCase().includes(query)
        );
      }
      
      if (this.categoryFilter) {
        filtered = filtered.filter(announcement => 
          announcement.category === this.categoryFilter
        );
      }
      
      if (this.timeFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        filtered = filtered.filter(announcement => {
          const announcementDate = new Date(announcement.date);
          
          if (this.timeFilter === 'today') {
            return announcementDate >= today;
          } else if (this.timeFilter === 'week') {
            return announcementDate >= weekStart;
          } else if (this.timeFilter === 'month') {
            return announcementDate >= monthStart;
          }
          
          return true;
        });
      }
      
      return Math.ceil(filtered.length / this.itemsPerPage);
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
      
      this.fetchAnnouncements();
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
    toggleExpand(id) {
      if (this.expandedAnnouncements.includes(id)) {
        this.expandedAnnouncements = this.expandedAnnouncements.filter(item => item !== id);
      } else {
        this.expandedAnnouncements.push(id);
      }
    },
    clearSearch() {
      this.searchQuery = '';
      this.currentPage = 1;
    },
    resetFilters() {
      this.searchQuery = '';
      this.categoryFilter = '';
      this.timeFilter = 'all';
      this.currentPage = 1;
    },
    formatDate(date) {
      if (!date) return '';
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    formatContent(content) {
      // Convert line breaks to <br> tags
      return content.replace(/\n/g, '<br>');
    },
    getCategoryClass(category) {
      const classes = {
        'Important': 'category-important',
        'Event': 'category-event',
        'Resource': 'category-resource',
        'Community': 'category-community',
        'Health': 'category-health',
        'Education': 'category-education'
      };
      
      return classes[category] || 'category-default';
    },
    getAttachmentIcon(type) {
      const icons = {
        'pdf': 'pi-file-pdf',
        'doc': 'pi-file-word',
        'docx': 'pi-file-word',
        'xls': 'pi-file-excel',
        'xlsx': 'pi-file-excel',
        'ppt': 'pi-file-powerpoint',
        'pptx': 'pi-file-powerpoint',
        'jpg': 'pi-image',
        'jpeg': 'pi-image',
        'png': 'pi-image',
        'zip': 'pi-file-zip'
      };
      
      return icons[type] || 'pi-file';
    },
    async fetchAnnouncements() {
      if (!this.user.barangay) return;
      
      try {
        const announcementsRef = collection(db, "announcements");
        let q;
        
        // If barangay is specified, get announcements for that barangay or global announcements
        if (this.user.barangay !== "Unknown") {
          q = query(
            announcementsRef,
            where("barangay", "in", [this.user.barangay, "All"]),
            orderBy("date", "desc")
          );
        } else {
          // If no barangay, just get global announcements
          q = query(
            announcementsRef,
            where("barangay", "==", "All"),
            orderBy("date", "desc")
          );
        }
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          this.announcements = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              content: data.content,
              date: data.date.toDate ? data.date.toDate() : new Date(data.date),
              author: data.author || 'Barangay Admin',
              category: data.category || 'General',
              image: data.image || null,
              attachments: data.attachments || []
            };
          });
        } else {
          // Load sample data if no announcements found
          this.loadSampleData();
        }
      } catch (error) {
        console.error("❌ Error fetching announcements:", error);
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
      // Sample announcements for demonstration
      this.announcements = [
        {
          id: 'a1',
          title: 'Important: COVID-19 Vaccination Schedule for Solo Parents',
          content: 'Dear Solo Parents,\n\nWe are pleased to announce that COVID-19 vaccines are now available for all solo parents in our barangay. The vaccination will take place at the Barangay Health Center on July 15-16, 2023, from 8:00 AM to 5:00 PM.\n\nPlease bring your Solo Parent ID and any valid government ID for verification. No appointment is needed, but we encourage you to come early as slots are limited.\n\nThis is part of our commitment to ensure the health and safety of all solo parents in our community.',
          date: new Date(2023, 6, 10), // July 10, 2023
          author: 'Dr. Maria Santos - Barangay Health Officer',
          category: 'Health',
          image: 'https://via.placeholder.com/800x400/f0e6ff/6a0dad?text=COVID-19+Vaccination',
          attachments: [
            { name: 'Vaccination_Guidelines.pdf', url: '#', type: 'pdf' },
            { name: 'Registration_Form.docx', url: '#', type: 'docx' }
          ]
        },
        {
          id: 'a2',
          title: 'Solo Parent Federation Monthly Meeting',
          content: 'We would like to invite all solo parents to our monthly meeting on July 20, 2023, at 2:00 PM at the Barangay Hall. We will discuss upcoming programs, resource distribution, and address any concerns from our members.\n\nAgenda:\n1. Welcome and Introduction\n2. Updates on Resource Distribution\n3. Upcoming Skills Training Programs\n4. Open Forum\n5. Announcements\n\nRefreshments will be served. We look forward to seeing you all there!',
          date: new Date(2023, 6, 15), // July 15, 2023
          author: 'Juan Dela Cruz - Federation President',
          category: 'Community',
          image: null,
          attachments: [
            { name: 'Meeting_Agenda.pdf', url: '#', type: 'pdf' }
          ]
        },
        {
          id: 'a3',
          title: 'Free School Supplies Distribution',
          content: 'As part of our back-to-school program, we will be distributing free school supplies to children of solo parents on July 25, 2023, from 9:00 AM to 3:00 PM at the Barangay Covered Court.\n\nEach child will receive a package containing notebooks, pencils, pens, crayons, and other essential school materials.\n\nTo claim the supplies, please bring your Solo Parent ID and your child\'s school ID or enrollment form for the current school year.\n\nLet\'s ensure that our children are well-equipped for the upcoming school year!',
          date: new Date(2023, 6, 20), // July 20, 2023
          author: 'Ana Reyes - Education Committee Head',
          category: 'Resource',
          image: 'https://via.placeholder.com/800x400/f0e6ff/6a0dad?text=School+Supplies',
          attachments: []
        },
        {
          id: 'a4',
          title: 'Job Fair for Solo Parents',
          content: 'We are organizing a special Job Fair exclusively for solo parents on August 5, 2023, from 10:00 AM to 4:00 PM at the Barangay Multi-Purpose Hall.\n\nOver 20 companies from various industries will be present to conduct on-the-spot interviews and hire qualified candidates.\n\nPlease bring multiple copies of your resume, valid IDs, and certificates of employment/training if available.\n\nThis is a great opportunity to find stable employment and improve your family\'s financial situation. Don\'t miss it!',
          date: new Date(2023, 6, 25), // July 25, 2023
          author: 'Pedro Gomez - Livelihood Committee Head',
          category: 'Event',
          image: 'https://via.placeholder.com/800x400/f0e6ff/6a0dad?text=Job+Fair',
          attachments: [
            { name: 'Participating_Companies.pdf', url: '#', type: 'pdf' },
            { name: 'Resume_Template.docx', url: '#', type: 'docx' }
          ]
        },
        {
          id: 'a5',
          title: 'Mental Health Webinar for Solo Parents',
          content: 'We understand that being a solo parent comes with unique challenges that can affect your mental health. To address this, we are organizing a free Mental Health Webinar specifically for solo parents on August 10, 2023, from 2:00 PM to 4:00 PM.\n\nTopics to be discussed:\n1. Managing Stress and Anxiety\n2. Building Resilience\n3. Self-care Practices\n4. Balancing Work and Parenting\n\nThe webinar will be conducted by licensed psychologists and counselors who specialize in family dynamics.\n\nTo participate, please register using the link provided in the attachment. A Zoom link will be sent to your email address before the event.',
          date: new Date(2023, 7, 1), // August 1, 2023
          author: 'Dr. Lisa Tan - Mental Health Advocate',
          category: 'Health',
          image: 'https://via.placeholder.com/800x400/f0e6ff/6a0dad?text=Mental+Health+Webinar',
          attachments: [
            { name: 'Webinar_Details.pdf', url: '#', type: 'pdf' }
          ]
        },
        {
          id: 'a6',
          title: 'Financial Literacy Workshop',
          content: 'We are pleased to announce a Financial Literacy Workshop for solo parents on August 15, 2023, from 1:00 PM to 5:00 PM at the Barangay Hall.\n\nThe workshop will cover essential financial topics such as:\n1. Budgeting and Saving\n2. Managing Debt\n3. Emergency Fund Planning\n4. Investment Basics\n5. Financial Planning for Your Child\'s Education\n\nThis workshop aims to equip you with the knowledge and skills to better manage your finances and secure a stable future for your family.\n\nRegistration is required as slots are limited. Please sign up at the Barangay Office or call the number provided in the attachment.',
          date: new Date(2023, 7, 5), // August 5, 2023
          author: 'Roberto Santos - Financial Advisor',
          category: 'Education',
          image: null,
          attachments: [
            { name: 'Workshop_Details.pdf', url: '#', type: 'pdf' }
          ]
        },
        {
          id: 'a7',
          title: 'Important: Typhoon Preparedness Advisory',
          content: 'Dear Solo Parents,\n\nAs we are entering the typhoon season, we would like to remind everyone to be prepared for potential severe weather conditions.\n\nHere are some important preparedness measures:\n1. Prepare an emergency kit with food, water, medicines, and important documents\n2. Know your evacuation routes and emergency contact numbers\n3. Secure your homes against strong winds and flooding\n4. Monitor weather updates regularly\n\nIn case of evacuation, the Barangay Covered Court will serve as our primary evacuation center. Solo parents with children, elderly, and persons with disabilities will be given priority.\n\nStay safe and be prepared!',
          date: new Date(2023, 7, 10), // August 10, 2023
          author: 'Barangay Disaster Risk Reduction Management Office',
          category: 'Important',
          image: 'https://via.placeholder.com/800x400/f0e6ff/6a0dad?text=Typhoon+Preparedness',
          attachments: [
            { name: 'Emergency_Contacts.pdf', url: '#', type: 'pdf' },
            { name: 'Evacuation_Map.jpg', url: '#', type: 'jpg' }
          ]
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

/* Announcements Header */
.announcements-header {
  margin-bottom: 20px;
}

.search-filter-container {
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-container {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6a0dad;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 35px;
  border: 1px solid #e0d0ff;
  border-radius: 30px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #6a0dad;
  box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.2);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6a0dad;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.clear-search:hover {
  background: #f0e6ff;
}

.filter-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-item {
  flex: 1;
  min-width: 150px;
}

.filter-select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #e0d0ff;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236a0dad' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.filter-select:focus {
  outline: none;
  border-color: #6a0dad;
  box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.2);
}

/* Announcements Container */
.announcements-container {
  min-height: 400px;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.announcement-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.announcement-category {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.category-important {
  background: #ffebee;
  color: #c62828;
}

.category-event {
  background: #e8f5e9;
  color: #2e7d32;
}

.category-resource {
  background: #e3f2fd;
  color: #1565c0;
}

.category-community {
  background: #fff8e1;
  color: #f57c00;
}

.category-health {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-education {
  background: #e8eaf6;
  color: #3949ab;
}

.category-default {
  background: #f5f5f5;
  color: #616161;
}

.announcement-date {
  font-size: 13px;
  color: #65676b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.announcement-title {
  padding: 15px 20px 10px;
  margin: 0;
  font-size: 20px;
  color: #1c1e21;
}

.announcement-content {
  padding: 0 20px 15px;
}

.announcement-image {
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.announcement-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.announcement-text {
  color: #1c1e21;
  line-height: 1.5;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #f0f2f5;
}

.announcement-author {
  font-size: 13px;
  color: #65676b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.expand-btn {
  background: none;
  border: none;
  color: #6a0dad;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background 0.2s;
}

.expand-btn:hover {
  background: #f0e6ff;
}

.announcement-attachments {
  padding: 15px 20px;
  border-top: 1px solid #f0f2f5;
}

.announcement-attachments h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #1c1e21;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: #f0e6ff;
  border-radius: 5px;
  color: #6a0dad;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
}

.attachment-item:hover {
  background: #e0d0ff;
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  color: #6a0dad;
  opacity: 0.5;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #1c1e21;
}

.empty-state p {
  margin: 0 0 20px 0;
  color: #65676b;
}

.reset-btn {
  background: #6a0dad;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #5a0b8d;
  transform: translateY(-2px);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0d0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a0dad;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f0e6ff;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #65676b;
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

  .filter-container {
    flex-direction: column;
  }

  .filter-item {
    width: 100%;
  }

  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .announcement-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .expand-btn {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 10px;
  }

  .header-left h1 {
    font-size: 20px;
  }

  .search-filter-container {
    padding: 10px;
  }

  .announcement-title {
    font-size: 18px;
  }

  .attachments-list {
    flex-direction: column;
  }
}
</style>