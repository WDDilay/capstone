<template>
  <div class="p-6">
    <!-- Error Alert -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
      <span>{{ error }}</span>
      <button @click="error = null" class="text-red-700">
        <X class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Federation Indicator -->
    <div class="mb-4">
      <h2 class="text-xl font-semibold">All Solo Parents</h2>
      <p class="text-sm text-gray-600">View all registered solo parents across all barangays</p>
    </div>
    
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <!-- Search Bar -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, or ID..."
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
          <option value="email-asc">Email (A-Z)</option>
          <option value="email-desc">Email (Z-A)</option>
          <option value="idNumber-asc">ID Number (Ascending)</option>
          <option value="idNumber-desc">ID Number (Descending)</option>
          <option value="barangay-asc">Barangay (A-Z)</option>
          <option value="barangay-desc">Barangay (Z-A)</option>
        </select>
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
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('idNumber')">
          ID Number
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('name')">
          Name
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('email')">
          Email
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('barangay')">
          Barangay
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium">Actions</div>
      </div>

      <!-- Table Body for Larger Screens -->
      <div class="hidden md:block divide-y">
        <div v-for="user in paginatedUsers" :key="user.id" class="grid grid-cols-5 gap-4 py-4 px-6 items-center hover:bg-gray-50">
          <div>{{ user.idNumber || 'N/A' }}</div>
          <div>{{ user.name || 'N/A' }}</div>
          <div>{{ user.email || 'N/A' }}</div>
          <div>{{ user.barangay || 'N/A' }}</div>
          <div class="flex gap-2">
            <button @click="viewUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
            <button @click="openEditModal(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Pencil class="w-5 h-5" />
            </button>
            <button @click="deleteUser(user.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedUsers.length === 0" class="py-8 text-center text-gray-500">
          No solo parents found
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="user in paginatedUsers" :key="user.id" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold">{{ user.name || 'N/A' }}</p>
          <p class="text-sm text-gray-600">ID: {{ user.idNumber || 'N/A' }}</p>
          <p class="text-sm text-gray-600">Email: {{ user.email || 'N/A' }}</p>
          <p class="text-sm text-gray-600">Barangay: {{ user.barangay || 'N/A' }}</p>
          <div class="flex gap-2 mt-2">
            <button @click="viewUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
            <button @click="openEditModal(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Pencil class="w-5 h-5" />
            </button>
            <button @click="deleteUser(user.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedUsers.length === 0" class="py-4 text-center text-gray-500">
          No solo parents found
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Personal Information</h3>
              <p><span class="font-medium">Name:</span> {{ selectedUser.name }}</p>
              <p><span class="font-medium">ID Number:</span> {{ selectedUser.idNumber || 'N/A' }}</p>
              <p><span class="font-medium">Email:</span> {{ selectedUser.email }}</p>
            </div>

            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Address Information</h3>
              <p><span class="font-medium">Barangay:</span> {{ selectedUser.barangay }}</p>
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
              @click="openEditModal(selectedUser)"ick="openEditModal(selectedUser)"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Edit User</h2>
          <button @click="closeEditModal" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input 
              v-model="editForm.idNumber" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="editForm.email" 
              type="email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
            <input 
              v-model="editForm.barangay" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button 
            @click="closeEditModal" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="updateUser" 
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            :disabled="isUpdating"
          >
            {{ isUpdating ? 'Saving...' : 'Save Changes' }}
          </button>
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
            You are about to export data for {{ filteredUsers.length }} solo parents.
            The following data will be included in the Excel file:
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 border text-left">ID Number</th>
                <th class="px-4 py-2 border text-left">Name</th>
                <th class="px-4 py-2 border text-left">Email</th>
                <th class="px-4 py-2 border text-left">Barangay</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in previewUsers" :key="index" class="border-b">
                <td class="px-4 py-2 border">{{ user.idNumber || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.name || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.email || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.barangay || 'N/A' }}</td>
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
          <h1 class="text-2xl font-bold text-center mb-2">Solo Parents Directory</h1>
          <p class="text-center text-gray-600 mb-6">Generated on {{ new Date().toLocaleDateString() }}</p>
          
          <table class="min-w-full border border-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 border text-left">ID Number</th>
                <th class="px-4 py-2 border text-left">Name</th>
                <th class="px-4 py-2 border text-left">Email</th>
                <th class="px-4 py-2 border text-left">Barangay</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="border-b">
                <td class="px-4 py-2 border">{{ user.idNumber || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.name || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.email || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ user.barangay || 'N/A' }}</td>
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
import { db } from '@/services/firebase'; // Ensure Firebase is configured correctly
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  FileSpreadsheet, 
  Printer,
  Eye,
  X
} from 'lucide-vue-next';

// State
const users = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;
const error = ref(null);

// Sorting
const sortOption = ref('name-asc');
const sortField = ref('name');
const sortDirection = ref('asc');

// Edit Modal
const showEditModal = ref(false);
const editForm = ref({ id: '', idNumber: '', name: '', email: '', barangay: '' });
const isUpdating = ref(false);

