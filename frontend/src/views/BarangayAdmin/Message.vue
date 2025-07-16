<template>
  <div class="h-screen flex bg-gray-50 relative">
    <!-- Mobile Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="closeMobileSidebar"
    ></div>

    <!-- Chat List Sidebar -->
    <div 
      class="bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50"
      :class="[
        // Desktop: Always visible with fixed width
        'md:w-1/3 md:relative md:translate-x-0',
        // Mobile: Full width overlay that slides in/out
        'fixed inset-y-0 left-0 w-full sm:w-80',
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Header -->
      <div class="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-white">Messages</h2>
            <p class="text-blue-100 text-xs sm:text-sm">Barangay President - {{ currentUserBarangay }}</p>
          </div>
          <!-- Mobile Close Button -->
          <button 
            @click="closeMobileSidebar"
            class="md:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <!-- Search Bar -->
      <div class="p-3 sm:p-4 border-b border-gray-200">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search contacts..."
            class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <!-- Contact Categories -->
      <div class="flex-1 overflow-y-auto">
        <!-- Federation President -->
        <div v-if="federationPresident" class="border-b border-gray-100">
          <div class="p-2 sm:p-3 bg-gray-50">
            <h3 class="text-xs sm:text-sm font-semibold text-gray-600 flex items-center">
              <Crown class="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-yellow-500" />
              Federation President
            </h3>
          </div>
          <div
            @click="selectChat(federationPresident)"
            :class="[
              'p-3 sm:p-4 hover:bg-blue-50 cursor-pointer transition-colors border-l-4',
              selectedChat?.id === federationPresident.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="relative flex-shrink-0">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown class="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {{ federationPresident.name || 'Federation President' }}
                </p>
                <p class="text-xs text-gray-500">Federation President</p>
              </div>
              <div v-if="getUnreadCount(federationPresident.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] sm:min-w-[20px] text-center flex-shrink-0">
                {{ getUnreadCount(federationPresident.id) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Other Barangay Presidents -->
        <div v-if="filteredBarangayPresidents.length > 0" class="border-b border-gray-100">
          <div class="p-2 sm:p-3 bg-gray-50">
            <h3 class="text-xs sm:text-sm font-semibold text-gray-600 flex items-center flex-wrap">
              <Users class="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-500" />
              <span class="mr-2">Other Barangay Presidents</span>
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {{ filteredBarangayPresidents.length }}
              </span>
            </h3>
          </div>
          <div
            v-for="president in filteredBarangayPresidents"
            :key="president.id"
            @click="selectChat(president)"
            :class="[
              'p-3 sm:p-4 hover:bg-blue-50 cursor-pointer transition-colors border-l-4',
              selectedChat?.id === president.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="relative flex-shrink-0">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <User class="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {{ president.name || 'Barangay President' }}
                </p>
                <p class="text-xs text-gray-500 truncate">Barangay {{ president.barangay }}</p>
              </div>
              <div v-if="getUnreadCount(president.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] sm:min-w-[20px] text-center flex-shrink-0">
                {{ getUnreadCount(president.id) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Members in Same Barangay -->
        <div v-if="filteredMembers.length > 0" class="border-b border-gray-100">
          <div class="p-2 sm:p-3 bg-gray-50">
            <h3 class="text-xs sm:text-sm font-semibold text-gray-600 flex items-center flex-wrap">
              <UserCheck class="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500" />
              <span class="mr-2">Members in {{ currentUserBarangay }}</span>
              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {{ filteredMembers.length }}
              </span>
            </h3>
          </div>
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            @click="selectChat(member)"
            :class="[
              'p-3 sm:p-4 hover:bg-blue-50 cursor-pointer transition-colors border-l-4',
              selectedChat?.id === member.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="relative flex-shrink-0">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <User class="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {{ member.name || 'Member' }}
                </p>
                <p class="text-xs text-gray-500">Member</p>
              </div>
              <div v-if="getUnreadCount(member.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] sm:min-w-[20px] text-center flex-shrink-0">
                {{ getUnreadCount(member.id) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoadingContacts" class="p-6 sm:p-8 text-center">
          <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-gray-500 text-sm">Loading contacts...</p>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoadingContacts && !federationPresident && filteredBarangayPresidents.length === 0 && filteredMembers.length === 0" class="p-6 sm:p-8 text-center">
          <MessageCircle class="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-sm">No contacts available</p>
        </div>
      </div>
    </div>
    
    <!-- Chat Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header with Menu Button -->
      <div class="md:hidden bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <button 
          @click="openMobileSidebar"
          class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu class="h-5 w-5" />
        </button>
        <h1 class="text-lg font-semibold text-gray-900">Messages</h1>
        <div class="w-9"></div> <!-- Spacer for centering -->
      </div>

      <div v-if="!selectedChat" class="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div class="text-center max-w-sm">
          <MessageCircle class="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p class="text-gray-500 text-sm">Choose a contact from the sidebar to start messaging</p>
          <!-- Mobile: Show button to open sidebar -->
          <button 
            @click="openMobileSidebar"
            class="md:hidden mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Contacts
          </button>
        </div>
      </div>
      
      <div v-else class="flex-1 flex flex-col min-h-0">
        <!-- Chat Header -->
        <div class="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center space-x-3">
            <!-- Mobile Back Button -->
            <button 
              @click="selectedChat = null"
              class="md:hidden p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft class="h-5 w-5" />
            </button>
            
            <div class="relative flex-shrink-0">
              <div :class="[
                'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                getChatHeaderColor(selectedChat)
              ]">
                <component :is="getChatHeaderIcon(selectedChat)" class="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm sm:text-lg font-medium text-gray-900 truncate">{{ selectedChat.name || 'Unknown' }}</h3>
              <p class="text-xs sm:text-sm text-gray-500 truncate">{{ getChatSubtitle(selectedChat) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="[
              'flex',
              message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
            ]"
          >
            <div :class="[
              'max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg',
              message.senderId === currentUser?.uid
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            ]">
              <p class="text-sm break-words">{{ message.text }}</p>
              <p :class="[
                'text-xs mt-1',
                message.senderId === currentUser?.uid ? 'text-blue-100' : 'text-gray-500'
              ]">
                {{ formatMessageTime(message.timestamp) }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Message Input -->
        <div class="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <form @submit.prevent="sendMessage" class="flex space-x-2 sm:space-x-3">
            <div class="flex-1">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type your message..."
                class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              :disabled="!newMessage.trim()"
              class="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send class="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, Crown, Users, User, UserCheck, MessageCircle, Send, X, Menu, ArrowLeft } from 'lucide-vue-next'
import { auth, db } from '@/services/firebase'
import {
  collection, query, where, orderBy, onSnapshot, addDoc,
  serverTimestamp, getDocs, updateDoc, doc, getDoc
} from 'firebase/firestore'

// Reactive data
const searchQuery = ref('')
const selectedChat = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)
const currentUser = ref(null)
const currentUserBarangay = ref('')
const currentUserName = ref('')
const isLoadingContacts = ref(true)
const debugInfo = ref('')

// Mobile sidebar state
const showMobileSidebar = ref(false)

// Data arrays
const federationPresident = ref(null)
const barangayPresidents = ref([])
const members = ref([])
const messages = ref([])
const unreadCounts = ref({})

// Mobile sidebar methods
const openMobileSidebar = () => {
  showMobileSidebar.value = true
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

// Computed properties
const filteredBarangayPresidents = computed(() => {
  let filtered = barangayPresidents.value.filter(president => 
    president.id !== currentUser.value?.uid
  )
  
  if (searchQuery.value) {
    filtered = filtered.filter(president =>
      (president.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (president.barangay || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return filtered
})

const filteredMembers = computed(() => {
  let filtered = members.value.filter(member => 
    member.barangay === currentUserBarangay.value
  )
  
  if (searchQuery.value) {
    filtered = filtered.filter(member =>
      (member.name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return filtered
})

const currentMessages = computed(() => {
  if (!selectedChat.value || !currentUser.value) return []
  
  return messages.value
    .filter(message => {
      const chatId = getChatId(currentUser.value.uid, selectedChat.value.id)
      return message.chatId === chatId
    })
    .sort((a, b) => {
      const aTime = a.timestamp?.seconds || 0
      const bTime = b.timestamp?.seconds || 0
      return aTime - bTime
    })
})

// Methods
const getChatId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_')
}

const selectChat = (contact) => {
  selectedChat.value = contact
  markMessagesAsRead(contact.id)
  // Close mobile sidebar when chat is selected
  closeMobileSidebar()
  nextTick(() => {
    scrollToBottom()
  })
}

const getChatHeaderColor = (contact) => {
  if (contact.role === 'FederationPresident') {
    return 'bg-gradient-to-br from-yellow-400 to-orange-500'
  } else if (contact.role === 'BarangayPresident') {
    return 'bg-gradient-to-br from-blue-400 to-blue-600'
  } else {
    return 'bg-gradient-to-br from-green-400 to-green-600'
  }
}

const getChatHeaderIcon = (contact) => {
  if (contact.role === 'FederationPresident') {
    return Crown
  } else {
    return User
  }
}

const getChatSubtitle = (contact) => {
  if (contact.role === 'FederationPresident') {
    return 'Federation President'
  } else if (contact.role === 'BarangayPresident') {
    return `Barangay President - ${contact.barangay || 'Unknown'}`
  } else {
    return `Member - ${contact.barangay || 'Unknown'}`
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value || !currentUser.value) return

  try {
    const chatId = getChatId(currentUser.value.uid, selectedChat.value.id)
    
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId: currentUser.value.uid,
      senderName: currentUserName.value || 'Barangay President',
      senderRole: 'BarangayPresident',
      receiverId: selectedChat.value.id,
      receiverName: selectedChat.value.name || 'Unknown',
      receiverRole: selectedChat.value.role,
      text: newMessage.value.trim(),
      timestamp: serverTimestamp(),
      read: false
    })

    newMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = timestamp.toDate()
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return 'Just now'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const getUnreadCount = (contactId) => {
  return unreadCounts.value[contactId] || 0
}

const markMessagesAsRead = async (contactId) => {
  if (!currentUser.value) return
  
  const chatId = getChatId(currentUser.value.uid, contactId)
  
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('receiverId', '==', currentUser.value.uid),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(messagesQuery)
    
    snapshot.forEach(async (messageDoc) => {
      await updateDoc(doc(db, 'messages', messageDoc.id), {
        read: true
      })
    })
    
    unreadCounts.value[contactId] = 0
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

// Data fetching functions
const fetchCurrentUserData = async () => {
  if (!currentUser.value) return

  try {
    const userDoc = await getDoc(doc(db, 'barangay_presidents', currentUser.value.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      currentUserBarangay.value = userData.barangay || ''
      currentUserName.value = userData.name || userData.firstName || userData.fullName || 'Barangay President'
    }
  } catch (error) {
    console.error('Error fetching current user data:', error)
  }
}

// Alternative approach: Find Federation President through messages or create a placeholder
const fetchFederationPresidentAlternative = async () => {
  try {
    debugInfo.value = 'Trying alternative approach...'
    
    // Method 1: Look for Federation President in existing messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('senderRole', '==', 'FederationPresident')
    )
    const messagesSnapshot = await getDocs(messagesQuery)
    
    if (!messagesSnapshot.empty) {
      const messageData = messagesSnapshot.docs[0].data()
      federationPresident.value = {
        id: messageData.senderId,
        name: messageData.senderName || 'Federation President',
        role: 'FederationPresident'
      }
      debugInfo.value = 'Found Federation President from messages'
      return
    }
    
    // Method 2: Create a placeholder Federation President
    // This assumes you know the Federation President's UID
    // Replace 'FEDERATION_PRESIDENT_UID' with the actual UID
    const knownFederationPresidentUID = 'FEDERATION_PRESIDENT_UID' // You need to replace this
    
    if (knownFederationPresidentUID !== 'FEDERATION_PRESIDENT_UID') {
      federationPresident.value = {
        id: knownFederationPresidentUID,
        name: 'Federation President',
        role: 'FederationPresident'
      }
      debugInfo.value = 'Using known Federation President UID'
      return
    }
    
    debugInfo.value = 'Federation President not found - please check Firebase setup'
    
  } catch (error) {
    console.error('Error in alternative Federation President fetch:', error)
    debugInfo.value = `Alternative fetch error: ${error.message}`
  }
}

const fetchFederationPresident = async () => {
  try {
    debugInfo.value = 'Fetching Federation President...'
    
    // Try the original approach first
    const adminsQuery = query(collection(db, 'admins'))
    const adminsSnapshot = await getDocs(adminsQuery)
    
    if (!adminsSnapshot.empty) {
      const doc = adminsSnapshot.docs[0]
      const data = doc.data()
      
      federationPresident.value = {
        id: doc.id,
        name: data.name || data.firstName || data.fullName || data.username || 'Federation President',
        role: 'FederationPresident',
        ...data
      }
      debugInfo.value = 'Federation President found in admins collection'
      return
    }
    
    debugInfo.value = 'No documents in admins collection, trying alternative...'
    await fetchFederationPresidentAlternative()
    
  } catch (error) {
    console.error('Error fetching federation president:', error)
    debugInfo.value = `Error: ${error.message}`
    
    // Try alternative approach if main approach fails
    await fetchFederationPresidentAlternative()
  }
}

const fetchBarangayPresidents = async () => {
  try {
    const presidentsQuery = query(collection(db, 'barangay_presidents'))
    const snapshot = await getDocs(presidentsQuery)
    
    const presidents = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      presidents.push({
        id: doc.id,
        name: data.name || data.firstName || data.fullName || 'Barangay President',
        barangay: data.barangay || 'Unknown',
        role: 'BarangayPresident',
        ...data
      })
    })
    
    barangayPresidents.value = presidents
  } catch (error) {
    console.error('Error fetching barangay presidents:', error)
  }
}

const fetchMembers = async () => {
  try {
    const membersQuery = query(
      collection(db, 'users'),
      where('barangay', '==', currentUserBarangay.value)
    )
    const snapshot = await getDocs(membersQuery)
    
    const membersList = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.role === 'Member' || !data.role) {
        membersList.push({
          id: doc.id,
          name: data.name || data.firstName || data.fullName || 'Member',
          barangay: data.barangay || 'Unknown',
          role: 'Member',
          ...data
        })
      }
    })
    
    members.value = membersList
  } catch (error) {
    console.error('Error fetching members:', error)
  }
}

const setupMessagesListener = () => {
  if (!currentUser.value) return

  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('timestamp', 'desc')
  )
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messagesList = []
    const counts = {}
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      messagesList.push({
        id: doc.id,
        ...data
      })
      
      // Count unread messages
      if (!data.read && data.receiverId === currentUser.value.uid) {
        counts[data.senderId] = (counts[data.senderId] || 0) + 1
      }
    })
    
    messages.value = messagesList
    unreadCounts.value = counts
  })
}

// Lifecycle
let unsubscribeMessages = null

onMounted(async () => {
  currentUser.value = auth.currentUser
  
  if (currentUser.value) {
    isLoadingContacts.value = true
    await fetchCurrentUserData()
    await fetchFederationPresident()
    await fetchBarangayPresidents()
    await fetchMembers()
    unsubscribeMessages = setupMessagesListener()
    isLoadingContacts.value = false
  }
})

onUnmounted(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Ensure proper touch scrolling on mobile */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
}

/* Prevent horizontal scroll on mobile */
.min-w-0 {
  min-width: 0;
}
</style>
