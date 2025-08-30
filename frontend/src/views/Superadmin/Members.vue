<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { db } from '@/services/firebase';
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
const editForm = ref({ id: '', soloParentId: '', name: '', email: '', barangay: '' });
const isUpdating = ref(false);

// View Modal
const showViewModal = ref(false);
const selectedUser = ref(null);

// Preview modals state
const showExportPreview = ref(false);
const showPrintPreview = ref(false);

// Format full name as "lastName, firstName middleName"
const formatFullName = (user) => {
  if (!user) return "";
  let fullName = `${user.lastName || ""}, ${user.firstName || ""}`;
  if (user.middleName) {
    fullName += ` ${user.middleName}`;
  }
  return fullName;
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
  if (attachmentRef.startsWith('http')) return attachmentRef;
  // Replace 'your-project-id' with your Firebase project ID if you actually construct URLs here
  return `https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/${encodeURIComponent(attachmentRef)}?alt=media`;
};

// Handle image loading errors
const handleImageError = (event) => {
  console.error('Error loading image:', event.target.src);
  event.target.style.display = 'none';
};

// Fetch users from Firestore
const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users.value = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      name: formatFullName(doc.data())
    }));
    sortUsers();
  } catch (e) {
    console.error('Error fetching users:', e);
    error.value = 'Error fetching users: ' + e.message;
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
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  sortOption.value = `${sortField.value}-${sortDirection.value}`;
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
    } else if (field === 'soloParentId') {
      valueA = a.soloParentId?.toLowerCase() || '';
      valueB = b.soloParentId?.toLowerCase() || '';
    } else {
      valueA = a[field]?.toLowerCase?.() || '';
      valueB = b[field]?.toLowerCase?.() || '';
    }
    if (field === 'soloParentId' && !isNaN(valueA) && !isNaN(valueB)) {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }
    return direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });
};

// Filtered users based on search
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    (formatFullName(user).toLowerCase().includes(q)) ||
    (user.email?.toLowerCase().includes(q)) ||
    (user.soloParentId?.toLowerCase().includes(q)) ||
    (user.barangay?.toLowerCase().includes(q))
  );
});

// Preview users for export
const previewUsers = computed(() => filteredUsers.value.slice(0, 5));

// Paginated users
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage) || 1);
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// View user
const viewUser = (user) => { selectedUser.value = user; showViewModal.value = true; };

// Edit Modal
const openEditModal = (user) => {
  editForm.value = { 
    id: user.id,
    soloParentId: user.soloParentId || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    middleName: user.middleName || '',
    email: user.email || '',
    barangay: user.barangay || ''
  };
  showEditModal.value = true;
  if (showViewModal.value) showViewModal.value = false;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = { id: '', soloParentId: '', firstName: '', lastName: '', middleName: '', email: '', barangay: '' };
};

const updateUser = async () => {
  if (!editForm.value.firstName || !editForm.value.lastName || !editForm.value.email) {
    alert('Please fill in all required fields');
    return;
  }
  isUpdating.value = true;
  try {
    const userRef = doc(db, 'users', editForm.value.id);
    await updateDoc(userRef, {
      soloParentId: editForm.value.soloParentId,
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      middleName: editForm.value.middleName,
      email: editForm.value.email,
      barangay: editForm.value.barangay
    });
    const index = users.value.findIndex(u => u.id === editForm.value.id);
    if (index !== -1) {
      users.value[index] = { 
        ...users.value[index], 
        ...editForm.value,
        name: formatFullName(editForm.value)
      };
    }
    closeEditModal();
  } catch (e) {
    console.error('Error updating user:', e);
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
    } catch (e) {
      console.error('Error deleting user:', e);
      alert('Failed to delete user. Please try again.');
    }
  }
};

