<template>
  <div class="p-6">
    <!-- Error Alert -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
      <span>{{ error }}</span>
      <button @click="error = null" class="text-red-700">
        <X class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Success Alert -->
    <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
      <span>{{ success }}</span>
      <button @click="success = null" class="text-green-700">
        <X class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Blocked Members</h1>
      <p class="text-gray-600">Manage blocked solo parent accounts</p>
    </div>
    
    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, or contact..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
        />
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="blockedMembers.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
      <UserX class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 class="text-xl font-semibold text-gray-700 mb-2">No Blocked Members</h2>
      <p class="text-gray-500 mb-6">There are currently no blocked members in the system.</p>
    </div>
    
    <!-- Blocked Members List -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Table Header -->
      <div class="hidden md:grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b">
        <div class="font-medium text-gray-700">Name</div>
        <div class="font-medium text-gray-700">Email</div>
        <div class="font-medium text-gray-700">Barangay</div>
        <div class="font-medium text-gray-700">Blocked Date</div>
        <div class="font-medium text-gray-700">Actions</div>
      </div>
      
      <!-- Table Body (Desktop) -->
      <div class="hidden md:block">
        <div v-for="member in paginatedMembers" :key="member.id" class="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50">
          <div>{{ formatFullName(member) }}</div>
          <div>{{ member.email || 'N/A' }}</div>
          <div>{{ member.barangay }}</div>
          <div>{{ formatDate(member.blockedAt) }}</div>
          <div class="flex gap-2">
            <button 
              @click="viewMember(member)" 
              class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
              title="View Details"
            >
              <Eye class="w-5 h-5" />
            </button>
            <button 
              @click="confirmRestore(member)" 
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              title="Restore Member"
            >
              <RefreshCw class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile View -->
      <div class="md:hidden">
        <div v-for="member in paginatedMembers" :key="member.id" class="p-4 border-b">
          <div class="font-medium">{{ formatFullName(member) }}</div>
          <div class="text-sm text-gray-600">{{ member.email || 'N/A' }}</div>
          <div class="text-sm text-gray-600">{{ member.barangay }}</div>
          <div class="text-sm text-gray-600 mb-2">Blocked: {{ formatDate(member.blockedAt) }}</div>
          <div class="flex gap-2">
            <button 
              @click="viewMember(member)" 
              class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
              title="View Details"
            >
              <Eye class="w-5 h-5" />
            </button>
            <button 
              @click="confirmRestore(member)" 
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              title="Restore Member"
            >
              <RefreshCw class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="blockedMembers.length > 0" class="flex items-center justify-between mt-4 px-4 py-3 bg-white rounded-lg shadow-sm">
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
    
    <!-- View Member Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Blocked Member Details</h2>
          <button @click="showViewModal = false" class="p-1 hover:bg-gray-100 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="selectedMember" class="space-y-4">
          <!-- Status Badge -->
          <div class="mb-4">
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600">
              Blocked
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Personal Information</h3>
              <p><span class="font-medium">Full Name:</span> {{ formatFullName(selectedMember) }}</p>
              <p><span class="font-medium">Email:</span> {{ selectedMember.email }}</p>
              <p><span class="font-medium">Contact:</span> {{ selectedMember.contactNumber }}</p>
              <p><span class="font-medium">Gender:</span> {{ selectedMember.gender }}</p>
              <p><span class="font-medium">Date of Birth:</span> {{ selectedMember.dateOfBirth }}</p>
            </div>

            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Address Information</h3>
              <p><span class="font-medium">Address:</span> {{ selectedMember.address }}</p>
              <p><span class="font-medium">Barangay:</span> {{ selectedMember.barangay }}</p>
              <p><span class="font-medium">Role:</span> {{ selectedMember.role }}</p>
              <p><span class="font-medium">Blocked on:</span> {{ formatDate(selectedMember.blockedAt) }}</p>
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
              @click="confirmRestore(selectedMember)"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <RefreshCw class="w-5 h-5" />
              <span>Restore Member</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Restore Confirmation Modal -->
    <div v-if="showRestoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <RefreshCw class="h-6 w-6 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Restore Member Account</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to restore {{ formatFullName(memberToRestore) }}? This will allow them to log in again.
          </p>
          <div class="flex justify-center gap-3">
            <button
              @click="showRestoreModal = false"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="restoreMember"
              :disabled="isProcessing"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <span v-if="isProcessing">Processing...</span>
              <span v-else>Restore Member</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '@/services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  Timestamp, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  addDoc, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  X,
  RefreshCw,
  UserX
} from 'lucide-vue-next';

