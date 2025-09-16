<template>
  <div class="h-screen flex bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden z-60">
    <!-- Mobile Overlay -->
    <div 
      v-if="showMobileSidebar"
      class="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black bg-opacity-70 z-40 md:hidden backdrop-blur-md"
      @click="closeMobileSidebar"
    ></div>

    <!-- Chat List Sidebar -->
    <div 
      class="bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r-2 border-maroon-200 flex flex-col transition-all duration-300 ease-in-out z-50 shadow-2xl"
      :class="[
        // Desktop: Always visible with fixed width
        'md:w-1/3 lg:w-1/4 xl:w-1/5 md:relative md:translate-x-0',
        // Mobile: Full width overlay that slides in/out
        'fixed inset-y-0 left-0 w-full sm:w-80',
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Header - Fixed -->
      <div class="sticky top-0 z-30 p-3 sm:p-4 lg:p-6 border-b-2 border-maroon-300 bg-gradient-to-br from-maroon-700 via-maroon-600 to-maroon-800 shadow-xl">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-maroon-800 drop-shadow-lg truncate">Messages</h2>
            <p class="text-yellow-300 text-xs sm:text-sm lg:text-base font-semibold mt-1 truncate">Federation President</p>
          </div>
          <!-- Mobile Close Button -->
          <button 
            @click="closeMobileSidebar"
            class="md:hidden p-2 lg:p-3 text-white hover:bg-white hover:bg-opacity-25 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md flex-shrink-0"
          >
            <X class="h-5 w-5 lg:h-6 lg:w-6" />
          </button>
        </div>
      </div>
      
      <!-- Search Bar - Fixed -->
      <div class="sticky top-16 sm:top-20 lg:top-24 z-20 p-3 sm:p-4 lg:p-6 border-b border-gray-300 bg-gradient-to-r from-gray-50 via-white to-gray-50 shadow-sm">
        <div class="relative">
          <Search class="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-maroon-500 h-4 w-4 lg:h-5 lg:w-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search barangay presidents..."
            class="w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 text-sm lg:text-base border-2 border-maroon-300 rounded-xl focus:ring-3 focus:ring-maroon-400 focus:border-maroon-500 bg-white shadow-md transition-all duration-200 hover:shadow-lg placeholder-gray-500"
          />
        </div>
      </div>
      
      <!-- Barangay Presidents List - Scrollable with fixed header -->
      <div class="flex-1 overflow-y-auto" style="height: calc(100vh - 180px);">
        <!-- Fixed header overlap by adjusting z-index and positioning -->
        <div class="sticky top-0 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-maroon-100 via-yellow-50 to-maroon-100 border-b border-maroon-200 shadow-sm z-40">
          <h3 class="text-xs sm:text-sm lg:text-base font-bold text-maroon-800 flex items-center flex-wrap">
            <Users class="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2 text-maroon-600" />
            <span class="mr-2">Barangay Presidents</span>
            <span class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-maroon-900 text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1 rounded-full font-bold shadow-lg border border-yellow-600">
              {{ filteredBarangayPresidents.length }}
            </span>
          </h3>
        </div>
        
        <div v-if="isLoadingContacts" class="p-6 sm:p-8 lg:p-12 text-center bg-gradient-to-br from-white to-gray-50">
          <div class="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-4 border-maroon-500 border-t-transparent mx-auto shadow-lg"></div>
          <p class="mt-4 text-maroon-700 text-sm lg:text-base font-semibold">Loading contacts...</p>
        </div>
        
        <div v-else-if="filteredBarangayPresidents.length === 0" class="p-6 sm:p-8 lg:p-12 text-center bg-gradient-to-br from-white to-gray-50">
          <MessageCircle class="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-maroon-400 mx-auto mb-6" />
          <p class="text-maroon-600 text-sm lg:text-base font-semibold">No barangay presidents found</p>
        </div>
        
        <div v-else class="bg-gradient-to-b from-white to-gray-50">
          <div
            v-for="president in filteredBarangayPresidents"
            :key="president.id"
            @click="selectChat(president)"
            :class="[
              'p-3 sm:p-4 lg:p-4 hover:bg-gradient-to-r hover:from-maroon-50 hover:via-yellow-50 hover:to-maroon-50 cursor-pointer transition-all duration-300 border-l-4 transform hover:scale-[1.02] hover:shadow-xl mx-2 my-1 rounded-r-xl',
              selectedChat?.id === president.id ? 'bg-gradient-to-r from-maroon-200 via-yellow-100 to-maroon-200 border-maroon-600 shadow-xl scale-[1.02]' : 'border-transparent hover:border-maroon-400'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="relative flex-shrink-0">
                <!-- Changed profile background from maroon to blue -->
                <div class="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <span class="text-white font-bold text-sm sm:text-base lg:text-lg">
                    {{ getInitials(president.name) }}
                  </span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-green-500 border-2 border-white rounded-full shadow-md pulse-animation"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm sm:text-base lg:text-base font-bold text-maroon-900 truncate">
                  {{ president.name || 'Barangay President' }}
                </p>
                <p class="text-xs sm:text-sm lg:text-sm text-maroon-600 truncate font-semibold">
                  Brgy. {{ president.barangay || 'Unknown' }}
                </p>
              </div>
              <div v-if="getUnreadCount(president.id)" class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0 font-bold shadow-lg border border-red-400 bounce-animation">
                {{ getUnreadCount(president.id) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chat Area -->
    <div class="flex-1 flex flex-col min-w-0 relative bg-gradient-to-br from-gray-50 via-white to-gray-100 h-screen">
      <!-- Logo Background -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div class="opacity-[0.03] transform scale-150">
          <div class="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-maroon-600 via-maroon-700 to-black rounded-full flex items-center justify-center shadow-2xl border-4 border-maroon-500">
            <div class="text-white text-6xl lg:text-8xl font-bold drop-shadow-2xl">SP</div>
          </div>
        </div>
      </div>

      <!-- Mobile Header with Menu Button -->
      <div class="md:hidden sticky top-0 z-60 bg-gradient-to-r from-white via-gray-50 to-white border-b-2 border-maroon-200 p-3 lg:p-4 flex items-center justify-between shadow-xl backdrop-blur-lg bg-opacity-95">
        <button 
          @click="openMobileSidebar"
          class="p-2 lg:p-3 text-maroon-700 hover:bg-maroon-100 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md"
        >
          <Menu class="h-6 w-6" />
        </button>
        <h1 class="text-lg lg:text-xl font-bold text-maroon-800 drop-shadow-sm">Messages</h1>
        <div class="w-10 lg:w-12"></div>
      </div>

      <div v-if="!selectedChat" class="flex-1 flex items-center justify-center bg-transparent p-4 lg:p-8 relative z-10">
        <div class="text-center max-w-sm lg:max-w-md bg-gradient-to-br from-maroon via-gray-50 to-white bg-opacity-95 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl border-2 border-maroon-200">
          <MessageCircle class="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-maroon-500 mx-auto mb-6 animate-pulse" />
          <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-maroon-800 mb-4">Select a conversation</h3>
          <p class="text-maroon-600 text-sm lg:text-base mb-6 font-medium">Choose a barangay president to start messaging</p>
          <button 
            @click="openMobileSidebar"
            class="md:hidden px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-xl hover:from-maroon-700 hover:to-maroon-800 transition-all duration-200 transform hover:scale-105 shadow-xl font-bold border border-maroon-500"
          >
            View Contacts
          </button>
        </div>
      </div>
      
      <div v-else class="flex-1 flex flex-col min-h-0 relative z-10 h-full">
        <!-- Chat Header - Fixed with proper z-index -->
        <div class="sticky top-0 z-60 p-3 sm:p-4 lg:p-6 border-b-2 border-maroon-200 bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-lg shadow-xl">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <button 
              @click="selectedChat = null"
              class="md:hidden p-2 text-maroon-700 hover:bg-maroon-100 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md"
            >
              <ArrowLeft class="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
            
            <div class="relative flex-shrink-0">
              <!-- Changed chat header profile background to blue to match contact list -->
              <div class="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center shadow-xl border-2 border-white">
                <span class="text-white font-bold text-sm sm:text-lg lg:text-xl">
                  {{ getInitials(selectedChat.name) }}
                </span>
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-green-400 to-green-500 border-3 border-white rounded-full shadow-md pulse-animation"></div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base sm:text-lg lg:text-xl font-bold text-maroon-800 truncate">{{ selectedChat.name || 'Barangay President' }}</h3>
              <p class="text-xs sm:text-sm lg:text-base text-maroon-600 truncate font-semibold">Barangay President - {{ selectedChat.barangay || 'Unknown' }}</p>
            </div>
          </div>
        </div>
        
        <!-- Messages Area - Fixed height with scroll -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 bg-maroon" style="height: calc(100vh - 200px); max-height: calc(100vh - 200px);">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="[
              'flex items-end space-x-2 lg:space-x-3',
              message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
            ]"
          >
            <!-- Avatar for received messages -->
            <div 
              v-if="message.senderId !== currentUser?.uid" 
              class="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-lg border border-white"
            >
              <span class="text-white font-bold text-xs lg:text-sm">
                {{ getInitials(selectedChat.name) }}
              </span>
            </div>
            
            <!-- Message Bubble -->
            <div 
              :class="[
                'relative max-w-[75%] sm:max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 lg:px-5 lg:py-4 shadow-xl border-2',
                message.senderId === currentUser?.uid
                  ? 'bg-gradient-to-br from-maroon-600 via-maroon-700 to-maroon-800 text-white rounded-2xl rounded-br-md message-bubble-sent border-maroon-700'
                  : 'bg-gradient-to-br from-white via-gray-50 to-white text-maroon-900 border-maroon-200 rounded-2xl rounded-bl-md message-bubble-received'
              ]"
            >
              <div 
                v-if="message.senderId === currentUser?.uid"
                class="absolute -bottom-0 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-maroon-700 transform rotate-45 rounded-sm border border-maroon-600"
                style="clip-path: polygon(0% 0%, 100% 100%, 0% 100%)"
              ></div>
              
              <div 
                v-else
                class="absolute -bottom-0 -left-1 w-4 h-4 lg:w-5 lg:h-5 bg-white border-l-2 border-b-2 border-maroon-200 transform rotate-45 rounded-sm"
                style="clip-path: polygon(0% 0%, 100% 0%, 0% 100%)"
              ></div>
              
              <!-- Changed sender message text to black -->
              <p :class="[
                'text-sm lg:text-base break-words relative z-10 font-medium leading-relaxed',
                message.senderId === currentUser?.uid ? 'text-black' : 'text-maroon-900'
              ]">{{ message.text }}</p>
              <!-- Changed sender message timestamp to maroon -->
              <p 
                :class="[
                  'text-xs lg:text-sm mt-2 relative z-10 font-semibold',
                  message.senderId === currentUser?.uid ? 'text-maroon-600' : 'text-maroon-500'
                ]"
              >
                {{ formatMessageTime(message.timestamp) }}
              </p>
            </div>
            
            <!-- Avatar for sent messages -->
            <div 
              v-if="message.senderId === currentUser?.uid" 
              class="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-lg border border-white"
            >
              <span class="text-white font-bold text-xs lg:text-sm">FP</span>
            </div>
          </div>
        </div>
        
        <!-- Message Input - Fixed at bottom -->
        <div class="sticky bottom-0 z-60 p-3 sm:p-4 lg:p-6 border-t-2 border-maroon-200 bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-lg shadow-2xl">
          <form @submit.prevent="sendMessage" class="flex space-x-3 lg:space-x-4">
            <div class="flex-1">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type your message..."
                class="w-full px-4 py-3 lg:px-6 lg:py-4 text-sm lg:text-base border-2 border-maroon-300 rounded-full focus:ring-3 focus:ring-maroon-400 focus:border-maroon-500 bg-white shadow-lg transition-all duration-200 hover:shadow-xl placeholder-maroon-400"
              />
            </div>
            <button
              type="submit"
              :disabled="!newMessage.trim()"
              class="px-4 py-3 lg:px-6 lg:py-4 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-full hover:from-maroon-700 hover:to-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-xl transform hover:scale-105 disabled:hover:scale-100 border border-maroon-500"
            >
              <Send class="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, Users, MessageCircle, Send, X, Menu, ArrowLeft } from 'lucide-vue-next'
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
const currentUserName = ref('')
const isLoadingContacts = ref(true)

