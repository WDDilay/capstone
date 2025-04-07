<template>
<div class="app-container">
  <!-- Main Header / Navbar -->
  <header class="main-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="pi" :class="isSidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
      </button>
      <h1>Request Resources</h1>
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
            <router-link to="/resourcereq" class="active">
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
      <div class="request-container">
        <!-- Request Form Card -->
        <div class="request-card">
          <div class="request-header">
            <h2><i class="pi pi-file-edit"></i> Resource Request Form</h2>
            <p>Please fill out this form to request resources from the Solo Parent Federation.</p>
          </div>
          
          <div v-if="isSubmitted" class="success-message">
            <div class="success-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <h3>Request Submitted Successfully!</h3>
            <p>Your request has been submitted and is now pending approval. You will be notified once it's processed.</p>
            <div class="request-reference">
              <span>Reference Number:</span> <strong>{{ referenceNumber }}</strong>
            </div>
            <button class="new-request-btn" @click="resetForm">Submit Another Request</button>
          </div>
          
          <form v-else @submit.prevent="submitRequest" class="request-form">
            <!-- Resource Type Selection -->
            <div class="form-group">
              <label for="resourceType">Resource Type <span class="required">*</span></label>
              <div class="select-wrapper">
                <select 
                  id="resourceType" 
                  v-model="formData.resourceType" 
                  class="form-control"
                  required
                  @change="loadResourcesByType"
                >
                  <option value="" disabled>Select Resource Type</option>
                  <option v-for="type in resourceTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
                <i class="pi pi-chevron-down select-icon"></i>
              </div>
              <span v-if="errors.resourceType" class="error-message">{{ errors.resourceType }}</span>
            </div>
            
            <!-- Resource Selection -->
            <div class="form-group">
              <label for="resource">Resource <span class="required">*</span></label>
              <div class="select-wrapper">
                <select 
                  id="resource" 
                  v-model="formData.resourceId" 
                  class="form-control"
                  required
                  :disabled="!formData.resourceType || availableResources.length === 0"
                >
                  <option value="" disabled>{{ selectResourcePlaceholder }}</option>
                  <option v-for="resource in availableResources" :key="resource.id" :value="resource.id">
                    {{ resource.name }} (Available: {{ resource.stock }})
                  </option>
                </select>
                <i class="pi pi-chevron-down select-icon"></i>
              </div>
              <span v-if="errors.resourceId" class="error-message">{{ errors.resourceId }}</span>
            </div>
            
            <!-- Quantity Selection -->
            <div class="form-group">
              <label for="quantity">Quantity <span class="required">*</span></label>
              <div class="quantity-input">
                <button 
                  type="button" 
                  class="quantity-btn" 
                  @click="decrementQuantity"
                  :disabled="formData.quantity <= 1"
                >
                  <i class="pi pi-minus"></i>
                </button>
                <input 
                  id="quantity" 
                  type="number" 
                  v-model.number="formData.quantity" 
                  class="form-control quantity-control"
                  min="1"
                  :max="selectedResourceMaxQuantity"
                  required
                />
                <button 
                  type="button" 
                  class="quantity-btn"
                  @click="incrementQuantity"
                  :disabled="formData.quantity >= selectedResourceMaxQuantity"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
              <span class="helper-text">
                {{ quantityHelperText }}
              </span>
              <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
            </div>
            
            <!-- Purpose/Reason -->
            <div class="form-group">
              <label for="reason">Purpose/Reason <span class="required">*</span></label>
              <textarea 
                id="reason" 
                v-model="formData.reason" 
                class="form-control"
                rows="4"
                placeholder="Please explain why you need this resource..."
                required
              ></textarea>
              <span class="helper-text">
                {{ formData.reason.length }}/500 characters
              </span>
              <span v-if="errors.reason" class="error-message">{{ errors.reason }}</span>
            </div>
            
            <!-- Supporting Documents (Optional) -->
            <div class="form-group">
              <label for="documents">Supporting Documents (Optional)</label>
              <div class="file-upload">
                <input 
                  id="documents" 
                  type="file" 
                  ref="fileInput"
                  @change="handleFileUpload"
                  multiple
                  class="file-input"
                />
                <div class="file-upload-btn">
                  <i class="pi pi-upload"></i>
                  <span>Choose Files</span>
                </div>
                <span class="file-name">{{ fileUploadText }}</span>
              </div>
              <span class="helper-text">
                You can upload documents to support your request (max 3 files, 5MB each)
              </span>
            </div>
            
            <!-- Additional Notes -->
            <div class="form-group">
              <label for="notes">Additional Notes (Optional)</label>
              <textarea 
                id="notes" 
                v-model="formData.notes" 
                class="form-control"
                rows="3"
                placeholder="Any additional information you'd like to provide..."
              ></textarea>
            </div>
            
            <!-- Terms and Conditions -->
            <div class="form-group checkbox-group">
              <label class="checkbox-container">
                <input 
                  type="checkbox" 
                  v-model="formData.termsAccepted"
                  required
                />
                <span class="checkmark"></span>
                <span class="checkbox-text">
                  I confirm that the information provided is accurate and I agree to the <a href="#" @click.prevent="showTerms">terms and conditions</a>.
                </span>
              </label>
              <span v-if="errors.termsAccepted" class="error-message">{{ errors.termsAccepted }}</span>
            </div>
            
            <!-- Submit Button -->
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="resetForm">Cancel</button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="isSubmitting"
              >
                <i class="pi" :class="isSubmitting ? 'pi-spinner pi-spin' : 'pi-send'"></i>
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Request Guidelines Card -->
        <div class="guidelines-card">
          <div class="guidelines-header">
            <h3><i class="pi pi-info-circle"></i> Request Guidelines</h3>
          </div>
          <div class="guidelines-content">
            <ul class="guidelines-list">
              <li>
                <i class="pi pi-check-circle"></i>
                <span>Requests are processed within 3-5 working days.</span>
              </li>
              <li>
                <i class="pi pi-check-circle"></i>
                <span>You will be notified via SMS or email when your request is approved.</span>
              </li>
              <li>
                <i class="pi pi-check-circle"></i>
                <span>Please bring your Solo Parent ID when claiming resources.</span>
              </li>
              <li>
                <i class="pi pi-check-circle"></i>
                <span>Resources must be claimed within 7 days of approval.</span>
              </li>
              <li>
                <i class="pi pi-check-circle"></i>
                <span>Each solo parent is limited to 3 resource requests per month.</span>
              </li>
            </ul>
            
            <div class="contact-info">
              <h4>Need Help?</h4>
              <p>If you have questions about requesting resources, please contact:</p>
              <div class="contact-item">
                <i class="pi pi-phone"></i>
                <span>(123) 456-7890</span>
              </div>
              <div class="contact-item">
                <i class="pi pi-envelope"></i>
                <span>support@soloparentfederation.org</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Request History Card -->
        <div class="history-card">
          <div class="history-header">
            <h3><i class="pi pi-history"></i> Your Recent Requests</h3>
            <router-link to="/request-history" class="view-all-link">
              View All <i class="pi pi-arrow-right"></i>
            </router-link>
          </div>
          <div class="history-content">
            <div v-if="recentRequests.length === 0" class="no-history">
              <i class="pi pi-inbox"></i>
              <p>You haven't made any resource requests yet.</p>
            </div>
            <ul v-else class="history-list">
              <li v-for="request in recentRequests" :key="request.id" class="history-item">
                <div class="history-item-header">
                  <span class="history-resource">{{ request.resourceName }}</span>
                  <span 
                    class="history-status" 
                    :class="`status-${request.status}`"
                  >
                    {{ request.status }}
                  </span>
                </div>
                <div class="history-item-details">
                  <div class="history-detail">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDate(request.dateRequested) }}</span>
                  </div>
                  <div class="history-detail">
                    <i class="pi pi-box"></i>
                    <span>Quantity: {{ request.quantity }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
  
  <!-- Terms and Conditions Modal -->
  <div v-if="showTermsModal" class="modal-overlay" @click="hideTerms">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Terms and Conditions</h2>
        <button class="modal-close" @click="hideTerms">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <h3>Resource Request Terms</h3>
        <p>By submitting a resource request, you agree to the following terms and conditions:</p>
        
        <ol>
          <li>All information provided in this form must be accurate and truthful.</li>
          <li>Resources are distributed based on availability and need.</li>
          <li>The Solo Parent Federation reserves the right to approve or deny requests based on eligibility criteria.</li>
          <li>Approved resources must be claimed within 7 days of notification.</li>
          <li>You must present your Solo Parent ID when claiming resources.</li>
          <li>Resources are for personal use only and may not be sold or transferred to others.</li>
          <li>Misuse of resources or providing false information may result in disqualification from future resource distributions.</li>
          <li>The Solo Parent Federation may contact you for additional information regarding your request.</li>
          <li>You are limited to 3 resource requests per month, unless special circumstances apply.</li>
          <li>By accepting resources, you agree to participate in occasional follow-up surveys to help improve our services.</li>
        </ol>
        
        <h3>Privacy Policy</h3>
        <p>The Solo Parent Federation is committed to protecting your privacy. Information collected through this form will be used solely for the purpose of processing your resource request and will not be shared with third parties without your consent.</p>
      </div>
      <div class="modal-footer">
        <button class="accept-btn" @click="acceptTerms">I Accept</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { db } from '@/services/firebase.js';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

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
      formData: {
        resourceType: '',
        resourceId: '',
        quantity: 1,
        reason: '',
        notes: '',
        termsAccepted: false,
        files: []
      },
      errors: {},
      isSubmitting: false,
      isSubmitted: false,
      referenceNumber: '',
      showTermsModal: false,
      resourceTypes: ['Food', 'Education', 'Medical', 'Financial', 'Clothing', 'Hygiene', 'Other'],
      allResources: [],
      availableResources: [],
      recentRequests: []
    };
  },
  computed: {
    selectResourcePlaceholder() {
      if (!this.formData.resourceType) {
        return 'Please select a resource type first';
      }
      
      if (this.availableResources.length === 0) {
        return 'No resources available for this type';
      }
      
      return 'Select a resource';
    },
    selectedResource() {
      if (!this.formData.resourceId) return null;
      
      return this.allResources.find(resource => resource.id === this.formData.resourceId);
    },
    selectedResourceMaxQuantity() {
      if (!this.selectedResource) return 1;
      
      // If resource has a limit per person, use that, otherwise use the stock
      return this.selectedResource.limit ? 
        Math.min(this.selectedResource.limit, this.selectedResource.stock) : 
        this.selectedResource.stock;
    },
    quantityHelperText() {
      if (!this.selectedResource) return 'Select a resource to set quantity';
      
      if (this.selectedResource.limit) {
        return `Maximum ${this.selectedResource.limit} per person (${this.selectedResource.stock} in stock)`;
      }
      
      return `${this.selectedResource.stock} available in stock`;
    },
    fileUploadText() {
      if (this.formData.files.length === 0) {
        return 'No file chosen';
      }
      
      if (this.formData.files.length === 1) {
        return this.formData.files[0].name;
      }
      
      return `${this.formData.files.length} files selected`;
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
      this.fetchRecentRequests();
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
    loadResourcesByType() {
      this.formData.resourceId = '';
      
      if (!this.formData.resourceType) {
        this.availableResources = [];
        return;
      }
      
      this.availableResources = this.allResources.filter(resource => 
        resource.type === this.formData.resourceType && resource.stock > 0
      );
    },
    incrementQuantity() {
      if (this.formData.quantity < this.selectedResourceMaxQuantity) {
        this.formData.quantity++;
      }
    },
    decrementQuantity() {
      if (this.formData.quantity > 1) {
        this.formData.quantity--;
      }
    },
    handleFileUpload(event) {
      const files = Array.from(event.target.files);
      
      // Limit to 3 files
      if (files.length > 3) {
        alert('You can upload a maximum of 3 files.');
        this.$refs.fileInput.value = '';
        return;
      }
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        alert(`The following files exceed the 5MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
        this.$refs.fileInput.value = '';
        return;
      }
      
      this.formData.files = files;
    },
    validateForm() {
      this.errors = {};
      let isValid = true;
      
      if (!this.formData.resourceType) {
        this.errors.resourceType = 'Please select a resource type';
        isValid = false;
      }
      
      if (!this.formData.resourceId) {
        this.errors.resourceId = 'Please select a resource';
        isValid = false;
      }
      
      if (!this.formData.quantity || this.formData.quantity < 1) {
        this.errors.quantity = 'Quantity must be at least 1';
        isValid = false;
      }
      
      if (this.selectedResource && this.formData.quantity > this.selectedResourceMaxQuantity) {
        this.errors.quantity = `Maximum quantity allowed is ${this.selectedResourceMaxQuantity}`;
        isValid = false;
      }
      
      if (!this.formData.reason.trim()) {
        this.errors.reason = 'Please provide a reason for your request';
        isValid = false;
      }
      
      if (this.formData.reason.length > 500) {
        this.errors.reason = 'Reason cannot exceed 500 characters';
        isValid = false;
      }
      
      if (!this.formData.termsAccepted) {
        this.errors.termsAccepted = 'You must accept the terms and conditions';
        isValid = false;
      }
      
      return isValid;
    },
    async submitRequest() {
      if (!this.validateForm()) {
        // Scroll to the first error
        const firstError = document.querySelector('.error-message');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        // In a real app, you would upload files to storage and save request to Firestore
        // For this demo, we'll just simulate a successful submission
        
        // Example of how you would submit to Firestore:
        /*
        const requestsRef = collection(db, "requests");
        
        const docRef = await addDoc(requestsRef, {
          userId: this.user.id,
          userName: this.user.name,
          resourceId: this.formData.resourceId,
          resourceName: this.selectedResource.name,
          resourceType: this.formData.resourceType,
          quantity: this.formData.quantity,
          reason: this.formData.reason,
          notes: this.formData.notes,
          status: 'pending',
          dateRequested: serverTimestamp(),
          barangay: this.user.barangay,
          // Add file URLs after upload
          attachments: []
        });
        */
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a reference number
        this.referenceNumber = 'REQ-' + Date.now().toString().slice(-8);
        
        this.isSubmitted = true;
        this.isSubmitting = false;
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("❌ Error submitting request:", error);
        alert("Failed to submit request. Please try again.");
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.formData = {
        resourceType: '',
        resourceId: '',
        quantity: 1,
        reason: '',
        notes: '',
        termsAccepted: false,
        files: []
      };
      this.errors = {};
      this.isSubmitted = false;
      this.referenceNumber = '';
      
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    showTerms() {
      this.showTermsModal = true;
    },
    hideTerms() {
      this.showTermsModal = false;
    },
    acceptTerms() {
      this.formData.termsAccepted = true;
      this.hideTerms();
    },
    formatDate(date) {
      if (!date) return '';
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
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
          this.allResources = snapshot.docs.map(doc => {
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
    async fetchRecentRequests() {
      if (!this.user.id) return;
      
      try {
        const requestsRef = collection(db, "requests");
        const q = query(
          requestsRef,
          where("userId", "==", this.user.id),
          orderBy("dateRequested", "desc"),
          limit(3)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          this.recentRequests = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              resourceName: data.resourceName,
              resourceType: data.resourceType,
              quantity: data.quantity,
              status: data.status,
              dateRequested: data.dateRequested?.toDate ? data.dateRequested.toDate() : new Date(data.dateRequested)
            };
          });
        } else {
          // Load sample data for recent requests
          this.loadSampleRecentRequests();
        }
      } catch (error) {
        console.error("❌ Error fetching recent requests:", error);
        this.loadSampleRecentRequests();
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
      this.allResources = [
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
        }
      ];
      
      this.loadSampleRecentRequests();
    },
    loadSampleRecentRequests() {
      // Sample recent requests for demonstration
      this.recentRequests = [
        {
          id: 'req1',
          resourceName: 'Food Assistance Package',
          resourceType: 'Food',
          quantity: 1,
          status: 'approved',
          dateRequested: new Date(2023, 6, 15) // July 15, 2023
        },
        {
          id: 'req2',
          resourceName: 'School Supplies Package',
          resourceType: 'Education',
          quantity: 1,
          status: 'pending',
          dateRequested: new Date(2023, 6, 20) // July 20, 2023
        },
        {
          id: 'req3',
          resourceName: 'Hygiene Kit',
          resourceType: 'Hygiene',
          quantity: 1,
          status: 'rejected',
          dateRequested: new Date(2023, 6, 25) // July 25, 2023
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

/* Request Container */
.request-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

/* Request Card */
.request-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  grid-column: 1;
  grid-row: span 2;
}

.request-header {
  padding: 20px;
  border-bottom: 1px solid #f0e6ff;
}

.request-header h2 {
  margin: 0 0 10px 0;
  font-size: 22px;
  color: #6a0dad;
  display: flex;
  align-items: center;
  gap: 10px;
}

.request-header p {
  margin: 0;
  color: #65676b;
}

/* Success Message */
.success-message {
  padding: 30px 20px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e8f5e9;
  color: #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 20px;
}

.success-message h3 {
  margin: 0 0 10px 0;
  font-size: 22px;
  color: #2e7d32;
}

.success-message p {
  margin: 0 0 20px 0;
  color: #65676b;
}

.request-reference {
  background: #f5f0fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: inline-block;
}

.new-request-btn {
  padding: 12px 24px;
  background: #6a0dad;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.new-request-btn:hover {
  background: #5a0b8d;
  transform: translateY(-2px);
}

/* Request Form */
.request-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1c1e21;
}

.required {
  color: #e53935;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0d0ff;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #6a0dad;
  box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.1);
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6a0dad;
  pointer-events: none;
}

select.form-control {
  appearance: none;
  padding-right: 40px;
}

.quantity-input {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0e6ff;
  color: #6a0dad;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: #e0d0ff;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control {
  width: 80px;
  text-align: center;
  margin: 0 10px;
  padding: 8px;
}

.helper-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #65676b;
}

.error-message {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #e53935;
}

.file-upload {
  position: relative;
  display: flex;
  align-items: center;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload-btn {
  padding: 10px 15px;
  background: #f0e6ff;
  color: #6a0dad;
  border: 1px dashed #6a0dad;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.file-upload:hover .file-upload-btn {
  background: #e0d0ff;
}

.file-name {
  margin-left: 10px;
  font-size: 14px;
  color: #65676b;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 1px solid #e0d0ff;
  border-radius: 4px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #f0e6ff;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #6a0dad;
  border-color: #6a0dad;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-size: 14px;
  color: #1c1e21;
}

.checkbox-text a {
  color: #6a0dad;
  text-decoration: none;
}

.checkbox-text a:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn {
  padding: 12px 24px;
  background: white;
  color: #6a0dad;
  border: 1px solid #e0d0ff;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f0e6ff;
}

.submit-btn {
  padding: 12px 24px;
  background: #6a0dad;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #5a0b8d;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Guidelines Card */
.guidelines-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  grid-column: 2;
  grid-row: 1;
}

.guidelines-header {
  padding: 15px 20px;
  background: #f0e6ff;
  border-bottom: 1px solid #e0d0ff;
}

.guidelines-header h3 {
  margin: 0;
  font-size: 18px;
  color: #6a0dad;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guidelines-content {
  padding: 15px 20px;
}

.guidelines-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.guidelines-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  color: #1c1e21;
  font-size: 14px;
}

.guidelines-list li i {
  color: #6a0dad;
  margin-top: 2px;
}

.contact-info {
  border-top: 1px solid #f0e6ff;
  padding-top: 15px;
}

.contact-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #1c1e21;
}

.contact-info p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #65676b;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #1c1e21;
}

.contact-item i {
  color: #6a0dad;
}

/* History Card */
.history-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  grid-column: 2;
  grid-row: 2;
}

.history-header {
  padding: 15px 20px;
  background: #f0e6ff;
  border-bottom: 1px solid #e0d0ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header h3 {
  margin: 0;
  font-size: 18px;
  color: #6a0dad;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-all-link {
  font-size: 14px;
  color: #6a0dad;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.view-all-link:hover {
  text-decoration: underline;
}

.history-content {
  padding: 15px 20px;
}

.no-history {
  text-align: center;
  padding: 20px 0;
  color: #65676b;
}

.no-history i {
  font-size: 40px;
  color: #e0d0ff;
  margin-bottom: 10px;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  padding: 12px;
  border-radius: 8px;
  background: #f5f0fa;
  margin-bottom: 10px;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-resource {
  font-weight: 600;
  color: #1c1e21;
  font-size: 14px;
}

.history-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: #fff8e1;
  color: #f57c00;
}

.status-approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-rejected {
  background: #ffebee;
  color: #c62828;
}

.history-item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-detail {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
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

.modal-body h3 {
  margin: 20px 0 10px 0;
  font-size: 18px;
  color: #6a0dad;
}

.modal-body p {
  margin: 0 0 15px 0;
  color: #1c1e21;
  line-height: 1.5;
}

.modal-body ol {
  margin: 0 0 20px 0;
  padding-left: 20px;
}

.modal-body ol li {
  margin-bottom: 8px;
  color: #1c1e21;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #f0e6ff;
  display: flex;
  justify-content: flex-end;
}

.accept-btn {
  padding: 10px 20px;
  background: #6a0dad;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.accept-btn:hover {
  background: #5a0b8d;
  transform: translateY(-2px);
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
  
  .request-container {
    grid-template-columns: 1fr;
  }
  
  .request-card, .guidelines-card, .history-card {
    grid-column: 1;
  }
  
  .request-card {
    grid-row: 1;
  }
  
  .guidelines-card {
    grid-row: 2;
  }
  
  .history-card {
    grid-row: 3;
  }
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .submit-btn {
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
  
  .request-header h2 {
    font-size: 20px;
  }
  
  .quantity-input {
    flex-wrap: wrap;
  }
  
  .quantity-control {
    width: 100%;
    margin: 10px 0;
  }
  
  .file-upload {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .file-name {
    margin: 10px 0 0 0;
  }
}
</style>