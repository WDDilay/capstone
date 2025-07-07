<template>
  <div class="h-screen flex bg-gray-50">
    <!-- Chat List Sidebar -->
    <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
        <h2 class="text-xl font-bold text-white">Messages</h2>
        <p class="text-purple-100 text-sm">Federation President</p>
      </div>

      <!-- Search Bar -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search barangay presidents..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Barangay Presidents List -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-3 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-600 flex items-center">
            <Users class="h-4 w-4 mr-2 text-blue-500" />
            Barangay Presidents
            <span class="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {{ filteredBarangayPresidents.length }}
            </span>
          </h3>
        </div>
        
        <div v-if="isLoadingContacts" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading contacts...</p>
        </div>

        <div v-else-if="filteredBarangayPresidents.length === 0" class="p-8 text-center">
          <MessageCircle class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500">No barangay presidents found</p>
        </div>

        <div v-else>
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
                  {{ president.name }}
                </p>
                <p class="text-xs text-gray-500">Barangay {{ president.barangay }}</p>
              </div>
              <div v-if="getUnreadCount(president.id)" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {{ getUnreadCount(president.id) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="flex-1 flex flex-col">
      <div v-if="!selectedChat" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <MessageCircle class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p class="text-gray-500">Choose a barangay president to start messaging</p>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-col">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User class="h-5 w-5 text-white" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">{{ selectedChat.name }}</h3>
              <p class="text-sm text-gray-500">Barangay President - {{ selectedChat.barangay }}</p>
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
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            ]">
              <p class="text-sm">{{ message.text }}</p>
              <p :class="[
                'text-xs mt-1',
                message.senderId === currentUser?.uid ? 'text-purple-100' : 'text-gray-500'
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
                class="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              :disabled="!newMessage.trim()"
              class="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
import { Search, Users, User, MessageCircle, Send } from 'lucide-vue-next'
import { auth, db } from '@/services/firebase'
import {
  collection, query, where, orderBy, onSnapshot, addDoc,
  serverTimestamp, getDocs, updateDoc, doc
} from 'firebase/firestore'

// Reactive data
const searchQuery = ref('')
const selectedChat = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)
const currentUser = ref(null)
const isLoadingContacts = ref(true)

// Data arrays
const barangayPresidents = ref([])
const messages = ref([])
const unreadCounts = ref({})

// Computed properties
const filteredBarangayPresidents = computed(() => {
  let filtered = barangayPresidents.value

  if (searchQuery.value) {
    filtered = filtered.filter(president =>
      president.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      president.barangay.toLowerCase().includes(searchQuery.value.toLowerCase())
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

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value || !currentUser.value) return

  try {
    const chatId = getChatId(currentUser.value.uid, selectedChat.value.id)
    
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId: currentUser.value.uid,
      senderName: 'Federation President',
      senderRole: 'FederationPresident',
      receiverId: selectedChat.value.id,
      receiverName: selectedChat.value.name,
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
        name: data.name || 'Barangay President',
        barangay: data.barangay,
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
