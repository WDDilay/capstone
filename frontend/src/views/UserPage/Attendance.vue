<template>
  <div class="attendance-system">
    <div class="main-content">
      <!-- Alert Messages -->
      <div v-if="notification.show" :class="`notification ${notification.type}`">
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">&times;</button>
      </div>

      <h1 class="page-title">Attendance System</h1>

      <!-- Stat Cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #3B82F6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ availableForms }}</h3>
            <p class="stat-label">Available Today</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #10B981">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ completedAttendance }}</h3>
            <p class="stat-label">Completed</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #F59E0B">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ upcomingEvents }}</h3>
            <p class="stat-label">Upcoming Events</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'today' }]" 
          @click="activeTab = 'today'"
        >
          Today's Attendance
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]" 
          @click="activeTab = 'history'; loadAttendanceHistory()"
        >
          My Attendance History
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'upcoming' }]" 
          @click="activeTab = 'upcoming'; loadUpcomingEvents()"
        >
          Upcoming Events
        </button>
      </div>

      <!-- Today's Attendance Tab -->
      <div v-if="activeTab === 'today'" class="tab-content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading attendance forms...</p>
        </div>

        <div v-else-if="todayForms.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h3>No attendance forms available today</h3>
          <p>There are no events requiring attendance today</p>

          <!-- Add this debug button -->
          <button @click="debugForms" class="debug-btn">Debug Forms</button>
        </div>

        <div v-else class="forms-grid">
          <div v-for="form in todayForms" :key="form.id" class="form-card">
            <div class="form-card-header">
              <div class="status-indicator active"></div>
              <h3 class="form-card-title">{{ form.eventName }}</h3>
            </div>
            <div class="form-card-content">
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Event Date: {{ formatDate(form.eventDate) }}</span>
              </div>
              <div class="form-card-detail" v-if="form.eventLocation">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Location: {{ form.eventLocation }}</span>
              </div>
              <p v-if="form.eventDescription" class="form-card-description">
                {{ truncateText(form.eventDescription, 100) }}
              </p>
              
              <div class="attendance-status" v-if="hasSubmittedAttendance(form.id)">
                <div class="status-badge submitted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  You Already Submitted
                </div>
              </div>
              <div v-else>
                <form @submit.prevent="submitAttendance(form)" class="attendance-form">
                  <div class="form-group">
                    <label for="memberName">Your Name <span class="required">*</span></label>
                    <input 
                      id="memberName"
                      v-model="attendanceData.memberName" 
                      type="text" 
                      required
                      placeholder="Enter your full name"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label for="comments">Comments (Optional)</label>
                    <textarea 
                      id="comments"
                      v-model="attendanceData.comments" 
                      placeholder="Any comments about the event"
                      rows="2"
                      class="form-textarea"
                    ></textarea>
                  </div>
                  
                  <button type="submit" class="submit-btn" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Submitting...' : 'Submit Attendance' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance History Tab -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div v-if="isLoadingHistory" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading attendance history...</p>
        </div>

        <div v-else-if="attendanceHistory.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <h3>No attendance history</h3>
          <p>You haven't submitted any attendance yet</p>
        </div>

        <div v-else class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortHistory('submittedAt')">
                  Date Submitted
                  <span v-if="historySortField === 'submittedAt'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortHistory('eventName')">
                  Event
                  <span v-if="historySortField === 'eventName'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortHistory('eventDate')">
                  Event Date
                  <span v-if="historySortField === 'eventDate'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in attendanceHistory" :key="record.id">
                <td>{{ formatDateTime(record.submittedAt) }}</td>
                <td>{{ record.eventName }}</td>
                <td>{{ formatDate(record.eventDate) }}</td>
                <td>
                  <button @click="viewAttendanceDetails(record)" class="view-btn" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Upcoming Events Tab -->
      <div v-if="activeTab === 'upcoming'" class="tab-content">
        <div v-if="isLoadingUpcoming" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading upcoming events...</p>
        </div>

        <div v-else-if="upcomingEventsList.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h3>No upcoming events</h3>
          <p>There are no upcoming events scheduled</p>
        </div>

        <div v-else class="forms-grid">
          <div v-for="event in upcomingEventsList" :key="event.id" class="form-card">
            <div class="form-card-header">
              <div class="status-indicator upcoming"></div>
              <h3 class="form-card-title">{{ event.eventName }}</h3>
            </div>
            <div class="form-card-content">
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Event Date: {{ formatDate(event.eventDate) }}</span>
              </div>
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Attendance Date: {{ formatDate(event.attendanceDate) }}</span>
              </div>
              <div class="form-card-detail" v-if="event.eventLocation">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Location: {{ event.eventLocation }}</span>
              </div>
              <p v-if="event.eventDescription" class="form-card-description">
                {{ truncateText(event.eventDescription, 100) }}
              </p>
            </div>
            <div class="form-card-footer">
              <button @click="viewEventDetails(event)" class="view-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Details Modal -->
      <div v-if="showEventModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Event Details</h2>
            <button @click="showEventModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedEvent">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Event Name</h3>
                <p>{{ selectedEvent.eventName }}</p>
              </div>
              <div class="detail-item">
                <h3>Event Date</h3>
                <p>{{ formatDate(selectedEvent.eventDate) }}</p>
              </div>
              <div class="detail-item">
                <h3>Attendance Date</h3>
                <p>{{ formatDate(selectedEvent.attendanceDate) }}</p>
              </div>
              <div class="detail-item" v-if="selectedEvent.eventLocation">
                <h3>Location</h3>
                <p>{{ selectedEvent.eventLocation }}</p>
              </div>
            </div>

            <div class="detail-section" v-if="selectedEvent.eventDescription">
              <h3>Description</h3>
              <p>{{ selectedEvent.eventDescription }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showEventModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Attendance Details Modal -->
      <div v-if="showAttendanceModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Attendance Details</h2>
            <button @click="showAttendanceModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedAttendance">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Event</h3>
                <p>{{ selectedAttendance.eventName }}</p>
              </div>
              <div class="detail-item">
                <h3>Event Date</h3>
                <p>{{ formatDate(selectedAttendance.eventDate) }}</p>
              </div>
              <div class="detail-item">
                <h3>Submitted At</h3>
                <p>{{ formatDateTime(selectedAttendance.submittedAt) }}</p>
              </div>
              <div class="detail-item">
                <h3>Member Name</h3>
                <p>{{ selectedAttendance.memberName }}</p>
              </div>
            </div>

            <div class="detail-section" v-if="selectedAttendance.comments">
              <h3>Comments</h3>
              <p>{{ selectedAttendance.comments }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showAttendanceModal = false" class="close-btn">Close</button>
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
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/services/firebase';

// Current user and barangay
const currentUser = ref(null);
const currentBarangay = ref('');
const userReferenceCode = ref('');

// Active tab
const activeTab = ref('today');

// Loading states
const isLoading = ref(true);
const isLoadingHistory = ref(false);
const isLoadingUpcoming = ref(false);
const isSubmitting = ref(false);

// Notification
const notification = ref({ show: false, message: '', type: 'success' });

// Today's forms
const todayForms = ref([]);

// Attendance data
const attendanceData = ref({
  memberName: '',
  comments: ''
});

// Attendance history
const attendanceHistory = ref([]);
const historySortField = ref('submittedAt');
const historySortDirection = ref('desc');

// Upcoming events
const upcomingEventsList = ref([]);

// Modals
const showEventModal = ref(false);
const selectedEvent = ref(null);
const showAttendanceModal = ref(false);
const selectedAttendance = ref(null);

// Stats
const availableForms = computed(() => todayForms.value.length);
const completedAttendance = computed(() => {
  return attendanceHistory.value.filter(record => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const submittedDate = new Date(record.submittedAt.seconds * 1000);
    submittedDate.setHours(0, 0, 0, 0);
    
    return submittedDate.getTime() === today.getTime();
  }).length;
});
const upcomingEvents = computed(() => upcomingEventsList.value.length);

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

// Debug function to check all forms
const debugForms = async () => {
  try {
    showNotification('Checking all attendance forms...', 'info');
    
    const attendanceFormsCollection = collection(db, 'attendance_forms');
    const querySnapshot = await getDocs(attendanceFormsCollection);
    
    console.log(`Total forms in database: ${querySnapshot.size}`);
    console.log(`Current user barangay: ${currentBarangay.value}`);
    
    const formsData = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      formsData.push({
        id: doc.id,
        barangay: data.barangay,
        eventName: data.eventName,
        attendanceDate: data.attendanceDate,
        createdBy: data.createdBy
      });
      
      console.log(`Form: ${doc.id}`);
      console.log(`- Barangay: "${data.barangay}"`);
      console.log(`- Event: ${data.eventName}`);
      console.log(`- Attendance Date: ${data.attendanceDate}`);
      console.log(`- Created By: ${data.createdBy}`);
    });
    
    // Check if any forms match the user's barangay
    const matchingForms = formsData.filter(form => 
      form.barangay && form.barangay.trim().toLowerCase() === currentBarangay.value.toLowerCase()
    );
    
    console.log(`Forms matching user's barangay: ${matchingForms.length}`);
    console.log('Matching forms:', matchingForms);
    
    if (matchingForms.length > 0) {
      showNotification(`Found ${matchingForms.length} forms for your barangay, but none for today.`, 'info');
    } else {
      showNotification('No forms found for your barangay.', 'info');
    }
  } catch (error) {
    console.error('Error debugging forms:', error);
    showNotification('Error checking forms: ' + error.message, 'error');
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
    
    // Get user data to determine barangay
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log("User data:", userData);
      
      // Try different possible field names for barangay
      const possibleBarangayFields = ['barangay', 'Barangay', 'BARANGAY', 'brgy', 'Brgy'];
      let foundBarangay = '';
      
      for (const field of possibleBarangayFields) {
        if (userData[field]) {
          foundBarangay = userData[field];
          console.log(`Found barangay in field '${field}': ${foundBarangay}`);
          break;
        }
      }
      
      // Normalize barangay name (trim whitespace and convert to consistent case)
      currentBarangay.value = foundBarangay.trim();
      console.log("Normalized barangay:", currentBarangay.value);
      
      userReferenceCode.value = userData.referenceCode || userData.reference_code || userData.reference || userData.id || user.uid;
      
      // Pre-fill name if available
      attendanceData.value.memberName = userData.fullName || userData.name || userData.displayName || '';
      
      console.log("User reference code:", userReferenceCode.value);
    } else {
      console.error("User document not found");
      showNotification('Your user profile could not be found.', 'error');
    }
  } catch (error) {
    console.error('Error initializing user data:', error);
    showNotification('Failed to load user data: ' + error.message, 'error');
  }
};

