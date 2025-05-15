<template>
  <div class="inventory-system">
    <!-- Main Content -->
    <main class="main-content">
      <!-- Alert Messages -->
      <div v-if="notification.show" :class="`notification ${notification.type}`">
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">&times;</button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon financial">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="stat-info">
            <h3>{{ resourceStats.financial }}</h3>
            <p>Financial Resources</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon medical">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div class="stat-info">
            <h3>{{ resourceStats.medical }}</h3>
            <p>Medical Resources</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon educational">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </div>
          <div class="stat-info">
            <h3>{{ resourceStats.educational }}</h3>
            <p>Educational Resources</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon other">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </div>
          <div class="stat-info">
            <h3>{{ resourceStats.other }}</h3>
            <p>Other Resources</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'list' }]" 
          @click="activeTab = 'list'"
        >
          Resource List
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'add' }]" 
          @click="activeTab = 'add'; editingId = null; resetForm()"
        >
          Add New Resource
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'send' }]" 
          @click="activeTab = 'send'; resetSendForm()"
        >
          Send to Barangay
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]" 
          @click="activeTab = 'history'; loadRequestHistory()"
        >
          Request History
        </button>
      </div>

      <!-- Resource List Tab -->
      <div v-if="activeTab === 'list'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search resources..." 
              @input="filterResources"
            >
          </div>
          <div class="filter-box">
            <select v-model="typeFilter" @change="filterResources">
              <option value="">All Types</option>
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
        </div>

        <div class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortResources('name')">
                  Resource Name
                  <span v-if="sortField === 'name'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResources('type')">
                  Type
                  <span v-if="sortField === 'type'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResources('providerOrganization')">
                  Provider
                  <span v-if="sortField === 'providerOrganization'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResources('availability')">
                  Availability
                  <span v-if="sortField === 'availability'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResources('quantity')">
                  Quantity
                  <span v-if="sortField === 'quantity'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortResources('dateAdded')">
                  Date Added
                  <span v-if="sortField === 'dateAdded'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody v-if="!isLoading">
              <tr v-if="filteredResources.length === 0">
                <td colspan="7" class="no-data">No resources found. Add your first resource.</td>
              </tr>
              <tr v-for="res in filteredResources" :key="res.id">
                <td>{{ res.name }}</td>
                <td>{{ res.type }}</td>
                <td>{{ res.providerOrganization }}</td>
                <td>{{ res.availability }}</td>
                <td>{{ formatQuantity(res) }}</td>
                <td>{{ formatDate(res.dateAdded) }}</td>
                <td class="actions">
                  <button @click="viewResourceDetails(res)" class="view-btn" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                  <button @click="editResource(res)" class="edit-btn" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button @click="confirmDelete(res)" class="delete-btn" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="7" class="loading">
                  <div class="loading-spinner"></div>
                  Loading resources...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Resource Tab -->
      <div v-if="activeTab === 'add'" class="tab-content">
        <h2 class="form-title">{{ editingId ? 'Update Resource' : 'Add New Resource' }}</h2>
        <form @submit.prevent="submitForm" class="resource-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Resource Name <span class="required">*</span></label>
              <input 
                id="name"
                v-model="resourceForm.name" 
                type="text" 
                required
                placeholder="Enter resource name"
              >
            </div>

            <div class="form-group">
              <label for="type">Resource Type <span class="required">*</span></label>
              <select 
                id="type"
                v-model="resourceForm.type" 
                required
                @change="updateQuantityLabel"
              >
                <option value="" disabled>Select resource type</option>
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

            <div class="form-group">
              <label for="provider">Provider Organization <span class="required">*</span></label>
              <input 
                id="provider"
                v-model="resourceForm.providerOrganization" 
                type="text" 
                required
                placeholder="Enter provider organization"
              >
            </div>

            <div class="form-group">
              <label for="availability">Availability</label>
              <select 
                id="availability"
                v-model="resourceForm.availability"
              >
                <option value="" disabled>Select availability</option>
                <option value="Ongoing">Ongoing</option>
                <option value="One-time">One-time</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
                <option value="As Needed">As Needed</option>
                <option value="Limited">Limited</option>
              </select>
            </div>

            <div class="form-group">
              <label for="quantity">{{ quantityLabel }} <span class="required">*</span></label>
              <input 
                id="quantity"
                v-model="resourceForm.quantity" 
                type="number" 
                min="0"
                step="0.01"
                required
                placeholder="Enter quantity"
              >
            </div>

            <div class="form-group">
              <label for="unit">Unit of Measure</label>
              <input 
                id="unit"
                v-model="resourceForm.unit" 
                type="text" 
                placeholder="e.g., pcs, kg, PHP"
              >
            </div>

            <div class="form-group">
              <label for="contactPerson">Contact Person</label>
              <input 
                id="contactPerson"
                v-model="resourceForm.contactPerson" 
                type="text" 
                placeholder="Enter contact person name"
              >
            </div>

            <div class="form-group">
              <label for="contactNumber">Contact Number</label>
              <input 
                id="contactNumber"
                v-model="resourceForm.contactNumber" 
                type="text" 
                placeholder="Enter contact number"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description"
              v-model="resourceForm.description" 
              placeholder="Enter resource description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="eligibility">Eligibility Requirements</label>
            <textarea 
              id="eligibility"
              v-model="resourceForm.eligibility" 
              placeholder="Enter eligibility requirements"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="application">Application Process</label>
            <textarea 
              id="application"
              v-model="resourceForm.applicationProcess" 
              placeholder="Enter application process"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Additional Notes</label>
            <textarea 
              id="notes"
              v-model="resourceForm.notes" 
              placeholder="Enter additional notes"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Processing...' : (editingId ? 'Update Resource' : 'Add Resource') }}
            </button>
            <button type="button" @click="resetForm" class="cancel-btn" v-if="editingId">
              Cancel Edit
            </button>
          </div>
        </form>
      </div>

      <!-- Send to Barangay Tab - Improved Design -->
      <div v-if="activeTab === 'send'" class="tab-content">
        <h2 class="form-title">Send Resources to Barangay</h2>
        <form @submit.prevent="submitSendForm" class="resource-form">
          <!-- Barangay and Admin Information Section -->
          <div class="form-section">
            <h3 class="section-title">Barangay & Admin Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="barangay">Barangay <span class="required">*</span></label>
                <select 
                  id="barangay"
                  v-model="sendForm.barangay" 
                  required
                  class="form-select"
                >
                  <option value="" disabled>Select barangay</option>
                  <option v-for="brgy in barangayList" :key="brgy" :value="brgy">{{ brgy }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="adminName">Barangay Admin Name <span class="required">*</span></label>
                <input 
                  id="adminName"
                  v-model="sendForm.adminName" 
                  type="text" 
                  required
                  placeholder="Enter barangay admin name"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="adminContact">Admin Contact Number <span class="required">*</span></label>
                <input 
                  id="adminContact"
                  v-model="sendForm.adminContact" 
                  type="text" 
                  required
                  placeholder="Enter admin contact number"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="requestDate">Request Date <span class="required">*</span></label>
                <input 
                  id="requestDate"
                  v-model="sendForm.requestDate" 
                  type="date" 
                  required
                  class="form-input"
                >
              </div>
            </div>
          </div>

          <!-- Resources Section -->
          <div class="form-section">
            <h3 class="section-title">Requested Resources</h3>
            <div class="requested-resources">
              <div v-for="(item, index) in sendForm.requestedItems" :key="index" class="requested-item">
                <div class="resource-selection">
                  <div class="resource-select">
                    <label :for="`resource-${index}`">Resource <span class="required">*</span></label>
                    <select 
                      :id="`resource-${index}`"
                      v-model="item.resourceId" 
                      required
                      @change="updateResourceDetails(index)"
                      class="form-select"
                    >
                      <option value="" disabled>Select resource</option>
                      <option v-for="res in resources" :key="res.id" :value="res.id">
                        {{ res.name }} ({{ formatQuantity(res) }})
                      </option>
                    </select>
                  </div>
                  
                  <div class="resource-quantity">
                    <label :for="`quantity-${index}`">Quantity <span class="required">*</span></label>
                    <input 
                      :id="`quantity-${index}`"
                      v-model.number="item.quantity" 
                      type="number" 
                      min="1" 
                      :max="getMaxQuantity(item.resourceId)"
                      required
                      placeholder="Qty"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="resource-unit" v-if="getResourceById(item.resourceId)">
                    <span class="unit-label">Unit</span>
                    <span class="unit-value">{{ getResourceById(item.resourceId).unit || 'units' }}</span>
                  </div>
                  
                  <button 
                    type="button" 
                    @click="removeRequestedItem(index)" 
                    class="remove-btn"
                    :disabled="sendForm.requestedItems.length <= 1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                
                <div class="resource-info" v-if="getResourceById(item.resourceId)">
                  <div class="info-badge">
                    Available: {{ getResourceById(item.resourceId).quantity }} {{ getResourceById(item.resourceId).unit || 'units' }}
                  </div>
                </div>
              </div>
              
              <button type="button" @click="addRequestedItem" class="add-item-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Another Resource
              </button>
            </div>
          </div>

          <!-- Additional Information Section -->
          <div class="form-section">
            <h3 class="section-title">Additional Information</h3>
            <div class="form-group">
              <label for="purpose">Purpose <span class="required">*</span></label>
              <textarea 
                id="purpose"
                v-model="sendForm.purpose" 
                placeholder="Enter the purpose of this request"
                rows="3"
                required
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="requestNotes">Additional Notes</label>
              <textarea 
                id="requestNotes"
                v-model="sendForm.notes" 
                placeholder="Enter any additional notes about this request"
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSending || !isValidSendForm">
              {{ isSending ? 'Processing...' : 'Submit Request' }}
            </button>
            <button type="button" @click="resetSendForm" class="cancel-btn">
              Reset Form
            </button>
          </div>
        </form>
      </div>

      <!-- Request History Tab -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <h2 class="form-title">Request History</h2>
        
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="historySearchQuery" 
              type="text" 
              placeholder="Search requests..." 
              @input="filterHistory"
            >
          </div>
          <div class="filter-box">
            <select v-model="historyBarangayFilter" @change="filterHistory">
              <option value="">All Barangays</option>
              <option v-for="brgy in barangayList" :key="brgy" :value="brgy">{{ brgy }}</option>
            </select>
          </div>
        </div>

        <div class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortHistory('requestDate')">
                  Request Date
                  <span v-if="historySortField === 'requestDate'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortHistory('barangay')">
                  Barangay
                  <span v-if="historySortField === 'barangay'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortHistory('adminName')">
                  Admin Name
                  <span v-if="historySortField === 'adminName'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Resources</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody v-if="!isLoadingHistory">
              <tr v-if="filteredHistory.length === 0">
                <td colspan="6" class="no-data">No request history found.</td>
              </tr>
              <tr v-for="request in filteredHistory" :key="request.id">
                <td>{{ formatDate(request.requestDate) }}</td>
                <td>{{ request.barangay }}</td>
                <td>{{ request.adminName }}</td>
                <td>
                  <div class="resource-count">{{ request.requestedItems.length }} items</div>
                </td>
                <td>
                  <span :class="`status-badge ${request.status.toLowerCase()}`">
                    {{ request.status }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="viewRequestDetails(request)" class="view-btn" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="loading">
                  <div class="loading-spinner"></div>
                  Loading request history...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resource Details Modal -->
      <div v-if="showDetailsModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Resource Details</h2>
            <button @click="showDetailsModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedResource">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Resource Name</h3>
                <p>{{ selectedResource.name }}</p>
              </div>
              <div class="detail-item">
                <h3>Type</h3>
                <p>{{ selectedResource.type }}</p>
              </div>
              <div class="detail-item">
                <h3>Provider Organization</h3>
                <p>{{ selectedResource.providerOrganization }}</p>
              </div>
              <div class="detail-item">
                <h3>Availability</h3>
                <p>{{ selectedResource.availability || 'Not specified' }}</p>
              </div>
              <div class="detail-item">
                <h3>Quantity</h3>
                <p>{{ formatQuantity(selectedResource) }}</p>
              </div>
              <div class="detail-item">
                <h3>Contact Person</h3>
                <p>{{ selectedResource.contactPerson || 'Not specified' }}</p>
              </div>
              <div class="detail-item">
                <h3>Contact Number</h3>
                <p>{{ selectedResource.contactNumber || 'Not specified' }}</p>
              </div>
            </div>

            <div class="detail-section">
              <h3>Description</h3>
              <p>{{ selectedResource.description || 'No description provided' }}</p>
            </div>

            <div class="detail-section">
              <h3>Eligibility Requirements</h3>
              <p>{{ selectedResource.eligibility || 'No eligibility requirements specified' }}</p>
            </div>

            <div class="detail-section">
              <h3>Application Process</h3>
              <p>{{ selectedResource.applicationProcess || 'No application process specified' }}</p>
            </div>

            <div class="detail-section">
              <h3>Additional Notes</h3>
              <p>{{ selectedResource.notes || 'No additional notes' }}</p>
            </div>

            <div class="detail-section">
              <h3>Date Information</h3>
              <p><strong>Added:</strong> {{ formatDate(selectedResource.dateAdded) }}</p>
              <p><strong>Last Updated:</strong> {{ formatDate(selectedResource.lastUpdated) }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="editResource(selectedResource)" class="edit-btn">Edit Resource</button>
            <button @click="showDetailsModal = false" class="close-btn">Close</button>
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
                <h3>Barangay</h3>
                <p>{{ selectedRequest.barangay }}</p>
              </div>
              <div class="detail-item">
                <h3>Admin Name</h3>
                <p>{{ selectedRequest.adminName }}</p>
              </div>
              <div class="detail-item">
                <h3>Admin Contact</h3>
                <p>{{ selectedRequest.adminContact }}</p>
              </div>
              <div class="detail-item">
                <h3>Request Date</h3>
                <p>{{ formatDate(selectedRequest.requestDate) }}</p>
              </div>
              <div class="detail-item">
                <h3>Status</h3>
                <p>
                  <span :class="`status-badge ${selectedRequest.status.toLowerCase()}`">
                    {{ selectedRequest.status }}
                  </span>
                </p>
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
                    <td>{{ item.resourceType }}</td>
                    <td>{{ item.quantity }} {{ item.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="detail-section" v-if="selectedRequest.purpose">
              <h3>Purpose</h3>
              <p>{{ selectedRequest.purpose }}</p>
            </div>

            <div class="detail-section" v-if="selectedRequest.notes">
              <h3>Notes</h3>
              <p>{{ selectedRequest.notes }}</p>
            </div>

            <div class="detail-section">
              <h3>Date Information</h3>
              <p><strong>Requested:</strong> {{ formatDate(selectedRequest.createdAt) }}</p>
              <p v-if="selectedRequest.updatedAt"><strong>Last Updated:</strong> {{ formatDate(selectedRequest.updatedAt) }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              v-if="selectedRequest && selectedRequest.status === 'Pending'" 
              @click="updateRequestStatus('Approved')" 
              class="approve-btn"
            >
              Approve Request
            </button>
            <button 
              v-if="selectedRequest && selectedRequest.status === 'Pending'" 
              @click="updateRequestStatus('Rejected')" 
              class="reject-btn"
            >
              Reject Request
            </button>
            <button @click="showRequestModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal with Resource Preview -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content delete-modal">
          <div class="modal-header">
            <h2>Confirm Deletion</h2>
            <button @click="showDeleteModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <p class="delete-warning">Are you sure you want to delete this resource? This action cannot be undone.</p>
            
            <!-- Resource Preview Section -->
            <div class="resource-preview" v-if="resourceToDelete">
              <h3 class="preview-title">Resource to be deleted:</h3>
              <div class="preview-content">
                <div class="preview-item">
                  <span class="preview-label">Name:</span>
                  <span class="preview-value">{{ resourceToDelete.name }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Type:</span>
                  <span class="preview-value">{{ resourceToDelete.type }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Provider:</span>
                  <span class="preview-value">{{ resourceToDelete.providerOrganization }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Availability:</span>
                  <span class="preview-value">{{ resourceToDelete.availability || 'Not specified' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Quantity:</span>
                  <span class="preview-value">{{ formatQuantity(resourceToDelete) }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Date Added:</span>
                  <span class="preview-value">{{ formatDate(resourceToDelete.dateAdded) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="deleteResource()" class="delete-confirm-btn">Delete</button>
            <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
  Timestamp
} from 'firebase/firestore'
import { db } from '@/services/firebase' // Adjust the path to your firebase config

// Firestore references
const resourceCollection = collection(db, 'spfresource')
const requestCollection = collection(db, 'request_history') // Changed to request_history as requested

// Reactive state
const activeTab = ref('list')
const resourceForm = ref({
  name: '',
  type: '',
  providerOrganization: '',
  contactPerson: '',
  contactNumber: '',
  availability: '',
  description: '',
  eligibility: '',
  applicationProcess: '',
  notes: '',
  quantity: 0,
  unit: ''
})

const quantityLabel = ref('Quantity')

const sendForm = ref({
  barangay: '',
  adminName: '',
  adminContact: '',
  requestDate: new Date().toISOString().substr(0, 10),
  requestedItems: [{ resourceId: '', quantity: 1 }],
  purpose: '', // Added purpose field
  notes: ''
})

const editingId = ref(null)
const isSubmitting = ref(false)
const isSending = ref(false)
const isLoading = ref(false)
const isLoadingHistory = ref(false)
const resources = ref([])
const filteredResources = ref([])
const requestHistory = ref([])
const filteredHistory = ref([])
const searchQuery = ref('')
const historySearchQuery = ref('')
const typeFilter = ref('')
const historyBarangayFilter = ref('')
const sortField = ref('name')
const sortDirection = ref('asc')
const historySortField = ref('requestDate')
const historySortDirection = ref('desc')
const showDetailsModal = ref(false)
const showRequestModal = ref(false)
const selectedResource = ref(null)
const selectedRequest = ref(null)
const showDeleteModal = ref(false)
const resourceToDelete = ref(null)
const notification = ref({ show: false, message: '', type: '' })

// Barangay list
const barangayList = [
  'Balite', 'Bayanan I', 'Bayanan II', 'Bulusan', 'Comunal', 'Guinobatan',
  'Ibaba East', 'Ibaba West', 'Ilaya', 'Lalud', 'Libis', 'Mahal Na Pangalan',
  'Maidlang', 'Malad', 'Masipit', 'Nag-iba I', 'Nag-iba II', 'Pachoca',
  'Parang', 'Salong', 'San Antonio', 'Sta. Cruz', 'Sta. Isabel', 'Sto. Niño',
  'Suqui', 'Tawagan', 'Tibag', 'Wawa', 'Bagong Pook', 'Kanlurang Bucana',
  'Silangang Bucana', 'Navotas', 'Tawiran', 'Balingayan', 'Batino', 'Bayanan III',
  'Bayanan IV', 'Biga', 'Bondoc', 'Gaudencio Antonino', 'Gutad', 'Ibaba Baco',
  'Ilaya Baco', 'Malapad', 'Malisbog', 'Managpi', 'Masipit 2', 'Nagiba 3',
  'Pinagtipunan', 'Puting Tubig', 'San Rafael', 'Sapul', 'Silonay',
  'Sta. Maria Village', 'Sta. Rita', 'Sta. Theresa', 'Sta. Clara', 'Sta. Maria',
  'Tagumpay', 'Tawagan 2'
]

// Statistics
const resourceStats = ref({
  financial: 0,
  medical: 0,
  educational: 0,
  other: 0
})

// Computed properties
const isValidSendForm = computed(() => {
  // Check if barangay, admin name, and contact are filled
  if (!sendForm.value.barangay || !sendForm.value.adminName || !sendForm.value.adminContact || !sendForm.value.purpose) {
    return false
  }
  
  // Check if at least one resource is selected with valid quantity
  for (const item of sendForm.value.requestedItems) {
    if (!item.resourceId) return false
    
    const resource = getResourceById(item.resourceId)
    if (!resource) return false
    
    if (item.quantity <= 0 || item.quantity > resource.quantity) return false
  }
  
  return true
})

// Notification function
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => (notification.value.show = false), 3000)
}

// Format Firestore timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString()
    }
    return new Date(timestamp.seconds * 1000).toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

// Format quantity with unit
const formatQuantity = (resource) => {
  if (!resource) return 'N/A'
  if (resource.quantity === undefined) return 'N/A'
  
  if (resource.type === 'Financial') {
    return `₱${parseFloat(resource.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  return `${resource.quantity} ${resource.unit || ''}`
}

// Update quantity label based on resource type
const updateQuantityLabel = () => {
  const type = resourceForm.value.type
  
  if (type === 'Financial') {
    quantityLabel.value = 'Amount'
    if (!resourceForm.value.unit) resourceForm.value.unit = 'PHP'
  } else if (type === 'Medical' || type === 'Food') {
    quantityLabel.value = 'Quantity'
    if (!resourceForm.value.unit) resourceForm.value.unit = 'pcs'
  } else if (type === 'Housing') {
    quantityLabel.value = 'Units Available'
    if (!resourceForm.value.unit) resourceForm.value.unit = 'units'
  } else {
    quantityLabel.value = 'Quantity'
  }
}

// Fetch all resources
const getResources = async () => {
  isLoading.value = true
  try {
    const q = query(resourceCollection, orderBy(sortField.value, sortDirection.value))
    const querySnapshot = await getDocs(q)
    resources.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    filterResources()
    calculateStats()
  } catch (error) {
    console.error('Failed to fetch resources:', error)
    showNotification('Failed to load resources.', 'error')
  } finally {
    isLoading.value = false
  }
}

// Filter resources based on search and type
const filterResources = () => {
  const search = searchQuery.value.toLowerCase()
  filteredResources.value = resources.value.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(search) ||
                          r.type?.toLowerCase().includes(search) ||
                          r.providerOrganization?.toLowerCase().includes(search)
    const matchesType = !typeFilter.value || r.type === typeFilter.value
    return matchesSearch && matchesType
  })
}

// Sort by field
const sortResources = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }

  resources.value.sort((a, b) => {
    let valA = a[field]
    let valB = b[field]
    if (valA?.toDate) valA = valA.toDate()
    if (valB?.toDate) valB = valB.toDate()
    return sortDirection.value === 'asc'
      ? valA < valB ? -1 : 1
      : valA > valB ? -1 : 1
  })
  filterResources()
}

// Submit (add or update)
const submitForm = async () => {
  isSubmitting.value = true
  try {
    const data = {
      ...resourceForm.value,
      dateAdded: editingId.value ? resourceForm.value.dateAdded : serverTimestamp(),
      lastUpdated: serverTimestamp()
    }

    if (editingId.value) {
      await updateDoc(doc(db, 'spfresource', editingId.value), data)
      showNotification('Resource updated successfully!')
    } else {
      await addDoc(resourceCollection, data)
      showNotification('Resource added successfully!')
    }

    await getResources()
    resetForm()
    activeTab.value = 'list'
  } catch (error) {
    console.error('Submit error:', error)
    showNotification('Failed to submit data.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
const resetForm = () => {
  editingId.value = null
  resourceForm.value = {
    name: '',
    type: '',
    providerOrganization: '',
    contactPerson: '',
    contactNumber: '',
    availability: '',
    description: '',
    eligibility: '',
    applicationProcess: '',
    notes: '',
    quantity: 0,
    unit: ''
  }
  quantityLabel.value = 'Quantity'
}

// Edit
const editResource = (resource) => {
  editingId.value = resource.id
  resourceForm.value = { ...resource }
  updateQuantityLabel()
  activeTab.value = 'add'
  showDetailsModal.value = false // Close details modal if open
}

// View
const viewResourceDetails = (resource) => {
  selectedResource.value = resource
  showDetailsModal.value = true
}

// Confirm delete - now stores the full resource object
const confirmDelete = (resource) => {
  resourceToDelete.value = resource
  showDeleteModal.value = true
}

// Delete
const deleteResource = async () => {
  try {
    await deleteDoc(doc(db, 'spfresource', resourceToDelete.value.id))
    showNotification('Resource deleted successfully!')
    await getResources()
  } catch (error) {
    console.error('Delete error:', error)
    showNotification('Failed to delete resource.', 'error')
  } finally {
    showDeleteModal.value = false
    resourceToDelete.value = null
  }
}

// Count stats
const calculateStats = () => {
  const stats = {
    financial: 0,
    medical: 0,
    educational: 0,
    other: 0
  }

  for (const r of resources.value) {
    if (r.type === 'Financial') {
      stats.financial++
    } else if (r.type === 'Medical') {
      stats.medical++
    } else if (r.type === 'Educational') {
      stats.educational++
    } else {
      stats.other++
    }
  }

  resourceStats.value = stats
}

// Send to Barangay functions
const resetSendForm = () => {
  sendForm.value = {
    barangay: '',
    adminName: '',
    adminContact: '',
    requestDate: new Date().toISOString().substr(0, 10),
    requestedItems: [{ resourceId: '', quantity: 1 }],
    purpose: '',
    notes: ''
  }
}

const addRequestedItem = () => {
  sendForm.value.requestedItems.push({ resourceId: '', quantity: 1 })
}

const removeRequestedItem = (index) => {
  if (sendForm.value.requestedItems.length > 1) {
    sendForm.value.requestedItems.splice(index, 1)
  }
}

const getResourceById = (id) => {
  if (!id) return null
  return resources.value.find(r => r.id === id) || null
}

const getMaxQuantity = (resourceId) => {
  const resource = getResourceById(resourceId)
  return resource ? resource.quantity : 1
}

const updateResourceDetails = (index) => {
  const item = sendForm.value.requestedItems[index]
  const resource = getResourceById(item.resourceId)
  
  if (resource && item.quantity > resource.quantity) {
    item.quantity = resource.quantity
  }
}

const submitSendForm = async () => {
  isSending.value = true
  try {
    // Prepare request data
    const requestItems = []
    
    for (const item of sendForm.value.requestedItems) {
      const resource = getResourceById(item.resourceId)
      if (!resource) continue
      
      requestItems.push({
        resourceId: item.resourceId,
        resourceName: resource.name,
        resourceType: resource.type,
        quantity: item.quantity,
        unit: resource.unit || ''
      })
    }
    
    if (requestItems.length === 0) {
      showNotification('Please select at least one resource', 'error')
      isSending.value = false
      return
    }
    
    const requestData = {
      barangay: sendForm.value.barangay,
      adminName: sendForm.value.adminName,
      adminContact: sendForm.value.adminContact,
      requestDate: Timestamp.fromDate(new Date(sendForm.value.requestDate)),
      requestedItems: requestItems,
      purpose: sendForm.value.purpose,
      notes: sendForm.value.notes,
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Add to Firestore
    await addDoc(requestCollection, requestData)
    
    // Update resource quantities
    for (const item of sendForm.value.requestedItems) {
      const resource = getResourceById(item.resourceId)
      if (!resource) continue
      
      const newQuantity = parseFloat(resource.quantity) - parseFloat(item.quantity)
      await updateDoc(doc(db, 'spfresource', resource.id), {
        quantity: newQuantity,
        lastUpdated: serverTimestamp()
      })
    }
    
    showNotification('Request submitted successfully!')
    resetSendForm()
    
    // Switch to history tab
    activeTab.value = 'history'
    loadRequestHistory()
    
  } catch (error) {
    console.error('Submit request error:', error)
    showNotification('Failed to submit request: ' + error.message, 'error')
  } finally {
    isSending.value = false
  }
}

// Request History functions
const loadRequestHistory = async () => {
  isLoadingHistory.value = true
  try {
    const q = query(requestCollection, orderBy('requestDate', 'desc'))
    const querySnapshot = await getDocs(q)
    requestHistory.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    filterHistory()
  } catch (error) {
    console.error('Failed to fetch request history:', error)
    showNotification('Failed to load request history.', 'error')
  } finally {
    isLoadingHistory.value = false
  }
}

const filterHistory = () => {
  const search = historySearchQuery.value.toLowerCase()
  filteredHistory.value = requestHistory.value.filter(r => {
    const matchesSearch = r.barangay?.toLowerCase().includes(search) ||
                          r.adminName?.toLowerCase().includes(search) ||
                          r.status?.toLowerCase().includes(search) ||
                          r.purpose?.toLowerCase().includes(search)
    const matchesBarangay = !historyBarangayFilter.value || r.barangay === historyBarangayFilter.value
    return matchesSearch && matchesBarangay
  })
}

const sortHistory = (field) => {
  if (historySortField.value === field) {
    historySortDirection.value = historySortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    historySortField.value = field
    historySortDirection.value = 'desc'
  }

  requestHistory.value.sort((a, b) => {
    let valA = a[field]
    let valB = b[field]
    if (valA?.toDate) valA = valA.toDate()
    if (valB?.toDate) valB = valB.toDate()
    return historySortDirection.value === 'asc'
      ? valA < valB ? -1 : 1
      : valA > valB ? -1 : 1
  })
  filterHistory()
}

const viewRequestDetails = (request) => {
  selectedRequest.value = request
  showRequestModal.value = true
}

const updateRequestStatus = async (status) => {
  try {
    const requestRef = doc(db, 'request_history', selectedRequest.value.id)
    await updateDoc(requestRef, {
      status: status,
      updatedAt: serverTimestamp()
    })
    
    // If rejected, return the quantity to the resource
    if (status === 'Rejected') {
      for (const item of selectedRequest.value.requestedItems) {
        const resource = resources.value.find(r => r.id === item.resourceId)
        if (resource) {
          const newQuantity = parseFloat(resource.quantity) + parseFloat(item.quantity)
          await updateDoc(doc(db, 'spfresource', item.resourceId), {
            quantity: newQuantity,
            lastUpdated: serverTimestamp()
          })
        }
      }
    }
    
    // Update local data
    selectedRequest.value.status = status
    
    // Update in the list
    const index = requestHistory.value.findIndex(r => r.id === selectedRequest.value.id)
    if (index !== -1) {
      requestHistory.value[index].status = status
    }
    
    showNotification(`Request ${status.toLowerCase()} successfully!`)
  } catch (error) {
    console.error('Update request status error:', error)
    showNotification('Failed to update request status.', 'error')
  }
}

// On mount
onMounted(() => {
  getResources()
})
</script>

<style scoped>
/* Base Styles */
.inventory-system {
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

/* Stats Cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
}

.stat-icon.financial {
  background-color: #4caf50;
}

.stat-icon.medical {
  background-color: #2196f3;
}

.stat-icon.educational {
  background-color: #ff9800;
}

.stat-icon.other {
  background-color: #9c27b0;
}

.stat-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
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

/* Resource List */
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

.actions {
  display: flex;
  gap: 0.5rem;
}

.view-btn, .edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  color: #2196f3;
}

.edit-btn {
  color: #ff9800;
}

.delete-btn {
  color: #f44336;
}

.view-btn:hover, .edit-btn:hover, .delete-btn:hover {
  background-color: rgba(0,0,0,0.05);
}

.no-data, .loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #2c3e50;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Form Styles */
.form-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.resource-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 0.5rem;
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

/* Send to Barangay Styles */
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
  grid-template-columns: 3fr 1fr auto auto;
  gap: 1rem;
  align-items: flex-end;
}

.resource-select, .resource-quantity {
  display: flex;
  flex-direction: column;
}

.resource-unit {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  height: 100%;
  padding-bottom: 0.75rem;
}

.unit-label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.unit-value {
  font-weight: 500;
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

.resource-info {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.info-badge {
  background-color: #e9ecef;
  color: #495057;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
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

.submit-btn, .cancel-btn, .approve-btn, .reject-btn {
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

.approve-btn {
  background-color: #4caf50;
  color: white;
}

.approve-btn:hover {
  background-color: #388e3c;
}

.reject-btn {
  background-color: #f44336;
  color: white;
}

.reject-btn:hover {
  background-color: #d32f2f;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.pending {
  background-color: #fff3cd;
  color: #856404;
}

.approved {
  background-color: #d4edda;
  color: #155724;
}

.rejected {
  background-color: #f8d7da;
  color: #721c24;
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

.delete-modal {
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

/* Delete Preview Styles */
.delete-warning {
  color: #721c24;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.resource-preview {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.preview-title {
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  color: #333;
}

.preview-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.preview-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.preview-label {
  font-size: 0.75rem;
  color: #666;
}

.preview-value {
  font-weight: 500;
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
}
</style>