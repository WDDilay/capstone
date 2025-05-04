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
      <h2 class="text-xl font-semibold">Solo Parents in {{ currentBarangay }}</h2>
      <p class="text-sm text-gray-600">You can view all registered solo parents from your barangay</p>
    </div>
    
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <!-- Search Bar -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, or contact..."
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
      <div class="hidden md:grid grid-cols-5 gap-4 py-4 px-6 border-b">
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('name')">
          Name
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium">Address</div>
        <div class="text-gray-600 font-medium">Contact</div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('status')">
          Status
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium">Actions</div>
      </div>

      <!-- Table Body for Larger Screens -->
      <div class="hidden md:block divide-y">
        <div
          v-for="user in paginatedUsers"
          :key="user.id"
          class="grid grid-cols-5 gap-4 py-4 px-6 items-center hover:bg-gray-50"
        >
          <div>{{ formatFullName(user) }}</div>
          <div>{{ user.address }}</div>
          <div class="whitespace-nowrap">{{ user.contactNumber }}</div>
          <div>
            <span
              :class="{
                'px-2 py-1 rounded-full text-sm font-medium': true,
                'bg-green-100 text-green-600': user.status === 'Active',
                'bg-red-100 text-red-600': user.status === 'Blocked',
                'bg-yellow-100 text-yellow-600': user.status !== 'Active' && user.status !== 'Blocked'
              }"
            >
              {{ user.status }}
            </span>
          </div>
          <div class="flex gap-2">
            <button @click="viewUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedUsers.length === 0" class="py-8 text-center text-gray-500">
          No solo parents found in your barangay
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="user in paginatedUsers" :key="user.id" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold">{{ formatFullName(user) }}</p>
          <p class="text-sm text-gray-600">Address: {{ user.address }}</p>
          <p class="text-sm text-gray-600">Contact: {{ user.contactNumber }}</p>
          <p class="text-sm text-gray-600">Email: {{ user.email }}</p>
          <div class="flex items-center justify-between mt-2">
            <span
              :class="{
                'px-2 py-1 rounded-full text-sm font-medium': true,
                'bg-green-100 text-green-600': user.status === 'Active',
                'bg-red-100 text-red-600': user.status === 'Blocked',
                'bg-yellow-100 text-yellow-600': user.status !== 'Active' && user.status !== 'Blocked'
              }"
            >
              {{ user.status }}
            </span>
            <button @click="viewUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedUsers.length === 0" class="py-4 text-center text-gray-500">
          No solo parents found in your barangay
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
          <h2 class="text-xl font-semibold">Solo Parent Details</h2>
          <button @click="showViewModal = false" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="selectedUser" class="space-y-4">
          <!-- Status Badge -->
          <div class="mb-4">
            <span
              :class="{
                'px-3 py-1 rounded-full text-sm font-medium': true,
                'bg-green-100 text-green-600': selectedUser.status === 'Active',
                'bg-red-100 text-red-600': selectedUser.status === 'Blocked',
                'bg-yellow-100 text-yellow-600': selectedUser.status !== 'Active' && selectedUser.status !== 'Blocked'
              }"
            >
              {{ selectedUser.status }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Personal Information</h3>
              <p><span class="font-medium">Full Name:</span> {{ formatFullName(selectedUser) }}</p>
              <p><span class="font-medium">Email:</span> {{ selectedUser.email }}</p>
              <p><span class="font-medium">Contact:</span> {{ selectedUser.contactNumber }}</p>
              <p><span class="font-medium">Gender:</span> {{ selectedUser.gender }}</p>
              <p><span class="font-medium">Date of Birth:</span> {{ selectedUser.dateOfBirth }}</p>
            </div>

            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Address Information</h3>
              <p><span class="font-medium">Address:</span> {{ selectedUser.address }}</p>
              <p><span class="font-medium">Barangay:</span> {{ selectedUser.barangay }}</p>
              <p><span class="font-medium">Role:</span> {{ selectedUser.role }}</p>
              <p><span class="font-medium">Registered on:</span> {{ formatDate(selectedUser.createdAt) }}</p>
              <p v-if="selectedUser.updatedAt"><span class="font-medium">Last Updated:</span> {{ formatDate(selectedUser.updatedAt) }}</p>
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
            You are about to export data for {{ filteredUsers.length }} solo parents from {{ currentBarangay }}.
            The following data will be included in the Excel file:
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 border text-left">Full Name</th>
                <th class="px-4 py-2 border text-left">Email</th>
                <th class="px-4 py-2 border text-left">Contact</th>
                <th class="px-4 py-2 border text-left">Address</th>
                <th class="px-4 py-2 border text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in previewUsers" :key="index" class="border-b">
                <td class="px-4 py-2 border">{{ formatFullName(user) }}</td>
                <td class="px-4 py-2 border">{{ user.email || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.contactNumber || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.address || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.status || 'N/A' }}</td>
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
          <h1 class="text-2xl font-bold text-center mb-2">Solo Parents in {{ currentBarangay }}</h1>
          <p class="text-center text-gray-600 mb-6">Generated on {{ new Date().toLocaleDateString() }}</p>
          
          <table class="min-w-full border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 border text-left">Full Name</th>
                <th class="px-4 py-2 border text-left">Contact</th>
                <th class="px-4 py-2 border text-left">Address</th>
                <th class="px-4 py-2 border text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="border-b">
                <td class="px-4 py-2 border">{{ formatFullName(user) }}</td>
                <td class="px-4 py-2 border">{{ user.contactNumber || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.address || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.status || 'N/A' }}</td>
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
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
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
import { db, auth } from '@/services/firebase'; // Ensure Firebase is configured correctly
import { collection, getDocs, doc, getDoc, Timestamp, query, where, onSnapshot } from 'firebase/firestore';
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
  Mail
} from 'lucide-vue-next';