// Load today's attendance forms
const loadTodayForms = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    console.log("Fetching attendance forms for date:", todayStr);
    console.log("Fetching for barangay:", currentBarangay.value);
    
    // First, let's check what attendance forms exist for today
    const attendanceFormsCollection = collection(db, 'attendance_forms');
    const allFormsQuery = query(
      attendanceFormsCollection,
      where('attendanceDate', '==', todayStr)
    );
    
    const allFormsSnapshot = await getDocs(allFormsQuery);
    console.log(`Found ${allFormsSnapshot.size} total forms for today`);
    
    // Log all forms to see their barangay values
    allFormsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Form ID: ${doc.id}, Barangay: ${data.barangay}, Event: ${data.eventName}`);
    });
    
    // Now try to fetch forms for the specific barangay
    const q = query(
      attendanceFormsCollection,
      where('attendanceDate', '==', todayStr)
    );
    
    const querySnapshot = await getDocs(q);
    const forms = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      
      // Compare barangay case-insensitively
      if (data.barangay && 
          data.barangay.trim().toLowerCase() === currentBarangay.value.toLowerCase()) {
        console.log(`Matched form: ${doc.id}, Event: ${data.eventName}`);
        forms.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    console.log(`Found ${forms.length} matching forms for user's barangay`);
    todayForms.value = forms;
    
    // Load attendance history to check if already submitted
    await loadAttendanceHistory();
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading today\'s attendance forms:', error);
    showNotification('Failed to load attendance forms: ' + error.message, 'error');
    isLoading.value = false;
  }
};

