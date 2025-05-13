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
            <i class="fas fa-money-bill"></i>
          </div>
          <div class="stat-info">
            <h3>{{ resourceStats.financial }}</h3>
            <p>Financial Resources</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon medical">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="stat-info">
            <h3>{{ resourceStats.medical }}</h3>
            <p>Medical Resources</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon educational">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="stat-info">
            <h3>{{ resourceStats.educational }}</h3>
            <p>Educational Resources</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon other">
            <i class="fas fa-box"></i>
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
                <th>Barangays</th>
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
                <td>
                  <span class="barangay-count">{{ res.barangaysCovered.length }} barangays</span>
                  <div class="barangay-tooltip">
                    {{ res.barangaysCovered.join(', ') }}
                  </div>
                </td>
                <td>{{ formatDate(res.dateAdded) }}</td>
                <td class="actions">
                  <button @click="viewResourceDetails(res)" class="view-btn" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="editResource(res)" class="edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="confirmDelete(res.id)" class="delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
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

          <div class="form-group barangay-selection">
            <label>Barangays Covered:</label>
            <div class="barangay-grid">
              <div v-for="brgy in barangayList" :key="brgy" class="barangay-checkbox">
                <input 
                  type="checkbox" 
                  :id="'brgy-' + brgy" 
                  :value="brgy" 
                  v-model="resourceForm.barangaysCovered"
                >
                <label :for="'brgy-' + brgy">{{ brgy }}</label>
              </div>
            </div>
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
              <h3>Barangays Covered</h3>
              <div class="barangay-tags">
                <span v-for="brgy in selectedResource.barangaysCovered" :key="brgy" class="barangay-tag">
                  {{ brgy }}
                </span>
              </div>
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

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content delete-modal">
          <div class="modal-header">
            <h2>Confirm Deletion</h2>
            <button @click="showDeleteModal = false" class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this resource? This action cannot be undone.</p>
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
import { ref, onMounted } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '@/services/firebase' // Adjust the path to your firebase config

// Firestore reference
const resourceCollection = collection(db, 'spfresource')

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
  barangaysCovered: []
})

const editingId = ref(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const resources = ref([])
const filteredResources = ref([])
const searchQuery = ref('')
const typeFilter = ref('')
const sortField = ref('name')
const sortDirection = ref('asc')
const showDetailsModal = ref(false)
const selectedResource = ref(null)
const showDeleteModal = ref(false)
const resourceToDeleteId = ref(null)
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
const resourceStats = ref({ total: 0, typeCounts: {}, barangayCounts: {} })

// Notification function
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => (notification.value.show = false), 3000)
}

// Format Firestore timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    return new Date(timestamp.seconds * 1000).toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
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
    const matchesSearch = r.name.toLowerCase().includes(search) ||
                          r.type.toLowerCase().includes(search) ||
                          r.providerOrganization.toLowerCase().includes(search)
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
    barangaysCovered: []
  }
}

// Edit
const editResource = (resource) => {
  editingId.value = resource.id
  resourceForm.value = { ...resource }
  activeTab.value = 'add'
}

// View
const viewResourceDetails = (resource) => {
  selectedResource.value = resource
  showDetailsModal.value = true
}

// Confirm delete
const confirmDelete = (id) => {
  resourceToDeleteId.value = id
  showDeleteModal.value = true
}

// Delete
const deleteResource = async () => {
  try {
    await deleteDoc(doc(db, 'spfresource', resourceToDeleteId.value))
    showNotification('Resource deleted successfully!')
    await getResources()
  } catch (error) {
    console.error('Delete error:', error)
    showNotification('Failed to delete resource.', 'error')
  } finally {
    showDeleteModal.value = false
  }
}

// Count stats
const calculateStats = () => {
  const stats = {
    total: resources.value.length,
    typeCounts: {},
    barangayCounts: {}
  }

  for (const r of resources.value) {
    stats.typeCounts[r.type] = (stats.typeCounts[r.type] || 0) + 1
    for (const brgy of r.barangaysCovered || []) {
      stats.barangayCounts[brgy] = (stats.barangayCounts[brgy] || 0) + 1
    }
  }

  resourceStats.value = stats
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

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.barangay-count {
  cursor: pointer;
  color: #2196f3;
  position: relative;
}

.barangay-tooltip {
  display: none;
  position: absolute;
  background-color: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  z-index: 10;
  max-width: 300px;
  font-size: 0.75rem;
}

td:hover .barangay-tooltip {
  display: block;
}

/* Form Styles */
.form-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
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

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.barangay-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}

.barangay-checkbox {
  display: flex;
  align-items: center;
}

.barangay-checkbox input {
  margin-right: 0.5rem;
  width: auto;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
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
  max-width: 400px;
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

.barangay-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.barangay-tag {
  background-color: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.delete-confirm-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.delete-confirm-btn:hover {
  background-color: #d32f2f;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .list-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
