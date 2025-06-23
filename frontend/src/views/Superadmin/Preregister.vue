<template>
  <div class="p-6">
    <!-- Error Alert -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
      <span>{{ error }}</span>
      <button @click="error = null" class="text-red-700">
        <X class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Success Notification -->
    <div v-if="notification" class="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 flex items-center justify-between" style="min-width: 300px; max-width: 500px;">
      <div>{{ notification }}</div>
      <button @click="notification = null" class="text-green-700 hover:text-green-900">
        <X class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Header -->
    <div class="mb-4">
      <h2 class="text-xl font-semibold">Pre-Registration Data</h2>
      <p class="text-sm text-gray-600">View all pre-registered users in the system</p>
    </div>
    
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <!-- Search Bar -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, contact, or barangay..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 flex-wrap justify-center">
        <button
          @click="showExportPreview = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FileSpreadsheet class="w-5 h-5" />
          <span>Export to Excel</span>
        </button>
        <button
          @click="showPrintPreview = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Printer class="w-5 h-5" />
          <span>Print Data</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg overflow-x-auto shadow-md">
      <div class="hidden md:grid grid-cols-6 gap-4 py-4 px-6 border-b">
        <div class="text-gray-600 font-medium">No.</div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('name')">
          Full Name
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('barangay')">
          Barangay
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium">Contact</div>
        <div class="text-gray-600 font-medium">Email</div>
        <div class="text-gray-600 font-medium">Actions</div>
      </div>

      <!-- Table Body for Larger Screens -->
      <div class="hidden md:block divide-y">
        <div
          v-for="(user, index) in paginatedUsers"
          :key="user.id"
          class="grid grid-cols-6 gap-4 py-4 px-6 items-center hover:bg-gray-50"
        >
          <div class="font-medium">{{ getRegistrationNumber(index) }}</div>
          <div>{{ formatFullName(user) }}</div>
          <div>{{ user.barangay }}</div>
          <div class="whitespace-nowrap">{{ user.contactNumber }}</div>
          <div class="truncate">{{ user.email }}</div>
          <div class="flex gap-2">
            <button @click="viewUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
            <button @click="confirmDelete(user)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedUsers.length === 0" class="py-8 text-center text-gray-500">
          No pre-registrations found
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="(user, index) in paginatedUsers" :key="user.id" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-start mb-2">
            <p class="text-lg font-semibold">{{ formatFullName(user) }}</p>
            <span class="text-sm font-medium text-primary-600">No. {{ getRegistrationNumber(index) }}</span>
          </div>
          <p class="text-sm text-gray-600">Barangay: {{ user.barangay }}</p>
          <p class="text-sm text-gray-600">Contact: {{ user.contactNumber }}</p>
          <p class="text-sm text-gray-600">Email: {{ user.email }}</p>
          <div class="flex justify-end gap-2 mt-3">
            <button @click="viewUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
            <button @click="confirmDelete(user)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedUsers.length === 0" class="py-4 text-center text-gray-500">
          No pre-registrations found
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="paginatedUsers.length > 0" class="flex items-center justify-between px-6 py-4 border-t">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>
      <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>
    
    <!-- View User Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Pre-Registration Details</h2>
          <button @click="showViewModal = false" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="selectedUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Personal Information</h3>
              <p><span class="font-medium">Full Name:</span> {{ formatFullName(selectedUser) }}</p>
              <p><span class="font-medium">Email:</span> {{ selectedUser.email }}</p>
              <p><span class="font-medium">Contact:</span> {{ selectedUser.contactNumber }}</p>
              <p><span class="font-medium">Gender:</span> {{ selectedUser.gender }}</p>
              <p><span class="font-medium">Facebook:</span> {{ selectedUser.facebookAccount || 'N/A' }}</p>
            </div>

            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Address Information</h3>
              <p><span class="font-medium">Address:</span> {{ selectedUser.address }}</p>
              <p><span class="font-medium">Barangay:</span> {{ selectedUser.barangay }}</p>
              <p><span class="font-medium">Role:</span> {{ selectedUser.role }}</p>
              <p><span class="font-medium">Name Extension:</span> {{ selectedUser.nameExt || 'N/A' }}</p>
              <p><span class="font-medium">Registered on:</span> {{ formatDate(selectedUser.timestamp) }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button
              @click="showViewModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              @click="sendEmail(selectedUser)"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Pre-Registration</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to delete the pre-registration for {{ formatFullName(userToDelete) }}? This action cannot be undone.
          </p>
          <div class="flex justify-center gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="deleteUser"
              :disabled="isProcessing"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
            >
              <span v-if="isProcessing">Processing...</span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Preview Modal -->
    <div v-if="showExportPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Export Preview</h2>
          <button @click="showExportPreview = false" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-600">
            You are about to export data for {{ filteredUsers.length }} pre-registrations.
            The following data will be included in the Excel file:
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 border text-left">No.</th>
                <th class="px-4 py-2 border text-left">Full Name</th>
                <th class="px-4 py-2 border text-left">Barangay</th>
                <th class="px-4 py-2 border text-left">Contact</th>
                <th class="px-4 py-2 border text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in previewUsers" :key="index" class="border-b">
                <td class="px-4 py-2 border">{{ index + 1 }}</td>
                <td class="px-4 py-2 border">{{ formatFullName(user) }}</td>
                <td class="px-4 py-2 border">{{ user.barangay || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.contactNumber || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.email || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredUsers.length > 5" class="mt-2 text-center text-sm text-gray-500">
          Showing 5 of {{ filteredUsers.length }} records in this preview
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="showExportPreview = false"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="confirmExport"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <FileSpreadsheet class="w-5 h-5" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Print Preview Modal -->
    <div v-if="showPrintPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Print Preview</h2>
          <button @click="showPrintPreview = false" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div id="print-content" class="print-section">
          <h1 class="text-2xl font-bold text-center mb-2">Pre-Registration Data</h1>
          <p class="text-center text-gray-600 mb-6">Generated on {{ new Date().toLocaleDateString() }}</p>
          
          <table class="min-w-full border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 border text-left">No.</th>
                <th class="px-4 py-2 border text-left">Full Name</th>
                <th class="px-4 py-2 border text-left">Barangay</th>
                <th class="px-4 py-2 border text-left">Contact</th>
                <th class="px-4 py-2 border text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in filteredUsers" :key="user.id" class="border-b">
                <td class="px-4 py-2 border">{{ index + 1 }}</td>
                <td class="px-4 py-2 border">{{ formatFullName(user) }}</td>
                <td class="px-4 py-2 border">{{ user.barangay || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.contactNumber || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.email || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button 
            @click="showPrintPreview = false" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="confirmPrint" 
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center"
          >
            <Printer class="w-5 h-5" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { 
  collection, 
  getDocs, 
  Timestamp, 
  onSnapshot, 
  deleteDoc,
  doc,
  orderBy,
  query
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-vue-next';

// State
const users = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const showViewModal = ref(false);
const selectedUser = ref(null);
const error = ref(null);
const isProcessing = ref(false);
const notification = ref(null);

// Preview modals state
const showExportPreview = ref(false);
const showPrintPreview = ref(false);

// Delete confirmation modal
const showDeleteModal = ref(false);
const userToDelete = ref(null);

// Sorting
const sortField = ref('timestamp');
const sortDirection = ref('asc');

// Format full name as "firstName middleName lastName nameExt"
const formatFullName = (user) => {
  if (!user) return '';
  
  let fullName = user.firstName || '';
  if (user.middleName) {
    fullName += ` ${user.middleName}`;
  }
  if (user.lastName) {
    fullName += ` ${user.lastName}`;
  }
  if (user.nameExt && user.nameExt.trim() !== '') {
    fullName += ` ${user.nameExt}`;
  }
  return fullName.trim();
};

// Get registration number based on timestamp order
const getRegistrationNumber = (index) => {
  return (currentPage.value - 1) * itemsPerPage + index + 1;
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
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

// Show notification
const showNotification = (message) => {
  notification.value = message;
  setTimeout(() => {
    notification.value = null;
  }, 5000);
};

// Fetch pre-registration data from Firestore
const fetchUsers = async () => {
  try {
    // Query preregistration collection ordered by timestamp
    const preregistrationQuery = query(
      collection(db, 'preregistration'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(preregistrationQuery, (snapshot) => {
      users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error fetching pre-registration data:', error);
    error.value = 'Error fetching pre-registration data: ' + error.message;
    return null;
  }
};

// Sorting functions
const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  
  sortUsers();
};

const sortUsers = () => {
  const field = sortField.value;
  const direction = sortDirection.value;
  
  users.value.sort((a, b) => {
    let valueA, valueB;
    
    if (field === 'name') {
      valueA = formatFullName(a).toLowerCase();
      valueB = formatFullName(b).toLowerCase();
    } else if (field === 'timestamp') {
      valueA = a.timestamp?.seconds || 0;
      valueB = b.timestamp?.seconds || 0;
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

// Filtered users based on search
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => {
    const fullName = formatFullName(user).toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const contact = user.contactNumber || '';
    const barangay = user.barangay?.toLowerCase() || '';
    
    return fullName.includes(query) || 
           email.includes(query) || 
           contact.includes(query) ||
           barangay.includes(query);
  });
});

// Preview users (limited to 5 for the export preview)
const previewUsers = computed(() => {
  return filteredUsers.value.slice(0, 5);
});

// Paginated users
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage) || 1;
});

// Pagination methods
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// View user details
const viewUser = (user) => {
  selectedUser.value = user;
  showViewModal.value = true;
};

// Send email to user
const sendEmail = (user) => {
  if (!user.email) {
    alert('This user does not have an email address.');
    return;
  }
  
  window.location.href = `mailto:${user.email}?subject=Pre-Registration - Important Information`;
};

// Confirm delete user
const confirmDelete = (user) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

// Delete user
const deleteUser = async () => {
  if (!userToDelete.value) return;
  
  isProcessing.value = true;
  
  try {
    const user = userToDelete.value;
    
    // Delete from preregistration collection
    const userRef = doc(db, 'preregistration', user.id);
    await deleteDoc(userRef);
    
    // Remove from local array to update UI immediately
    users.value = users.value.filter(u => u.id !== user.id);
    
    // Show success notification
    showNotification(`${formatFullName(user)} has been deleted successfully`);
    
    // Close modal
    showDeleteModal.value = false;
    userToDelete.value = null;
  } catch (err) {
    console.error('Error deleting user:', err);
    error.value = 'Failed to delete pre-registration: ' + err.message;
  } finally {
    isProcessing.value = false;
  }
};

// Export to Excel functionality
const confirmExport = () => {
  const exportData = filteredUsers.value.map((user, index) => ({
    'No.': index + 1,
    'Full Name': formatFullName(user),
    'Barangay': user.barangay || 'N/A',
    'Contact Number': user.contactNumber || 'N/A',
    'Email': user.email || 'N/A',
    'Address': user.address || 'N/A',
    'Gender': user.gender || 'N/A',
    'Facebook Account': user.facebookAccount || 'N/A',
    'Role': user.role || 'N/A',
    'Registration Date': user.timestamp ? formatDate(user.timestamp) : 'N/A'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pre-Registrations');

  XLSX.writeFile(wb, `pre-registrations-${new Date().toISOString().split('T')[0]}.xlsx`);
  
  showExportPreview.value = false;
};

// Print functionality
const confirmPrint = () => {
  showPrintPreview.value = false;
  
  setTimeout(() => {
    const tableRows = filteredUsers.value.map((user, index) => 
      `<tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formatFullName(user)}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.barangay || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.contactNumber || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.email || 'N/A'}</td>
      </tr>`
    ).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Pre-Registration Data</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 20px;">Pre-Registration Data</h1>
          <p style="text-align: center; margin-bottom: 20px;">Generated on ${new Date().toLocaleDateString()}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">No.</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Full Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Barangay</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Contact</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Email</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          <\/script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, 300);
};

// Lifecycle hooks
onMounted(() => {
  const unsubscribe = fetchUsers();
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
});
</script>

<style>
@media print {
  .print-section {
    margin: 0;
    padding: 20px;
  }
}
</style>