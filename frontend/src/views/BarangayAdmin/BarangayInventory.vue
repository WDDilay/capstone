<template>
  <div class="inventory-system">
    <div class="main-content">
      <!-- Alert Messages -->
      <div v-if="notification.show" :class="`notification ${notification.type}`">
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">&times;</button>
      </div>

      <!-- Error Alert -->
      <div v-if="authError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
        <span>{{ authError }}</span>
        <button @click="authError = null" class="text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Barangay Indicator -->
      <div v-if="currentBarangay" class="mb-4">
        <h1 class="page-title">{{ currentBarangay }} Resource Inventory</h1>
        <p class="text-sm text-gray-600">Managing resources for {{ currentBarangay }}</p>
      </div>

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
          :class="['tab-btn', { active: activeTab === 'available' }]" 
          @click="activeTab = 'available'"
        >
          Available Resources
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'memberRequest' }]" 
          @click="activeTab = 'memberRequest'; loadMemberRequests()"
        >
          Member Request
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'member' }]" 
          @click="activeTab = 'member'"
        >
          Member Resource
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]" 
          @click="activeTab = 'history'; loadMemberHistory()"
        >
          History
        </button>
      </div>

      <!-- Available Resources Tab -->
      <div v-if="activeTab === 'available'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search resources..." 
              @input="filterAvailableResources"
            >
          </div>
          <div class="filter-box">
            <select v-model="typeFilter" @change="filterAvailableResources">
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

        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading resources...</p>
        </div>

        <div v-else-if="fetchError" class="error-container">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p>{{ fetchError }}</p>
          <button @click="fetchAvailableResources" class="retry-btn">Retry</button>
        </div>

        <div v-else class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortAvailableResources('resourceName')">
                  Resource Name
                  <span v-if="sortField === 'resourceName'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortAvailableResources('resourceType')">
                  Type
                  <span v-if="sortField === 'resourceType'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortAvailableResources('quantity')">
                  Available Quantity
                  <span v-if="sortField === 'quantity'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortAvailableResources('requestDate')">
                  Date Received
                  <span v-if="sortField === 'requestDate'" class="sort-icon">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredAvailableResources.length === 0">
                <td colspan="5" class="no-data">No resources available for this barangay.</td>
              </tr>
              <tr v-for="(resource, index) in filteredAvailableResources" :key="index">
                <td>{{ resource.resourceName }}</td>
                <td>
                  <span 
                    class="resource-type-badge"
                    :style="`background-color: ${getResourceTypeColor(resource.resourceType, 0.2)}; color: ${getResourceTypeColor(resource.resourceType, 1)}`"
                  >
                    {{ resource.resourceType }}
                  </span>
                </td>
                <td>{{ resource.remainingQuantity }} {{ resource.unit }}</td>
                <td>{{ formatDate(resource.requestDate) }}</td>
                <td>
                  <span 
                    class="status-badge"
                    :class="{
                      'approved': resource.status === 'Approved',
                      'pending': resource.status === 'Pending',
                      'rejected': resource.status === 'Rejected'
                    }"
                  >
                    {{ resource.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Member Request Tab -->
      <div v-if="activeTab === 'memberRequest'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="memberRequestSearchQuery" 
              type="text" 
              placeholder="Search member requests..." 
              @input="filterMemberRequests"
            >
          </div>
          <div class="filter-box">
            <select v-model="memberRequestStatusFilter" @change="filterMemberRequests">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div v-if="isLoadingMemberRequests" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading member requests...</p>
        </div>

        <div v-else class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortMemberRequests('requestDate')">
                  Request Date
                  <span v-if="memberRequestSortField === 'requestDate'" class="sort-icon">
                    {{ memberRequestSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortMemberRequests('userName')">
                  Member Name
                  <span v-if="memberRequestSortField === 'userName'" class="sort-icon">
                    {{ memberRequestSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortMemberRequests('referenceCode')">
                  Reference Code
                  <span v-if="memberRequestSortField === 'referenceCode'" class="sort-icon">
                    {{ memberRequestSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Requested Items</th>
                <th @click="sortMemberRequests('status')">
                  Status
                  <span v-if="memberRequestSortField === 'status'" class="sort-icon">
                    {{ memberRequestSortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredMemberRequests.length === 0">
                <td colspan="6" class="no-data">No member requests found.</td>
              </tr>
              <tr v-for="request in filteredMemberRequests" :key="request.id">
                <td>{{ formatDate(request.requestDate) }}</td>
                <td>{{ request.userName }}</td>
                <td>{{ request.referenceCode }}</td>
                <td>
                  <div class="resource-list">
                    <div 
                      v-for="(item, index) in request.requestedItems" 
                      :key="index"
                      class="resource-item"
                      :style="`border-left-color: ${getResourceTypeColor(item.resourceType, 1)}`"
                    >
                      {{ item.resourceName }}: {{ item.quantity }} {{ item.unit }}
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    class="status-badge"
                    :class="{
                      'approved': request.status === 'Approved',
                      'pending': request.status === 'Pending',
                      'rejected': request.status === 'Rejected'
                    }"
                  >
                    {{ request.status }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="viewMemberRequestDetails(request)" class="view-btn" title="View Details">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button 
                      v-if="request.status === 'Pending'" 
                      @click="updateRequestStatus(request, 'Approved')" 
                      class="approve-btn" 
                      title="Approve Request"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button 
                      v-if="request.status === 'Pending'" 
                      @click="updateRequestStatus(request, 'Rejected')" 
                      class="reject-btn" 
                      title="Reject Request"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Member Resource Tab -->
      <div v-if="activeTab === 'member'" class="tab-content">
        <h2 class="section-title">Send Resources to Member</h2>
        
        <form @submit.prevent="submitMemberResourceForm" class="member-resource-form">
          <!-- Member Information Section -->
          <div class="form-section">
            <h3 class="subsection-title">Member Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="memberName">Member Name <span class="required">*</span></label>
                <input 
                  id="memberName"
                  v-model="memberResourceForm.memberName" 
                  type="text" 
                  required
                  placeholder="Enter member name"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="memberID">Member ID <span class="required">*</span></label>
                <input 
                  id="memberID"
                  v-model="memberResourceForm.memberID" 
                  type="text" 
                  required
                  placeholder="Enter member ID"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="contactNumber">Contact Number</label>
                <input 
                  id="contactNumber"
                  v-model="memberResourceForm.contactNumber" 
                  type="text" 
                  placeholder="Enter contact number"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="address">Address</label>
                <input 
                  id="address"
                  v-model="memberResourceForm.address" 
                  type="text" 
                  placeholder="Enter address"
                  class="form-input"
                >
              </div>
            </div>
          </div>

          <!-- Resources Section -->
          <div class="form-section">
            <h3 class="subsection-title">Resources to Send</h3>
            <div class="requested-resources">
              <div v-for="(item, index) in memberResourceForm.resources" :key="index" class="requested-item">
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
                      <option 
                        v-for="res in availableResources" 
                        :key="res.id" 
                        :value="res.id"
                        :disabled="res.remainingQuantity <= 0"
                      >
                        {{ res.resourceName }} ({{ res.remainingQuantity }} {{ res.unit }})
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
                    @click="removeResourceItem(index)" 
                    class="remove-btn"
                    :disabled="memberResourceForm.resources.length <= 1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                
                <div class="resource-info" v-if="getResourceById(item.resourceId)">
                  <div class="info-badge">
                    Available: {{ getResourceById(item.resourceId).remainingQuantity }} {{ getResourceById(item.resourceId).unit || 'units' }}
                  </div>
                </div>
              </div>
              
              <button type="button" @click="addResourceItem" class="add-item-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Another Resource
              </button>
            </div>
          </div>

          <!-- Additional Information Section -->
          <div class="form-section">
            <h3 class="subsection-title">Additional Information</h3>
            <div class="form-group">
              <label for="purpose">Purpose <span class="required">*</span></label>
              <textarea 
                id="purpose"
                v-model="memberResourceForm.purpose" 
                placeholder="Enter the purpose of this distribution"
                rows="3"
                required
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="notes">Additional Notes</label>
              <textarea 
                id="notes"
                v-model="memberResourceForm.notes" 
                placeholder="Enter any additional notes"
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting || !isValidMemberForm">
              {{ isSubmitting ? 'Processing...' : 'Send Resources' }}
            </button>
            <button type="button" @click="resetMemberResourceForm" class="cancel-btn">
              Reset Form
            </button>
          </div>
        </form>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div class="list-controls">
          <div class="search-box">
            <input 
              v-model="historySearchQuery" 
              type="text" 
              placeholder="Search history..." 
              @input="filterHistory"
            >
          </div>
          <div class="filter-box">
            <select v-model="historyTypeFilter" @change="filterHistory">
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

        <div v-if="isLoadingHistory" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading history...</p>
        </div>

        <div v-else class="resource-table-container">
          <table class="resource-table">
            <thead>
              <tr>
                <th @click="sortHistory('distributionDate')">
                  Date
                  <span v-if="historySortField === 'distributionDate'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortHistory('memberName')">
                  Member Name
                  <span v-if="historySortField === 'memberName'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th @click="sortHistory('memberID')">
                  Member ID
                  <span v-if="historySortField === 'memberID'" class="sort-icon">
                    {{ historySortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
                <th>Resources</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredHistory.length === 0">
                <td colspan="5" class="no-data">No distribution history found.</td>
              </tr>
              <tr v-for="history in filteredHistory" :key="history.id">
                <td>{{ formatDate(history.distributionDate) }}</td>
                <td>{{ history.memberName }}</td>
                <td>{{ history.memberID }}</td>
                <td>
                  <div class="resource-list">
                    <div 
                      v-for="(resource, index) in history.resources" 
                      :key="index"
                      class="resource-item"
                      :style="`border-left-color: ${getResourceTypeColor(resource.resourceType, 1)}`"
                    >
                      {{ resource.resourceName }}: {{ resource.quantity }} {{ resource.unit }}
                    </div>
                  </div>
                </td>
                <td>
                  <button @click="viewHistoryDetails(history)" class="view-btn" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- History Details Modal -->
      <div v-if="showHistoryModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Distribution Details</h2>
            <button @click="showHistoryModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedHistory">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Member Name</h3>
                <p>{{ selectedHistory.memberName }}</p>
              </div>
              <div class="detail-item">
                <h3>Member ID</h3>
                <p>{{ selectedHistory.memberID }}</p>
              </div>
              <div class="detail-item">
                <h3>Contact Number</h3>
                <p>{{ selectedHistory.contactNumber || 'Not provided' }}</p>
              </div>
              <div class="detail-item">
                <h3>Address</h3>
                <p>{{ selectedHistory.address || 'Not provided' }}</p>
              </div>
              <div class="detail-item">
                <h3>Distribution Date</h3>
                <p>{{ formatDate(selectedHistory.distributionDate) }}</p>
              </div>
            </div>

            <div class="detail-section">
              <h3>Distributed Resources</h3>
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Type</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(resource, index) in selectedHistory.resources" :key="index">
                    <td>{{ resource.resourceName }}</td>
                    <td>
                      <span 
                        class="resource-type-badge"
                        :style="`background-color: ${getResourceTypeColor(resource.resourceType, 0.2)}; color: ${getResourceTypeColor(resource.resourceType, 1)}`"
                      >
                        {{ resource.resourceType }}
                      </span>
                    </td>
                    <td>{{ resource.quantity }} {{ resource.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="detail-section" v-if="selectedHistory.purpose">
              <h3>Purpose</h3>
              <p>{{ selectedHistory.purpose }}</p>
            </div>

            <div class="detail-section" v-if="selectedHistory.notes">
              <h3>Notes</h3>
              <p>{{ selectedHistory.notes }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showHistoryModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Member Request Details Modal -->
      <div v-if="showMemberRequestModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Member Request Details</h2>
            <button @click="showMemberRequestModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body" v-if="selectedMemberRequest">
            <div class="detail-grid">
              <div class="detail-item">
                <h3>Member Name</h3>
                <p>{{ selectedMemberRequest.userName }}</p>
              </div>
              <div class="detail-item">
                <h3>Reference Code</h3>
                <p>{{ selectedMemberRequest.referenceCode }}</p>
              </div>
              <div class="detail-item">
                <h3>Email</h3>
                <p>{{ selectedMemberRequest.userEmail || 'Not provided' }}</p>
              </div>
              <div class="detail-item">
                <h3>Barangay</h3>
                <p>{{ selectedMemberRequest.barangay }}</p>
              </div>
              <div class="detail-item">
                <h3>Request Date</h3>
                <p>{{ formatDate(selectedMemberRequest.requestDate) }}</p>
              </div>
              <div class="detail-item">
                <h3>Status</h3>
                <p>
                  <span 
                    class="status-badge"
                    :class="{
                      'approved': selectedMemberRequest.status === 'Approved',
                      'pending': selectedMemberRequest.status === 'Pending',
                      'rejected': selectedMemberRequest.status === 'Rejected'
                    }"
                  >
                    {{ selectedMemberRequest.status }}
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
                  <tr v-for="(item, index) in selectedMemberRequest.requestedItems" :key="index">
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
              <h3>Urgency</h3>
              <p>{{ selectedMemberRequest.urgency }}</p>
            </div>

            <div class="detail-section">
              <h3>Reason</h3>
              <p>{{ selectedMemberRequest.reason }}</p>
            </div>

            <div class="detail-section" v-if="selectedMemberRequest.additionalInfo">
              <h3>Additional Information</h3>
              <p>{{ selectedMemberRequest.additionalInfo }}</p>
            </div>

            <div class="detail-section">
              <h3>Contact Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <h4>Contact Number</h4>
                  <p>{{ selectedMemberRequest.contactNumber || 'Not provided' }}</p>
                </div>
                <div class="detail-item" v-if="selectedMemberRequest.alternateContact">
                  <h4>Alternate Contact</h4>
                  <p>{{ selectedMemberRequest.alternateContact }}</p>
                </div>
                <div class="detail-item" v-if="selectedMemberRequest.preferredContactTime">
                  <h4>Preferred Contact Time</h4>
                  <p>{{ selectedMemberRequest.preferredContactTime }}</p>
                </div>
                <div class="detail-item">
                  <h4>Delivery Address</h4>
                  <p>{{ selectedMemberRequest.deliveryAddress || 'Not provided' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div v-if="selectedMemberRequest && selectedMemberRequest.status === 'Pending'" class="status-actions">
              <button @click="updateRequestStatus(selectedMemberRequest, 'Approved')" class="approve-btn-large">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Approve Request
              </button>
              <button @click="updateRequestStatus(selectedMemberRequest, 'Rejected')" class="reject-btn-large">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Reject Request
              </button>
            </div>
            <button @click="showMemberRequestModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/services/firebase';

// Authentication and barangay detection
const currentBarangay = ref('');
const authError = ref(null);

// Active tab
const activeTab = ref('available');

// Loading states
const isLoading = ref(true);
const isLoadingHistory = ref(true);
const isLoadingMemberRequests = ref(true);
const isSubmitting = ref(false);
const fetchError = ref(null);

// Notification
const notification = ref({ show: false, message: '', type: 'success' });

// Stats
const stats = ref([
  {
    label: 'Total Resources',
    value: '0',
    icon: 'pi pi-box',
    bgColor: '#3B82F6'
  },
  {
    label: 'Resource Types',
    value: '0',
    icon: 'pi pi-list',
    bgColor: '#10B981'
  },
  {
    label: 'Distributions',
    value: '0',
    icon: 'pi pi-send',
    bgColor: '#F59E0B'
  },
  {
    label: 'Members Served',
    value: '0',
    icon: 'pi pi-users',
    bgColor: '#8B5CF6'
  }
]);

// Available Resources
const availableResources = ref([]);
const filteredAvailableResources = ref([]);
const searchQuery = ref('');
const typeFilter = ref('');
const sortField = ref('resourceName');
const sortDirection = ref('asc');

// Member Resource Form
const memberResourceForm = ref({
  memberName: '',
  memberID: '',
  contactNumber: '',
  address: '',
  resources: [{ resourceId: '', quantity: 1 }],
  purpose: '',
  notes: ''
});

// Member Requests
const memberRequests = ref([]);
const filteredMemberRequests = ref([]);
const memberRequestSearchQuery = ref('');
const memberRequestStatusFilter = ref('');
const memberRequestSortField = ref('requestDate');
const memberRequestSortDirection = ref('desc');
const showMemberRequestModal = ref(false);
const selectedMemberRequest = ref(null);

// History
const memberHistory = ref([]);
const filteredHistory = ref([]);
const historySearchQuery = ref('');
const historyTypeFilter = ref('');
const historySortField = ref('distributionDate');
const historySortDirection = ref('desc');
const showHistoryModal = ref(false);
const selectedHistory = ref(null);

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

// Computed property to check if member form is valid
const isValidMemberForm = computed(() => {
  if (!memberResourceForm.value.memberName || !memberResourceForm.value.memberID || !memberResourceForm.value.purpose) {
    return false;
  }
  
  // Check if at least one resource is selected with valid quantity
  for (const item of memberResourceForm.value.resources) {
    if (!item.resourceId) return false;
    
    const resource = getResourceById(item.resourceId);
    if (!resource) return false;
    
    if (item.quantity <= 0 || item.quantity > resource.remainingQuantity) return false;
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

// Check authentication and get barangay
const checkAuthenticationAndBarangay = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User is not authenticated');
    }
    
    console.log('User authenticated:', user.uid);
    
    // Check if user is in barangay_presidents collection
    const barangayPresidentDocRef = doc(db, 'barangay_presidents', user.uid);
    const barangayPresidentDoc = await getDoc(barangayPresidentDocRef);
    
    if (!barangayPresidentDoc.exists()) {
      throw new Error('Your user account is not properly set up as a Barangay President. Please contact the system administrator.');
    }
    
    const barangayPresidentData = barangayPresidentDoc.data();
    if (barangayPresidentData.role !== 'BarangayPresident') {
      throw new Error(`Your role is set to "${barangayPresidentData.role}" instead of "BarangayPresident". Please contact the system administrator.`);
    }
    
    // Store the barangay for filtering
    currentBarangay.value = barangayPresidentData.barangay;
    console.log('User verified as BarangayPresident for:', currentBarangay.value);
    
    return user;
  } catch (error) {
    console.error('Authentication/Authorization error:', error);
    authError.value = error.message;
    throw error;
  }
};

// Fetch available resources from request_history
const fetchAvailableResources = async () => {
  isLoading.value = true;
  fetchError.value = null;
  
  try {
    // First check authentication and get barangay
    await checkAuthenticationAndBarangay();
    
    console.log('Fetching resources for barangay:', currentBarangay.value);
    
    const requestHistoryCollection = collection(db, 'request_history');
    const q = query(
      requestHistoryCollection,
      where('barangay', '==', currentBarangay.value),
      where('status', '==', 'Approved')
    );
    
    console.log('Query created, executing...');
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log('Query executed, documents found:', querySnapshot.size);
      
      const resources = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        console.log('Document data:', data);
        
        // Process each requested item as a separate available resource
        if (data.requestedItems && Array.isArray(data.requestedItems)) {
          data.requestedItems.forEach((item, index) => {
            // Calculate remaining quantity by checking member_history
            // For now, we'll just use the original quantity
            resources.push({
              id: `${doc.id}-${index}`,
              requestId: doc.id,
              resourceName: item.resourceName,
              resourceType: item.resourceType,
              quantity: parseFloat(item.quantity) || 0,
              remainingQuantity: parseFloat(item.quantity) || 0, // Will be updated later
              unit: item.unit || '',
              requestDate: data.requestDate,
              status: data.status
            });
          });
        }
      });
      
      console.log('Resources processed:', resources.length);
      
      // Update remaining quantities based on member_history
      await updateRemainingQuantities(resources);
      
      availableResources.value = resources;
      filterAvailableResources();
      
      // Update stats
      updateStats();
      
      isLoading.value = false;
    }, (error) => {
      console.error('Error in onSnapshot:', error);
      fetchError.value = `Failed to load resources: ${error.message}. Please check your permissions and try again.`;
      isLoading.value = false;
    });
    
    // Store unsubscribe function for cleanup
    return unsubscribe;
  } catch (error) {
    console.error('Error fetching available resources:', error);
    fetchError.value = `Failed to load resources: ${error.message}. Please check your permissions and try again.`;
    isLoading.value = false;
  }
};

// Update remaining quantities based on member_history
const updateRemainingQuantities = async (resources) => {
  try {
    const memberHistoryCollection = collection(db, 'Member_history');
    const q = query(
      memberHistoryCollection,
      where('barangay', '==', currentBarangay.value)
    );
    
    const querySnapshot = await getDocs(q);
    const distributedResources = {};
    
    // Calculate total distributed quantities for each resource
    querySnapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.resources && Array.isArray(data.resources)) {
        data.resources.forEach(item => {
          const resourceKey = `${item.requestId}-${item.resourceName}`;
          
          if (!distributedResources[resourceKey]) {
            distributedResources[resourceKey] = 0;
          }
          
          distributedResources[resourceKey] += parseFloat(item.quantity) || 0;
        });
      }
    });
    
    // Update remaining quantities
    resources.forEach(resource => {
      const resourceKey = `${resource.requestId}-${resource.resourceName}`;
      const distributedQuantity = distributedResources[resourceKey] || 0;
      resource.remainingQuantity = Math.max(0, resource.quantity - distributedQuantity);
    });
  } catch (error) {
    console.error('Error updating remaining quantities:', error);
  }
};

// Update stats
const updateStats = () => {
  // Total resources
  const totalResources = availableResources.value.reduce((sum, resource) => sum + resource.remainingQuantity, 0);
  stats.value[0].value = totalResources.toFixed(0);
  
  // Resource types
  const uniqueTypes = new Set(availableResources.value.map(resource => resource.resourceType));
  stats.value[1].value = uniqueTypes.size.toString();
  
  // Distributions and members served will be updated when loading history
};

// Filter available resources
const filterAvailableResources = () => {
  const search = searchQuery.value.toLowerCase();
  
  filteredAvailableResources.value = availableResources.value.filter(resource => {
    const matchesSearch = 
      resource.resourceName.toLowerCase().includes(search) ||
      resource.resourceType.toLowerCase().includes(search);
    
    const matchesType = !typeFilter.value || resource.resourceType === typeFilter.value;
    
    return matchesSearch && matchesType;
  });
  
  sortAvailableResources(sortField.value);
};

// Sort available resources
const sortAvailableResources = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  
  filteredAvailableResources.value.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle date fields
    if (field === 'requestDate') {
      if (valueA instanceof Timestamp) valueA = valueA.toDate();
      if (valueB instanceof Timestamp) valueB = valueB.toDate();
      if (valueA.seconds) valueA = new Date(valueA.seconds * 1000);
      if (valueB.seconds) valueB = new Date(valueB.seconds * 1000);
      if (typeof valueA === 'string') valueA = new Date(valueA);
      if (typeof valueB === 'string') valueB = new Date(valueB);
    }
    
    // Handle numeric fields
    if (field === 'quantity' || field === 'remainingQuantity') {
      valueA = parseFloat(valueA) || 0;
      valueB = parseFloat(valueB) || 0;
    }
    
    if (sortDirection.value === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Get resource by ID
const getResourceById = (id) => {
  return availableResources.value.find(resource => resource.id === id);
};

// Get max quantity for a resource
const getMaxQuantity = (resourceId) => {
  const resource = getResourceById(resourceId);
  return resource ? resource.remainingQuantity : 0;
};

// Add resource item to form
const addResourceItem = () => {
  memberResourceForm.value.resources.push({ resourceId: '', quantity: 1 });
};

// Remove resource item from form
const removeResourceItem = (index) => {
  if (memberResourceForm.value.resources.length > 1) {
    memberResourceForm.value.resources.splice(index, 1);
  }
};

// Update resource details when selection changes
const updateResourceDetails = (index) => {
  const item = memberResourceForm.value.resources[index];
  const resource = getResourceById(item.resourceId);
  
  if (resource && item.quantity > resource.remainingQuantity) {
    item.quantity = resource.remainingQuantity;
  }
};

// Reset member resource form
const resetMemberResourceForm = () => {
  memberResourceForm.value = {
    memberName: '',
    memberID: '',
    contactNumber: '',
    address: '',
    resources: [{ resourceId: '', quantity: 1 }],
    purpose: '',
    notes: ''
  };
};

// Submit member resource form
const submitMemberResourceForm = async () => {
  if (!isValidMemberForm.value) {
    showNotification('Please fill in all required fields correctly', 'error');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Prepare resources data
    const resources = memberResourceForm.value.resources.map(item => {
      const resource = getResourceById(item.resourceId);
      return {
        requestId: resource.requestId,
        resourceId: item.resourceId,
        resourceName: resource.resourceName,
        resourceType: resource.resourceType,
        quantity: item.quantity,
        unit: resource.unit
      };
    });
    
    // Create distribution record
    const memberHistoryCollection = collection(db, 'Member_history');
    await addDoc(memberHistoryCollection, {
      barangay: currentBarangay.value,
      memberName: memberResourceForm.value.memberName,
      memberID: memberResourceForm.value.memberID,
      contactNumber: memberResourceForm.value.contactNumber,
      address: memberResourceForm.value.address,
      resources: resources,
      purpose: memberResourceForm.value.purpose,
      notes: memberResourceForm.value.notes,
      distributionDate: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    showNotification('Resources successfully sent to member', 'success');
    resetMemberResourceForm();
    
    // Refresh available resources
    await fetchAvailableResources();
    
    // Switch to history tab
    activeTab.value = 'history';
    await loadMemberHistory();
  } catch (error) {
    console.error('Error sending resources to member:', error);
    showNotification('Failed to send resources to member', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Load member requests from user_history
const loadMemberRequests = async () => {
  isLoadingMemberRequests.value = true;
  
  try {
    // Ensure we have the current barangay
    if (!currentBarangay.value) {
      await checkAuthenticationAndBarangay();
    }
    
    const userHistoryCollection = collection(db, 'user_history');
    const q = query(
      userHistoryCollection,
      where('barangay', '==', currentBarangay.value)
    );
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = [];
      
      querySnapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Member requests loaded:', requests.length);
      memberRequests.value = requests;
      filterMemberRequests();
      
      isLoadingMemberRequests.value = false;
    }, (error) => {
      console.error('Error loading member requests:', error);
      showNotification('Failed to load member requests', 'error');
      isLoadingMemberRequests.value = false;
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error loading member requests:', error);
    showNotification('Failed to load member requests', 'error');
    isLoadingMemberRequests.value = false;
  }
};

// Filter member requests
const filterMemberRequests = () => {
  const search = memberRequestSearchQuery.value.toLowerCase();
  
  filteredMemberRequests.value = memberRequests.value.filter(request => {
    const matchesSearch = 
      (request.userName && request.userName.toLowerCase().includes(search)) ||
      (request.referenceCode && request.referenceCode.toLowerCase().includes(search)) ||
      (request.reason && request.reason.toLowerCase().includes(search)) ||
      (request.requestedItems && request.requestedItems.some(item => 
        item.resourceName.toLowerCase().includes(search) ||
        item.resourceType.toLowerCase().includes(search)
      ));
    
    const matchesStatus = !memberRequestStatusFilter.value || request.status === memberRequestStatusFilter.value;
    
    return matchesSearch && matchesStatus;
  });
  
  sortMemberRequests(memberRequestSortField.value);
};

// Sort member requests
const sortMemberRequests = (field) => {
  if (memberRequestSortField.value === field) {
    memberRequestSortDirection.value = memberRequestSortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    memberRequestSortField.value = field;
    memberRequestSortDirection.value = 'desc';
  }
  
  filteredMemberRequests.value.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle date fields
    if (field === 'requestDate') {
      if (valueA instanceof Timestamp) valueA = valueA.toDate();
      if (valueB instanceof Timestamp) valueB = valueB.toDate();
      if (valueA.seconds) valueA = new Date(valueA.seconds * 1000);
      if (valueB.seconds) valueB = new Date(valueB.seconds * 1000);
      if (typeof valueA === 'string') valueA = new Date(valueA);
      if (typeof valueB === 'string') valueB = new Date(valueB);
    }
    
    if (memberRequestSortDirection.value === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// View member request details
const viewMemberRequestDetails = (request) => {
  selectedMemberRequest.value = request;
  showMemberRequestModal.value = true;
};

// Update request status
const updateRequestStatus = async (request, newStatus) => {
  try {
    const requestRef = doc(db, 'user_history', request.id);
    await updateDoc(requestRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    // Update local data
    if (request === selectedMemberRequest.value) {
      selectedMemberRequest.value.status = newStatus;
    }
    
    // Update in the list
    const index = memberRequests.value.findIndex(r => r.id === request.id);
    if (index !== -1) {
      memberRequests.value[index].status = newStatus;
    }
    
    // Re-filter the list
    filterMemberRequests();
    
    // Close modal if open
    if (showMemberRequestModal.value) {
      showMemberRequestModal.value = false;
    }
    
    showNotification(`Request ${newStatus.toLowerCase()} successfully`, 'success');
  } catch (error) {
    console.error('Error updating request status:', error);
    showNotification('Failed to update request status', 'error');
  }
};

// Load member history
const loadMemberHistory = async () => {
  isLoadingHistory.value = true;
  
  try {
    // Ensure we have the current barangay
    if (!currentBarangay.value) {
      await checkAuthenticationAndBarangay();
    }
    
    const memberHistoryCollection = collection(db, 'Member_history');
    const q = query(
      memberHistoryCollection,
      where('barangay', '==', currentBarangay.value),
      orderBy('distributionDate', 'desc')
    );
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history = [];
      
      querySnapshot.forEach(doc => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      memberHistory.value = history;
      filterHistory();
      
      // Update stats
      stats.value[2].value = history.length.toString();
      
      // Count unique members served
      const uniqueMembers = new Set(history.map(item => item.memberID));
      stats.value[3].value = uniqueMembers.size.toString();
      
      isLoadingHistory.value = false;
    }, (error) => {
      console.error('Error loading member history:', error);
      showNotification('Failed to load distribution history', 'error');
      isLoadingHistory.value = false;
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error loading member history:', error);
    showNotification('Failed to load distribution history', 'error');
    isLoadingHistory.value = false;
  }
};

// Filter history
const filterHistory = () => {
  const search = historySearchQuery.value.toLowerCase();
  
  filteredHistory.value = memberHistory.value.filter(history => {
    const matchesSearch = 
      history.memberName.toLowerCase().includes(search) ||
      history.memberID.toLowerCase().includes(search) ||
      (history.purpose && history.purpose.toLowerCase().includes(search));
    
    // Check if any resource matches the type filter
    const matchesType = !historyTypeFilter.value || 
      (history.resources && history.resources.some(
        resource => resource.resourceType === historyTypeFilter.value
      ));
    
    return matchesSearch && matchesType;
  });
  
  sortHistory(historySortField.value);
};

// Sort history
const sortHistory = (field) => {
  if (historySortField.value === field) {
    historySortDirection.value = historySortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    historySortField.value = field;
    historySortDirection.value = 'desc';
  }
  
  filteredHistory.value.sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle date fields
    if (field === 'distributionDate') {
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

// View history details
const viewHistoryDetails = (history) => {
  selectedHistory.value = history;
  showHistoryModal.value = true;
};

// Initialize
onMounted(async () => {
  try {
    await fetchAvailableResources();
    await loadMemberHistory();
    await loadMemberRequests();
  } catch (error) {
    console.error('Error initializing inventory system:', error);
    if (!authError.value) {
      showNotification('Failed to initialize inventory system. Please refresh the page.', 'error');
    }
  }
});

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'memberRequest') {
    loadMemberRequests();
  } else if (newTab === 'history') {
    loadMemberHistory();
  }
});
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

.notification.warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
}

/* Error Container */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #721c24;
  background-color: #f8d7da;
  border-radius: 8px;
  text-align: center;
}

.error-icon {
  margin-bottom: 1rem;
  color: #dc3545;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #1a2530;
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

.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Resource Type Badge */
.resource-type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
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

/* Member Resource Form */
.member-resource-form {
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

/* Resource List in History */
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resource-item {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-left: 3px solid;
  background-color: #f8f9fa;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-btn, .approve-btn, .reject-btn {
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

.approve-btn {
  color: #10B981;
}

.reject-btn {
  color: #EF4444;
}

.view-btn:hover, .approve-btn:hover, .reject-btn:hover {
  background-color: rgba(0,0,0,0.05);
}

.approve-btn-large, .reject-btn-large {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.approve-btn-large {
  background-color: #d4edda;
  color: #155724;
}

.approve-btn-large:hover {
  background-color: #c3e6cb;
}

.reject-btn-large {
  background-color: #f8d7da;
  color: #721c24;
}

.reject-btn-large:hover {
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

.status-actions {
  display: flex;
  gap: 0.5rem;
  margin-right: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item h3, .detail-item h4 {
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
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: left;
    padding: 0.5rem 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .status-actions {
    flex-direction: column;
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>