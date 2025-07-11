<template>
  <div class="h-screen flex bg-gray-50">
    <!-- Chat List Sidebar -->
    <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <h2 class="text-xl font-bold text-white">Messages</h2>
        <p class="text-blue-100 text-sm">Barangay President - {{ currentUserBarangay }}</p>
      </div>
      
      <!-- Search Bar -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search contacts..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <!-- Contact Categories -->
      <div class="flex-1 overflow-y-auto">
        <!-- Federation President -->
        <div v-if="federationPresident" class="border-b border-gray-100">
          <div class="p-3 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-600 flex items-center">
              <Crown class="h-4 w-4 mr-2 text-yellow-500" />
              Federation President
            </h3>
          </div>
          <div
            @click="selectChat(federationPresident)"
            :class="[
              'p-4 hover:bg-blue-50 cursor-pointer transition-colors border-l-4',
              selectedChat?.id === federationPresident.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown class="h-5 w-5 text-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ federationPresident.name || 'Federation President' }}
                </p>
                <p class="text-xs text-gray-500">Federation President</p>
              </div>
              <div v-if="getUnreadCount(federationPresident.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {{ getUnreadCount(federationPresident.id) }}
              </div>
            </div>
          </div>
        </div>
        
        
        
        <!-- Other Barangay Presidents -->
        <div v-if="filteredBarangayPresidents.length > 0" class="border-b border-gray-100">
          <div class="p-3 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-600 flex items-center">
              <Users class="h-4 w-4 mr-2 text-blue-500" />
              Other Barangay Presidents
              <span class="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {{ filteredBarangayPresidents.length }}
              </span>
            </h3>
          </div>
          <div
            v-for="president in filteredBarangayPresidents"
            :key="president.id"
            @click="selectChat(president)"
            :class="[
              'p-4 hover:bg-blue-50 cursor-pointer transition-colors border-l-4',
              selectedChat?.id === president.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <User class="h-5 w-5 text-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ president.name || 'Barangay President' }}
                </p>
                <p class="text-xs text-gray-500">Barangay {{ president.barangay }}</p>
              </div>
              <div v-if="getUnreadCount(president.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {{ getUnreadCount(president.id) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Members in Same Barangay -->
        <div v-if="filteredMembers.length > 0" class="border-b border-gray-100">
          <div class="p-3 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-600 flex items-center">
              <UserCheck class="h-4 w-4 mr-2 text-green-500" />
              Members in {{ currentUserBarangay }}
              <span class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {{ filteredMembers.length }}
              </span>
            </h3>
          </div>
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            @click="selectChat(member)"
            :class="[
              'p-4 hover:bg-blue-50 cursor-pointer transition-colors border-l-4',
              selectedChat?.id === member.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <User class="h-5 w-5 text-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ member.name || 'Member' }}
                </p>
                <p class="text-xs text-gray-500">Member</p>
              </div>
              <div v-if="getUnreadCount(member.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {{ getUnreadCount(member.id) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoadingContacts" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading contacts...</p>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoadingContacts && !federationPresident && filteredBarangayPresidents.length === 0 && filteredMembers.length === 0" class="p-8 text-center">
          <MessageCircle class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500">No contacts available</p>
        </div>
      </div>
    </div>
    
    <!-- Chat Area -->
    <div class="flex-1 flex flex-col">
      <div v-if="!selectedChat" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <MessageCircle class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p class="text-gray-500">Choose a contact from the sidebar to start messaging</p>
        </div>
      </div>
      
      <div v-else class="flex-1 flex flex-col">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                getChatHeaderColor(selectedChat)
              ]">
                <component :is="getChatHeaderIcon(selectedChat)" class="h-5 w-5 text-white" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">{{ selectedChat.name || 'Unknown' }}</h3>
              <p class="text-sm text-gray-500">{{ getChatSubtitle(selectedChat) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            :class="[
              'flex',
              message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
            ]"
          >
            <div :class="[
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
              message.senderId === currentUser?.uid
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            ]">
              <p class="text-sm">{{ message.text }}</p>
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
        <div class="p-4 border-t border-gray-200 bg-white">
          <form @submit.prevent="sendMessage" class="flex space-x-3">
            <div class="flex-1">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type your message..."
                class="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              :disabled="!newMessage.trim()"
              class="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send class="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, Crown, Users, User, UserCheck, MessageCircle, Send } from 'lucide-vue-next'
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

// Data arrays
const federationPresident = ref(null)
const barangayPresidents = ref([])
const members = ref([])
const messages = ref([])
const unreadCounts = ref({})

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
</style>
