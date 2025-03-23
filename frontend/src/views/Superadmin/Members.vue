<template>
  <div class="p-6">
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
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg overflow-x-auto">
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
            <button @click="openEditModal(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Pencil class="w-5 h-5" />
            </button>
            <button @click="deleteUser(user.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4">
        <div v-for="user in paginatedUsers" :key="user.id" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold">{{ user.name || 'N/A' }}</p>
          <p class="text-sm text-gray-600">ID: {{ user.idNumber || 'N/A' }}</p>
          <p class="text-sm text-gray-600">Email: {{ user.email || 'N/A' }}</p>
          <p class="text-sm text-gray-600">Barangay: {{ user.barangay || 'N/A' }}</p>
          <div class="flex gap-2 mt-2">
            <button @click="openEditModal(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Pencil class="w-5 h-5" />
            </button>
            <button @click="deleteUser(user.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-6 py-4 border-t">
      <button @click="prevPage" :disabled="currentPage === 1" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">Edit User</h2>
        
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/services/firebase'; // Ensure Firebase is configured correctly
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-vue-next';

const users = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

// Sorting
const sortOption = ref('name-asc');
const sortField = ref('name');
const sortDirection = ref('asc');

// Edit Modal
const showEditModal = ref(false);
const editForm = ref({ id: '', idNumber: '', name: '', email: '', barangay: '' });
const isUpdating = ref(false);

// Fetch users from Firestore
const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    sortUsers(); // Sort initially
  } catch (error) {
    console.error('Error fetching users:', error);
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

// Edit Modal functions
const openEditModal = (user) => {
  editForm.value = { ...user };
  showEditModal.value = true;
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
</script>