// State
const blockedMembers = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isLoading = ref(true);
const error = ref(null);
const success = ref(null);
const isProcessing = ref(false);

// Modals
const showViewModal = ref(false);
const selectedMember = ref(null);
const showRestoreModal = ref(false);
const memberToRestore = ref(null);

// Format full name
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

// Fetch blocked members
const fetchBlockedMembers = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Check user role (can be either FederationPresident or BarangayPresident)
    let userRole = '';
    let userBarangay = '';
    
    // Check if user is FederationPresident
    const adminDocRef = doc(db, 'admins', user.uid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists() && adminDoc.data().role === 'FederationPresident') {
      userRole = 'FederationPresident';
    } else {
      // Check if user is BarangayPresident
      const barangayPresidentDocRef = doc(db, 'barangay_presidents', user.uid);
      const barangayPresidentDoc = await getDoc(barangayPresidentDocRef);
      
      if (barangayPresidentDoc.exists() && barangayPresidentDoc.data().role === 'BarangayPresident') {
        userRole = 'BarangayPresident';
        userBarangay = barangayPresidentDoc.data().barangay;
      }
    }
    
    if (!userRole) {
      throw new Error('You do not have permission to view blocked members');
    }
    
    // Query blocked_members collection
    let blockedMembersQuery;
    
    if (userRole === 'FederationPresident') {
      // Federation president can see all blocked members
      blockedMembersQuery = query(collection(db, 'blocked_members'));
    } else {
      // Barangay president can only see blocked members from their barangay
      blockedMembersQuery = query(
        collection(db, 'blocked_members'),
        where('barangay', '==', userBarangay)
      );
    }
    
    const unsubscribe = onSnapshot(blockedMembersQuery, (snapshot) => {
      blockedMembers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      isLoading.value = false;
    }, (err) => {
      console.error('Error fetching blocked members:', err);
      error.value = 'Failed to load blocked members: ' + err.message;
      isLoading.value = false;
    });
    
    return unsubscribe;
  } catch (err) {
    console.error('Error setting up blocked members query:', err);
    error.value = err.message;
    isLoading.value = false;
    return null;
  }
};

// Filtered members based on search
const filteredMembers = computed(() => {
  if (!searchQuery.value) return blockedMembers.value;
  
  const query = searchQuery.value.toLowerCase();
  return blockedMembers.value.filter(member => {
    const fullName = formatFullName(member).toLowerCase();
    const email = member.email?.toLowerCase() || '';
    const contact = member.contactNumber || '';
    const address = member.address?.toLowerCase() || '';
    const barangay = member.barangay?.toLowerCase() || '';
    
    return fullName.includes(query) || 
           email.includes(query) || 
           contact.includes(query) ||
           address.includes(query) ||
           barangay.includes(query);
  });
});

// Paginated members
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMembers.value.slice(start, end);
});

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(filteredMembers.value.length / itemsPerPage) || 1;
});

// Pagination methods
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// View member details
const viewMember = (member) => {
  selectedMember.value = member;
  showViewModal.value = true;
};

// Confirm restore member
const confirmRestore = (member) => {
  memberToRestore.value = member;
  showRestoreModal.value = true;
  
  // If view modal is open, close it
  if (showViewModal.value) {
    showViewModal.value = false;
  }
};

// Restore member
const restoreMember = async () => {
  if (!memberToRestore.value) return;
  
  isProcessing.value = true;
  error.value = null;
  success.value = null;
  
  try {
    const member = memberToRestore.value;
    
    // Check if member has previousId (original ID from users collection)
    const userId = member.previousId || member.id;
    
    // Prepare member data for users collection (remove blocked-specific fields)
    const { blockedAt, blockedBy, previousId, ...userData } = member;
    
    // Update status to Active
    userData.status = 'Active';
    userData.updatedAt = serverTimestamp();
    
    // Add back to users collection with original ID if possible
    await setDoc(doc(db, 'users', userId), userData);
    
    // Delete from blocked_members collection
    await deleteDoc(doc(db, 'blocked_members', member.id));
    
    // Show success message
    success.value = `${formatFullName(member)} has been restored successfully`;
    
    // Close modal
    showRestoreModal.value = false;
    memberToRestore.value = null;
  } catch (err) {
    console.error('Error restoring member:', err);
    error.value = 'Failed to restore member: ' + err.message;
  } finally {
    isProcessing.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  const unsubscribe = fetchBlockedMembers();
  
  // Cleanup on component unmount
  return () => {
    if (unsubscribe) unsubscribe();
  };
});
</script>