// Mobile sidebar state
const showMobileSidebar = ref(false)

// Data arrays
const barangayPresidents = ref([])
const messages = ref([])
const unreadCounts = ref({})

// Mobile sidebar methods
const openMobileSidebar = () => {
  showMobileSidebar.value = true
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

// Method to get initials from name
const getInitials = (name) => {
  if (!name) return 'BP'
  const words = name.trim().split(' ')
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

// Computed properties
const filteredBarangayPresidents = computed(() => {
  let filtered = barangayPresidents.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(president =>
      (president.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (president.barangay || '').toLowerCase().includes(searchQuery.value.toLowerCase())
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
  closeMobileSidebar()
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value || !currentUser.value) return

  try {
    const chatId = getChatId(currentUser.value.uid, selectedChat.value.id)
    
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId: currentUser.value.uid,
      senderName: currentUserName.value || 'Federation President',
      senderRole: 'FederationPresident',
      receiverId: selectedChat.value.id,
      receiverName: selectedChat.value.name || 'Barangay President',
      receiverRole: 'BarangayPresident',
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
    const userDoc = await getDoc(doc(db, 'admins', currentUser.value.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      currentUserName.value = userData.name || userData.firstName || userData.fullName || 'Federation President'
    }
  } catch (error) {
    console.error('Error fetching current user data:', error)
  }
}

const fetchBarangayPresidents = async () => {
  try {
    isLoadingContacts.value = true
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
    isLoadingContacts.value = false
  } catch (error) {
    console.error('Error fetching barangay presidents:', error)
    isLoadingContacts.value = false
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
    await fetchCurrentUserData()
    await fetchBarangayPresidents()
    unsubscribeMessages = setupMessagesListener()
  }
})

onUnmounted(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }
})
</script>
<style scoped>
/* Define maroon color variables */
:root {
  --maroon-50: #fdf2f8;
  --maroon-100: #fce7f3;
  --maroon-200: #f9d4e8;
  --maroon-300: #f5a3c7;
  --maroon-400: #8b0000;
  --maroon-500: #800020;
  --maroon-600: #701a23;
  --maroon-700: #5c1417;
  --maroon-800: #4a0e12;
  --maroon-900: #3a0a0d;
}

/* Maroon color utilities */
.bg-maroon-50 { background-color: #fdf2f8; }
.bg-maroon-100 { background-color: #fce7f3; }
.bg-maroon-200 { background-color: #f9d4e8; }
.bg-maroon-400 { background-color: #8b0000; }
.bg-maroon-500 { background-color: #800020; }
.bg-maroon-600 { background-color: #701a23; }
.bg-maroon-700 { background-color: #5c1417; }
.bg-maroon-800 { background-color: #4a0e12; }

.text-maroon-400 { color: #8b0000; }
.text-maroon-500 { color: #800020; }
.text-maroon-600 { color: #701a23; }
.text-maroon-700 { color: #5c1417; }
.text-maroon-800 { color: #4a0e12; }
.text-maroon-900 { color: #3a0a0d; }

.border-maroon-200 { border-color: #f9d4e8; }
.border-maroon-300 { border-color: #f5a3c7; }
.border-maroon-400 { border-color: #8b0000; }
.border-maroon-500 { border-color: #800020; }
.border-maroon-600 { border-color: #701a23; }
.border-maroon-700 { border-color: #5c1417; }

.ring-maroon-400 { --tw-ring-color: #8b0000; }
.ring-maroon-500 { --tw-ring-color: #800020; }

.focus\:border-maroon-500:focus { border-color: #800020; }
.focus\:ring-maroon-400:focus { --tw-ring-color: #8b0000; }
.focus\:ring-maroon-500:focus { --tw-ring-color: #800020; }

.hover\:bg-maroon-50:hover { background-color: #fdf2f8; }
.hover\:bg-maroon-100:hover { background-color: #fce7f3; }
.hover\:from-maroon-700:hover { --tw-gradient-from: #5c1417; }
.hover\:to-maroon-800:hover { --tw-gradient-to: #4a0e12; }
.hover\:border-maroon-400:hover { border-color: #8b0000; }

.from-maroon-50 { --tw-gradient-from: #fdf2f8; }
.from-maroon-100 { --tw-gradient-from: #fce7f3; }
.from-maroon-200 { --tw-gradient-from: #f9d4e8; }
.from-maroon-600 { --tw-gradient-from: #701a23; }
.from-maroon-700 { --tw-gradient-from: #5c1417; }

.via-maroon-50 { --tw-gradient-via: #fdf2f8; }
.via-maroon-100 { --tw-gradient-via: #fce7f3; }
.via-maroon-600 { --tw-gradient-via: #701a23; }
.via-maroon-700 { --tw-gradient-via: #5c1417; }

.to-maroon-100 { --tw-gradient-to: #fce7f3; }
.to-maroon-200 { --tw-gradient-to: #f9d4e8; }
.to-maroon-700 { --tw-gradient-to: #5c1417; }
.to-maroon-800 { --tw-gradient-to: #4a0e12; }

.placeholder-maroon-400::placeholder { color: #8b0000; }

/* Fixed z-index layering */
.sticky {
  position: -webkit-sticky;
  position: sticky;
}

/* Ensure proper stacking order */
.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

.z-60 {
  z-index: 60;
}

/* Custom scrollbar with enhanced maroon theme */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #800020, #701a23);
  border-radius: 3px;
  border: 1px solid #5c1417;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #701a23, #5c1417);
}

/* Ensure proper touch scrolling on mobile */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Prevent horizontal scroll on mobile */
.min-w-0 {
  min-width: 0;
}

/* Enhanced message bubble animations */
.message-bubble-sent,
.message-bubble-received {
  animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced hover effects for message bubbles */
.message-bubble-sent:hover,
.message-bubble-received:hover {
  transform: translateY(-2px) scale(1.02);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pulse animation for online status */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* Bounce animation for unread badges */
.bounce-animation {
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -6px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -3px, 0);
  }
  90% {
    transform: translate3d(0, -1px, 0);
  }
}

/* Backdrop blur support */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

.backdrop-blur-lg {
  backdrop-filter: blur(16px);
}

.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

/* Enhanced border utilities */
.border-2 {
  border-width: 2px;
}

.border-3 {
  border-width: 3px;
}

/* Focus ring utilities */
.focus\:ring-3:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

/* Fix for overlapping headers */
.sticky.top-0 {
  position: sticky;
  top: 0;
}

/* Mobile specific fixes */
@media (max-width: 768px) {
  /* Ensure mobile header doesn't get covered */
  .md\:hidden.sticky.top-0 {
    z-index: 50;
  }
  
  /* Adjust message container height for mobile */
  .message-container-mobile {
    height: calc(100vh - 220px);
    max-height: calc(100vh - 220px);
  }
  
  /* Smaller message bubbles on mobile */
  .message-bubble-sent,
  .message-bubble-received {
    max-width: 85%;
  }
  
  /* Better contact list sizing */
  .contact-item {
    padding: 12px 16px;
  }
  
  /* Truncate long barangay names */
  .barangay-name {
    max-width: 140px;
  }
}

/* Desktop specific adjustments */
@media (min-width: 769px) {
  .message-container-desktop {
    height: calc(100vh - 180px);
    max-height: calc(100vh - 180px);
  }
}

/* Improved truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Enhanced focus styles for accessibility */
button:focus,
input:focus {
  outline: 2px solid #800020;
  outline-offset: 2px;
}

/* Loading animation enhancement */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Enhanced pulse animation for icons */
.animate-pulse {
  animation: pulse-icon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-icon {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Message input focus styles */
input[type="text"]:focus {
  box-shadow: 0 0 0 3px rgba(128, 0, 32, 0.1);
}

/* Button hover animations */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Contact list item improvements */
.contact-item:hover {
  box-shadow: 0 4px 12px rgba(128, 0, 32, 0.15);
}

/* Avatar initials styling */
.avatar-initials {
  font-weight: 700;
  letter-spacing: -0.5px;
}

/* Message timestamp styling */
.message-timestamp {
  opacity: 0.8;
  font-size: 0.75rem;
}

/* Unread badge styling */
.unread-badge {
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Responsive font sizes */
@media (max-width: 640px) {
  .text-responsive-sm {
    font-size: 0.875rem;
  }
  .text-responsive-base {
    font-size: 1rem;
  }
}

@media (min-width: 640px) and (max-width: 1024px) {
  .text-responsive-sm {
    font-size: 1rem;
  }
  .text-responsive-base {
    font-size: 1.125rem;
  }
}

@media (min-width: 1024px) {
  .text-responsive-sm {
    font-size: 1.125rem;
  }
  .text-responsive-base {
    font-size: 1.25rem;
  }
}

/* Fix for white text in sent messages */
.message-bubble-sent .text-white {
  color: white !important;
}

.message-bubble-sent p {
  color: black !important;
}

.message-bubble-sent .text-maroon-600 {
  color: #701a23 !important;
}

/* Ensure proper contrast for received messages */
.message-bubble-received .text-maroon-900 {
  color: #3a0a0d !important;
}

/* Mobile sidebar overlay improvements */
@media (max-width: 768px) {
  .mobile-sidebar-overlay {
    backdrop-filter: blur(8px);
    background: rgba(0, 0, 0, 0.5);
  }
  
  .mobile-sidebar {
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  }
}

/* Contact list spacing improvements */
.contact-list-item {
  margin: 4px 8px;
  border-radius: 0 12px 12px 0;
}

.contact-list-item.selected {
  box-shadow: 0 4px 16px rgba(128, 0, 32, 0.2);
}

/* Message area scrollbar styling */
.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(128, 0, 32, 0.3);
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 0, 32, 0.5);
}

/* Improved message spacing */
.message-item {
  margin-bottom: 12px;
}

.message-item:last-child {
  margin-bottom: 0;
}
</style>
