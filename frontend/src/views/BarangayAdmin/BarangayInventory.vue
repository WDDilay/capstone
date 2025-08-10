<template>
  <div class="inventory-system">
    <div class="main-content">
        
      <div v-if="notification.show" :class="`notification ${notification.type}`">
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">&times;</button>
      </div>
      
        
      <div v-if="authError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
        <span>{{ authError }}</span>
        <button @click="authError = null" class="text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
        
      <div v-if="currentBarangay" class="mb-4">
        <h1 class="page-title">{{ currentBarangay }} Resource Inventory</h1>
        <p class="text-sm text-gray-600">Managing resources for {{ currentBarangay }}</p>
      </div>
      
      
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
      
        
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'available' }]"
          @click="activeTab = 'available'"
        >
          <span class="tab-text">Available Resources</span>
          <span class="tab-text-short">Available</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'memberRequest' }]"
          @click="activeTab = 'memberRequest'; loadMemberRequests()"
        >
          <span class="tab-text">Member Request</span>
          <span class="tab-text-short">Requests</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'member' }]"
          @click="activeTab = 'member'"
        >
          <span class="tab-text">Member Resource</span>
          <span class="tab-text-short">Send</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'; loadMemberHistory()"
        >
          <span class="tab-text">History</span>
          <span class="tab-text-short">History</span>
        </button>
      </div>
      
       
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
           
          <div class="mobile-cards">
            <div v-if="filteredAvailableResources.length === 0" class="no-data-mobile">
              No resources available for this barangay.
            </div>
            <div v-for="(resource, index) in filteredAvailableResources" :key="index" class="mobile-card">
              <div class="mobile-card-header">
                <h3 class="mobile-card-title">{{ resource.resourceName }}</h3>
                <span 
                  class="resource-type-badge"
                  :style="`background-color: ${getResourceTypeColor(resource.resourceType, 0.2)}; color: ${getResourceTypeColor(resource.resourceType, 1)}`"
                >
                  {{ resource.resourceType }}
                </span>
              </div>
              <div class="mobile-card-content">
                <div class="mobile-card-row">
                  <span class="mobile-label">Available:</span>
                  <span class="mobile-value">{{ resource.remainingQuantity }} {{ resource.unit }}</span>
                </div>
                <div class="mobile-card-row">
                  <span class="mobile-label">Date Received:</span>
                  <span class="mobile-value">{{ formatDate(resource.requestDate) }}</span>
                </div>
                <div class="mobile-card-row">
                  <span class="mobile-label">Status:</span>
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
                </div>
              </div>
            </div>
          </div>
          
           
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
           
          <div class="mobile-cards">
            <div v-if="filteredMemberRequests.length === 0" class="no-data-mobile">
              No member requests found.
            </div>
            <div v-for="request in filteredMemberRequests" :key="request.id" class="mobile-card">
              <div class="mobile-card-header">
                <h3 class="mobile-card-title">{{ request.userName }}</h3>
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
              </div>
              <div class="mobile-card-content">
                <div class="mobile-card-row">
                  <span class="mobile-label">Date:</span>
                  <span class="mobile-value">{{ formatDate(request.requestDate) }}</span>
                </div>
                <div class="mobile-card-row">
                  <span class="mobile-label">Reference:</span>
                  <span class="mobile-value">{{ request.referenceCode }}</span>
                </div>
                <div class="mobile-card-row">
                  <span class="mobile-label">Items:</span>
                  <div class="mobile-resource-list">
                    <div 
                      v-for="(item, index) in request.requestedItems"
                      :key="index"
                      class="mobile-resource-item"
                      :style="`border-left-color: ${getResourceTypeColor(item.resourceType, 1)}`"
                    >
                      {{ item.resourceName }}: {{ item.quantity }} {{ item.unit }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-card-actions">
                <button @click="viewMemberRequestDetails(request)" class="mobile-action-btn view">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  View
                </button>
                <button 
                  v-if="request.status === 'Pending'"
                  @click="updateRequestStatus(request, 'Approved')"
                  class="mobile-action-btn approve"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Approve
                </button>
                <button 
                  v-if="request.status === 'Pending'"
                  @click="openRejectModal(request)"
                  class="mobile-action-btn reject"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Reject
                </button>
                <button 
                  v-if="request.status === 'Approved'"
                  @click="prefillMemberResourceForm(request)"
                  class="mobile-action-btn send"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m3 3 3 9-3 9 19-9Z"></path></svg>
                  Send
                </button>
              </div>
            </div>
          </div>
          
          
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
                      @click="openRejectModal(request)"
                      class="reject-btn"
                      title="Reject Request"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <button 
                      v-if="request.status === 'Approved'"
                      @click="prefillMemberResourceForm(request)"
                      class="send-btn"
                      title="Send Resources"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="m3 3 3 9-3 9 19-9Z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
       
      <div v-if="activeTab === 'member'" class="tab-content">
        <h2 class="section-title">Send Resources to Member</h2>
        
        <form @submit.prevent="submitMemberResourceForm" class="member-resource-form">
           
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
                <label for="referenceId">Reference ID <span class="required">*</span></label>
                <div class="reference-input-container">
                  <input 
                    id="referenceId"
                    v-model="memberResourceForm.referenceId"
                    type="text"
                    required
                    placeholder="Enter reference ID or select from approved requests"
                    class="form-input"
                    @input="searchMemberRequests"
                  >
                  <div v-if="memberRequestSuggestions.length > 0" class="suggestions-dropdown">
                    <div 
                      v-for="suggestion in memberRequestSuggestions"
                      :key="suggestion.id"
                      @click="selectMemberRequest(suggestion)"
                      class="suggestion-item"
                    >
                      <div class="suggestion-main">
                        <strong>{{ suggestion.referenceCode }}</strong> - {{ suggestion.userName }}
                      </div>
                      <div class="suggestion-sub">
                        {{ suggestion.requestedItems.length }} item(s) requested
                      </div>
                    </div>
                  </div>
                </div>
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
            
          <div class="mobile-cards">
            <div v-if="filteredHistory.length === 0" class="no-data-mobile">
              No distribution history found.
            </div>
            <div v-for="history in filteredHistory" :key="history.id" class="mobile-card">
              <div class="mobile-card-header">
                <h3 class="mobile-card-title">{{ history.memberName }}</h3>
                <span class="mobile-date">{{ formatDate(history.distributionDate) }}</span>
              </div>
              <div class="mobile-card-content">
                <div class="mobile-card-row">
                  <span class="mobile-label">Reference ID:</span>
                  <span class="mobile-value">{{ history.referenceId }}</span>
                </div>
                <div class="mobile-card-row">
                  <span class="mobile-label">Resources:</span>
                  <div class="mobile-resource-list">
                    <div 
                      v-for="(resource, index) in history.resources"
                      :key="index"
                      class="mobile-resource-item"
                      :style="`border-left-color: ${getResourceTypeColor(resource.resourceType, 1)}`"
                    >
                      {{ resource.resourceName }}: {{ resource.quantity }} {{ resource.unit }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="mobile-card-actions">
                <button @click="viewHistoryDetails(history)" class="mobile-action-btn view">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  View Details
                </button>
              </div>
            </div>
          </div>
          
           
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
                <th @click="sortHistory('referenceId')">
                  Reference ID
                  <span v-if="historySortField === 'referenceId'" class="sort-icon">
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
                <td>{{ history.referenceId }}</td>
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
                <h3>Reference ID</h3>
                <p>{{ selectedHistory.referenceId }}</p>
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
              <button @click="openRejectModal(selectedMemberRequest)" class="reject-btn-large">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Reject Request
              </button>
            </div>
            <button @click="showMemberRequestModal = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>
      
        
      <div v-if="showRejectModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Reject Resource Request</h2>
            <button @click="closeRejectModal" class="close-modal">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="request-summary" v-if="requestToReject">
              <h3>Request Summary</h3>
              <div class="summary-details">
                <div class="detail-item">
                  <span class="label">Member:</span>
                  <span class="value">{{ requestToReject.userName || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Reference Code:</span>
                  <span class="value">{{ requestToReject.referenceCode }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Request Date:</span>
                  <span class="value">{{ formatDate(requestToReject.requestDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Urgency:</span>
                  <span class="value">{{ requestToReject.urgency }}</span>
                </div>
              </div>
              
              <div class="requested-resources-summary">
                <h4>Requested Resources:</h4>
                <ul>
                  <li v-for="(item, index) in requestToReject.requestedItems" :key="index">
                    {{ item.resourceName }} ({{ item.quantity }} {{ item.unit }}) - {{ item.resourceType }}
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="rejection-form">
              <h3>Rejection Reason <span class="required">*</span></h3>
              <p class="form-description">
                Please provide a clear reason for rejecting this request. This will help the member understand the decision and potentially resubmit with corrections.
              </p>
              
              <div class="form-group">
                <label for="rejectionCategory">Rejection Category</label>
                <select 
                  id="rejectionCategory"
                  v-model="rejectionForm.category"
                  class="form-select"
                  @change="updateRejectionReason"
                >
                  <option value="">Select a category</option>
                  <option value="insufficient-documentation">Insufficient Documentation</option>
                  <option value="duplicate-request">Duplicate Request</option>
                  <option value="ineligible-resource">Ineligible for Requested Resource</option>
                  <option value="resource-unavailable">Resource Currently Unavailable</option>
                  <option value="incomplete-information">Incomplete Information</option>
                  <option value="policy-violation">Policy Violation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="rejectionReason">Detailed Reason <span class="required">*</span></label>
                <textarea 
                  id="rejectionReason"
                  v-model="rejectionForm.reason"
                  placeholder="Please provide a detailed explanation for the rejection..."
                  rows="4"
                  class="form-textarea"
                  required
                ></textarea>
              </div>
              
              <div class="form-group">
                <label for="suggestions">Suggestions for Resubmission (Optional)</label>
                <textarea 
                  id="suggestions"
                  v-model="rejectionForm.suggestions"
                  placeholder="Provide suggestions on how the member can improve their request for future submissions..."
                  rows="3"
                  class="form-textarea"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox"
                    v-model="rejectionForm.allowResubmission"
                    class="form-checkbox"
                  >
                  Allow member to resubmit this request after addressing the issues
                </label>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              @click="confirmRejectRequest"
              class="confirm-reject-btn"
              :disabled="!rejectionForm.reason.trim() || isProcessingRejection"
            >
              {{ isProcessingRejection ? 'Processing...' : 'Confirm Rejection' }}
            </button>
            <button @click="closeRejectModal" class="cancel-btn" :disabled="isProcessingRejection">
              Cancel
            </button>
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

// Member Resource Form - Updated with referenceId
const memberResourceForm = ref({
  memberName: '',
  referenceId: '', // Changed from memberID
  contactNumber: '',
  address: '',
  resources: [{ resourceId: '', quantity: 1 }],
  purpose: '',
  notes: ''
});

// Member request suggestions for autocomplete
const memberRequestSuggestions = ref([]);

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

// ADD THESE NEW REACTIVE VARIABLES FOR REJECTION MODAL
const showRejectModal = ref(false);
const requestToReject = ref(null);
const isProcessingRejection = ref(false);

// Rejection form
const rejectionForm = ref({
  category: '',
  reason: '',
  suggestions: '',
  allowResubmission: true
});

// Predefined rejection reasons based on category
const rejectionReasons = {
  'insufficient-documentation': 'The request lacks sufficient supporting documentation to process.',
  'duplicate-request': 'A similar request has already been submitted and is being processed.',
  'ineligible-resource': 'The requested resource is not available for your eligibility category.',
  'resource-unavailable': 'The requested resource is currently unavailable in our inventory.',
  'incomplete-information': 'The request contains incomplete or missing required information.',
  'policy-violation': 'The request does not comply with our resource allocation policies.',
  'other': ''
};

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
  if (!memberResourceForm.value.memberName || !memberResourceForm.value.referenceId || !memberResourceForm.value.purpose) {
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

// ADD THESE NEW METHODS FOR REJECTION MODAL
// Update rejection reason based on category
const updateRejectionReason = () => {
  if (rejectionForm.value.category && rejectionReasons[rejectionForm.value.category]) {
    rejectionForm.value.reason = rejectionReasons[rejectionForm.value.category];
  }
};

// Open reject modal
const openRejectModal = (request) => {
  requestToReject.value = request;
  showRejectModal.value = true;
  
  // Reset form
  rejectionForm.value.category = '';
  rejectionForm.value.reason = '';
  rejectionForm.value.suggestions = '';
  rejectionForm.value.allowResubmission = true;
};

// Close reject modal
const closeRejectModal = () => {
  showRejectModal.value = false;
  requestToReject.value = null;
  
  // Reset form
  rejectionForm.value.category = '';
  rejectionForm.value.reason = '';
  rejectionForm.value.suggestions = '';
  rejectionForm.value.allowResubmission = true;
};

// Confirm reject request
const confirmRejectRequest = async () => {
  if (!rejectionForm.value.reason.trim()) {
    showNotification('Please provide a reason for rejection', 'error');
    return;
  }

  isProcessingRejection.value = true;

  try {
    // Update the request in user_history collection
    const requestRef = doc(db, 'user_history', requestToReject.value.id);
    
    await updateDoc(requestRef, {
      status: 'Rejected',
      rejectionReason: rejectionForm.value.reason.trim(),
      rejectionCategory: rejectionForm.value.category,
      rejectionSuggestions: rejectionForm.value.suggestions.trim(),
      allowResubmission: rejectionForm.value.allowResubmission,
      rejectedBy: currentBarangay.value + ' Admin',
      rejectedAt: serverTimestamp(),
      adminFeedback: `Rejected: ${rejectionForm.value.reason.trim()}${rejectionForm.value.suggestions ? '\n\nSuggestions: ' + rejectionForm.value.suggestions.trim() : ''}`,
      updatedAt: serverTimestamp()
    });

    showNotification('Request has been rejected with detailed reason', 'success');
    closeRejectModal();
    
    // Close member request modal if open
    if (showMemberRequestModal.value) {
      showMemberRequestModal.value = false;
    }
    
    // Refresh the requests list
    await loadMemberRequests();
    
  } catch (error) {
    console.error('Error rejecting request:', error);
    showNotification('Failed to reject request: ' + error.message, 'error');
  } finally {
    isProcessingRejection.value = false;
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

// Search member requests for autocomplete
const searchMemberRequests = () => {
  const searchTerm = memberResourceForm.value.referenceId.toLowerCase();
  
  if (searchTerm.length < 2) {
    memberRequestSuggestions.value = [];
    return;
  }
  
  memberRequestSuggestions.value = memberRequests.value.filter(request => 
    request.status === 'Approved' &&
    (request.referenceCode.toLowerCase().includes(searchTerm) ||
     request.userName.toLowerCase().includes(searchTerm))
  ).slice(0, 5); // Limit to 5 suggestions
};

// Select member request from suggestions
const selectMemberRequest = (request) => {
  memberResourceForm.value.referenceId = request.referenceCode;
  memberResourceForm.value.memberName = request.userName;
  memberResourceForm.value.contactNumber = request.contactNumber || '';
  memberResourceForm.value.address = request.deliveryAddress || '';
  
  // Clear suggestions
  memberRequestSuggestions.value = [];
  
  // Optionally prefill resources based on the request
  if (request.requestedItems && request.requestedItems.length > 0) {
    memberResourceForm.value.resources = request.requestedItems.map(item => ({
      resourceId: '', // Will need to be matched manually
      quantity: item.quantity
    }));
  }
};

// Prefill member resource form from approved request
const prefillMemberResourceForm = (request) => {
  memberResourceForm.value.memberName = request.userName;
  memberResourceForm.value.referenceId = request.referenceCode;
  memberResourceForm.value.contactNumber = request.contactNumber || '';
  memberResourceForm.value.address = request.deliveryAddress || '';
  memberResourceForm.value.purpose = `Distribution for approved request: ${request.referenceCode}`;
  
  // Try to match requested items with available resources
  const matchedResources = [];
  
  if (request.requestedItems && request.requestedItems.length > 0) {
    request.requestedItems.forEach(requestedItem => {
      // Find matching available resource
      const matchingResource = availableResources.value.find(resource => 
        resource.resourceName.toLowerCase() === requestedItem.resourceName.toLowerCase() &&
        resource.resourceType === requestedItem.resourceType &&
        resource.remainingQuantity >= requestedItem.quantity
      );
      
      if (matchingResource) {
        matchedResources.push({
          resourceId: matchingResource.id,
          quantity: Math.min(requestedItem.quantity, matchingResource.remainingQuantity)
        });
      } else {
        // Add empty resource slot if no match found
        matchedResources.push({
          resourceId: '',
          quantity: requestedItem.quantity
        });
      }
    });
  }
  
  if (matchedResources.length > 0) {
    memberResourceForm.value.resources = matchedResources;
  }
  
  // Switch to member resource tab
  activeTab.value = 'member';
  
  showNotification('Form prefilled with approved request data. Please review and adjust as needed.', 'info');
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
    const memberHistoryCollection = collection(db, 'member_history'); // Updated collection name
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
  const resource = getResourceById(item.resource);
  
  if (resource) {
    // Ensure quantity doesn't exceed available
    if (item.quantity > resource.remainingQuantity) {
      item.quantity = resource.remainingQuantity;
    }
  }
};

// Reset member resource form
const resetMemberResourceForm = () => {
  memberResourceForm.value = {
    memberName: '',
    referenceId: '',
    contactNumber: '',
    address: '',
    resources: [{ resourceId: '', quantity: 1 }],
    purpose: '',
    notes: ''
  };
  memberRequestSuggestions.value = [];
};

// Submit member resource form
const submitMemberResourceForm = async () => {
  if (!isValidMemberForm.value) {
    showNotification('Please fill in all required fields correctly', 'error');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Prepare resource data with additional details
    const resourcesWithDetails = memberResourceForm.value.resources.map(item => {
      const resource = getResourceById(item.resourceId);
      return {
        requestId: resource.requestId,
        resourceName: resource.resourceName,
        resourceType: resource.resourceType,
        quantity: item.quantity,
        unit: resource.unit
      };
    });
    
    // Add to member_history collection
    const memberHistoryCollection = collection(db, 'member_history');
    await addDoc(memberHistoryCollection, {
      memberName: memberResourceForm.value.memberName,
      referenceId: memberResourceForm.value.referenceId,
      contactNumber: memberResourceForm.value.contactNumber,
      address: memberResourceForm.value.address,
      resources: resourcesWithDetails,
      purpose: memberResourceForm.value.purpose,
      notes: memberResourceForm.value.notes,
      barangay: currentBarangay.value,
      distributionDate: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    showNotification('Resources sent to member successfully', 'success');
    resetMemberResourceForm();
    
    // Refresh available resources to update remaining quantities
    await fetchAvailableResources();
    
    // Switch to history tab
    activeTab.value = 'history';
    await loadMemberHistory();
  } catch (error) {
    console.error('Error submitting member resource form:', error);
    showNotification('Failed to send resources: ' + error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Load member requests
const loadMemberRequests = async () => {
  isLoadingMemberRequests.value = true;
  
  try {
    await checkAuthenticationAndBarangay();
    
    const userHistoryCollection = collection(db, 'user_history');
    const q = query(
      userHistoryCollection,
      where('barangay', '==', currentBarangay.value),
      orderBy('requestDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests = [];
    
    querySnapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    memberRequests.value = requests;
    filterMemberRequests();
    
    isLoadingMemberRequests.value = false;
  } catch (error) {
    console.error('Error loading member requests:', error);
    showNotification('Failed to load member requests: ' + error.message, 'error');
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
      request.requestedItems.some(item => 
        item.resourceName.toLowerCase().includes(search) ||
        item.resourceType.toLowerCase().includes(search)
      );
    
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
    memberRequestSortDirection.value = 'asc';
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
    
    filterMemberRequests();
    
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
    await checkAuthenticationAndBarangay();
    
    const memberHistoryCollection = collection(db, 'member_history');
    const q = query(
      memberHistoryCollection,
      where('barangay', '==', currentBarangay.value),
      orderBy('distributionDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
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
    const uniqueMembers = new Set(history.map(h => h.referenceId));
    stats.value[3].value = uniqueMembers.size.toString();
    
    isLoadingHistory.value = false;
  } catch (error) {
    console.error('Error loading member history:', error);
    showNotification('Failed to load history: ' + error.message, 'error');
    isLoadingHistory.value = false;
  }
};

// Filter history
const filterHistory = () => {
  const search = historySearchQuery.value.toLowerCase();
  
  filteredHistory.value = memberHistory.value.filter(history => {
    const matchesSearch = 
      history.memberName.toLowerCase().includes(search) ||
      history.referenceId.toLowerCase().includes(search) ||
      history.resources.some(resource => 
        resource.resourceName.toLowerCase().includes(search) ||
        resource.resourceType.toLowerCase().includes(search)
      );
    
    const matchesType = !historyTypeFilter.value || 
      history.resources.some(resource => resource.resourceType === historyTypeFilter.value);
    
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
    historySortDirection.value = 'asc';
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

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'memberRequest') {
    loadMemberRequests();
  } else if (newTab === 'history') {
    loadMemberHistory();
  }
});

// Initialize
onMounted(async () => {
  try {
    await fetchAvailableResources();
  } catch (error) {
    console.error('Error initializing inventory system:', error);
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
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

/* Stat Cards */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
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
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.25rem;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

/* Tabs */
.tabs {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1.5rem;
  gap: 0.25rem;
}

.tab-btn {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #2c3e50;
  border-bottom-color: #2c3e50;
}

.tab-text {
  display: block;
}

.tab-text-short {
  display: none;
}

.tab-content {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* List Controls */
.list-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-box, .filter-box {
  flex: 1;
  min-width: 200px;
}

.search-box input, .filter-box select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
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

/* Error Container */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #666;
}

.error-icon {
  margin-bottom: 1rem;
  color: #ef4444;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background-color: #1a2530;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
}

.mobile-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.mobile-card-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.mobile-card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
  flex: 1;
}

.mobile-date {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

.mobile-card-content {
  padding: 1rem;
}

.mobile-card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.mobile-card-row:last-child {
  margin-bottom: 0;
}

.mobile-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

.mobile-value {
  font-size: 0.875rem;
  color: #1f2937;
  text-align: right;
  flex: 1;
}

.mobile-resource-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.mobile-resource-item {
  padding: 0.25rem 0.5rem;
  background-color: #f9fafb;
  border-radius: 4px;
  border-left: 3px solid;
  font-size: 0.75rem;
  color: #374151;
}

.mobile-card-actions {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mobile-action-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 36px;
}

.mobile-action-btn.view {
  background-color: #f3f4f6;
  color: #374151;
}

.mobile-action-btn.approve {
  background-color: #d1fae5;
  color: #065f46;
}

.mobile-action-btn.reject {
  background-color: #fee2e2;
  color: #991b1b;
}

.mobile-action-btn.send {
  background-color: #dbeafe;
  color: #1e40af;
}

.no-data-mobile {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 2rem 1rem;
}

/* Desktop Tables */
.resource-table-container {
  overflow-x: auto;
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.resource-table th, .resource-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.resource-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.resource-table th:hover {
  background-color: #e9ecef;
}

.sort-icon {
  margin-left: 0.5rem;
  font-size: 0.75rem;
}

.resource-table tbody tr:hover {
  background-color: #f8f9fa;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}

/* Status Badges */
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

.resource-type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Resource Lists */
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.resource-item {
  padding: 0.25rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid;
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.view-btn, .approve-btn, .reject-btn, .send-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.view-btn {
  background-color: #e9ecef;
  color: #495057;
}

.view-btn:hover {
  background-color: #dee2e6;
}

.approve-btn {
  background-color: #d4edda;
  color: #155724;
}

.approve-btn:hover {
  background-color: #c3e6cb;
}

.reject-btn {
  background-color: #f8d7da;
  color: #721c24;
}

.reject-btn:hover {
  background-color: #f5c6cb;
}

.send-btn {
  background-color: #d1ecf1;
  color: #0c5460;
}

.send-btn:hover {
  background-color: #bee5eb;
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
.member-resource-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
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
  font-size: 0.875rem;
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
  font-size: 0.875rem;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: #2c3e50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Reference Input with Suggestions */
.reference-input-container {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.suggestion-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-main {
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.suggestion-sub {
  font-size: 0.75rem;
  color: #666;
}

/* Resource Selection */
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
  grid-template-columns: 2fr 1fr auto auto;
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
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.unit-label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.unit-value {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.875rem;
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
}

.info-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  display: inline-block;
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
  min-height: 44px;
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
  min-height: 44px;
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
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
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
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  flex-wrap: wrap;
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

.status-actions {
  display: flex;
  gap: 0.5rem;
  margin-right: auto;
}

.approve-btn-large, .reject-btn-large {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  min-height: 40px;
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

/* Rejection Modal Styles */
.request-summary {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.request-summary h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.summary-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: 500;
  color: #6b7280;
}

.value {
  color: #1f2937;
}

.requested-resources-summary h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.requested-resources-summary ul {
  margin: 0;
  padding-left: 1.5rem;
}

.requested-resources-summary li {
  margin-bottom: 0.25rem;
  color: #4b5563;
}

.rejection-form h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.form-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal !important;
}

.form-checkbox {
  margin-top: 0.125rem;
}

.confirm-reject-btn {
  background-color: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 44px;
}

.confirm-reject-btn:hover:not(:disabled) {
  background-color: #dc2626;
}

.confirm-reject-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .stat-cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  
  .tab-content {
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .stat-cards {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
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
    font-size: 0.7rem;
  }
  
  .tabs {
    gap: 0;
  }
  
  .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .tab-text {
    display: none;
  }
  
  .tab-text-short {
    display: block;
  }
  
  .tab-content {
    padding: 0.5rem;
  }
  
  .list-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-box, .filter-box {
    min-width: auto;
  }
  
  /* Show mobile cards, hide desktop table */
  .mobile-cards {
    display: block;
  }
  
  .resource-table {
    display: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-selection {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .remove-btn {
    align-self: flex-start;
    width: 100%;
    height: 40px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .status-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .approve-btn-large, .reject-btn-large {
    width: 100%;
    justify-content: center;
  }
  
  .modal {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header, .modal-body, .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .summary-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.25rem;
  }
  
  .stat-cards {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 0.5rem;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
  }
  
  .stat-value {
    font-size: 1.1rem;
  }
  
  .tab-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .mobile-card-header {
    padding: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .mobile-card-content {
    padding: 0.75rem;
  }
  
  .mobile-card-actions {
    padding: 0.75rem;
    flex-direction: column;
  }
  
  .mobile-action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .form-section {
    padding: 0.75rem;
  }
  
  .modal-header h2 {
    font-size: 1.1rem;
  }
}

/* Print Styles */
@media print {
  .tabs, .list-controls, .form-actions, .modal-footer, .mobile-card-actions {
    display: none !important;
  }
  
  .main-content {
    max-width: none;
    padding: 0;
  }
  
  .tab-content {
    box-shadow: none;
    border: 1px solid #ddd;
  }
  
  .mobile-cards {
    display: none !important;
  }
  
  .resource-table {
    display: table !important;
  }
}
</style>