// State
const users = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const showViewModal = ref(false);
const selectedUser = ref(null);
const error = ref(null);
const currentBarangay = ref('');
const isProcessing = ref(false);

// Preview modals state
const showExportPreview = ref(false);
const showPrintPreview = ref(false);

// Sorting
const sortField = ref('name');
const sortDirection = ref('asc');

// Format full name as "lastName, firstName middleName nameExt"
const formatFullName = (user) => {
  if (!user) return '';
  
  let fullName = `${user.lastName || ''}, ${user.firstName || ''}`;
  if (user.middleName) {
    fullName += ` ${user.middleName}`;
  }
  if (user.nameExt && user.nameExt.trim() !== '') {
    fullName += ` ${user.nameExt}`;
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

// Fetch users from Firestore
const fetchUsers = async () => {
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
    
    // Now fetch users for this barangay only
    const usersQuery = query(
      collection(db, 'users'),
      where('barangay', '==', currentBarangay.value),
      where('role', '==', 'Member')
    );
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sortUsers(); // Sort initially
    });
    
    return unsubscribe; // Return unsubscribe function for cleanup
  } catch (error) {
    console.error('Error fetching users:', error);
    error.value = 'Error fetching users: ' + error.message;
    return null;
  }
};

// Sorting functions
const toggleSort = (field) => {
  if (sortField.value === field) {
    // Toggle direction if same field
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // New field, default to ascending
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
    const address = user.address?.toLowerCase() || '';
    
    return fullName.includes(query) || 
           email.includes(query) || 
           contact.includes(query) ||
           address.includes(query);
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
  
  // Open default email client
  window.location.href = `mailto:${user.email}?subject=Solo Parent Federation - Important Information`;
};

// Export to Excel functionality with confirmation
const confirmExport = () => {
  // Prepare data for export
  const exportData = filteredUsers.value.map(user => ({
    'Full Name': formatFullName(user),
    'Email': user.email || 'N/A',
    'Contact Number': user.contactNumber || 'N/A',
    'Address': user.address || 'N/A',
    'Barangay': user.barangay || 'N/A',
    'Gender': user.gender || 'N/A',
    'Date of Birth': user.dateOfBirth || 'N/A',
    'Status': user.status || 'N/A',
    'Registration Date': user.createdAt ? formatDate(user.createdAt) : 'N/A'
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Solo Parents');

  // Save file
  XLSX.writeFile(wb, `solo-parents-${currentBarangay.value}.xlsx`);
  
  // Close the preview modal
  showExportPreview.value = false;
};

// Print functionality with preview
const confirmPrint = () => {
  // Close the preview modal first
  showPrintPreview.value = false;
  
  // Wait for modal to close before printing
  setTimeout(() => {
    // Create table rows HTML
    const tableRows = filteredUsers.value.map(user => 
      `<tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${formatFullName(user)}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.contactNumber || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.address || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.status || 'N/A'}</td>
      </tr>`
    ).join('');

    // Create HTML content
    const htmlContent = 
      `<html>
        <head>
          <title>Solo Parents in ${currentBarangay.value}</title>
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
          <h1 style="text-align: center; margin-bottom: 20px;">Solo Parents in ${currentBarangay.value}</h1>
          <p style="text-align: center; margin-bottom: 20px;">Generated on ${new Date().toLocaleDateString()}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Contact</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Address</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
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
          
        </body>
      </html>`;

    // Open new window and write content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, 300);
};

// Lifecycle hooks
onMounted(() => {
  const unsubscribe = fetchUsers();
  
  // Cleanup on component unmount
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