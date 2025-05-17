<template>
  <div class="attendance-system">
    <div class="main-content">
      <!-- Alert Messages -->
      <div v-if="notification.show" :class="`notification ${notification.type}`">
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">&times;</button>
      </div>

      <h1 class="page-title">Attendance Form Creator</h1>

      <!-- Stat Cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #3B82F6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalForms }}</h3>
            <p class="stat-label">Total Forms</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #10B981">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalAttendees }}</h3>
            <p class="stat-label">Total Attendees</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #F59E0B">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ activeFormsToday }}</h3>
            <p class="stat-label">Active Today</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'create' }]" 
          @click="activeTab = 'create'"
        >
          Create Form
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'manage' }]" 
          @click="activeTab = 'manage'; loadAttendanceForms()"
        >
          Manage Forms
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'responses' }]" 
          @click="activeTab = 'responses'; loadAttendanceResponses()"
        >
          View Responses
        </button>
      </div>

      <!-- Create Form Tab -->
      <div v-if="activeTab === 'create'" class="tab-content">
        <h2 class="section-title">Create New Attendance Form</h2>
        
        <form @submit.prevent="submitAttendanceForm" class="attendance-form">
          <div class="form-section">
            <div class="form-group">
              <label for="eventName">Event Name <span class="required">*</span></label>
              <input 
                id="eventName"
                v-model="formData.eventName" 
                type="text" 
                required
                placeholder="Enter event name"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="eventDate">Event Date <span class="required">*</span></label>
              <input 
                id="eventDate"
                v-model="formData.eventDate" 
                type="date" 
                required
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="attendanceDate">Attendance Date <span class="required">*</span></label>
              <input 
                id="attendanceDate"
                v-model="formData.attendanceDate" 
                type="date" 
                required
                class="form-input"
              >
              <p class="form-help">Members can only submit attendance on this date</p>
            </div>

            <div class="form-group">
              <label for="eventDescription">Event Description</label>
              <textarea 
                id="eventDescription"
                v-model="formData.eventDescription" 
                placeholder="Enter event description"
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="eventLocation">Event Location</label>
              <input 
                id="eventLocation"
                v-model="formData.eventLocation" 
                type="text" 
                placeholder="Enter event location"
                class="form-input"
              >
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Creating...' : 'Create Attendance Form' }}
            </button>
            <button type="button" @click="resetForm" class="cancel-btn">
              Reset Form
            </button>
          </div>
        </form>
      </div>

      <!-- Manage Forms Tab -->
      <div v-if="activeTab === 'manage'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search forms..." 
              @input="filterForms"
            >
          </div>
          <div class="filter-box">
            <select v-model="statusFilter" @change="filterForms">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading attendance forms...</p>
        </div>

        <div v-else-if="filteredForms.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          <h3>No attendance forms found</h3>
          <p>Create your first attendance form to get started</p>
          <button @click="activeTab = 'create'" class="action-btn">Create Form</button>
        </div>

        <div v-else class="forms-grid">
          <div v-for="form in filteredForms" :key="form.id" class="form-card">
            <div class="form-card-header">
              <div :class="['status-indicator', getFormStatus(form)]"></div>
              <h3 class="form-card-title">{{ form.eventName }}</h3>
            </div>
            <div class="form-card-content">
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Event Date: {{ formatDate(form.eventDate) }}</span>
              </div>
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Attendance Date: {{ formatDate(form.attendanceDate) }}</span>
              </div>
              <div class="form-card-detail" v-if="form.eventLocation">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Location: {{ form.eventLocation }}</span>
              </div>
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Responses: {{ getResponseCount(form.id) }}</span>
              </div>
              <p v-if="form.eventDescription" class="form-card-description">
                {{ truncateText(form.eventDescription, 100) }}
              </p>
            </div>
            <div class="form-card-footer">
              <button @click="viewFormDetails(form)" class="view-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                View Details
              </button>
              <button @click="deleteForm(form)" class="delete-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View Responses Tab -->
      <div v-if="activeTab === 'responses'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="responseSearchQuery" 
              type="text" 
              placeholder="Search responses..." 
              @input="filterResponses"
            >
          </div>
          <div class="filter-box">
            <select v-model="responseFormFilter" @change="filterResponses">
              <option value="">All Events</option>
              <option v-for="form in attendanceForms" :key="form.id" :value="form.id">
                {{ form.eventName }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="isLoadingResponses" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading attendance responses...</p>
        </div>

        <div v-else-if="filteredResponses.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <h3>No attendance responses found</h3>
          <p>No members have submitted attendance yet</p>
        </div>

        <div v-else class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortResponses('submittedAt')">
                  Date Submitted
                  <span v-if="responseSortField === 'submittedAt'" class="sort-icon">
                    {{ responseSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResponses('memberName')">
                  Member Name
                  <span v-if="responseSortField === 'memberName'" class="sort-icon">
                    {{ responseSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResponses('referenceCode')">
                  Reference Code
                  <span v-if="responseSortField === 'referenceCode'" class="sort-icon">
                    {{ responseSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResponses('formId')">
                  Event
                  <span v-if="responseSortField === 'formId'" class="sort-icon">
                    {{ responseSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="response in filteredResponses" :key="response.id">
                <td>{{ formatDateTime(response.submittedAt) }}</td>
                <td>{{ response.memberName }}</td>
                <td>{{ response.referenceCode }}</td>
                <td>{{ getEventName(response.formId) }}</td>
                <td>
                  <button @click="viewResponseDetails(response)" class="view-btn" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Form Details Modal -->
      <div v-if="showFormModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Attendance Form Details</h2>
            <button @click="showFormModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedForm">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Event Name</h3>
                <p>{{ selectedForm.eventName }}</p>
              </div>
              <div class="detail-item">
                <h3>Event Date</h3>
                <p>{{ formatDate(selectedForm.eventDate) }}</p>
              </div>
              <div class="detail-item">
                <h3>Attendance Date</h3>
                <p>{{ formatDate(selectedForm.attendanceDate) }}</p>
              </div>
              <div class="detail-item">
                <h3>Status</h3>
                <p>
                  <span 
                    class="status-badge"
                    :class="getFormStatus(selectedForm)"
                  >
                    {{ getFormStatusText(selectedForm) }}
                  </span>
                </p>
              </div>
              <div class="detail-item" v-if="selectedForm.eventLocation">
                <h3>Location</h3>
                <p>{{ selectedForm.eventLocation }}</p>
              </div>
              <div class="detail-item">
                <h3>Created On</h3>
                <p>{{ formatDateTime(selectedForm.createdAt) }}</p>
              </div>
            </div>

            <div class="detail-section" v-if="selectedForm.eventDescription">
              <h3>Description</h3>
              <p>{{ selectedForm.eventDescription }}</p>
            </div>

            <div class="detail-section">
              <h3>Attendance Responses</h3>
              <p v-if="getResponseCount(selectedForm.id) === 0">No responses yet</p>
              <div v-else class="response-summary">
                <div class="response-count">
                  <span class="count">{{ getResponseCount(selectedForm.id) }}</span>
                  <span class="label">Total Responses</span>
                </div>
              </div>
            </div>

            <div class="qr-section">
              <h3>Attendance QR Code</h3>
              <p>Members can scan this QR code to access the attendance form:</p>
              <div class="qr-placeholder">
                <p>QR Code for form ID: {{ selectedForm.id }}</p>
                <p class="qr-help">Implement QR code generation here</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showFormModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Response Details Modal -->
      <div v-if="showResponseModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Attendance Response Details</h2>
            <button @click="showResponseModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedResponse">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Member Name</h3>
                <p>{{ selectedResponse.memberName }}</p>
              </div>
              <div class="detail-item">
                <h3>Reference Code</h3>
                <p>{{ selectedResponse.referenceCode }}</p>
              </div>
              <div class="detail-item">
                <h3>Event</h3>
                <p>{{ getEventName(selectedResponse.formId) }}</p>
              </div>
              <div class="detail-item">
                <h3>Submitted At</h3>
                <p>{{ formatDateTime(selectedResponse.submittedAt) }}</p>
              </div>
            </div>

            <div class="detail-section" v-if="selectedResponse.comments">
              <h3>Comments</h3>
              <p>{{ selectedResponse.comments }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showResponseModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h2>Confirm Delete</h2>
            <button @click="showDeleteModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this attendance form?</p>
            <p class="warning-text">This action cannot be undone. All associated responses will remain in the system.</p>
          </div>
          <div class="modal-footer">
            <button @click="confirmDelete" class="delete-btn-large">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Delete Form
            </button>
            <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
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

// Active tab
const activeTab = ref('create');

// Loading states
const isLoading = ref(false);
const isLoadingResponses = ref(false);
const isSubmitting = ref(false);

// Notification
const notification = ref({ show: false, message: '', type: 'success' });

// Form data
const formData = ref({
  eventName: '',
  eventDate: '',
  attendanceDate: '',
  eventDescription: '',
  eventLocation: ''
});

// Attendance forms
const attendanceForms = ref([]);
const filteredForms = ref([]);
const searchQuery = ref('');
const statusFilter = ref('');

// Attendance responses
const attendanceResponses = ref([]);
const filteredResponses = ref([]);
const responseSearchQuery = ref('');
const responseFormFilter = ref('');
const responseSortField = ref('submittedAt');
const responseSortDirection = ref('desc');

// Modals
const showFormModal = ref(false);
const selectedForm = ref(null);
const showResponseModal = ref(false);
const selectedResponse = ref(null);
const showDeleteModal = ref(false);
const formToDelete = ref(null);

// Stats
const totalForms = computed(() => attendanceForms.value.length);
const totalAttendees = computed(() => {
  // Count unique attendees
  const uniqueAttendees = new Set();
  attendanceResponses.value.forEach(response => {
    uniqueAttendees.add(response.referenceCode);
  });
  return uniqueAttendees.size;
});
const activeFormsToday = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return attendanceForms.value.filter(form => {
    const attendanceDate = new Date(form.attendanceDate);
    attendanceDate.setHours(0, 0, 0, 0);
    return attendanceDate.getTime() === today.getTime();
  }).length;
});

// Show notification
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (dateString instanceof Timestamp) {
      date = dateString.toDate();
    } else if (dateString.seconds) {
      date = new Date(dateString.seconds * 1000);
    } else if (typeof dateString === 'string') {
      date = new Date(dateString);
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

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (dateString instanceof Timestamp) {
      date = dateString.toDate();
    } else if (dateString.seconds) {
      date = new Date(dateString.seconds * 1000);
    } else if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
};

// Truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
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
    
    // Check if user is a barangay president
    const barangayPresidentRef = doc(db, 'barangay_presidents', user.uid);
    const barangayPresidentSnap = await getDoc(barangayPresidentRef);
    
    if (barangayPresidentSnap.exists()) {
      const data = barangayPresidentSnap.data();
      console.log("Barangay president data:", data);
      
      // Try different possible field names for barangay
      const possibleBarangayFields = ['barangay', 'Barangay', 'BARANGAY', 'brgy', 'Brgy'];
      let foundBarangay = '';
      
      for (const field of possibleBarangayFields) {
        if (data[field]) {
          foundBarangay = data[field];
          console.log(`Found barangay in field '${field}': ${foundBarangay}`);
          break;
        }
      }
      
      // Normalize barangay name (trim whitespace)
      currentBarangay.value = foundBarangay.trim();
      console.log("Normalized barangay:", currentBarangay.value);
    } else {
      console.error("User is not a barangay president");
      showNotification('You do not have permission to access this page.', 'error');
    }
  } catch (error) {
    console.error('Error initializing user data:', error);
    showNotification('Failed to load user data: ' + error.message, 'error');
  }
};

// Reset form
const resetForm = () => {
  formData.value = {
    eventName: '',
    eventDate: '',
    attendanceDate: '',
    eventDescription: '',
    eventLocation: ''
  };
};

// Submit attendance form
const submitAttendanceForm = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    showNotification('You must be logged in as a barangay president to create forms.', 'error');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Create the attendance_forms collection if it doesn't exist
    const attendanceFormsCollection = collection(db, 'attendance_forms');
    
    // Add the document to the attendance_forms collection
    const docRef = await addDoc(attendanceFormsCollection, {
      eventName: formData.value.eventName,
      eventDate: formData.value.eventDate,
      attendanceDate: formData.value.attendanceDate,
      eventDescription: formData.value.eventDescription,
      eventLocation: formData.value.eventLocation,
      barangay: currentBarangay.value,
      createdBy: currentUser.value.uid,
      createdAt: serverTimestamp()
    });
    
    console.log("Form created successfully with ID:", docRef.id);
    showNotification('Attendance form created successfully', 'success');
    resetForm();
    
    // Switch to manage tab and refresh
    activeTab.value = 'manage';
    await loadAttendanceForms();
  } catch (error) {
    console.error('Error creating attendance form:', error);
    showNotification('Failed to create attendance form: ' + error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Load attendance forms
const loadAttendanceForms = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    const attendanceFormsCollection = collection(db, 'attendance_forms');
    const q = query(
      attendanceFormsCollection,
      where('barangay', '==', currentBarangay.value),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const forms = [];
    
    querySnapshot.forEach(doc => {
      forms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    attendanceForms.value = forms;
    filterForms();
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading attendance forms:', error);
    showNotification('Failed to load attendance forms: ' + error.message, 'error');
    isLoading.value = false;
  }
};

// Load attendance responses
const loadAttendanceResponses = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    return;
  }
  
  isLoadingResponses.value = true;
  
  try {
    // First, get all form IDs for this barangay
    const formIds = attendanceForms.value.map(form => form.id);
    
    if (formIds.length === 0) {
      attendanceResponses.value = [];
      filteredResponses.value = [];
      isLoadingResponses.value = false;
      return;
    }
    
    const attendanceCollection = collection(db, 'Attendance');
    const q = query(
      attendanceCollection,
      where('formId', 'in', formIds),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const responses = [];
    
    querySnapshot.forEach(doc => {
      responses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    attendanceResponses.value = responses;
    filterResponses();
    
    isLoadingResponses.value = false;
  } catch (error) {
    console.error('Error loading attendance responses:', error);
    showNotification('Failed to load attendance responses: ' + error.message, 'error');
    isLoadingResponses.value = false;
  }
};

// Filter forms
const filterForms = () => {
  const search = searchQuery.value.toLowerCase();
  
  filteredForms.value = attendanceForms.value.filter(form => {
    const matchesSearch = 
      form.eventName.toLowerCase().includes(search) ||
      (form.eventDescription && form.eventDescription.toLowerCase().includes(search)) ||
      (form.eventLocation && form.eventLocation.toLowerCase().includes(search));
    
    const matchesStatus = !statusFilter.value || getFormStatus(form) === statusFilter.value;
    
    return matchesSearch && matchesStatus;
  });
};

// Filter responses
const filterResponses = () => {
  const search = responseSearchQuery.value.toLowerCase();
  
  filteredResponses.value = attendanceResponses.value.filter(response => {
    const matchesSearch = 
      response.memberName.toLowerCase().includes(search) ||
      response.referenceCode.toLowerCase().includes(search) ||
      (response.comments && response.comments.toLowerCase().includes(search));
    
    const matchesForm = !responseFormFilter.value || response.formId === responseFormFilter.value;
    
    return matchesSearch && matchesForm;
  });
  
  sortResponses(responseSortField.value);
};

// Sort responses
const sortResponses = (field) => {
  if (responseSortField.value === field) {
    responseSortDirection.value = responseSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    responseSortField.value = field;
    responseSortDirection.value = 'desc';
  }
  
  filteredResponses.value.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle date fields
    if (field === 'submittedAt') {
      if (valueA instanceof Timestamp) valueA = valueA.toDate();
      if (valueB instanceof Timestamp) valueB = valueB.toDate();
      if (valueA.seconds) valueA = new Date(valueA.seconds * 1000);
      if (valueB.seconds) valueB = new Date(valueB.seconds * 1000);
      if (typeof valueA === 'string') valueA = new Date(valueA);
      if (typeof valueB === 'string') valueB = new Date(valueB);
    }
    
    // Handle form ID (convert to event name)
    if (field === 'formId') {
      valueA = getEventName(valueA);
      valueB = getEventName(valueB);
    }
    
    if (responseSortDirection.value === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Get form status
const getFormStatus = (form) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const attendanceDate = new Date(form.attendanceDate);
  attendanceDate.setHours(0, 0, 0, 0);
  
  if (attendanceDate.getTime() === today.getTime()) {
    return 'active';
  } else if (attendanceDate.getTime() > today.getTime()) {
    return 'upcoming';
  } else {
    return 'closed';
  }
};

// Get form status text
const getFormStatusText = (form) => {
  const status = getFormStatus(form);
  
  if (status === 'active') {
    return 'Active Today';
  } else if (status === 'upcoming') {
    return 'Upcoming';
  } else {
    return 'Closed';
  }
};

// Get response count for a form
const getResponseCount = (formId) => {
  return attendanceResponses.value.filter(response => response.formId === formId).length;
};

// Get event name from form ID
const getEventName = (formId) => {
  const form = attendanceForms.value.find(form => form.id === formId);
  return form ? form.eventName : 'Unknown Event';
};

// View form details
const viewFormDetails = (form) => {
  selectedForm.value = form;
  showFormModal.value = true;
};

// View response details
const viewResponseDetails = (response) => {
  selectedResponse.value = response;
  showResponseModal.value = true;
};

// Delete form
const deleteForm = (form) => {
  formToDelete.value = form;
  showDeleteModal.value = true;
};

// Confirm delete
const confirmDelete = async () => {
  if (!formToDelete.value) {
    return;
  }
  
  try {
    const formRef = doc(db, 'attendance_forms', formToDelete.value.id);
    await deleteDoc(formRef);
    
    showNotification('Attendance form deleted successfully', 'success');
    
    // Remove from local array
    const index = attendanceForms.value.findIndex(form => form.id === formToDelete.value.id);
    if (index !== -1) {
      attendanceForms.value.splice(index, 1);
    }
    
    // Re-filter
    filterForms();
    
    // Close modal
    showDeleteModal.value = false;
    formToDelete.value = null;
  } catch (error) {
    console.error('Error deleting attendance form:', error);
    showNotification('Failed to delete attendance form: ' + error.message, 'error');
  }
};

// Initialize
onMounted(async () => {
  console.log("Component mounted");
  try {
    await initializeUserData();
    await loadAttendanceForms();
  } catch (error) {
    console.error('Error initializing attendance system:', error);
    showNotification('Failed to initialize. Please refresh the page.', 'error');
  }
});
</script>

<style scoped>
/* Base Styles */
.attendance-system {
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

/* Section Titles */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

/* Form Styles */
.attendance-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
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

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  background-color: white;
}

.form-input:focus, .form-textarea:focus {
  border-color: #2c3e50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-help {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn, .cancel-btn, .action-btn {
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

.action-btn {
  background-color: #2c3e50;
  color: white;
  align-self: center;
}

.action-btn:hover {
  background-color: #1a2530;
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
  color: #666;
  text-align: center;
}

.empty-state svg {
  color: #95a5a6;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

/* Forms Grid */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.form-card-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.active {
  background-color: #10B981;
}

.status-indicator.upcoming {
  background-color: #3B82F6;
}

.status-indicator.closed {
  background-color: #6B7280;
}

.form-card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-card-content {
  padding: 1rem;
  flex: 1;
}

.form-card-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.form-card-detail svg {
  color: #6B7280;
}

.form-card-description {
  margin: 0.75rem 0 0 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.form-card-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.view-btn, .delete-btn {
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

.delete-btn {
  background-color: #f8d7da;
  color: #721c24;
}

.delete-btn:hover {
  background-color: #f5c6cb;
}

.delete-btn-large {
  padding: 0.75rem 1.5rem;
  background-color: #f8d7da;
  color: #721c24;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.delete-btn-large:hover {
  background-color: #f5c6cb;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.upcoming {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.closed {
  background-color: #f3f4f6;
  color: #374151;
}

/* Resource Table */
.resource-table-container {
  overflow-x: auto;
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
}

.resource-table th, .resource-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.resource-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  cursor: pointer;
}

.resource-table th:hover {
  background-color: #e9ecef;
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 0.75rem;
}

.resource-table tbody tr:hover {
  background-color: #f8f9fa;
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

.modal-content.modal-sm {
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

.warning-text {
  color: #721c24;
  font-size: 0.875rem;
}

/* QR Code Section */
.qr-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.qr-placeholder {
  background-color: #f8f9fa;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-top: 1rem;
}

.qr-help {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.5rem;
}

/* Response Summary */
.response-summary {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.response-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  min-width: 150px;
}

.response-count .count {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.response-count .label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .forms-grid {
    grid-template-columns: 1fr;
  }
}
</style>