// View Modal
const showViewModal = ref(false);
const selectedUser = ref(null);

// Preview modals state
const showExportPreview = ref(false);
const showPrintPreview = ref(false);

// Fetch users from Firestore
const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    sortUsers(); // Sort initially
  } catch (error) {
    console.error('Error fetching users:', error);
    error.value = 'Error fetching users: ' + error.message;
  }
};

onMounted(fetchUsers);

// Sorting functions
const handleSort = () => {
  const [field, direction] = sortOption.value.split('-');
  sortField.value = field;
  sortDirection.value = direction;
  sortUsers();
};

const toggleSort = (field) => {
  if (sortField.value === field) {
    // Toggle direction if same field
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // New field, default to ascending
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  
  // Update the select dropdown to match
  sortOption.value = `${sortField.value}-${sortDirection.value}`;
  sortUsers();
};

const sortUsers = () => {
  const field = sortField.value;
  const direction = sortDirection.value;
  
  users.value.sort((a, b) => {
    let valueA = a[field]?.toLowerCase?.() || '';
    let valueB = b[field]?.toLowerCase?.() || '';
    
    // Handle numeric sorting for ID numbers if needed
    if (field === 'idNumber' && !isNaN(valueA) && !isNaN(valueB)) {
      valueA = Number(valueA);
      valueB = Number(valueB);
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
  return users.value.filter(user => 
    (user.name?.toLowerCase().includes(query)) ||
    (user.email?.toLowerCase().includes(query)) ||
    (user.idNumber?.toLowerCase().includes(query)) ||
    (user.barangay?.toLowerCase().includes(query))
  );
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

// Edit Modal functions
const openEditModal = (user) => {
  editForm.value = { ...user };
  showEditModal.value = true;
  // Close view modal if it's open
  if (showViewModal.value) {
    showViewModal.value = false;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = { id: '', idNumber: '', name: '', email: '', barangay: '' };
};

const updateUser = async () => {
  if (!editForm.value.name || !editForm.value.email) {
    alert('Please fill in all required fields');
    return;
  }
  
  isUpdating.value = true;
  
  try {
    const userRef = doc(db, 'users', editForm.value.id);
    await updateDoc(userRef, {
      idNumber: editForm.value.idNumber,
      name: editForm.value.name,
      email: editForm.value.email,
      barangay: editForm.value.barangay
    });
    
    // Update local data
    const index = users.value.findIndex(u => u.id === editForm.value.id);
    if (index !== -1) {
      users.value[index] = { ...editForm.value };
    }
    
    closeEditModal();
  } catch (error) {
    console.error('Error updating user:', error);
    alert('Failed to update user. Please try again.');
  } finally {
    isUpdating.value = false;
  }
};

// Delete user
const deleteUser = async (id) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await deleteDoc(doc(db, 'users', id));
      users.value = users.value.filter(u => u.id !== id);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  }
};

// Export to Excel functionality with confirmation
const confirmExport = () => {
  // Prepare data for export
  const exportData = filteredUsers.value.map(user => ({
    'ID Number': user.idNumber || 'N/A',
    'Name': user.name || 'N/A',
    'Email': user.email || 'N/A',
    'Barangay': user.barangay || 'N/A'
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Solo Parents');

  // Save file
  XLSX.writeFile(wb, 'solo-parents-directory.xlsx');
  
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
        <td style="border: 1px solid #ddd; padding: 8px;">${user.idNumber || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.name || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.email || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${user.barangay || 'N/A'}</td>
      </tr>`
    ).join('');

    // Create HTML content
    const htmlContent = 
      `<html>
        <head>
          <title>Solo Parents Directory</title>
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
          <h1 style="text-align: center; margin-bottom: 20px;">Solo Parents Directory</h1>
          <p style="text-align: center; margin-bottom: 20px;">Generated on ${new Date().toLocaleDateString()}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">ID Number</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Email</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Barangay</th>
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
</script>

<style>
@media print {
  .print-section {
    margin: 0;
    padding: 20px;
  }
}
</style>

I've updated your members.vue component to match the styling and functionality of your data.vue component. Here are the key changes I made:

1. **Added Export and Print Preview Functionality**:
   - Added export to Excel with preview modal
   - Added print functionality with preview modal
   - Both features show a preview before completing the action

2. **Added View User Modal**:
   - Added a detailed view modal similar to the one in data.vue
   - This allows users to view details before deciding to edit

3. **UI Improvements**:
   - Added error alert component
   - Added header with title and description
   - Improved styling for consistency with data.vue
   - Added empty state messages

4. **Enhanced Mobile Experience**:
   - Improved mobile card layout
   - Better responsive design for all screen sizes

5. **Maintained Original Functionality**:
   - Kept all the original sorting options
   - Preserved the edit and delete functionality
   - Maintained the same data structure

The component now provides a consistent experience with your data.vue component while preserving the unique aspects of the members management interface.