// Load attendance history
const loadAttendanceHistory = async () => {
  if (!currentUser.value) {
    return;
  }
  
  isLoadingHistory.value = true;
  
  try {
    const attendanceCollection = collection(db, 'Attendance');
    const q = query(
      attendanceCollection,
      where('userId', '==', currentUser.value.uid),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    attendanceHistory.value = history;
    
    isLoadingHistory.value = false;
  } catch (error) {
    console.error('Error loading attendance history:', error);
    showNotification('Failed to load attendance history: ' + error.message, 'error');
    isLoadingHistory.value = false;
  }
};

// Load upcoming events
const loadUpcomingEvents = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    return;
  }
  
  isLoadingUpcoming.value = true;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const attendanceFormsCollection = collection(db, 'attendance_forms');
    // Only filter by attendance date, then filter by barangay client-side
    const q = query(
      attendanceFormsCollection,
      where('attendanceDate', '>', todayStr)
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      
      // Compare barangay case-insensitively
      if (data.barangay && 
          data.barangay.trim().toLowerCase() === currentBarangay.value.toLowerCase()) {
        events.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Sort by attendance date
    events.sort((a, b) => {
      const dateA = new Date(a.attendanceDate);
      const dateB = new Date(b.attendanceDate);
      return dateA - dateB;
    });
    
    upcomingEventsList.value = events;
    
    isLoadingUpcoming.value = false;
  } catch (error) {
    console.error('Error loading upcoming events:', error);
    showNotification('Failed to load upcoming events: ' + error.message, 'error');
    isLoadingUpcoming.value = false;
  }
};