// Export to Excel
const confirmExport = () => {
  const exportData = filteredUsers.value.map(user => ({
    'Solo Parent ID': user.soloParentId || 'N/A',
    'Full Name': formatFullName(user) || 'N/A',
    'Email': user.email || 'N/A',
    'Barangay': user.barangay || 'N/A'
  }));
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Solo Parents');
  XLSX.writeFile(wb, 'solo-parents-directory.xlsx');
  showExportPreview.value = false;
};

// ------- PRINT (DIRECT, no popup; prevent duplicate first page) -------
const confirmPrint = async () => {
  // Close the preview AFTER printing so #print-content remains in DOM while printing
  const closeAfterPrint = () => {
    showPrintPreview.value = false;
    window.removeEventListener('afterprint', closeAfterPrint);
  };
  window.addEventListener('afterprint', closeAfterPrint);

  // Ensure DOM is settled before printing
  await nextTick();
  window.print();
};
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
          placeholder="Search by name, email, or Solo Parent ID..."
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
          <option value="soloParentId-asc">Solo Parent ID (Ascending)</option>
          <option value="soloParentId-desc">Solo Parent ID (Descending)</option>
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
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('soloParentId')">
          Solo Parent ID
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('name')">
          Full Name
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('barangay')">
          Barangay
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('email')">
          Email
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium">Actions</div>
      </div>

      <!-- Table Body for Larger Screens -->
      <div class="hidden md:block divide-y">
        <div v-for="user in paginatedUsers" :key="user.id" class="grid grid-cols-5 gap-4 py-4 px-6 items-center hover:bg-gray-50">
          <div>{{ user.soloParentId || 'N/A' }}</div>
          <div>{{ formatFullName(user) || 'N/A' }}</div>
          <div>{{ user.barangay || 'N/A' }}</div>
          <div>{{ user.email || 'N/A' }}</div>
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
        
        <div v-if="paginatedUsers.length === 0" class="py-8 text-center text-gray-500">
          No solo parents found
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="user in paginatedUsers" :key="user.id" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold">{{ formatFullName(user) || 'N/A' }}</p>
          <p class="text-sm text-gray-600">Solo Parent ID: {{ user.soloParentId || 'N/A' }}</p>
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
        
        <div v-if="paginatedUsers.length === 0" class="py-4 text-center text-gray-500">
          No solo parents found
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="paginatedUsers.length > 0" class="flex items-center justify-between px-6 py-4 border-t">
      <button @click="prevPage" :disabled="currentPage === 1" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
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
              <p><span class="font-medium">Full Name:</span> {{ formatFullName(selectedUser) }}</p>
              <p><span class="font-medium">Solo Parent ID:</span> {{ selectedUser.soloParentId || 'N/A' }}</p>
              <p><span class="font-medium">Email:</span> {{ selectedUser.email }}</p>
              <p><span class="font-medium">Contact:</span> {{ selectedUser.contactNumber || 'N/A' }}</p>
              <p><span class="font-medium">Gender:</span> {{ selectedUser.gender || 'N/A' }}</p>
              <p><span class="font-medium">Age:</span> {{ selectedUser.age || 'N/A' }}</p>
              <p><span class="font-medium">Date of Birth:</span> {{ selectedUser.dateOfBirth || 'N/A' }}</p>
              <p><span class="font-medium">Birthplace:</span> {{ selectedUser.birthplace || 'N/A' }}</p>
            </div>
            
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Address Information</h3>
              <p><span class="font-medium">Address:</span> {{ selectedUser.address || 'N/A' }}</p>
              <p><span class="font-medium">Barangay:</span> {{ selectedUser.barangay || 'N/A' }}</p>
              <p><span class="font-medium">FB Name:</span> {{ selectedUser.fbName || 'N/A' }}</p>
              <p><span class="font-medium">Solo Parent Reason:</span> {{ selectedUser.soloParentReason || 'N/A' }}</p>
              <p><span class="font-medium">Status:</span> {{ selectedUser.status || 'N/A' }}</p>
            </div>
          </div>

          <!-- Solo Parent ID Information Section -->
          <div v-if="selectedUser.soloParentId || selectedUser.soloParentIdAttachment" class="mt-4">
            <h3 class="font-medium text-gray-700 mb-2">Solo Parent ID Information</h3>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2">
              <p v-if="selectedUser.soloParentId">
                <span class="font-medium">Solo Parent ID:</span> {{ selectedUser.soloParentId }}
              </p>
              <div v-if="selectedUser.soloParentIdAttachment">
                <p class="font-medium mb-2">Solo Parent ID Attachment:</p>
                <div class="border border-gray-200 rounded-lg p-3 bg-white">
                  <p class="text-sm text-gray-600 mb-2">File Reference: {{ selectedUser.soloParentIdAttachment }}</p>
                  <div v-if="isImageFile(selectedUser.soloParentIdAttachment)" class="mb-2">
                    <img 
                      :src="getAttachmentUrl(selectedUser.soloParentIdAttachment)" 
                      :alt="'Solo Parent ID for ' + formatFullName(selectedUser)"
                      class="max-w-full h-auto max-h-64 rounded border border-gray-200"
                      @error="handleImageError"
                    />
                  </div>
                  <a 
                    :href="getAttachmentUrl(selectedUser.soloParentIdAttachment)" 
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
          
          <div v-if="selectedUser.children && selectedUser.children.length > 0" class="mt-4">
            <h3 class="font-medium text-gray-700 mb-2">Children</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div v-for="(child, index) in selectedUser.children" :key="index" class="mb-2 last:mb-0">
                <p><span class="font-medium">Name:</span> {{ child.name }}</p>
                <p><span class="font-medium">Age:</span> {{ child.age }}</p>
              </div>
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
              @click="openEditModal(selectedUser)"
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
          <h2 class="text-xl font-semibold">Edit Solo Parent</h2>
          <button @click="closeEditModal" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Solo Parent ID</label>
            <input 
              v-model="editForm.soloParentId" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input 
              v-model="editForm.firstName" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input 
              v-model="editForm.lastName" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
            <input 
              v-model="editForm.middleName" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              v-model="editForm.email" 
              type="email" 
              required
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
                <th class="px-4 py-2 border text-left">Solo Parent ID</th>
                <th class="px-4 py-2 border text-left">Full Name</th>
                <th class="px-4 py-2 border text-left">Email</th>
                <th class="px-4 py-2 border text-left">Barangay</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in previewUsers" :key="index" class="border-b">
                <td class="px-4 py-2 border">{{ user.soloParentId || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ formatFullName(user) || 'N/A' }}</td>
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
                <th class="px-4 py-2 border text-left">Solo Parent ID</th>
                <th class="px-4 py-2 border text-left">Full Name</th>
                <th class="px-4 py-2 border text-left">Email</th>
                <th class="px-4 py-2 border text-left">Barangay</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="border-b">
                <td class="px-4 py-2 border">{{ user.soloParentId || 'N/A' }}</td>
                <td class="px-4 py-2 border">{{ formatFullName(user) || 'N/A' }}</td>
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

<style>
/* Print only the #print-content, hide everything else (prevents duplicate first page) */
@media print {
  body * {
    visibility: hidden !important;
  }

  /* Hide common overlay/modal containers too */
  .fixed, .absolute, .modal, .backdrop, [role="dialog"] {
    visibility: hidden !important;
  }

  #print-content, #print-content * {
    visibility: visible !important;
  }

  #print-content {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 20px !important;
    background: #fff !important;
  }

  #print-content table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
  }

  #print-content tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  #print-content th,
  #print-content td {
    border: 1px solid #000;
    padding: 8px;
    font-size: 12px;
    text-align: left;
  }

  #print-content thead th {
    background-color: #f0f0f0 !important;
    font-weight: bold;
  }

  @page {
    size: A4;
    margin: 0.5in;
  }
}
</style>
