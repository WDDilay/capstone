<template>
  <div class="member-resource-system">
    <div class="main-content">
      <!-- Alert Messages -->
      <div v-if="notification.show" :class="`notification ${notification.type}`">
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">&times;</button>
      </div>

      <h1 class="page-title">Member Resource Center</h1>

      <!-- Stat Cards -->
      <div class="stat-cards">
        <div class="stat-card" v-for="(stat, index) in stats" :key="index">
          <div class="stat-icon" :style="`background-color: ${stat.bgColor}`">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ stat.value }}</h3>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'request' }]" 
          @click="activeTab = 'request'"
        >
          Request Resource
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]" 
          @click="activeTab = 'history'; loadRequestHistory()"
        >
          My Requests
        </button>
      </div>

      <!-- Request Resource Tab -->
      <div v-if="activeTab === 'request'" class="tab-content">
        <h2 class="section-title">Request Resources from Barangay</h2>
        
        <!-- Member Info Banner -->
        <div class="member-info-banner">
          <div class="member-info-item">
            <span class="info-label">Barangay:</span>
            <span class="info-value">{{ currentBarangay }}</span>
          </div>
          <div class="member-info-item">
            <span class="info-label">Reference Code:</span>
            <span class="info-value">{{ userReferenceCode }}</span>
          </div>
        </div>
        
        <form @submit.prevent="submitResourceRequest" class="resource-request-form">
          <!-- Resource Selection Section -->
          <div class="form-section">
            <h3 class="subsection-title">Resource Information</h3>
            <div class="requested-resources">
              <div v-for="(item, index) in resourceRequestForm.requestedItems" :key="index" class="requested-item">
                <div class="resource-selection">
                  <div class="resource-name">
                    <label :for="`resource-name-${index}`">Resource Name <span class="required">*</span></label>
                    <input 
                      :id="`resource-name-${index}`"
                      v-model="item.resourceName" 
                      type="text" 
                      required
                      placeholder="Enter resource name"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="resource-type">
                    <label :for="`resource-type-${index}`">Resource Type <span class="required">*</span></label>
                    <select 
                      :id="`resource-type-${index}`"
                      v-model="item.resourceType" 
                      required
                      class="form-select"
                    >
                      <option value="" disabled>Select type</option>
                      <option value="Financial">Financial</option>
                      <option value="Medical">Medical</option>
                      <option value="Educational">Educational</option>
                      <option value="Legal">Legal</option>
                      <option value="Livelihood">Livelihood</option>
                      <option value="Housing">Housing</option>
                      <option value="Food">Food</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div class="resource-quantity">
                    <label :for="`quantity-${index}`">Quantity <span class="required">*</span></label>
                    <input 
                      :id="`quantity-${index}`"
                      v-model.number="item.quantity" 
                      type="number" 
                      min="1" 
                      required
                      placeholder="Qty"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="resource-unit">
                    <label :for="`unit-${index}`">Unit <span class="required">*</span></label>
                    <input 
                      :id="`unit-${index}`"
                      v-model="item.unit" 
                      type="text" 
                      required
                      placeholder="e.g., kg, pcs"
                      class="form-input"
                    >
                  </div>
                  
                  <button 
                    type="button" 
                    @click="removeResourceItem(index)" 
                    class="remove-btn"
                    :disabled="resourceRequestForm.requestedItems.length <= 1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
              
              <button type="button" @click="addResourceItem" class="add-item-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Another Resource
              </button>
            </div>
          </div>

          <!-- Request Details Section -->
          <div class="form-section">
            <h3 class="subsection-title">Request Details</h3>
            <div class="form-group">
              <label for="urgency">Urgency Level <span class="required">*</span></label>
              <select 
                id="urgency"
                v-model="resourceRequestForm.urgency" 
                required
                class="form-select"
              >
                <option value="" disabled>Select urgency level</option>
                <option value="Low">Low - Within a month</option>
                <option value="Medium">Medium - Within two weeks</option>
                <option value="High">High - Within a week</option>
                <option value="Critical">Critical - Immediate need</option>
              </select>
            </div>

            <div class="form-group">
              <label for="reason">Reason for Request <span class="required">*</span></label>
              <textarea 
                id="reason"
                v-model="resourceRequestForm.reason" 
                placeholder="Please explain why you need these resources"
                rows="3"
                required
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="additionalInfo">Additional Information</label>
              <textarea 
                id="additionalInfo"
                v-model="resourceRequestForm.additionalInfo" 
                placeholder="Any additional details that might help your request"
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Contact Information Section -->
          <div class="form-section">
            <h3 class="subsection-title">Contact Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="contactNumber">Contact Number <span class="required">*</span></label>
                <input 
                  id="contactNumber"
                  v-model="resourceRequestForm.contactNumber" 
                  type="text" 
                  required
                  placeholder="Enter your contact number"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="alternateContact">Alternate Contact (Optional)</label>
                <input 
                  id="alternateContact"
                  v-model="resourceRequestForm.alternateContact" 
                  type="text" 
                  placeholder="Enter an alternate contact"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="preferredContactTime">Preferred Contact Time</label>
                <select 
                  id="preferredContactTime"
                  v-model="resourceRequestForm.preferredContactTime" 
                  class="form-select"
                >
                  <option value="">No preference</option>
                  <option value="Morning">Morning (8AM - 12PM)</option>
                  <option value="Afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="Evening">Evening (5PM - 8PM)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="deliveryAddress">Delivery Address <span class="required">*</span></label>
                <input 
                  id="deliveryAddress"
                  v-model="resourceRequestForm.deliveryAddress" 
                  type="text" 
                  required
                  placeholder="Enter delivery address"
                  class="form-input"
                >
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting || !isValidRequestForm">
              {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
            </button>
            <button type="button" @click="resetResourceRequestForm" class="cancel-btn">
              Reset Form
            </button>
          </div>
        </form>
      </div>

      <!-- My Requests Tab -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="historySearchQuery" 
              type="text" 
              placeholder="Search requests..." 
              @input="filterRequestHistory"
            >
          </div>
          <div class="filter-box">
            <select v-model="historyStatusFilter" @change="filterRequestHistory">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div v-if="isLoadingHistory" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading request history...</p>
        </div>

        <div v-else-if="requestHistory.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3>No Requests Found</h3>
          <p>You haven't made any resource requests yet.</p>
          <button @click="activeTab = 'request'" class="action-btn">Make Your First Request</button>
        </div>

        <div v-else class="request-cards">
          <div 
            v-for="request in filteredRequestHistory" 
            :key="request.id" 
            class="request-card"
            :class="{
              'pending': request.status === 'Pending',
              'approved': request.status === 'Approved',
              'rejected': request.status === 'Rejected'
            }"
          >
            <div class="request-header">
              <div class="request-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {{ formatDate(request.requestDate) }}
              </div>
              <div class="request-status">
                <span 
                  class="status-badge"
                  :class="{
                    'pending': request.status === 'Pending',
                    'approved': request.status === 'Approved',
                    'rejected': request.status === 'Rejected'
                  }"
                >
                  {{ request.status }}
                </span>
              </div>
            </div>
            
            <div class="request-resources">
              <h4>Requested Resources</h4>
              <div class="resource-list">
                <div 
                  v-for="(item, index) in request.requestedItems" 
                  :key="index"
                  class="resource-item"
                  :style="`border-left-color: ${getResourceTypeColor(item.resourceType, 1)}`"
                >
                  <div class="resource-name">{{ item.resourceName }}</div>
                  <div class="resource-details">
                    <span class="resource-type" :style="`background-color: ${getResourceTypeColor(item.resourceType, 0.2)}; color: ${getResourceTypeColor(item.resourceType, 1)}`">
                      {{ item.resourceType }}
                    </span>
                    <span class="resource-quantity">{{ item.quantity }} {{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="request-reason">
              <h4>Reason</h4>
              <p>{{ request.reason }}</p>
            </div>
            
            <div class="request-footer">
              <button @click="viewRequestDetails(request)" class="view-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                View Details
              </button>
              
              <button 
                v-if="request.status === 'Pending'" 
                @click="cancelRequest(request)" 
                class="cancel-request-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Details Modal -->
      <div v-if="showRequestModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Request Details</h2>
            <button @click="showRequestModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedRequest">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Request Date</h3>
                <p>{{ formatDate(selectedRequest.requestDate) }}</p>
              </div>
              <div class="detail-item">
                <h3>Status</h3>
                <p>
                  <span 
                    class="status-badge"
                    :class="{
                      'pending': selectedRequest.status === 'Pending',
                      'approved': selectedRequest.status === 'Approved',
                      'rejected': selectedRequest.status === 'Rejected'
                    }"
                  >
                    {{ selectedRequest.status }}
                  </span>
                </p>
              </div>
              <div class="detail-item">
                <h3>Urgency Level</h3>
                <p>{{ selectedRequest.urgency }}</p>
              </div>
              <div class="detail-item">
                <h3>Barangay</h3>
                <p>{{ selectedRequest.barangay }}</p>
              </div>
              <div class="detail-item">
                <h3>Reference Code</h3>
                <p>{{ selectedRequest.referenceCode }}</p>
              </div>
            </div>

            <div class="detail-section">
              <h3>Requested Resources</h3>
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Type</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedRequest.requestedItems" :key="index">
                    <td>{{ item.resourceName }}</td>
                    <td>
                      <span 
                        class="resource-type-badge"
                        :style="`background-color: ${getResourceTypeColor(item.resourceType, 0.2)}; color: ${getResourceTypeColor(item.resourceType, 1)}`"
                      >
                        {{ item.resourceType }}
                      </span>
                    </td>
                    <td>{{ item.quantity }} {{ item.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="detail-section">
              <h3>Reason for Request</h3>
              <p>{{ selectedRequest.reason }}</p>
            </div>

            <div class="detail-section" v-if="selectedRequest.additionalInfo">
              <h3>Additional Information</h3>
              <p>{{ selectedRequest.additionalInfo }}</p>
            </div>

            <div class="detail-section">
              <h3>Contact Information</h3>
              <div class="contact-details">
                <div class="contact-item">
                  <span class="contact-label">Contact Number:</span>
                  <span class="contact-value">{{ selectedRequest.contactNumber }}</span>
                </div>
                <div class="contact-item" v-if="selectedRequest.alternateContact">
                  <span class="contact-label">Alternate Contact:</span>
                  <span class="contact-value">{{ selectedRequest.alternateContact }}</span>
                </div>
                <div class="contact-item" v-if="selectedRequest.preferredContactTime">
                  <span class="contact-label">Preferred Contact Time:</span>
                  <span class="contact-value">{{ selectedRequest.preferredContactTime }}</span>
                </div>
                <div class="contact-item">
                  <span class="contact-label">Delivery Address:</span>
                  <span class="contact-value">{{ selectedRequest.deliveryAddress }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="selectedRequest.adminFeedback">
              <h3>Admin Feedback</h3>
              <p>{{ selectedRequest.adminFeedback }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              v-if="selectedRequest && selectedRequest.status === 'Pending'" 
              @click="cancelRequest(selectedRequest)" 
              class="cancel-request-btn"
            >
              Cancel Request
            </button>
            <button @click="showRequestModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal">
        <div class="modal-content confirm-modal">
          <div class="modal-header">
            <h2>Confirm Cancellation</h2>
            <button @click="showConfirmModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to cancel this request? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="confirmCancelRequest" class="confirm-btn">Yes, Cancel Request</button>
            <button @click="showConfirmModal = false" class="close-btn">No, Keep Request</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
  getFirestore,
  getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/services/firebase';

// Current user and barangay
const currentUser = ref(null);
const currentBarangay = ref('');
const userReferenceCode = ref('');

// Active tab
const activeTab = ref('request');

// Loading states
const isLoadingHistory = ref(true);
const isSubmitting = ref(false);

// Notification
const notification = ref({ show: false, message: '', type: 'success' });

// Stats
const stats = ref([
  {
    label: 'Total Requests',
    value: '0',
    icon: 'pi pi-list',
    bgColor: '#3B82F6'
  },
  {
    label: 'Pending',
    value: '0',
    icon: 'pi pi-clock',
    bgColor: '#F59E0B'
  },
  {
    label: 'Approved',
    value: '0',
    icon: 'pi pi-check-circle',
    bgColor: '#10B981'
  },
  {
    label: 'Rejected',
    value: '0',
    icon: 'pi pi-times-circle',
    bgColor: '#EF4444'
  }
]);

// Resource Request Form
const resourceRequestForm = ref({
  requestedItems: [
    { 
      resourceName: '',
      resourceType: '',
      quantity: 1,
      unit: ''
    }
  ],
  urgency: '',
  reason: '',
  additionalInfo: '',
  contactNumber: '',
  alternateContact: '',
  preferredContactTime: '',
  deliveryAddress: ''
});

// Request History
const requestHistory = ref([]);
const filteredRequestHistory = ref([]);
const historySearchQuery = ref('');
const historyStatusFilter = ref('');
const showRequestModal = ref(false);
const selectedRequest = ref(null);
const showConfirmModal = ref(false);
const requestToCancel = ref(null);

// Resource type colors
const resourceTypeColors = {
  'Financial': '#3B82F6', // blue
  'Medical': '#EF4444',   // red
  'Educational': '#F59E0B', // amber
  'Legal': '#8B5CF6',     // purple
  'Livelihood': '#10B981', // emerald
  'Housing': '#EC4899',   // pink
  'Food': '#14B8A6',      // teal
  'Other': '#6B7280'      // gray
};

// Get color for resource type
const getResourceTypeColor = (type, opacity = 1) => {
  const color = resourceTypeColors[type] || '#6B7280'; // Default to gray
  
  if (opacity === 1) {
    return color;
  }
  
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Computed property to check if request form is valid
const isValidRequestForm = computed(() => {
  if (!resourceRequestForm.value.urgency || 
      !resourceRequestForm.value.reason || 
      !resourceRequestForm.value.contactNumber || 
      !resourceRequestForm.value.deliveryAddress) {
    return false;
  }
  
  // Check if at least one resource is properly filled
  for (const item of resourceRequestForm.value.requestedItems) {
    if (!item.resourceName || !item.resourceType || !item.quantity || !item.unit) {
      return false;
    }
    
    if (item.quantity <= 0) {
      return false;
    }
  }
  
  return true;
});

// Show notification
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    let date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Initialize user data
const initializeUserData = async () => {
  try {
    const auth = getAuth();
    
    // Wait for auth state to be ready
    const user = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
    
    if (!user) {
      console.error("No authenticated user found");
      showNotification('You are not logged in. Please log in to continue.', 'error');
      return;
    }
    
    console.log("User authenticated:", user.uid);
    currentUser.value = user;
    
    // Try different approaches to find the user document
    let userData = null;
    
    // First try: Look for document with ID matching the user's UID
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        console.log("Found user document by ID");
        userData = userDocSnap.data();
      }
    } catch (err) {
      console.log("Could not find user document by ID:", err.message);
    }
    
    // Second try: Query by 'uid' field
    if (!userData) {
      try {
        const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(userQuery);
        
        if (!querySnapshot.empty) {
          console.log("Found user document by uid field");
          userData = querySnapshot.docs[0].data();
        }
      } catch (err) {
        console.log("Could not find user document by uid field:", err.message);
      }
    }
    
    // Third try: Query by email
    if (!userData && user.email) {
      try {
        const emailQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(emailQuery);
        
        if (!querySnapshot.empty) {
          console.log("Found user document by email");
          userData = querySnapshot.docs[0].data();
        }
      } catch (err) {
        console.log("Could not find user document by email:", err.message);
      }
    }
    
    // If we found user data, use it
    if (userData) {
      console.log("User data found:", userData);
      
      // Check for barangay in different possible field names
      currentBarangay.value = userData.barangay || userData.Barangay || '';
      
      // Check for reference code in different possible field names
      userReferenceCode.value = userData.referenceCode || userData.reference_code || userData.reference || userData.id || '';
      
      // Pre-fill contact information if available
      resourceRequestForm.value.contactNumber = userData.contactNumber || userData.contact || userData.phone || userData.phoneNumber || '';
      resourceRequestForm.value.deliveryAddress = userData.address || userData.deliveryAddress || userData.location || '';
      
      console.log("Extracted user data:", {
        barangay: currentBarangay.value,
        referenceCode: userReferenceCode.value,
        contactNumber: resourceRequestForm.value.contactNumber,
        address: resourceRequestForm.value.deliveryAddress
      });
    } else {
      // Last resort: Log the structure of the users collection to help debug
      console.error("Could not find user document in any way");
      console.log("Attempting to list all users to debug...");
      
      try {
        const allUsersSnapshot = await getDocs(collection(db, 'users'));
        console.log("Total users found:", allUsersSnapshot.size);
        
        if (allUsersSnapshot.size > 0) {
          // Log the first document structure to understand the schema
          const firstDoc = allUsersSnapshot.docs[0];
          console.log("Example user document structure:", {
            id: firstDoc.id,
            fields: Object.keys(firstDoc.data()),
            data: firstDoc.data()
          });
        }
      } catch (err) {
        console.error("Error listing users:", err);
      }
      
      // Use fallback values
      currentBarangay.value = '';
      userReferenceCode.value = user.uid; // Use UID as fallback reference code
      
      showNotification('Your user profile could not be found. Using default values.', 'warning');
    }
  } catch (error) {
    console.error('Error initializing user data:', error);
    showNotification('Failed to load user data: ' + error.message, 'error');
  }
};

// Add resource item to form
const addResourceItem = () => {
  resourceRequestForm.value.requestedItems.push({ 
    resourceName: '',
    resourceType: '',
    quantity: 1,
    unit: ''
  });
};

// Remove resource item from form
const removeResourceItem = (index) => {
  if (resourceRequestForm.value.requestedItems.length > 1) {
    resourceRequestForm.value.requestedItems.splice(index, 1);
  }
};

// Reset resource request form
const resetResourceRequestForm = () => {
  resourceRequestForm.value = {
    requestedItems: [
      { 
        resourceName: '',
        resourceType: '',
        quantity: 1,
        unit: ''
      }
    ],
    urgency: '',
    reason: '',
    additionalInfo: '',
    contactNumber: currentUser.value?.contactNumber || '',
    alternateContact: '',
    preferredContactTime: '',
    deliveryAddress: currentUser.value?.address || ''
  };
};

// Submit resource request
const submitResourceRequest = async () => {
  console.log("Submit request initiated");
  
  if (!isValidRequestForm.value) {
    showNotification('Please fill in all required fields correctly', 'error');
    return;
  }
  
  // Check authentication again at submission time
  const auth = getAuth();
  if (!currentUser.value && auth.currentUser) {
    console.log("Fixing auth state before submission");
    currentUser.value = auth.currentUser;
  }
  
  if (!currentUser.value) {
    console.error("Authentication check failed - user is null");
    showNotification('You must be logged in to submit a request. Please refresh the page or log in again.', 'error');
    return;
  }
  
  // Use fallback values if needed
  const effectiveBarangay = currentBarangay.value || 'Unknown';
  const effectiveReferenceCode = userReferenceCode.value || currentUser.value.uid;
  
  isSubmitting.value = true;
  
  try {
    // Create the user_history collection if it doesn't exist
    const userHistoryCollection = collection(db, 'user_history');
    
    // Add the document to the user_history collection
    const docRef = await addDoc(userHistoryCollection, {
      userId: currentUser.value.uid,
      userName: currentUser.value.displayName || '',
      userEmail: currentUser.value.email || '',
      barangay: effectiveBarangay,
      referenceCode: effectiveReferenceCode,
      requestedItems: resourceRequestForm.value.requestedItems,
      urgency: resourceRequestForm.value.urgency,
      reason: resourceRequestForm.value.reason,
      additionalInfo: resourceRequestForm.value.additionalInfo,
      contactNumber: resourceRequestForm.value.contactNumber,
      alternateContact: resourceRequestForm.value.alternateContact,
      preferredContactTime: resourceRequestForm.value.preferredContactTime,
      deliveryAddress: resourceRequestForm.value.deliveryAddress,
      status: 'Pending',
      requestDate: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    console.log("Request submitted successfully");
    showNotification('Resource request submitted successfully', 'success');
    resetResourceRequestForm();
    
    // Switch to history tab and refresh
    activeTab.value = 'history';
    await loadRequestHistory();
  } catch (error) {
    console.error('Error submitting resource request:', error);
    showNotification('Failed to submit resource request: ' + error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Load request history
const loadRequestHistory = async () => {
  if (!currentUser.value) {
    const auth = getAuth();
    if (auth.currentUser) {
      currentUser.value = auth.currentUser;
    } else {
      return;
    }
  }
  
  isLoadingHistory.value = true;
  
  try {
    // Use the user_history collection
    const userHistoryCollection = collection(db, 'user_history');
    
    // Simpler query that doesn't require a composite index
    const q = query(
      userHistoryCollection,
      where('userId', '==', currentUser.value.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort the results client-side instead of in the query
    requestHistory.value = history.sort((a, b) => {
      // Handle different timestamp formats
      const getTime = (timestamp) => {
        if (!timestamp) return 0;
        if (timestamp instanceof Date) return timestamp.getTime();
        if (timestamp instanceof Timestamp) return timestamp.toDate().getTime();
        if (timestamp.seconds) return timestamp.seconds * 1000;
        if (typeof timestamp === 'string') return new Date(timestamp).getTime();
        return 0;
      };
      
      // Sort in descending order (newest first)
      return getTime(b.requestDate) - getTime(a.requestDate);
    });
    
    filterRequestHistory();
    
    // Update stats
    updateStats();
    
    isLoadingHistory.value = false;
  } catch (error) {
    console.error('Error loading request history:', error);
    showNotification('Failed to load request history: ' + error.message, 'error');
    isLoadingHistory.value = false;
  }
};

// Update stats
const updateStats = () => {
  // Total requests
  stats.value[0].value = requestHistory.value.length.toString();
  
  // Count by status
  const pendingCount = requestHistory.value.filter(req => req.status === 'Pending').length;
  const approvedCount = requestHistory.value.filter(req => req.status === 'Approved').length;
  const rejectedCount = requestHistory.value.filter(req => req.status === 'Rejected').length;
  
  stats.value[1].value = pendingCount.toString();
  stats.value[2].value = approvedCount.toString();
  stats.value[3].value = rejectedCount.toString();
};

// Filter request history
const filterRequestHistory = () => {
  const search = historySearchQuery.value.toLowerCase();
  
  filteredRequestHistory.value = requestHistory.value.filter(request => {
    const matchesSearch = 
      request.reason.toLowerCase().includes(search) ||
      request.requestedItems.some(item => 
        item.resourceName.toLowerCase().includes(search) ||
        item.resourceType.toLowerCase().includes(search)
      );
    
    const matchesStatus = !historyStatusFilter.value || request.status === historyStatusFilter.value;
    
    return matchesSearch && matchesStatus;
  });
};

// View request details
const viewRequestDetails = (request) => {
  selectedRequest.value = request;
  showRequestModal.value = true;
};

// Cancel request
const cancelRequest = (request) => {
  requestToCancel.value = request;
  showConfirmModal.value = true;
};

// Confirm cancel request
const confirmCancelRequest = async () => {
  if (!requestToCancel.value) {
    return;
  }
  
  try {
    // Delete the request from user_history collection
    const requestRef = doc(db, 'user_history', requestToCancel.value.id);
    await deleteDoc(requestRef);
    
    showNotification('Request cancelled successfully', 'success');
    
    // Close modals
    showConfirmModal.value = false;
    showRequestModal.value = false;
    
    // Refresh history
    await loadRequestHistory();
  } catch (error) {
    console.error('Error cancelling request:', error);
    showNotification('Failed to cancel request: ' + error.message, 'error');
  }
};

// Initialize
onMounted(async () => {
  console.log("Component mounted");
  try {
    await initializeUserData();
    
    // Double-check authentication after initialization
    const auth = getAuth();
    if (auth.currentUser && !currentUser.value) {
      console.log("Fixing auth state after mount");
      currentUser.value = auth.currentUser;
    }
    
    await loadRequestHistory();
  } catch (error) {
    console.error('Error initializing member resource system:', error);
    showNotification('Failed to initialize. Please refresh the page.', 'error');
  }
});
</script>

<style scoped>
/* Base Styles */
.member-resource-system {
  font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
  color: #333;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

/* Member Info Banner */
.member-info-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  background-color: #f0f7ff;
  border: 1px solid #cce5ff;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.member-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
}

.info-value {
  color: #3B82F6;
  font-weight: 500;
}

/* Stat Cards */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
}

.stat-icon i {
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Notification */
.notification {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.notification.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
}

/* Tabs */
.tabs {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #2c3e50;
  border-bottom-color: #2c3e50;
}

.tab-content {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* List Controls */
.list-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.search-box input, .filter-box select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #2c3e50;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #666;
}

.empty-icon {
  margin-bottom: 1rem;
  color: #95a5a6;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn:hover {
  background-color: #1a2530;
}

/* Section Titles */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.subsection-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* Form Styles */
.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.required {
  color: #f44336;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  background-color: white;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: #2c3e50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Resource Request Form */
.resource-request-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.requested-resources {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.requested-item {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
}

.resource-selection {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
}

.resource-name, .resource-type, .resource-quantity, .resource-unit {
  display: flex;
  flex-direction: column;
}

.remove-btn {
  background-color: #f8d7da;
  color: #721c24;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  align-self: flex-end;
}

.remove-btn:hover {
  background-color: #f5c6cb;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-item-btn {
  background-color: #e9ecef;
  color: #495057;
  border: 1px dashed #ced4da;
  border-radius: 4px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.add-item-btn:hover {
  background-color: #dee2e6;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn {
  background-color: #2c3e50;
  color: white;
}

.submit-btn:hover {
  background-color: #1a2530;
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #e9ecef;
  color: #333;
}

.cancel-btn:hover {
  background-color: #dee2e6;
}

/* Request Cards */
.request-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.request-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-top: 4px solid #95a5a6;
  transition: transform 0.2s, box-shadow 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.request-card.pending {
  border-top-color: #f59e0b;
}

.request-card.approved {
  border-top-color: #10b981;
}

.request-card.rejected {
  border-top-color: #ef4444;
}

.request-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.request-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.request-resources {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.request-resources h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resource-item {
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid;
}

.resource-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.resource-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.resource-type {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.resource-quantity {
  color: #64748b;
}

.request-reason {
  padding: 1rem;
  flex: 1;
}

.request-reason h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.request-reason p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.request-footer {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
}

.view-btn, .cancel-request-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-btn {
  background-color: #e9ecef;
  color: #2c3e50;
}

.view-btn:hover {
  background-color: #dee2e6;
}

.cancel-request-btn {
  background-color: #f8d7da;
  color: #721c24;
}

.cancel-request-btn:hover {
  background-color: #f5c6cb;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.confirm-modal {
  max-width: 500px;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item h3 {
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 0.25rem 0;
}

.detail-item p {
  margin: 0;
  font-weight: 500;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.detail-section p {
  margin: 0;
  white-space: pre-line;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.detail-table th, .detail-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.detail-table th {
  font-weight: 600;
  background-color: #f8f9fa;
}

.resource-type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
}

.contact-label {
  font-weight: 500;
  min-width: 150px;
}

.confirm-btn {
  padding: 0.5rem 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn:hover {
  background-color: #f5c6cb;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .resource-selection {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .remove-btn {
    align-self: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .request-cards {
    grid-template-columns: 1fr;
  }
  
  .request-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .view-btn, .cancel-request-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>