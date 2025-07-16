<template>
  <div class="h-screen bg-gray-50 relative">
    <!-- Mobile Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="closeMobileSidebar"
    ></div>

    <!-- Layout Container -->
    <div class="h-full flex">
      <!-- Chat List Sidebar -->
      <div 
        class="bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out"
        :class="[
          // Desktop: Always visible with fixed width
          'md:w-1/3 md:relative md:translate-x-0 md:flex-shrink-0 md:z-10',
          // Mobile: Full width overlay that slides in/out
          'fixed inset-y-0 left-0 w-full sm:w-80 md:static z-50',
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
      >
        <!-- Header -->
        <div class="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-white">Messages</h2>
              <p class="text-green-100 text-xs sm:text-sm">Member - {{ currentUserBarangay }}</p>
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
              class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <!-- Contact Categories -->
        <div class="flex-1 overflow-y-auto">
          <!-- Barangay President -->
          <div v-if="barangayPresident" class="border-b border-gray-100">
            <div class="p-2 sm:p-3 bg-gray-50">
              <h3 class="text-xs sm:text-sm font-semibold text-gray-600 flex items-center">
                <Crown class="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-500" />
                Your Barangay President
              </h3>
            </div>
            <div
              @click="selectChat(barangayPresident)"
              :class="[
                'p-3 sm:p-4 hover:bg-green-50 cursor-pointer transition-colors border-l-4',
                selectedChat?.id === barangayPresident.id ? 'bg-green-50 border-green-500' : 'border-transparent'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="relative flex-shrink-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <Crown class="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {{ barangayPresident.name || 'Barangay President' }}
                  </p>
                  <p class="text-xs text-gray-500">Barangay President</p>
                </div>
                <div v-if="getUnreadCount(barangayPresident.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] sm:min-w-[20px] text-center flex-shrink-0">
                  {{ getUnreadCount(barangayPresident.id) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Other Members in Same Barangay -->
          <div v-if="filteredMembers.length > 0" class="border-b border-gray-100">
            <div class="p-2 sm:p-3 bg-gray-50">
              <h3 class="text-xs sm:text-sm font-semibold text-gray-600 flex items-center flex-wrap">
                <Users class="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500" />
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
                'p-3 sm:p-4 hover:bg-green-50 cursor-pointer transition-colors border-l-4',
                selectedChat?.id === member.id ? 'bg-green-50 border-green-500' : 'border-transparent'
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
            <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-green-500 border-t-transparent mx-auto"></div>
            <p class="mt-2 text-gray-500 text-sm">Loading contacts...</p>
          </div>
          
          <!-- Empty State -->
          <div v-if="!isLoadingContacts && !barangayPresident && filteredMembers.length === 0" class="p-6 sm:p-8 text-center">
            <MessageCircle class="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 text-sm">No contacts available</p>
          </div>
        </div>
      </div>
      
      <!-- Chat Area -->
      <div class="flex-1 flex flex-col min-w-0 md:flex-shrink">
        <!-- Mobile Header with Menu Button -->
        <div class="md:hidden bg-white border-b border-gray-200 p-3 flex items-center justify-between relative z-30">
          <button 
            @click="openMobileSidebar"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
          >
            <Menu class="h-5 w-5" />
          </button>
          <h1 class="text-lg font-semibold text-gray-900">Messages</h1>
          <div class="w-9"></div> <!-- Spacer for centering -->
        </div>

        <!-- Debug indicator (remove after testing) -->
        <div v-if="showMobileSidebar" class="md:hidden fixed top-16 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs z-50">
          Sidebar Open: {{ showMobileSidebar }}
        </div>

        <div v-if="!selectedChat" class="flex-1 flex items-center justify-center bg-gray-50 p-4">
          <div class="text-center max-w-sm">
            <MessageCircle class="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p class="text-gray-500 text-sm">Choose a contact from the sidebar to start messaging</p>
            <!-- Mobile: Show button to open sidebar -->
            <button 
              @click="openMobileSidebar"
              class="md:hidden mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              ]">
                <p class="text-sm break-words">{{ message.text }}</p>
                <p :class="[
                  'text-xs mt-1',
                  message.senderId === currentUser?.uid ? 'text-green-100' : 'text-gray-500'
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
                  class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                :disabled="!newMessage.trim()"
                class="px-4 sm:px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send class="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, Crown, Users, User, MessageCircle, Send, X, Menu, ArrowLeft } from 'lucide-vue-next'
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

// Mobile sidebar state
const showMobileSidebar = ref(false)

// Data arrays
const barangayPresident = ref(null)
const members = ref([])
const messages = ref([])
const unreadCounts = ref({})

// Mobile sidebar methods
const openMobileSidebar = () => {
  console.log('Opening mobile sidebar') // Debug log
  showMobileSidebar.value = true
}

const closeMobileSidebar = () => {
  console.log('Closing mobile sidebar') // Debug log
  showMobileSidebar.value = false
}

// Computed properties
const filteredMembers = computed(() => {
  let filtered = members.value.filter(member => 
    member.barangay === currentUserBarangay.value && 
    member.id !== currentUser.value?.uid
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
  if (contact.role === 'BarangayPresident') {
    return 'bg-gradient-to-br from-blue-400 to-blue-600'
  } else {
    return 'bg-gradient-to-br from-green-400 to-green-600'
  }
}

const getChatHeaderIcon = (contact) => {
  if (contact.role === 'BarangayPresident') {
    return Crown
  } else {
    return User
  }
}

const getChatSubtitle = (contact) => {
  if (contact.role === 'BarangayPresident') {
    return 'Barangay President'
  } else {
    return 'Member'
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value || !currentUser.value) return

  try {
    const chatId = getChatId(currentUser.value.uid, selectedChat.value.id)
    
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId: currentUser.value.uid,
      senderName: currentUserName.value || 'Member',
      senderRole: 'Member',
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
    // Try users collection first
    const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      currentUserBarangay.value = userData.barangay || ''
      currentUserName.value = userData.name || userData.firstName || userData.fullName || 'Member'
      return
    }

    // Try solo_parents collection as fallback
    const soloParentsQuery = query(
      collection(db, 'solo_parents'),
      where('uid', '==', currentUser.value.uid)
    )
    const soloParentsSnapshot = await getDocs(soloParentsQuery)
    
    if (!soloParentsSnapshot.empty) {
      const userData = soloParentsSnapshot.docs[0].data()
      currentUserBarangay.value = userData.barangay || userData.Barangay || ''
      currentUserName.value = userData.name || userData.firstName || userData.fullName || 'Member'
    }
  } catch (error) {
    console.error('Error fetching current user data:', error)
  }
}

const fetchBarangayPresident = async () => {
  if (!currentUserBarangay.value) return

  try {
    const presidentsQuery = query(
      collection(db, 'barangay_presidents'),
      where('barangay', '==', currentUserBarangay.value)
    )
    const snapshot = await getDocs(presidentsQuery)
    
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data()
      barangayPresident.value = {
        id: snapshot.docs[0].id,
        name: data.name || data.firstName || data.fullName || 'Barangay President',
        barangay: data.barangay,
        role: 'BarangayPresident',
        ...data
      }
    }
  } catch (error) {
    console.error('Error fetching barangay president:', error)
  }
}

const fetchMembers = async () => {
  if (!currentUserBarangay.value) return

  try {
    const membersQuery = query(
      collection(db, 'users'),
      where('barangay', '==', currentUserBarangay.value)
    )
    const snapshot = await getDocs(membersQuery)
    
    const membersList = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.role === 'Member' || !data.role) { // Include users without explicit role
        membersList.push({
          id: doc.id,
          name: data.name || data.firstName || data.fullName || 'Member',
          barangay: data.barangay,
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
    await fetchBarangayPresident()
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
