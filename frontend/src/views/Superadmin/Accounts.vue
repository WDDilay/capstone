```vue type="code" project="accounts" file="accounts.vue"
[v0-no-op-code-block-prefix]<template>
  <div class="p-6">
    <!-- Top Bar -->
    <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <!-- Search Bar -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or username..."
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
          <option value="username-asc">Username (A-Z)</option>
          <option value="username-desc">Username (Z-A)</option>
          <option value="barangay-asc">Barangay (A-Z)</option>
          <option value="barangay-desc">Barangay (Z-A)</option>
        </select>
      </div>

      <!-- Add Account Button -->
      <button 
        @click="openNewAccountDialog" 
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
      >
        <PlusCircle class="w-5 h-5" />
        Add Account
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg overflow-x-auto shadow-md">
      <div class="hidden md:grid grid-cols-4 gap-4 py-4 px-6 border-b">
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('name')">
          Name
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('username')">
          Username
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
        <div v-for="account in paginatedAccounts" :key="account.id" class="grid grid-cols-4 gap-4 py-4 px-6 items-center hover:bg-gray-50">
          <div>{{ account.name }}</div>
          <div class="font-mono text-sm">{{ account.username }}</div>
          <div>{{ account.barangay }}</div>
          <div class="flex gap-2">
            <button @click="openEditModal(account)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Pencil class="w-5 h-5" />
            </button>
            <button @click="confirmDeleteAccount(account)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="account in paginatedAccounts" :key="account.id" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold">{{ account.name }}</p>
          <p class="text-sm font-mono text-gray-600">{{ account.username }}</p>
          <p class="text-sm text-gray-600">Barangay: {{ account.barangay }}</p>
          <div class="flex gap-2 mt-2">
            <button @click="openEditModal(account)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Pencil class="w-5 h-5" />
            </button>
            <button @click="confirmDeleteAccount(account)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
    
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">{{ editMode ? 'Edit Account' : 'Add New Account' }}</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <p v-if="submitted && !editForm.name" class="mt-1 text-sm text-red-600">Name is required</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
                 v-model="editForm.email" 
              type="email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
              :disabled="editMode"
            />

            <p v-if="submitted && !editForm.email" class="mt-1 text-sm text-red-600">Email is required</p>

          </div>
          
          <div v-if="!editMode">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input 
                v-model="editForm.password" 
                :type="showPassword ? 'text' : 'password'" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button 
                @click="showPassword = !showPassword" 
                type="button" 
                class="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Eye v-if="!showPassword" class="w-5 h-5 text-gray-500" />
                <EyeOff v-else class="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p v-if="submitted && !editForm.password" class="mt-1 text-sm text-red-600">Password is required</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
            <select 
              v-model="editForm.barangay" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="" disabled>Select Barangay</option>
              <option v-for="barangay in barangays" :key="barangay.name" :value="barangay.name">
                {{ barangay.name }}
              </option>
            </select>
            <p v-if="submitted && !editForm.barangay" class="mt-1 text-sm text-red-600">Barangay is required</p>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button 
            @click="closeModal" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="saveAccount" 
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">Confirm Delete</h2>
        <p class="text-gray-700 mb-6">Are you sure you want to delete the account for <span class="font-semibold">{{ editForm.name }}</span>?</p>
        
        <div class="flex justify-end gap-2">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="deleteAccount" 
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '@/services/firebase'; // Ensure Firebase is configured correctly
import { collection, getDocs, doc, updateDoc, onSnapshot, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, deleteUser, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  Search, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  PlusCircle,
  Eye,
  EyeOff
} from 'lucide-vue-next';

// State
const accounts = ref([]);
const barangays = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;
const showModal = ref(false);
const showDeleteModal = ref(false);
const editMode = ref(false);
const submitted = ref(false);
const isProcessing = ref(false);
const showPassword = ref(false);

// Sorting
const sortOption = ref('name-asc');
const sortField = ref('name');
const sortDirection = ref('asc');

// Form
const editForm = ref({
  id: '',
  name: '',
  email: '',
  password: '',
  barangay: ''
});


// Fetch barangays from Firestore
const fetchBarangays = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'barangays'));
    barangays.value = querySnapshot.docs.map(doc => ({ name: doc.data().name }));
  } catch (error) {
    console.error('Error fetching barangays:', error);
  }
};

// Fetch accounts from Firestore
const fetchAccounts = () => {
  try {
    const unsubscribe = onSnapshot(collection(db, 'barangay_presidents'), (snapshot) => {
      accounts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sortAccounts(); // Sort initially
    });
    return unsubscribe; // Return unsubscribe function for cleanup
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

// Sorting functions
const handleSort = () => {
  const [field, direction] = sortOption.value.split('-');
  sortField.value = field;
  sortDirection.value = direction;
  sortAccounts();
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
  sortAccounts();
};

const sortAccounts = () => {
  const field = sortField.value;
  const direction = sortDirection.value;
  
  accounts.value.sort((a, b) => {
    let valueA = a[field]?.toLowerCase?.() || '';
    let valueB = b[field]?.toLowerCase?.() || '';
    
    if (direction === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

// Filtered accounts based on search
const filteredAccounts = computed(() => {
  if (!searchQuery.value) return accounts.value;
  const query = searchQuery.value.toLowerCase();
  return accounts.value.filter(account => 
    account.name?.toLowerCase().includes(query) ||
    account.username?.toLowerCase().includes(query) ||
    account.barangay?.toLowerCase().includes(query)
  );
});

// Paginated accounts
const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAccounts.value.slice(start, end);
});

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(filteredAccounts.value.length / itemsPerPage) || 1;
});

// Pagination methods
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// Modal functions
const openNewAccountDialog = () => {
  editForm.value = { id: '', name: '', username: '', password: '', barangay: '' };
  editMode.value = false;
  submitted.value = false;
  showModal.value = true;
};

const openEditModal = (account) => {
  editForm.value = { ...account };
  editMode.value = true;
  submitted.value = false;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editForm.value = { id: '', name: '', username: '', password: '', barangay: '' };
};

const confirmDeleteAccount = (account) => {
  editForm.value = { ...account };
  showDeleteModal.value = true;
  console.log('Account to delete:', editForm.value); // Debug log
};

// CRUD operations
const saveAccount = async () => {
  submitted.value = true;

  if (!editMode.value && (!editForm.value.name || !editForm.value.email || !editForm.value.password || !editForm.value.barangay)) {
    return alert('Please complete all fields.');
  }

  if (editMode.value && (!editForm.value.name || !editForm.value.barangay)) {
    return alert('Please complete all fields.');
  }

  isProcessing.value = true;

  try {
    if (editMode.value) {
      await updateDoc(doc(db, 'barangay_presidents', editForm.value.id), {
        name: editForm.value.name,
        barangay: editForm.value.barangay,
        updatedAt: new Date()
      });
      console.log('Account updated');
    } else {
      // Store current admin credentials
      const currentAdmin = auth.currentUser;
      const adminEmail = currentAdmin.email;
      const adminPassword = prompt("Re-enter your password to continue:");

      if (!adminPassword) throw new Error("Password is required.");

      // Create new user (this will log out the current admin)
      const userCredential = await createUserWithEmailAndPassword(auth, editForm.value.email, editForm.value.password);
      const newUser = userCredential.user;

      // Switch back to Federation President
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('Signed back in as Federation President');

      // Save user info to Firestore
      await setDoc(doc(db, 'barangay_presidents', newUser.uid), {
        name: editForm.value.name,
        email: editForm.value.email,
        barangay: editForm.value.barangay,
        role: 'BarangayPresident',
        createdAt: new Date()
      });

      console.log('Barangay account created and admin restored');
    }

    closeModal();
  } catch (error) {
    console.error('Error:', error.message);
    alert(error.message);
  } finally {
    isProcessing.value = false;
  }
};


const deleteAccount = async () => {
  if (!editForm.value.id || isProcessing.value) return;

  isProcessing.value = true;

  try {
    // Check if the current user is a Federation President
    const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
    if (!adminDoc.exists() || adminDoc.data().role !== 'FederationPresident') {
      throw new Error('Only Federation Presidents can delete accounts');
    }
    
    // Delete the Firestore document
    await deleteDoc(doc(db, 'barangay_presidents', editForm.value.id));
    
    console.log('Account document deleted successfully');
    
    // Note: Deleting the actual Firebase Auth user requires admin SDK or Cloud Functions
    // This client-side approach has limitations due to security restrictions
    
    showDeleteModal.value = false;
  } catch (error) {
    console.error('Error deleting account:', error);
    alert(`Error: ${error.message}`);
  } finally {
    isProcessing.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchBarangays();
  const unsubscribe = fetchAccounts();
  
  // Cleanup on component unmount
  return () => {
    if (unsubscribe) unsubscribe();
  };
});
</script>