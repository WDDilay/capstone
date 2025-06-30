<script setup>
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '@/services/firebase'; // Ensure Firebase is configured correctly
import { collection, getDocs, doc, getDoc, Timestamp, query, where, onSnapshot } from 'firebase/firestore';
import { 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  X
} from 'lucide-vue-next';

// State
const applications = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;
const showViewModal = ref(false);
const selectedApplication = ref(null);
const error = ref(null);
const currentBarangay = ref('');

// Sorting
const sortOption = ref('date-desc');
const sortField = ref('createdAt');
const sortDirection = ref('desc');

// Format full name as "lastName, firstName middleName"
const formatFullName = (application) => {
  if (!application) return '';
  
  let fullName = `${application.lastName || ''}, ${application.firstName || ''}`;
  if (application.middleName) {
    fullName += ` ${application.middleName}`;
  }
  return fullName;
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    // Handle Firestore Timestamp
    const date = timestamp instanceof Timestamp 
      ? timestamp.toDate() 
      : (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Helper function to check if file is an image
const isImageFile = (filename) => {
  if (!filename) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const lowerFilename = filename.toLowerCase();
  return imageExtensions.some(ext => lowerFilename.includes(ext));
};

// Helper function to get attachment URL
const getAttachmentUrl = (attachmentRef) => {
  if (!attachmentRef) return '';
  
  // If it's already a full URL, return as is
  if (attachmentRef.startsWith('http')) {
    return attachmentRef;
  }
  
  // If it's a Firebase Storage reference, construct the URL
  // Replace 'your-project-id' with your actual Firebase project ID
  return `https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/${encodeURIComponent(attachmentRef)}?alt=media`;
};

// Handle image loading errors
const handleImageError = (event) => {
  console.error('Error loading image:', event.target.src);
  event.target.style.display = 'none';
};

// Get status badge class
const getStatusBadgeClass = (status) => {
  switch(status) {
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

// Fetch applications from Firestore
const fetchApplications = async () => {
  try {
    // First, verify that the current user is in the barangay_presidents collection
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Check if user is in barangay_presidents collection
    const barangayPresidentDocRef = doc(db, 'barangay_presidents', user.uid);
    const barangayPresidentDoc = await getDoc(barangayPresidentDocRef);
    
    if (!barangayPresidentDoc.exists()) {
      console.error('User not found in barangay_presidents collection');
      error.value = 'Your user account is not properly set up as a Barangay President. Please contact the system administrator.';
      return null;
    }
    
    const barangayPresidentData = barangayPresidentDoc.data();
    if (barangayPresidentData.role !== 'BarangayPresident') {
      console.error('User does not have BarangayPresident role');
      error.value = `Your role is set to "${barangayPresidentData.role}" instead of "BarangayPresident". Please contact the system administrator.`;
      return null;
    }
    
    // Store the barangay for filtering
    currentBarangay.value = barangayPresidentData.barangay;
    console.log('User verified as BarangayPresident for:', currentBarangay.value);
    
    // Now fetch applications for this barangay only
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('barangay', '==', currentBarangay.value)
    );
    
    const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      applications.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sortApplications(); // Sort initially
    });
    
    return unsubscribe; // Return unsubscribe function for cleanup
  } catch (error) {
    console.error('Error fetching applications:', error);
    error.value = 'Error fetching applications: ' + error.message;
    return null;
  }
};

// Sorting functions
const handleSort = () => {
  const [field, direction] = sortOption.value.split('-');
  sortField.value = field === 'date' ? 'createdAt' : field;
  sortDirection.value = direction;
  sortApplications();
};

const toggleSort = (field) => {
  const actualField = field === 'date' ? 'createdAt' : field;
  
  if (sortField.value === actualField) {
    // Toggle direction if same field
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // New field, default to ascending
    sortField.value = actualField;
    sortDirection.value = 'asc';
  }
  
  // Update the select dropdown to match
  const displayField = actualField === 'createdAt' ? 'date' : actualField;
  sortOption.value = `${displayField}-${sortDirection.value}`;
  sortApplications();
};

const sortApplications = () => {
  const field = sortField.value;
  const direction = sortDirection.value;
  
  applications.value.sort((a, b) => {
    let valueA, valueB;
    
    if (field === 'name') {
      valueA = formatFullName(a).toLowerCase();
      valueB = formatFullName(b).toLowerCase();
    } else if (field === 'createdAt') {
      // Handle date sorting
      valueA = a[field] instanceof Timestamp ? a[field].toMillis() : 
               (a[field]?.seconds ? a[field].seconds * 1000 : 0);
      valueB = b[field] instanceof Timestamp ? b[field].toMillis() : 
               (b[field]?.seconds ? b[field].seconds * 1000 : 0);
    } else {
      valueA = (a[field]?.toLowerCase?.() || '');
      valueB = (b[field]?.toLowerCase?.() || '');
    }
    
    if (direction === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

// Filtered applications based on search
const filteredApplications = computed(() => {
  if (!searchQuery.value) return applications.value;
  
  const query = searchQuery.value.toLowerCase();
  return applications.value.filter(application => {
    const fullName = formatFullName(application).toLowerCase();
    const refCode = application.referenceCode?.toLowerCase() || '';
    const status = application.status?.toLowerCase() || '';
    
    return fullName.includes(query) || 
           refCode.includes(query) || 
           status.includes(query);
  });
});

// Paginated applications
const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredApplications.value.slice(start, end);
});

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(filteredApplications.value.length / itemsPerPage) || 1;
});

// Pagination methods
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// Modal functions
const viewApplication = (application) => {
  selectedApplication.value = application;
  showViewModal.value = true;
};

// Lifecycle hooks
onMounted(() => {
  const unsubscribe = fetchApplications();
  
  // Cleanup on component unmount
  return () => {
    if (unsubscribe) unsubscribe();
  };
});
</script>

<template>
  <div class="p-6">
    <!-- Error Alert -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
      <span>{{ error }}</span>
      <button @click="error = null" class="text-red-700">
        <X class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Barangay Indicator -->
    <div v-if="currentBarangay" class="mb-4">
      <h2 class="text-xl font-semibold">Applications for {{ currentBarangay }}</h2>
      <p class="text-sm text-gray-600">You can view all applications from your barangay</p>
    </div>
    
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <!-- Search Bar -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or reference code..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
        />
      </div>
      
      <!-- Sort Dropdown -->
      <div class="flex items-center gap-2">
        <span class="text-gray-600">Sort by:</span>
        <select 
          v-model="sortOption" 
          @change="handleSort"
          class="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="status-asc">Status (A-Z)</option>
          <option value="status-desc">Status (Z-A)</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg overflow-x-auto shadow-md">
      <div class="hidden md:grid grid-cols-4 gap-4 py-4 px-6 border-b">
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('name')">
          Full Name
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('date')">
          Date Applied
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('status')">
          Status
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium">Actions</div>
      </div>

      <!-- Table Body for Larger Screens -->
      <div class="hidden md:block divide-y">
        <div v-for="application in paginatedApplications" :key="application.id" class="grid grid-cols-4 gap-4 py-4 px-6 items-center hover:bg-gray-50">
          <div>{{ formatFullName(application) }}</div>
          <div>{{ formatDate(application.createdAt) }}</div>
          <div>
            <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusBadgeClass(application.status)]">
              {{ application.status || 'Pending' }}
            </span>
          </div>
          <div class="flex gap-2">
            <button @click="viewApplication(application)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedApplications.length === 0" class="py-8 text-center text-gray-500">
          No applications found for your barangay
        </div>
      </div>
      
      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="application in paginatedApplications" :key="application.id" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold">{{ formatFullName(application) }}</p>
          <p class="text-sm text-gray-600">Ref: {{ application.referenceCode }}</p>
          <p class="text-sm text-gray-600">Applied: {{ formatDate(application.createdAt) }}</p>
          <div class="flex items-center justify-between mt-2">
            <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusBadgeClass(application.status)]">
              {{ application.status || 'Pending' }}
            </span>
            <button @click="viewApplication(application)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedApplications.length === 0" class="py-4 text-center text-gray-500">
          No applications found for your barangay
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="paginatedApplications.length > 0" class="flex items-center justify-between px-6 py-4 border-t">
      <button @click="prevPage" :disabled="currentPage === 1" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>
    
    <!-- View Application Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Application Details</h2>
          <button @click="showViewModal = false" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div v-if="selectedApplication" class="space-y-4">
          <!-- Status Badge -->
          <div class="mb-4">
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusBadgeClass(selectedApplication.status)]">
              {{ selectedApplication.status || 'Pending' }}
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Personal Information</h3>
              <p><span class="font-medium">Name:</span> {{ formatFullName(selectedApplication) }}</p>
              <p><span class="font-medium">Reference Code:</span> {{ selectedApplication.referenceCode }}</p>
              <p><span class="font-medium">Email:</span> {{ selectedApplication.email }}</p>
              <p><span class="font-medium">Contact:</span> {{ selectedApplication.contactNumber }}</p>
              <p><span class="font-medium">Gender:</span> {{ selectedApplication.gender }}</p>
              <p><span class="font-medium">Age:</span> {{ selectedApplication.age }}</p>
              <p><span class="font-medium">Date of Birth:</span> {{ selectedApplication.dateOfBirth }}</p>
              <p><span class="font-medium">Birthplace:</span> {{ selectedApplication.birthplace }}</p>
            </div>
            
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Address Information</h3>
              <p><span class="font-medium">Address:</span> {{ selectedApplication.address }}</p>
              <p><span class="font-medium">Barangay:</span> {{ selectedApplication.barangay }}</p>
              <p><span class="font-medium">FB Name:</span> {{ selectedApplication.fbName }}</p>
              <p><span class="font-medium">Solo Parent Reason:</span> {{ selectedApplication.soloParentReason }}</p>
              <p><span class="font-medium">Applied on:</span> {{ formatDate(selectedApplication.createdAt) }}</p>
              <p v-if="selectedApplication.updatedAt"><span class="font-medium">Last Updated:</span> {{ formatDate(selectedApplication.updatedAt) }}</p>
            </div>
          </div>

          <!-- Solo Parent ID Information Section -->
          <div v-if="selectedApplication.soloParentId || selectedApplication.soloParentIdAttachment" class="mt-4">
            <h3 class="font-medium text-gray-700 mb-2">Solo Parent ID Information</h3>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2">
              <p v-if="selectedApplication.soloParentId">
                <span class="font-medium">Solo Parent ID:</span> {{ selectedApplication.soloParentId }}
              </p>
              <div v-if="selectedApplication.soloParentIdAttachment">
                <p class="font-medium mb-2">Solo Parent ID Attachment:</p>
                <div class="border border-gray-200 rounded-lg p-3 bg-white">
                  <p class="text-sm text-gray-600 mb-2">File Reference: {{ selectedApplication.soloParentIdAttachment }}</p>
                  <!-- If the attachment is an image, display it -->
                  <div v-if="isImageFile(selectedApplication.soloParentIdAttachment)" class="mb-2">
                    <img 
                      :src="getAttachmentUrl(selectedApplication.soloParentIdAttachment)" 
                      :alt="'Solo Parent ID for ' + formatFullName(selectedApplication)"
                      class="max-w-full h-auto max-h-64 rounded border border-gray-200"
                      @error="handleImageError"
                    />
                  </div>
                  <!-- Download/View link -->
                  <a 
                    :href="getAttachmentUrl(selectedApplication.soloParentIdAttachment)" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Eye class="w-4 h-4 mr-1" />
                    View Attachment
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedApplication.children && selectedApplication.children.length > 0" class="mt-4">
            <h3 class="font-medium text-gray-700 mb-2">Children</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div v-for="(child, index) in selectedApplication.children" :key="index" class="mb-2 last:mb-0">
                <p><span class="font-medium">Name:</span> {{ child.name }}</p>
                <p><span class="font-medium">Age:</span> {{ child.age }}</p>
              </div>
            </div>
          </div>
          
          <!-- Rejection Reason (if applicable) -->
          <div v-if="selectedApplication.status === 'Rejected' && selectedApplication.rejectionReason" class="mt-4">
            <h3 class="font-medium text-gray-700 mb-2">Rejection Reason</h3>
            <div class="bg-red-50 p-4 rounded-lg text-red-800">
              {{ selectedApplication.rejectionReason }}
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button 
              @click="showViewModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>