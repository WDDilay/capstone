```vue type="vue" project="Solo Parent Application" file="Application.vue"
[v0-no-op-code-block-prefix]\`\`\`vue type="vue" project="Solo Parent Application" file="Application.vue"
[v0-no-op-code-block-prefix]<script setup>
import { ref, computed, onMounted } from "vue"
import { db, auth } from "@/services/firebase" // Ensure Firebase is configured correctly
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore"
import { createUserWithEmailAndPassword, updateProfile, deleteUser, signInWithEmailAndPassword } from "firebase/auth"
import { Search, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, ArrowUpDown, X } from "lucide-vue-next"

// State
const applications = ref([])
const searchQuery = ref("")
const currentPage = ref(1)
const itemsPerPage = 5
const showViewModal = ref(false)
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const isProcessing = ref(false)
const selectedApplication = ref(null)
const rejectionReason = ref("")
const rejectionSubmitted = ref(false)
const error = ref(null)

// Sorting
const sortOption = ref("date-desc")
const sortField = ref("createdAt")
const sortDirection = ref("desc")

// Format full name as "lastName, firstName middleName"
const formatFullName = (application) => {
  if (!application) return ""

  let fullName = `${application.lastName || ""}, ${application.firstName || ""}`
  if (application.middleName) {
    fullName += ` ${application.middleName}`
  }
  return fullName
}

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A"

  try {
    // Handle Firestore Timestamp
    const date =
      timestamp instanceof Timestamp
        ? timestamp.toDate()
        : timestamp.seconds
          ? new Date(timestamp.seconds * 1000)
          : new Date(timestamp)

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

// Fetch applications from Firestore
const fetchApplications = async () => {
  try {
    // First, verify that the current user is in the admins collection with the correct role
    const user = auth.currentUser
    if (!user) {
      throw new Error("No authenticated user found")
    }

    // Check if user is in admins collection with FederationPresident role
    const adminDocRef = doc(db, "admins", user.uid)
    const adminDoc = await getDoc(adminDocRef)

    if (!adminDoc.exists()) {
      console.error("User not found in admins collection")
      error.value =
        "Your user account is not properly set up as a Federation President. Please contact the system administrator."
      return null
    }

    const adminData = adminDoc.data()
    if (adminData.role !== "FederationPresident") {
      console.error("User does not have FederationPresident role")
      error.value = `Your role is set to "${adminData.role}" instead of "FederationPresident". Please contact the system administrator.`
      return null
    }

    console.log("User verified as FederationPresident:", user.uid)

    // Now fetch applications
    const unsubscribe = onSnapshot(collection(db, "applications"), (snapshot) => {
      applications.value = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((app) => app.status === "Pending" || !app.status) // Only show pending applications

      sortApplications() // Sort initially
    })
    return unsubscribe // Return unsubscribe function for cleanup
  } catch (error) {
    console.error("Error fetching applications:", error)
    error.value = "Error fetching applications: " + error.message
    return null
  }
}

// Sorting functions
const handleSort = () => {
  const [field, direction] = sortOption.value.split("-")
  sortField.value = field === "date" ? "createdAt" : field
  sortDirection.value = direction
  sortApplications()
}

const toggleSort = (field) => {
  const actualField = field === "date" ? "createdAt" : field

  if (sortField.value === actualField) {
    // Toggle direction if same field
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
  } else {
    // New field, default to ascending
    sortField.value = actualField
    sortDirection.value = "asc"
  }

  // Update the select dropdown to match
  const displayField = actualField === "createdAt" ? "date" : actualField
  sortOption.value = `${displayField}-${sortDirection.value}`
  sortApplications()
}

const sortApplications = () => {
  const field = sortField.value
  const direction = sortDirection.value

  applications.value.sort((a, b) => {
    let valueA, valueB

    if (field === "name") {
      valueA = formatFullName(a).toLowerCase()
      valueB = formatFullName(b).toLowerCase()
    } else if (field === "createdAt") {
      // Handle date sorting
      valueA = a[field] instanceof Timestamp ? a[field].toMillis() : a[field]?.seconds ? a[field].seconds * 1000 : 0
      valueB = b[field] instanceof Timestamp ? b[field].toMillis() : b[field]?.seconds ? b[field].seconds * 1000 : 0
    } else {
      valueA = a[field]?.toLowerCase?.() || ""
      valueB = b[field]?.toLowerCase?.() || ""
    }

    if (direction === "asc") {
      return valueA > valueB ? 1 : -1
    } else {
      return valueA < valueB ? 1 : -1
    }
  })
}

// Filtered applications based on search
const filteredApplications = computed(() => {
  if (!searchQuery.value) return applications.value

  const query = searchQuery.value.toLowerCase()
  return applications.value.filter((application) => {
    const fullName = formatFullName(application).toLowerCase()
    const refCode = application.referenceCode?.toLowerCase() || ""
    const barangay = application.barangay?.toLowerCase() || ""

    return fullName.includes(query) || refCode.includes(query) || barangay.includes(query)
  })
})

// Paginated applications
const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredApplications.value.slice(start, end)
})

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(filteredApplications.value.length / itemsPerPage) || 1
})

// Pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Modal functions
const viewApplication = (application) => {
  selectedApplication.value = application
  showViewModal.value = true
}

const openAcceptModal = (application) => {
  selectedApplication.value = application
  showAcceptModal.value = true
  showViewModal.value = false
}

const openRejectModal = (application) => {
  selectedApplication.value = application
  rejectionReason.value = ""
  rejectionSubmitted.value = false
  showRejectModal.value = true
  showViewModal.value = false
}

// Send email notification
const sendEmailNotification = async (to, subject, body) => {
  try {
    // This would typically call a server function or API endpoint
    // For demonstration, we'll log the email details
    console.log("Sending email:", { to, subject, body })

    // In a real implementation, you would call a Cloud Function or API
    // Example:
    // await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, subject, body })
    // });

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Accept application using a transaction
const acceptApplication = async () => {
  if (!selectedApplication.value || isProcessing.value) return

  isProcessing.value = true
  error.value = null

  try {
    const application = selectedApplication.value
    const user = auth.currentUser

    if (!user) {
      throw new Error("No authenticated user found")
    }

    // Use a transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const applicationRef = doc(db, "applications", application.id)
      const applicationDoc = await transaction.get(applicationRef)

      if (!applicationDoc.exists()) {
        throw new Error("Application not found")
      }

      // Use the same document ID for the user
      const userRef = doc(db, "users", application.id)

      // Transfer all data, add role and status
      transaction.set(userRef, {
        ...applicationDoc.data(),
        role: "Member",
        status: "Active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      })

      // Delete the application document
      transaction.delete(applicationRef)
    })

    // Send email notification (outside transaction)
    const emailSubject = "Your Solo Parent Application Has Been Approved"
    const emailBody = `
      Dear ${application.firstName},

      We are pleased to inform you that your Solo Parent application (Reference: ${application.referenceCode}) has been approved.

      You can now log in to your account with your registered email address to access member services.

      Thank you,
      Solo Parent Support Team
    `
    await sendEmailNotification(application.email, emailSubject, emailBody)

    showAcceptModal.value = false

    // Remove from local list
    const index = applications.value.findIndex((a) => a.id === application.id)
    if (index !== -1) {
      applications.value.splice(index, 1)
    }
  } catch (err) {
    console.error("Error approving application:", err)
    error.value = "Error approving application: " + err.message
  } finally {
    isProcessing.value = false
  }
}

// Reject application without using a transaction
const rejectApplication = async () => {
  rejectionSubmitted.value = true

  if (!selectedApplication.value || isProcessing.value) return
  if (!rejectionReason.value) return

  isProcessing.value = true
  error.value = null

  try {
    const application = selectedApplication.value
    const user = auth.currentUser

    if (!user) {
      throw new Error("No authenticated user found")
    }

    // 1. Send email notification first (in case deletion fails, at least they get notified)
    const emailSubject = "Update on Your Solo Parent Application"
    const emailBody = `
      Dear ${application.firstName},
      
      We regret to inform you that your Solo Parent application (Reference: ${application.referenceCode}) has been declined.
      
      Reason: ${rejectionReason.value}
      
      If you have any questions or would like to submit additional information, please contact our office.
      
      Thank you,
      Solo Parent Support Team
    `

    await sendEmailNotification(application.email, emailSubject, emailBody)

    // 2. Delete the application document directly (no transaction)
    const applicationRef = doc(db, "applications", application.id)
    await deleteDoc(applicationRef)

    // 3. If there's a corresponding user document, delete it too
    if (application.userId) {
      const userRef = doc(db, "users", application.userId)
      await deleteDoc(userRef)
    }

    console.log("Application rejected and deleted successfully")
    showRejectModal.value = false
    rejectionReason.value = ""
    rejectionSubmitted.value = false

    // Update local state to reflect the change
    const index = applications.value.findIndex((a) => a.id === application.id)
    if (index !== -1) {
      applications.value.splice(index, 1) // Remove from the list
    }
  } catch (err) {
    console.error("Error rejecting application:", err)
    error.value = "Error rejecting application: " + err.message
  } finally {
    isProcessing.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  const unsubscribe = fetchApplications()

  // Cleanup on component unmount
  return () => {
    if (unsubscribe) unsubscribe()
  }
})

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
          <option value="barangay-asc">Barangay (A-Z)</option>
          <option value="barangay-desc">Barangay (Z-A)</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg overflow-x-auto shadow-md">
      <div class="hidden md:grid grid-cols-2 gap-4 py-4 px-6 border-b">
        <div class="text-gray-600 font-medium cursor-pointer flex items-center gap-1" @click="toggleSort('name')">
          Full Name
          <ArrowUpDown class="w-4 h-4" />
        </div>
        <div class="text-gray-600 font-medium">Actions</div>
      </div>

      <!-- Table Body for Larger Screens -->
      <div class="hidden md:block divide-y">
        <div v-for="application in paginatedApplications" :key="application.id" class="grid grid-cols-2 gap-4 py-4 px-6 items-center hover:bg-gray-50">
          <div>{{ formatFullName(application) }}</div>
          <div class="flex gap-2">
            <button @click="viewApplication(application)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
            <button @click="openAcceptModal(application)" class="p-2 text-green-600 hover:bg-green-50 rounded-lg">
              <CheckCircle class="w-5 h-5" />
            </button>
            <button @click="openRejectModal(application)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <XCircle class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedApplications.length === 0" class="py-8 text-center text-gray-500">
          No pending applications found
        </div>
      </div>
      
      <!-- Mobile View (Cards) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="application in paginatedApplications" :key="application.id" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg font-semibold">{{ formatFullName(application) }}</p>
          <p class="text-sm text-gray-600">Ref: {{ application.referenceCode }}</p>
          <p class="text-sm text-gray-600">Barangay: {{ application.barangay }}</p>
          <div class="flex gap-2 mt-2">
            <button @click="viewApplication(application)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
              <Eye class="w-5 h-5" />
            </button>
            <button @click="openAcceptModal(application)" class="p-2 text-green-600 hover:bg-green-50 rounded-lg">
              <CheckCircle class="w-5 h-5" />
            </button>
            <button @click="openRejectModal(application)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <XCircle class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="paginatedApplications.length === 0" class="py-4 text-center text-gray-500">
          No pending applications found
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
              <p><span class="font-medium">Status:</span> {{ selectedApplication.status }}</p>
              <p><span class="font-medium">Applied on:</span> {{ formatDate(selectedApplication.createdAt) }}</p>
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
          
          <div class="flex justify-end gap-2 mt-6">
            <button 
              @click="showViewModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button 
              @click="openAcceptModal(selectedApplication)" 
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Accept
            </button>
            <button 
              @click="openRejectModal(selectedApplication)" 
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Accept Modal -->
    <div v-if="showAcceptModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">Accept Application</h2>
        <p class="text-gray-700 mb-6">
          Are you sure you want to accept the application for 
          <span class="font-semibold">{{ selectedApplication ? formatFullName(selectedApplication) : '' }}</span>?
        </p>
        <p class="text-sm text-gray-600 mb-4">
          An email notification will be sent to the applicant, and they will be added as a member with approved status.
        </p>
        
        <div class="flex justify-end gap-2">
          <button 
            @click="showAcceptModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="acceptApplication" 
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Processing...' : 'Confirm Accept' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">Reject Application</h2>
        <p class="text-gray-700 mb-4">
          Please provide a reason for rejecting the application for 
          <span class="font-semibold">{{ selectedApplication ? formatFullName(selectedApplication) : '' }}</span>:
        </p>
        
        <div class="mb-4">
          <textarea 
            v-model="rejectionReason" 
            placeholder="Enter rejection reason..." 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[100px]"
          ></textarea>
          <p v-if="rejectionSubmitted && !rejectionReason" class="mt-1 text-sm text-red-600">
            Please provide a reason for rejection
          </p>
        </div>
        
        <div class="flex justify-end gap-2">
          <button 
            @click="showRejectModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="rejectApplication" 
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Processing...' : 'Confirm Reject' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>