<template>
<div class="app-container">
  <!-- Main Header / Navbar -->
  <header class="main-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="pi" :class="isSidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
      </button>
      <h1>Available Resources</h1>
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
            <router-link to="/available_resource" class="active">
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
      <!-- Resources Header -->
      <div class="resources-header">
        <div class="search-filter-container">
          <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search resources..." 
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
              <select v-model="availabilityFilter" class="filter-select">
                <option value="all">All Resources</option>
                <option value="available">Available Only</option>
                <option value="limited">Limited Stock</option>
              </select>
            </div>
            
            <div class="filter-item">
              <select v-model="sortBy" class="filter-select">
                <option value="name">Sort by Name</option>
                <option value="newest">Sort by Newest</option>
                <option value="stock">Sort by Stock (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Resources Stats -->
      <div class="resources-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-box"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalResources }}</h3>
            <p>Total Resources</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ availableResources }}</h3>
            <p>Available Resources</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-info">
            <h3>{{ pendingRequests }}</h3>
            <p>Your Pending Requests</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="stat-info">
            <h3>{{ nextDistributionDate }}</h3>
            <p>Next Distribution</p>
          </div>
        </div>
      </div>
      
      <!-- Resources List -->
      <div class="resources-container">
        <div v-if="filteredResources.length === 0" class="no-resources">
          <div class="empty-state">
            <i class="pi pi-box empty-icon"></i>
            <h3>No Resources Found</h3>
            <p>There are no resources matching your search criteria.</p>
            <button @click="resetFilters" class="reset-btn">Reset Filters</button>
          </div>
        </div>
        
        <div v-else class="resources-grid">
          <div 
            v-for="resource in filteredResources" 
            :key="resource.id" 
            class="resource-card"
            :class="{ 'out-of-stock': resource.stock === 0 }"
          >
            <div class="resource-image">
              <img :src="resource.image || defaultImage(resource.type)" :alt="resource.name">
              <div class="resource-category" :class="getCategoryClass(resource.type)">
                {{ resource.type }}
              </div>
              <div v-if="resource.stock === 0" class="out-of-stock-badge">
                Out of Stock
              </div>
              <div v-else-if="resource.stock <= 10" class="limited-stock-badge">
                Limited Stock
              </div>
            </div>
            
            <div class="resource-content">
              <h2 class="resource-title">{{ resource.name }}</h2>
              
              <div class="resource-description">
                {{ resource.description }}
              </div>
              
              <div class="resource-meta">
                <div class="resource-stock">
                  <i class="pi pi-box"></i> 
                  <span>Stock: <strong>{{ resource.stock }}</strong></span>
                </div>
                
                <div class="resource-limit" v-if="resource.limit">
                  <i class="pi pi-user"></i> 
                  <span>Limit: <strong>{{ resource.limit }} per person</strong></span>
                </div>
              </div>
              
              <div class="resource-details">
                <div v-if="resource.distribution_date" class="resource-date">
                  <i class="pi pi-calendar"></i> 
                  <span>Distribution: {{ formatDate(resource.distribution_date) }}</span>
                </div>
                
                <div v-if="resource.location" class="resource-location">
                  <i class="pi pi-map-marker"></i> 
                  <span>{{ resource.location }}</span>
                </div>
              </div>
              
              <div class="resource-footer">
                <button 
                  class="request-btn" 
                  :disabled="resource.stock === 0 || userRequested(resource.id)"
                  @click="requestResource(resource)"
                >
                  <i class="pi" :class="userRequested(resource.id) ? 'pi-check' : 'pi-plus'"></i>
                  {{ userRequested(resource.id) ? 'Requested' : 'Request' }}
                </button>
                
                <button class="details-btn" @click="viewResourceDetails(resource)">
                  <i class="pi pi-info-circle"></i> Details
                </button>
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
  
  <!-- Resource Details Modal -->
  <div v-if="selectedResource" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Resource Details</h2>
        <button class="modal-close" @click="closeModal">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="resource-detail-image">
          <img :src="selectedResource.image || defaultImage(selectedResource.type)" :alt="selectedResource.name">
        </div>
        
        <div class="resource-detail-content">
          <h3>{{ selectedResource.name }}</h3>
          
          <div class="detail-item">
            <span class="detail-label">Category:</span>
            <span class="detail-value category-badge" :class="getCategoryClass(selectedResource.type)">
              {{ selectedResource.type }}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Description:</span>
            <p class="detail-value">{{ selectedResource.description }}</p>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Available Stock:</span>
            <span class="detail-value">{{ selectedResource.stock }}</span>
          </div>
          
          <div class="detail-item" v-if="selectedResource.limit">
            <span class="detail-label">Limit per Person:</span>
            <span class="detail-value">{{ selectedResource.limit }}</span>
          </div>
          
          <div class="detail-item" v-if="selectedResource.distribution_date">
            <span class="detail-label">Distribution Date:</span>
            <span class="detail-value">{{ formatDate(selectedResource.distribution_date) }}</span>
          </div>
          
          <div class="detail-item" v-if="selectedResource.location">
            <span class="detail-label">Distribution Location:</span>
            <span class="detail-value">{{ selectedResource.location }}</span>
          </div>
          
          <div class="detail-item" v-if="selectedResource.requirements && selectedResource.requirements.length > 0">
            <span class="detail-label">Requirements:</span>
            <ul class="requirements-list">
              <li v-for="(req, index) in selectedResource.requirements" :key="index">
                {{ req }}
              </li>
            </ul>
          </div>
          
          <div class="detail-item" v-if="selectedResource.contact">
            <span class="detail-label">Contact for Inquiries:</span>
            <span class="detail-value">{{ selectedResource.contact }}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="request-btn full-width" 
          :disabled="selectedResource.stock === 0 || userRequested(selectedResource.id)"
          @click="requestResource(selectedResource)"
        >
          <i class="pi" :class="userRequested(selectedResource.id) ? 'pi-check' : 'pi-plus'"></i>
          {{ userRequested(selectedResource.id) ? 'Already Requested' : 'Request This Resource' }}
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { db } from '@/services/firebase.js';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

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
      resources: [],
      userRequests: [],
      searchQuery: '',
      categoryFilter: '',
      availabilityFilter: 'all',
      sortBy: 'name',
      currentPage: 1,
      itemsPerPage: 8,
      categories: ['Food', 'Education', 'Medical', 'Financial', 'Clothing', 'Hygiene', 'Other'],
      selectedResource: null,
      pendingRequests: 0,
      nextDistributionDate: 'July 30, 2023'
    };
  },
  computed: {
    totalResources() {
      return this.resources.length;
    },
    availableResources() {
      return this.resources.filter(resource => resource.stock > 0).length;
    },
    filteredResources() {
      let filtered = [...this.resources];
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(resource => 
          resource.name.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query) ||
          resource.type.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (this.categoryFilter) {
        filtered = filtered.filter(resource => 
          resource.type === this.categoryFilter
        );
      }
      
      // Apply availability filter
      if (this.availabilityFilter === 'available') {
        filtered = filtered.filter(resource => resource.stock > 0);
      } else if (this.availabilityFilter === 'limited') {
        filtered = filtered.filter(resource => resource.stock > 0 && resource.stock <= 10);
      }
      
      // Apply sorting
      if (this.sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.added_date) - new Date(a.added_date));
      } else if (this.sortBy === 'stock') {
        filtered.sort((a, b) => b.stock - a.stock);
      }
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      
      return filtered.slice(startIndex, endIndex);
    },
    totalPages() {
      // Calculate total pages based on filtered resources before pagination
      let filtered = [...this.resources];
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(resource => 
          resource.name.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query) ||
          resource.type.toLowerCase().includes(query)
        );
      }
      
      if (this.categoryFilter) {
        filtered = filtered.filter(resource => 
          resource.type === this.categoryFilter
        );
      }
      
      if (this.availabilityFilter === 'available') {
        filtered = filtered.filter(resource => resource.stock > 0);
      } else if (this.availabilityFilter === 'limited') {
        filtered = filtered.filter(resource => resource.stock > 0 && resource.stock <= 10);
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
      
      this.fetchResources();
      this.fetchUserRequests();
      this.fetchNotifications();
    } else {
      // Sample data for demonstration
      this.loadSampleData();
      this.unreadCount = 2;
      this.pendingRequests = 3;
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
    clearSearch() {
      this.searchQuery = '';
      this.currentPage = 1;
    },
    resetFilters() {
      this.searchQuery = '';
      this.categoryFilter = '';
      this.availabilityFilter = 'all';
      this.sortBy = 'name';
      this.currentPage = 1;
    },
    formatDate(date) {
      if (!date) return '';
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    getCategoryClass(category) {
      const classes = {
        'Food': 'category-food',
        'Education': 'category-education',
        'Medical': 'category-medical',
        'Financial': 'category-financial',
        'Clothing': 'category-clothing',
        'Hygiene': 'category-hygiene',
        'Other': 'category-other'
      };
      
      return classes[category] || 'category-other';
    },
    defaultImage(type) {
      const images = {
        'Food': 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Food',
        'Education': 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Education',
        'Medical': 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Medical',
        'Financial': 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Financial',
        'Clothing': 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Clothing',
        'Hygiene': 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Hygiene',
        'Other': 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Resource'
      };
      
      return images[type] || images['Other'];
    },
    userRequested(resourceId) {
      return this.userRequests.includes(resourceId);
    },
    viewResourceDetails(resource) {
      this.selectedResource = resource;
    },
    closeModal() {
      this.selectedResource = null;
    },
    async requestResource(resource) {
      if (!this.user.id || resource.stock === 0 || this.userRequested(resource.id)) {
        return;
      }
      
      try {
        // Add request to Firebase
        const requestsRef = collection(db, "requests");
        
        await addDoc(requestsRef, {
          userId: this.user.id,
          userName: this.user.name,
          resourceId: resource.id,
          resourceName: resource.name,
          resourceType: resource.type,
          quantity: 1, // Default quantity
          status: 'pending',
          dateRequested: serverTimestamp(),
          barangay: this.user.barangay
        });
        
        // Update local state
        this.userRequests.push(resource.id);
        this.pendingRequests++;
        
        alert(`Your request for ${resource.name} has been submitted successfully!`);
      } catch (error) {
        console.error("❌ Error submitting request:", error);
        alert("Failed to submit request. Please try again.");
      }
    },
    async fetchResources() {
      try {
        const resourcesRef = collection(db, "resources");
        let q;
        
        // If barangay is specified, get resources for that barangay or global resources
        if (this.user.barangay !== "Unknown") {
          q = query(
            resourcesRef,
            where("barangay", "in", [this.user.barangay, "All"])
          );
        } else {
          // If no barangay, just get global resources
          q = query(
            resourcesRef,
            where("barangay", "==", "All")
          );
        }
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          this.resources = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              description: data.description,
              type: data.type || 'Other',
              stock: data.stock || 0,
              limit: data.limit || null,
              image: data.image || null,
              distribution_date: data.distribution_date?.toDate ? data.distribution_date.toDate() : data.distribution_date,
              location: data.location || null,
              requirements: data.requirements || [],
              contact: data.contact || null,
              added_date: data.added_date?.toDate ? data.added_date.toDate() : new Date(),
              barangay: data.barangay || 'All'
            };
          });
        } else {
          // Load sample data if no resources found
          this.loadSampleData();
        }
      } catch (error) {
        console.error("❌ Error fetching resources:", error);
        // Load sample data on error
        this.loadSampleData();
      }
    },
    async fetchUserRequests() {
      if (!this.user.id) return;
      
      try {
        const requestsRef = collection(db, "requests");
        const q = query(
          requestsRef,
          where("userId", "==", this.user.id)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // Get all resource IDs that the user has requested
          this.userRequests = snapshot.docs.map(doc => doc.data().resourceId);
          
          // Count pending requests
          this.pendingRequests = snapshot.docs.filter(doc => doc.data().status === 'pending').length;
        }
      } catch (error) {
        console.error("❌ Error fetching user requests:", error);
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
      // Sample resources for demonstration
      this.resources = [
        {
          id: 'r1',
          name: 'School Supplies Package',
          description: 'Complete package of school supplies including notebooks, pencils, pens, crayons, and other essential materials for elementary students.',
          type: 'Education',
          stock: 50,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=School+Supplies',
          distribution_date: new Date(2023, 6, 30), // July 30, 2023
          location: 'Barangay Hall - Function Room',
          requirements: [
            'Solo Parent ID',
            'Child\'s School ID or Enrollment Form',
            'Barangay Residency Certificate'
          ],
          contact: 'Education Committee: 09123456789',
          added_date: new Date(2023, 6, 1), // July 1, 2023
          barangay: 'All'
        },
        {
          id: 'r2',
          name: 'Food Assistance Package',
          description: 'Monthly food package containing rice (5kg), canned goods, noodles, and other basic food items to support solo parent families.',
          type: 'Food',
          stock: 100,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Food+Package',
          distribution_date: new Date(2023, 7, 5), // August 5, 2023
          location: 'Barangay Covered Court',
          requirements: [
            'Solo Parent ID',
            'Barangay Residency Certificate'
          ],
          contact: 'Food Committee: 09123456788',
          added_date: new Date(2023, 6, 5), // July 5, 2023
          barangay: 'All'
        },
        {
          id: 'r3',
          name: 'Medical Check-up Voucher',
          description: 'Free medical check-up voucher for solo parents at the Barangay Health Center. Includes basic health assessment, blood pressure monitoring, and consultation.',
          type: 'Medical',
          stock: 30,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Medical+Voucher',
          distribution_date: new Date(2023, 7, 10), // August 10, 2023
          location: 'Barangay Health Center',
          requirements: [
            'Solo Parent ID',
            'Barangay Health Card'
          ],
          contact: 'Health Committee: 09123456787',
          added_date: new Date(2023, 6, 10), // July 10, 2023
          barangay: 'All'
        },
        {
          id: 'r4',
          name: 'Financial Assistance',
          description: 'One-time financial assistance of PHP 2,000 for solo parents facing emergency situations or financial hardship.',
          type: 'Financial',
          stock: 15,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Financial+Aid',
          distribution_date: new Date(2023, 7, 15), // August 15, 2023
          location: 'Barangay Treasury Office',
          requirements: [
            'Solo Parent ID',
            'Barangay Residency Certificate',
            'Valid ID',
            'Application Form with Statement of Need'
          ],
          contact: 'Finance Committee: 09123456786',
          added_date: new Date(2023, 6, 15), // July 15, 2023
          barangay: 'All'
        },
        {
          id: 'r5',
          name: 'Children\'s Clothing Package',
          description: 'Package of new clothing items for children of different ages. Each package contains 2 shirts, 1 pair of pants/shorts, and 1 pair of socks.',
          type: 'Clothing',
          stock: 40,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Children+Clothing',
          distribution_date: new Date(2023, 7, 20), // August 20, 2023
          location: 'Barangay Multi-Purpose Hall',
          requirements: [
            'Solo Parent ID',
            'Children\'s Birth Certificates'
          ],
          contact: 'Welfare Committee: 09123456785',
          added_date: new Date(2023, 6, 20), // July 20, 2023
          barangay: 'All'
        },
        {
          id: 'r6',
          name: 'Hygiene Kit',
          description: 'Complete hygiene kit containing soap, shampoo, toothpaste, toothbrush, alcohol, face masks, and sanitary items for the family.',
          type: 'Hygiene',
          stock: 75,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Hygiene+Kit',
          distribution_date: new Date(2023, 7, 25), // August 25, 2023
          location: 'Barangay Covered Court',
          requirements: [
            'Solo Parent ID'
          ],
          contact: 'Health Committee: 09123456784',
          added_date: new Date(2023, 6, 25), // July 25, 2023
          barangay: 'All'
        },
        {
          id: 'r7',
          name: 'Job Skills Training Voucher',
          description: 'Voucher for free skills training programs in partnership with TESDA. Courses include Basic Computer Skills, Baking, Sewing, and Customer Service.',
          type: 'Education',
          stock: 25,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Skills+Training',
          distribution_date: new Date(2023, 8, 1), // September 1, 2023
          location: 'Barangay Multi-Purpose Hall',
          requirements: [
            'Solo Parent ID',
            'High School Diploma or Equivalent',
            'Application Form'
          ],
          contact: 'Livelihood Committee: 09123456783',
          added_date: new Date(2023, 7, 1), // August 1, 2023
          barangay: 'All'
        },
        {
          id: 'r8',
          name: 'Children\'s Vitamins',
          description: 'Three-month supply of multivitamins for children to support their growth and immune system.',
          type: 'Medical',
          stock: 0, // Out of stock
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Children+Vitamins',
          distribution_date: null,
          location: 'Barangay Health Center',
          requirements: [
            'Solo Parent ID',
            'Children\'s Birth Certificates',
            'Barangay Health Card'
          ],
          contact: 'Health Committee: 09123456782',
          added_date: new Date(2023, 7, 5), // August 5, 2023
          barangay: 'All'
        },
        {
          id: 'r9',
          name: 'School Uniform Subsidy',
          description: 'Financial subsidy of PHP 1,000 per child to help with school uniform expenses for the new school year.',
          type: 'Education',
          stock: 5, // Limited stock
          limit: 3,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=School+Uniform',
          distribution_date: new Date(2023, 8, 5), // September 5, 2023
          location: 'Barangay Treasury Office',
          requirements: [
            'Solo Parent ID',
            'Children\'s School ID or Enrollment Form',
            'Proof of Residence'
          ],
          contact: 'Education Committee: 09123456781',
          added_date: new Date(2023, 7, 10), // August 10, 2023
          barangay: 'All'
        },
        {
          id: 'r10',
          name: 'Rice Subsidy',
          description: '10kg of rice per month for three months to support solo parent families with their basic food needs.',
          type: 'Food',
          stock: 60,
          limit: 1,
          image: 'https://via.placeholder.com/300/f0e6ff/6a0dad?text=Rice+Subsidy',
          distribution_date: new Date(2023, 8, 10), // September 10, 2023
          location: 'Barangay Covered Court',
          requirements: [
            'Solo Parent ID',
            'Barangay Residency Certificate'
          ],
          contact: 'Food Committee: 09123456780',
          added_date: new Date(2023, 7, 15), // August 15, 2023
          barangay: 'All'
        }
      ];
      
      // Sample user requests
      this.userRequests = ['r2', 'r3', 'r6'];
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

/* Resources Header */
.resources-header {
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

/* Resources Stats */
.resources-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: #f0e6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a0dad;
  font-size: 24px;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #1c1e21;
}

.stat-info p {
  margin: 0;
  font-size: 14px;
  color: #65676b;
}

/* Resources Container */
.resources-container {
  min-height: 400px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.resource-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.resource-card.out-of-stock {
  opacity: 0.7;
}

.resource-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.resource-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-category {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  z-index: 1;
}

.category-food {
  background: #e8f5e9;
  color: #2e7d32;
}

.category-education {
  background: #e8eaf6;
  color: #3949ab;
}

.category-medical {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-financial {
  background: #e3f2fd;
  color: #1565c0;
}

.category-clothing {
  background: #fff8e1;
  color: #f57c00;
}

.category-hygiene {
  background: #e0f7fa;
  color: #00838f;
}

.category-other {
  background: #f5f5f5;
  color: #616161;
}

.out-of-stock-badge, .limited-stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 20px;
  z-index: 1;
}

.out-of-stock-badge {
  background: #ffebee;
  color: #c62828;
}

.limited-stock-badge {
  background: #fff8e1;
  color: #f57c00;
}

.resource-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.resource-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #1c1e21;
}

.resource-description {
  color: #65676b;
  font-size: 14px;
  margin-bottom: 15px;
  flex: 1;
}

.resource-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.resource-stock, .resource-limit {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #65676b;
}

.resource-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
  font-size: 13px;
  color: #65676b;
}

.resource-date, .resource-location {
  display: flex;
  align-items: center;
  gap: 5px;
}

.resource-footer {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.request-btn, .details-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;
}

.request-btn {
  background: #6a0dad;
  color: white;
}

.request-btn:hover:not(:disabled) {
  background: #5a0b8d;
}

.request-btn:disabled {
  background: #d0d0d0;
  cursor: not-allowed;
}

.details-btn {
  background: #f0e6ff;
  color: #6a0dad;
}

.details-btn:hover {
  background: #e0d0ff;
}

.full-width {
  width: 100%;
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
  border-radius: 10px;
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

.resource-detail-image {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.resource-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-detail-content h3 {
  margin: 0 0 15px 0;
  font-size: 22px;
  color: #1c1e21;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: 600;
  color: #65676b;
  display: block;
  margin-bottom: 5px;
}

.detail-value {
  color: #1c1e21;
}

.category-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.requirements-list {
  margin: 5px 0 0 20px;
  padding: 0;
}

.requirements-list li {
  margin-bottom: 5px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #f0e6ff;
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

  .resources-stats {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .filter-container {
    flex-direction: column;
  }

  .filter-item {
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

  .search-filter-container {
    padding: 10px;
  }

  .resources-stats {
    grid-template-columns: 1fr;
  }

  .resources-grid {
    grid-template-columns: 1fr;
  }

  .resource-footer {
    flex-direction: column;
  }
}
</style>