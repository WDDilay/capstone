<template>
<div class="app-container">
  <!-- Main Header / Navbar -->
  <header class="main-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="pi" :class="isSidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
      </button>
      <h1>Messages</h1>
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
            <router-link to="/usermessage" class="active">
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
      <div class="chat-container">
        <!-- Chat Panel -->
        <div class="chat-panel">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-contact-info">
              <div class="contact-avatar">
                <img :src="admin.avatar" :alt="admin.name">
                <span 
                  v-if="admin.status === 'online'" 
                  class="status-indicator online"
                ></span>
              </div>
              <div>
                <h3>{{ admin.name }}</h3>
                <p class="contact-status">
                  {{ admin.status === 'online' ? 'Online' : 'Offline' }}
                </p>
              </div>
            </div>
            
            <div class="chat-actions">
              <button class="action-btn" title="Refresh conversation">
                <i class="pi pi-refresh"></i>
              </button>
              <button class="action-btn" title="More options">
                <i class="pi pi-ellipsis-v"></i>
              </button>
            </div>
          </div>
          
          <!-- Chat Messages -->
          <div class="chat-messages" ref="messagesContainer">
            <!-- Messages will appear here -->
          </div>
          
          <!-- Chat Input -->
          <div class="chat-input-container">
            <div class="chat-input-actions">
              <button class="input-action-btn" title="Attach file">
                <i class="pi pi-paperclip"></i>
              </button>
              <button class="input-action-btn" title="Send image">
                <i class="pi pi-camera"></i>
              </button>
            </div>
            
            <div class="chat-input-field">
              <textarea 
                v-model="messageText" 
                placeholder="Type a message to Barangay Admin..." 
                @keyup.enter="sendMessage"
                rows="1"
                ref="messageInput"
              ></textarea>
            </div>
            
            <button 
              class="send-btn" 
              :class="{ 'active': messageText.trim().length > 0 }"
              @click="sendMessage"
              title="Send message"
            >
              <i class="pi pi-send"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
</template>

<script>
import { db } from '@/services/firebase.js';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

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
      admin: {
        id: 'admin1',
        name: 'Barangay Admin',
        avatar: 'https://via.placeholder.com/150/6a0dad/ffffff?text=BA',
        status: 'online',
      },
      messageText: '',
      messages: [],
      messagesListener: null
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
      
      this.fetchMessages();
      this.fetchNotifications();
    } else {
      // Sample data for demonstration
      this.unreadCount = 2;
    }
  },
  beforeUnmount() {
    // Clean up Firestore listener
    if (this.messagesListener) {
      this.messagesListener();
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
    sendMessage() {
      if (!this.messageText.trim()) return;
      
      // In a real app, you would save this message to Firebase
      // For now, we'll just clear the input
      this.messageText = '';
      
      // Resize textarea back to default
      if (this.$refs.messageInput) {
        this.$refs.messageInput.style.height = 'auto';
      }
    },
    async fetchMessages() {
      if (!this.user.id) return;
      
      try {
        // In a real app, you would fetch messages from Firebase
        // For this demo, we'll just set up a listener placeholder
        
        // Example of how you would set up a real-time listener:
        /*
        const messagesRef = collection(db, "messages");
        const q = query(
          messagesRef,
          where("conversationId", "==", `${this.user.id}_admin`),
          orderBy("timestamp", "asc")
        );
        
        this.messagesListener = onSnapshot(q, (snapshot) => {
          this.messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              text: data.text,
              senderId: data.senderId,
              timestamp: data.timestamp?.toDate() || new Date(),
              status: data.status || 'sent'
            };
          });
          
          // Scroll to bottom
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        });
        */
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    },
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
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

/* Chat Container */
.chat-container {
  display: flex;
  height: calc(100vh - 110px);
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Chat Panel */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f0fa;
}

.chat-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: 1px solid #f0e6ff;
}

.chat-contact-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.contact-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background: #4caf50;
}

.chat-contact-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #1c1e21;
}

.contact-status {
  margin: 0;
  font-size: 13px;
  color: #65676b;
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f0fa;
  color: #6a0dad;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e0d0ff;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-input-container {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #f0e6ff;
  display: flex;
  align-items: center;
  gap: 15px;
}

.chat-input-actions {
  display: flex;
  gap: 10px;
}

.input-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f0fa;
  color: #6a0dad;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.input-action-btn:hover {
  background: #e0d0ff;
}

.chat-input-field {
  flex: 1;
  position: relative;
}

.chat-input-field textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0d0ff;
  border-radius: 20px;
  font-size: 14px;
  background: #f5f0fa;
  resize: none;
  max-height: 120px;
  transition: all 0.2s;
}

.chat-input-field textarea:focus {
  outline: none;
  border-color: #6a0dad;
  box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.1);
  background: white;
}

.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f0e6ff;
  color: #6a0dad;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn.active {
  background: #6a0dad;
  color: white;
}

.send-btn:hover {
  transform: scale(1.05);
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
}

@media (max-width: 480px) {
  .main-header {
    padding: 10px;
  }

  .header-left h1 {
    font-size: 20px;
  }

  .chat-header {
    padding: 10px 15px;
  }

  .chat-input-container {
    padding: 10px 15px;
  }

  .chat-input-actions {
    display: none;
  }
}
</style>