// Check if already submitted attendance for a form
const hasSubmittedAttendance = (formId) => {
  return attendanceHistory.value.some(record => record.formId === formId);
};

// Submit attendance
const submitAttendance = async (form) => {
  if (!currentUser.value || !userReferenceCode.value) {
    showNotification('You must be logged in to submit attendance.', 'error');
    return;
  }
  
  if (hasSubmittedAttendance(form.id)) {
    showNotification('You have already submitted attendance for this event.', 'info');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Get the form details
    const formDetails = {
      eventName: form.eventName,
      eventDate: form.eventDate,
      eventLocation: form.eventLocation || ''
    };
    
    // Create attendance record
    const attendanceCollection = collection(db, 'Attendance');
    await addDoc(attendanceCollection, {
      formId: form.id,
      userId: currentUser.value.uid,
      memberName: attendanceData.value.memberName,
      referenceCode: userReferenceCode.value,
      barangay: currentBarangay.value,
      comments: attendanceData.value.comments,
      submittedAt: serverTimestamp(),
      ...formDetails
    });
    
    showNotification('Attendance submitted successfully', 'success');
    
    // Reset form
    attendanceData.value.comments = '';
    
    // Refresh attendance history
    await loadAttendanceHistory();
  } catch (error) {
    console.error('Error submitting attendance:', error);
    showNotification('Failed to submit attendance: ' + error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Sort history
const sortHistory = (field) => {
  if (historySortField.value === field) {
    historySortDirection.value = historySortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    historySortField.value = field;
    historySortDirection.value = 'desc';
  }
  
  attendanceHistory.value.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle date fields
    if (field === 'submittedAt' || field === 'eventDate') {
      if (valueA instanceof Timestamp) valueA = valueA.toDate();
      if (valueB instanceof Timestamp) valueB = valueB.toDate();
      if (valueA.seconds) valueA = new Date(valueA.seconds * 1000);
      if (valueB.seconds) valueB = new Date(valueB.seconds * 1000);
      if (typeof valueA === 'string') valueA = new Date(valueA);
      if (typeof valueB === 'string') valueB = new Date(valueB);
    }
    
    if (historySortDirection.value === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// View event details
const viewEventDetails = (event) => {
  selectedEvent.value = event;
  showEventModal.value = true;
};

// View attendance details
const viewAttendanceDetails = (attendance) => {
  selectedAttendance.value = attendance;
  showAttendanceModal.value = true;
};

// Initialize
onMounted(async () => {
  console.log("Component mounted");
  try {
    await initializeUserData();
    await loadTodayForms();
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
  margin: 0;
}

/* Debug Button */
.debug-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #6B7280;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.debug-btn:hover {
  background-color: #4B5563;
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
  margin: 0.75rem 0 1rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.form-card-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

/* Attendance Status */
.attendance-status {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.submitted {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.closed {
  background-color: #f3f4f6;
  color: #374151;
}

/* Attendance Form */
.attendance-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
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
  min-height: 80px;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.submit-btn:hover {
  background-color: #1a2530;
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* View Button */
.view-btn {
  padding: 0.5rem 0.75rem;
  background-color: #e9ecef;
  color: #2c3e50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-btn:hover {
  background-color: #dee2e6;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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

/* Responsive Adjustments */
@media (max-width: 768px) {
  .forms-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>