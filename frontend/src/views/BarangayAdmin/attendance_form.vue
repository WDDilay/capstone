<template>
  <div class="attendance-system">
    <div class="main-content">
        
      <div v-if="notification.show" :class="`notification ${notification.type}`">
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">&times;</button>
      </div>
      
      <h1 class="page-title">Attendance Form Creator</h1>
      
       
      <div class="stat-cards">
    <div class="stat-card" style="background-color: #8dddfff2;">
      <div class="stat-icon" style="background-color: #1E40AF">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-value text-black">{{ totalForms }}</h3>
        <p class="stat-label text-black-150">Total Forms</p>
      </div>
    </div>
    
    <div class="stat-card" style="background-color: #9bf6b8ff;">
      <div class="stat-icon" style="background-color: #00a832ff">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-value text-white">{{ totalConfirmations }}</h3>
        <p class="stat-label text-black-150">Event Confirmations</p>
      </div>
    </div>
    
    <div class="stat-card" style="background-color: #ffcf9eff;">
      <div class="stat-icon" style="background-color: #f37e00ff">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-value text-white">{{ totalAttendance }}</h3>
        <p class="stat-label text-blue-100">Attendance Responses</p>
      </div>
    </div>
    
    <div class="stat-card" style="background-color: #dba9ffff;">
      <div class="stat-icon" style="background-color: #55039dff">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <div class="stat-content">
        <h3 class="stat-value text-white">{{ activeFormsToday }}</h3>
        <p class="stat-label text-blue-100">Active Today</p>
      </div>
    </div>
  </div>
      
        
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'create' }]"
          @click="activeTab = 'create'"
        >
          <span class="tab-text">Create Form</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'manage' }]"
          @click="activeTab = 'manage'; loadAttendanceForms()"
        >
          <span class="tab-text">Manage Forms</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'confirmations' }]"
          @click="activeTab = 'confirmations'; loadEventConfirmations()"
        >
          <span class="tab-text">Event Confirmations</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'attendance' }]"
          @click="activeTab = 'attendance'; loadAttendanceResponses()"
        >
          <span class="tab-text">Attendance Responses</span>
        </button>
      </div>
      
       
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
              <label for="eventTime">Event Start Time <span class="required">*</span></label>
              <input 
                id="eventTime"
                v-model="formData.eventTime" 
                type="time" 
                required
                class="form-input"
              >
              <p class="form-help">Attendance form will become available at this time</p>
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
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
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
                <span>Event Time: {{ form.eventTime }}</span>
              </div>
              <div class="form-card-detail" v-if="form.eventLocation">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Location: {{ form.eventLocation }}</span>
              </div>
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>Confirmations: {{ getConfirmationCount(form.id) }}</span>
              </div>
              <div class="form-card-detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Attendance: {{ getAttendanceCount(form.id) }}</span>
              </div>
              <p v-if="form.eventDescription" class="form-card-description">
                {{ truncateText(form.eventDescription, 100) }}
              </p>
            </div>
            <div class="form-card-footer">
              <button @click="viewFormDetails(form)" class="view-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span class="btn-text">View Details</span>
              </button>
              <button @click="deleteForm(form)" class="delete-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span class="btn-text">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      
      <div v-if="activeTab === 'confirmations'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="confirmationSearchQuery"
              type="text"
              placeholder="Search confirmations..."
              @input="filterConfirmations"
            >
          </div>
          <div class="filter-box">
            <select v-model="confirmationFormFilter" @change="filterConfirmations">
              <option value="">All Events</option>
              <option v-for="form in attendanceForms" :key="form.id" :value="form.id">
                {{ form.eventName }}
              </option>
            </select>
          </div>
          <div class="filter-box">
            <select v-model="confirmationStatusFilter" @change="filterConfirmations">
              <option value="">All Responses</option>
              <option value="yes">Will Attend</option>
              <option value="no">Won't Attend</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoadingConfirmations" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading event confirmations...</p>
        </div>
        
        <div v-else-if="filteredConfirmations.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h3>No event confirmations found</h3>
          <p>No members have confirmed attendance for upcoming events yet</p>
        </div>
        
        <div v-else class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortConfirmations('submittedAt')">
                  <span class="th-content">
                    <span class="th-text">Date Submitted</span>
                    <span v-if="confirmationSortField === 'submittedAt'" class="sort-icon">
                      {{ confirmationSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortConfirmations('memberName')">
                  <span class="th-content">
                    <span class="th-text">Member Name</span>
                    <span v-if="confirmationSortField === 'memberName'" class="sort-icon">
                      {{ confirmationSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortConfirmations('barangay')" class="hidden-mobile">
                  <span class="th-content">
                    <span class="th-text">Barangay</span>
                    <span v-if="confirmationSortField === 'barangay'" class="sort-icon">
                      {{ confirmationSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortConfirmations('formId')" class="hidden-mobile">
                  <span class="th-content">
                    <span class="th-text">Event</span>
                    <span v-if="confirmationSortField === 'formId'" class="sort-icon">
                      {{ confirmationSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortConfirmations('willAttend')">
                  <span class="th-content">
                    <span class="th-text">Response</span>
                    <span v-if="confirmationSortField === 'willAttend'" class="sort-icon">
                      {{ confirmationSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th class="hidden-mobile">Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="confirmation in filteredConfirmations" :key="confirmation.id">
                <td>
                  <div class="mobile-label">Date:</div>
                  {{ formatDateTime(confirmation.submittedAt) }}
                </td>
                <td>
                  <div class="mobile-label">Member:</div>
                  {{ confirmation.memberName }}
                  <div class="mobile-info visible-mobile">
                    <div class="mobile-detail">{{ confirmation.barangay }}</div>
                    <div class="mobile-detail">{{ getEventName(confirmation.formId) }}</div>
                    <div class="mobile-detail" v-if="confirmation.comments">{{ confirmation.comments }}</div>
                  </div>
                </td>
                <td class="hidden-mobile">{{ confirmation.barangay }}</td>
                <td class="hidden-mobile">{{ getEventName(confirmation.formId) }}</td>
                <td>
                  <div class="mobile-label">Response:</div>
                  <span :class="['confirmation-badge', confirmation.willAttend ? 'yes' : 'no']">
                    {{ confirmation.willAttend ? 'Will Attend' : 'Won\'t Attend' }}
                  </span>
                </td>
                <td class="hidden-mobile">{{ confirmation.comments || 'No comments' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      
      <div v-if="activeTab === 'attendance'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="attendanceSearchQuery"
              type="text"
              placeholder="Search attendance..."
              @input="filterAttendanceResponses"
            >
          </div>
          <div class="filter-box">
            <select v-model="attendanceFormFilter" @change="filterAttendanceResponses">
              <option value="">All Events</option>
              <option v-for="form in attendanceForms" :key="form.id" :value="form.id">
                {{ form.eventName }}
              </option>
            </select>
          </div>
          <div class="filter-box">
            <select v-model="attendanceStatusFilter" @change="filterAttendanceResponses">
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoadingAttendance" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading attendance responses...</p>
        </div>
        
        <div v-else-if="filteredAttendanceResponses.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <h3>No attendance responses found</h3>
          <p>No members have submitted attendance yet</p>
        </div>
        
        <div v-else class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortAttendanceResponses('submittedAt')">
                  <span class="th-content">
                    <span class="th-text">Date Submitted</span>
                    <span v-if="attendanceSortField === 'submittedAt'" class="sort-icon">
                      {{ attendanceSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortAttendanceResponses('memberName')">
                  <span class="th-content">
                    <span class="th-text">Member Name</span>
                    <span v-if="attendanceSortField === 'memberName'" class="sort-icon">
                      {{ attendanceSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortAttendanceResponses('barangay')" class="hidden-mobile">
                  <span class="th-content">
                    <span class="th-text">Barangay</span>
                    <span v-if="attendanceSortField === 'barangay'" class="sort-icon">
                      {{ attendanceSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortAttendanceResponses('formId')" class="hidden-mobile">
                  <span class="th-content">
                    <span class="th-text">Event</span>
                    <span v-if="attendanceSortField === 'formId'" class="sort-icon">
                      {{ attendanceSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th @click="sortAttendanceResponses('status')">
                  <span class="th-content">
                    <span class="th-text">Status</span>
                    <span v-if="attendanceSortField === 'status'" class="sort-icon">
                      {{ attendanceSortDirection === 'asc' ? '▲' : '▼' }}
                    </span>
                  </span>
                </th>
                <th class="hidden-mobile">Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="attendance in filteredAttendanceResponses" :key="attendance.id">
                <td>
                  <div class="mobile-label">Date:</div>
                  {{ formatDateTime(attendance.submittedAt) }}
                </td>
                <td>
                  <div class="mobile-label">Member:</div>
                  {{ attendance.memberName }}
                  <div class="mobile-info visible-mobile">
                    <div class="mobile-detail">{{ attendance.barangay }}</div>
                    <div class="mobile-detail">{{ getEventName(attendance.formId) }}</div>
                    <div class="mobile-detail" v-if="attendance.comments">{{ attendance.comments }}</div>
                  </div>
                </td>
                <td class="hidden-mobile">{{ attendance.barangay }}</td>
                <td class="hidden-mobile">{{ getEventName(attendance.formId) }}</td>
                <td>
                  <div class="mobile-label">Status:</div>
                  <span :class="['status-badge', attendance.status === 'present' ? 'present' : 'absent']">
                    {{ attendance.status === 'present' ? 'Present' : 'Absent' }}
                  </span>
                </td>
                <td class="hidden-mobile">{{ attendance.comments || 'No comments' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
       
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
                <h3>Event Time</h3>
                <p>{{ selectedForm.eventTime }}</p>
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
              <h3>Response Summary</h3>
              <div class="response-summary">
                <div class="response-count">
                  <span class="count">{{ getConfirmationCount(selectedForm.id) }}</span>
                  <span class="label">Event Confirmations</span>
                </div>
                <div class="response-count">
                  <span class="count">{{ getAttendanceCount(selectedForm.id) }}</span>
                  <span class="label">Attendance Responses</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showFormModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>
      
        
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
const isLoadingConfirmations = ref(false);
const isLoadingAttendance = ref(false);
const isSubmitting = ref(false);

// Notification
const notification = ref({ show: false, message: '', type: 'success' });

// Form data
const formData = ref({
  eventName: '',
  eventDate: '',
  eventTime: '',
  eventDescription: '',
  eventLocation: ''
});

// Attendance forms
const attendanceForms = ref([]);
const filteredForms = ref([]);
const searchQuery = ref('');
const statusFilter = ref('');

// Event confirmations
const eventConfirmations = ref([]);
const filteredConfirmations = ref([]);
const confirmationSearchQuery = ref('');
const confirmationFormFilter = ref('');
const confirmationStatusFilter = ref('');
const confirmationSortField = ref('submittedAt');
const confirmationSortDirection = ref('desc');

// Attendance responses
const attendanceResponses = ref([]);
const filteredAttendanceResponses = ref([]);
const attendanceSearchQuery = ref('');
const attendanceFormFilter = ref('');
const attendanceStatusFilter = ref('');
const attendanceSortField = ref('submittedAt');
const attendanceSortDirection = ref('desc');

// Modals
const showFormModal = ref(false);
const selectedForm = ref(null);
const showDeleteModal = ref(false);
const formToDelete = ref(null);

// Stats
const totalForms = computed(() => attendanceForms.value.length);
const totalConfirmations = computed(() => eventConfirmations.value.length);
const totalAttendance = computed(() => attendanceResponses.value.length);
const activeFormsToday = computed(() => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return attendanceForms.value.filter(form => {
    const eventDate = new Date(form.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() !== today.getTime()) return false;
    
    // Check if form is currently active (between event time and 10 PM)
    const [hours, minutes] = form.eventTime.split(':');
    const eventDateTime = new Date(form.eventDate);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDateTime = new Date(form.eventDate);
    endDateTime.setHours(22, 0, 0, 0); // 10 PM
    
    return now >= eventDateTime && now <= endDateTime;
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
    
    const barangayPresidentRef = doc(db, 'barangay_presidents', user.uid);
    const barangayPresidentSnap = await getDoc(barangayPresidentRef);
    
    if (barangayPresidentSnap.exists()) {
      const data = barangayPresidentSnap.data();
      console.log("Barangay president data:", data);
      
      const possibleBarangayFields = ['barangay', 'Barangay', 'BARANGAY', 'brgy', 'Brgy'];
      let foundBarangay = '';
      
      for (const field of possibleBarangayFields) {
        if (data[field]) {
          foundBarangay = data[field];
          console.log(`Found barangay in field '${field}': ${foundBarangay}`);
          break;
        }
      }
      
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
    eventTime: '',
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
    const attendanceFormsCollection = collection(db, 'attendance_forms');
    
    const docRef = await addDoc(attendanceFormsCollection, {
      eventName: formData.value.eventName,
      eventDate: formData.value.eventDate,
      eventTime: formData.value.eventTime,
      eventDescription: formData.value.eventDescription,
      eventLocation: formData.value.eventLocation,
      barangay: currentBarangay.value,
      createdBy: currentUser.value.uid,
      createdAt: serverTimestamp()
    });
    
    console.log("Form created successfully with ID:", docRef.id);
    showNotification('Attendance form created successfully', 'success');
    resetForm();
    
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

// Load event confirmations
const loadEventConfirmations = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    return;
  }
  
  isLoadingConfirmations.value = true;
  
  try {
    const formIds = attendanceForms.value.map(form => form.id);
    
    if (formIds.length === 0) {
      eventConfirmations.value = [];
      filteredConfirmations.value = [];
      isLoadingConfirmations.value = false;
      return;
    }
    
    const confirmationsCollection = collection(db, 'event_confirmations');
    const q = query(
      confirmationsCollection,
      where('formId', 'in', formIds),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const confirmations = [];
    
    querySnapshot.forEach(doc => {
      confirmations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    eventConfirmations.value = confirmations;
    filterConfirmations();
    
    isLoadingConfirmations.value = false;
  } catch (error) {
    console.error('Error loading event confirmations:', error);
    showNotification('Failed to load event confirmations: ' + error.message, 'error');
    isLoadingConfirmations.value = false;
  }
};

// Load attendance responses
const loadAttendanceResponses = async () => {
  if (!currentUser.value || !currentBarangay.value) {
    return;
  }
  
  isLoadingAttendance.value = true;
  
  try {
    const formIds = attendanceForms.value.map(form => form.id);
    
    if (formIds.length === 0) {
      attendanceResponses.value = [];
      filteredAttendanceResponses.value = [];
      isLoadingAttendance.value = false;
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
    filterAttendanceResponses();
    
    isLoadingAttendance.value = false;
  } catch (error) {
    console.error('Error loading attendance responses:', error);
    showNotification('Failed to load attendance responses: ' + error.message, 'error');
    isLoadingAttendance.value = false;
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

// Filter confirmations
const filterConfirmations = () => {
  const search = confirmationSearchQuery.value.toLowerCase();
  
  filteredConfirmations.value = eventConfirmations.value.filter(confirmation => {
    const matchesSearch = 
      confirmation.memberName.toLowerCase().includes(search) ||
      (confirmation.barangay && confirmation.barangay.toLowerCase().includes(search)) ||
      (confirmation.comments && confirmation.comments.toLowerCase().includes(search));
    
    const matchesForm = !confirmationFormFilter.value || confirmation.formId === confirmationFormFilter.value;
    
    const matchesStatus = !confirmationStatusFilter.value ||
      (confirmationStatusFilter.value === 'yes' && confirmation.willAttend) ||
      (confirmationStatusFilter.value === 'no' && !confirmation.willAttend);
    
    return matchesSearch && matchesForm && matchesStatus;
  });
  
  sortConfirmations(confirmationSortField.value);
};

// Filter attendance responses
const filterAttendanceResponses = () => {
  const search = attendanceSearchQuery.value.toLowerCase();
  
  filteredAttendanceResponses.value = attendanceResponses.value.filter(response => {
    const matchesSearch = 
      response.memberName.toLowerCase().includes(search) ||
      (response.barangay && response.barangay.toLowerCase().includes(search)) ||
      (response.comments && response.comments.toLowerCase().includes(search));
    
    const matchesForm = !attendanceFormFilter.value || response.formId === attendanceFormFilter.value;
    
    const matchesStatus = !attendanceStatusFilter.value || response.status === attendanceStatusFilter.value;
    
    return matchesSearch && matchesForm && matchesStatus;
  });
  
  sortAttendanceResponses(attendanceSortField.value);
};

// Sort confirmations
const sortConfirmations = (field) => {
  if (confirmationSortField.value === field) {
    confirmationSortDirection.value = confirmationSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    confirmationSortField.value = field;
    confirmationSortDirection.value = 'desc';
  }
  
  filteredConfirmations.value.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    if (field === 'submittedAt') {
      if (valueA instanceof Timestamp) valueA = valueA.toDate();
      if (valueB instanceof Timestamp) valueB = valueB.toDate();
      if (valueA.seconds) valueA = new Date(valueA.seconds * 1000);
      if (valueB.seconds) valueB = new Date(valueB.seconds * 1000);
      if (typeof valueA === 'string') valueA = new Date(valueA);
      if (typeof valueB === 'string') valueB = new Date(valueB);
    }
    
    if (field === 'formId') {
      valueA = getEventName(valueA);
      valueB = getEventName(valueB);
    }
    
    if (confirmationSortDirection.value === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Sort attendance responses
const sortAttendanceResponses = (field) => {
  if (attendanceSortField.value === field) {
    attendanceSortDirection.value = attendanceSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    attendanceSortField.value = field;
    attendanceSortDirection.value = 'desc';
  }
  
  filteredAttendanceResponses.value.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    if (field === 'submittedAt') {
      if (valueA instanceof Timestamp) valueA = valueA.toDate();
      if (valueB instanceof Timestamp) valueB = valueB.toDate();
      if (valueA.seconds) valueA = new Date(valueA.seconds * 1000);
      if (valueB.seconds) valueB = new Date(valueB.seconds * 1000);
      if (typeof valueA === 'string') valueA = new Date(valueA);
      if (typeof valueB === 'string') valueB = new Date(valueB);
    }
    
    if (field === 'formId') {
      valueA = getEventName(valueA);
      valueB = getEventName(valueB);
    }
    
    if (attendanceSortDirection.value === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Get form status
const getFormStatus = (form) => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const eventDate = new Date(form.eventDate);
  eventDate.setHours(0, 0, 0, 0);
  
  if (eventDate.getTime() > today.getTime()) {
    return 'upcoming';
  } else if (eventDate.getTime() === today.getTime()) {
    // Check if form is currently active (between event time and 10 PM)
    const [hours, minutes] = form.eventTime.split(':');
    const eventDateTime = new Date(form.eventDate);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDateTime = new Date(form.eventDate);
    endDateTime.setHours(22, 0, 0, 0); // 10 PM
    
    if (now >= eventDateTime && now <= endDateTime) {
      return 'active';
    } else if (now < eventDateTime) {
      return 'upcoming';
    } else {
      return 'closed';
    }
  } else {
    return 'closed';
  }
};

// Get form status text
const getFormStatusText = (form) => {
  const status = getFormStatus(form);
  
  if (status === 'active') {
    return 'Active Now';
  } else if (status === 'upcoming') {
    return 'Upcoming';
  } else {
    return 'Closed';
  }
};

// Get confirmation count for a form
const getConfirmationCount = (formId) => {
  return eventConfirmations.value.filter(confirmation => confirmation.formId === formId).length;
};

// Get attendance count for a form
const getAttendanceCount = (formId) => {
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
    
    const index = attendanceForms.value.findIndex(form => form.id === formToDelete.value.id);
    if (index !== -1) {
      attendanceForms.value.splice(index, 1);
    }
    
    filterForms();
    
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
  padding: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Stat Cards */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
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
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Notification */
.notification {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
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
  padding: 0;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tabs */
.tabs {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-btn:hover {
  color: #2c3e50;
  background-color: #f8fafc;
}

.tab-btn.active {
  color: #2c3e50;
  border-bottom-color: #2c3e50;
  background-color: white;
}

.tab-text {
  white-space: nowrap;
}

.tab-content {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
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
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #f44336;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  background-color: white;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.form-input:focus, .form-textarea:focus {
  border-color: #2c3e50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.submit-btn, .cancel-btn, .action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-height: 44px;
  font-size: 0.875rem;
}

.submit-btn {
  background-color: #2c3e50;
  color: white;
  flex: 1;
  min-width: 200px;
}

.submit-btn:hover {
  background-color: #1a2530;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background-color: #e9ecef;
  color: #495057;
  flex: 1;
  min-width: 120px;
}

.cancel-btn:hover {
  background-color: #dee2e6;
  transform: translateY(-2px);
}

.action-btn {
  background-color: #2c3e50;
  color: white;
  align-self: center;
}

.action-btn:hover {
  background-color: #1a2530;
  transform: translateY(-2px);
}

/* List Controls */
.list-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box, .filter-box {
  flex: 1;
  min-width: 200px;
}

.search-box input, .filter-box select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.3s ease;
}

.search-box input:focus, .filter-box select:focus {
  border-color: #2c3e50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
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
  padding: 3rem 1rem;
  color: #6b7280;
  text-align: center;
}

.empty-state svg {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #374151;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

/* Forms Grid */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.form-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0,0,0,0.05);
}

.form-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.form-card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.active {
  background-color: #10B981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.status-indicator.upcoming {
  background-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.status-indicator.closed {
  background-color: #6B7280;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2);
}

.form-card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
}

.form-card-content {
  padding: 1.25rem;
  flex: 1;
}

.form-card-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.form-card-detail svg {
  color: #9ca3af;
  flex-shrink: 0;
}

.form-card-description {
  margin: 1rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.form-card-footer {
  padding: 1.25rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.view-btn, .delete-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
  min-height: 36px;
}

.view-btn {
  background-color: #f1f5f9;
  color: #2c3e50;
}

.view-btn:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.delete-btn {
  background-color: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background-color: #fee2e2;
  transform: translateY(-1px);
}

.btn-text {
  white-space: nowrap;
}

.delete-btn-large {
  padding: 0.75rem 1.5rem;
  background-color: #fef2f2;
  color: #dc2626;
  border: 2px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-height: 44px;
}

.delete-btn-large:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
  transform: translateY(-2px);
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
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

.status-badge.present {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.absent {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Confirmation Badge */
.confirmation-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.confirmation-badge.yes {
  background-color: #d1fae5;
  color: #065f46;
}

.confirmation-badge.no {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Resource Table */
.resource-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.resource-table th, .resource-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.resource-table th {
  background-color: #f9fafb;
  font-weight: 600;
  cursor: pointer;
  position: sticky;
  top: 0;
  z-index: 10;
}

.resource-table th:hover {
  background-color: #f3f4f6;
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.th-text {
  white-space: nowrap;
}

.sort-icon {
  font-size: 0.75rem;
  color: #6b7280;
}

.resource-table tbody tr:hover {
  background-color: #f9fafb;
}

.mobile-label {
  display: none;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.mobile-info {
  margin-top: 0.5rem;
}

.mobile-detail {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-content.modal-sm {
  max-width: 500px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-modal:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-item h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.detail-item p {
  margin: 0;
  font-weight: 500;
  color: #111827;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h3 {
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  color: #111827;
  font-weight: 600;
}

.detail-section p {
  margin: 0;
  white-space: pre-line;
  line-height: 1.6;
  color: #374151;
}

.warning-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Response Summary */
.response-summary {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.response-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 150px;
  border: 1px solid #e5e7eb;
}

.response-count .count {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.response-count .label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
  text-align: center;
  font-weight: 500;
}

/* Responsive Utilities */
.hidden-mobile {
  display: table-cell;
}

.visible-mobile {
  display: none;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .main-content {
    padding: 0.75rem;
  }

  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .stat-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    margin-right: 0.75rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .tabs {
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-height: 40px;
  }

  .tab-text {
    font-size: 0.8rem;
  }

  .tab-content {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  .form-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn, .cancel-btn {
    min-width: auto;
    width: 100%;
  }

  .list-controls {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .search-box, .filter-box {
    min-width: auto;
  }

  .forms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-card-header {
    padding: 1rem;
  }

  .form-card-content {
    padding: 1rem;
  }

  .form-card-footer {
    padding: 1rem;
    flex-direction: column;
  }

  .view-btn, .delete-btn {
    width: 100%;
  }

  .hidden-mobile {
    display: none;
  }

  .visible-mobile {
    display: block;
  }

  .mobile-label {
    display: block;
  }

  .resource-table th, .resource-table td {
    padding: 0.5rem;
  }

  .modal {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .response-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .response-count {
    min-width: auto;
    padding: 1rem;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .main-content {
    padding: 0.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .stat-cards {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    margin-right: 0.5rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .tab-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .tab-text {
    font-size: 0.75rem;
  }

  .tab-content {
    padding: 0.75rem;
  }

  .form-section {
    padding: 0.75rem;
  }

  .form-input, .form-textarea {
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  .submit-btn, .cancel-btn, .action-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .search-box input, .filter-box select {
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  .form-card-header, .form-card-content, .form-card-footer {
    padding: 0.75rem;
  }

  .form-card-title {
    font-size: 1rem;
  }

  .form-card-detail {
    font-size: 0.8rem;
  }

  .view-btn, .delete-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .resource-table th, .resource-table td {
    padding: 0.375rem;
    font-size: 0.875rem;
  }

  .modal-header h2 {
    font-size: 1.125rem;
  }

  .response-count .count {
    font-size: 1.5rem;
  }

  .response-count .label {
    font-size: 0.8rem;
  }
}

/* Landscape Mobile Styles */
@media (max-width: 768px) and (orientation: landscape) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .tabs {
    justify-content: center;
  }

  .response-summary {
    flex-direction: row;
    justify-content: center;
  }
}

/* High DPI Displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .stat-card, .form-card, .tab-content {
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  }

  .stat-card:hover, .form-card:hover {
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  }
}

/* Focus Styles for Accessibility */
.tab-btn:focus,
.form-input:focus,
.form-textarea:focus,
.search-box input:focus,
.filter-box select:focus,
.submit-btn:focus,
.cancel-btn:focus,
.action-btn:focus,
.view-btn:focus,
.delete-btn:focus,
.close-modal:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Smooth Transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Print Styles */
@media print {
  .tabs, .form-actions, .list-controls, .form-card-footer, .modal {
    display: none;
  }

  .main-content {
    max-width: none;
    padding: 0;
  }

  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .forms-grid {
    grid-template-columns: 1fr;
  }
}
</style>
