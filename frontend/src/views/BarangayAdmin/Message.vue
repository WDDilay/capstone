<template>
  <div class="h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
    <!-- Mobile Overlay -->
    <div 
      v-if="showMobileSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden mobile-sidebar-overlay"
      @click="closeMobileSidebar"
    ></div>

    <!-- Layout Container -->
    <div class="h-full flex">
      <!-- Chat List Sidebar -->
      <div 
        class="bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300 ease-out shadow-xl mobile-sidebar"
        :class="[
          'md:w-80 md:relative md:translate-x-0 md:flex-shrink-0 md:z-10',
          'fixed inset-y-0 left-0 w-full sm:w-80 md:static z-50',
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
      >
        <!-- Header -->
        <div class="p-4 border-b border-slate-200/60 bg-gradient-to-r from-maroon-800 to-maroon-600 relative overflow-hidden sticky top-0 z-20">
          <div class="flex items-center justify-between relative z-10">
            <div>
              <h2 class="text-xl font-bold text-maroon-600 flex items-center">
                <MessageCircle class="h-6 w-6 mr-2" />
                Messages
              </h2>
              <p class="text-black text-sm font-medium">Barangay President - {{ currentUserBarangay }}</p>
            </div>
            <button 
              @click="closeMobileSidebar"
              class="md:hidden p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200 active:scale-95"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="p-4 border-b border-slate-200/60 bg-white/50">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search conversations..."
              class="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-maroon-500/50 focus:border-maroon-500/50 transition-all duration-200 placeholder-maroon-400"
            />
          </div>
        </div>

        <!-- Contact Categories -->
        <div class="flex-1 overflow-y-auto">
          <!-- Federation President -->
          <div v-if="federationPresident" class="border-b border-slate-100/60">
            <div class="p-3 bg-gradient-to-r from-maroon-50/80 to-red-50/80">
              <h3 class="text-xs font-semibold text-slate-600 flex items-center">
                <Crown class="h-4 w-4 mr-2 text-maroon-600" />
                Federation President
              </h3>
            </div>
            <div
              @click="selectChat(federationPresident)"
              :class="[
                'contact-item contact-list-item hover:bg-gradient-to-r hover:from-maroon-50/50 hover:to-red-50/50 cursor-pointer transition-all duration-200 border-l-4 group',
                selectedChat?.id === federationPresident.id 
                  ? 'bg-gray-200 border-maroon-600 shadow-sm contact-list-item selected'
                  : 'border-transparent hover:border-maroon-400/50'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white avatar-initials">
                    <span class="text-white font-bold text-lg">{{ getInitials(federationPresident.name || 'Federation President') }}</span>
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm pulse-animation"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-900 truncate text-responsive-sm">
                    {{ federationPresident.name || 'Federation President' }}
                  </p>
                  <p class="text-xs text-slate-500 font-medium">Federation President</p>
                </div>
                <div v-if="getUnreadCount(federationPresident.id)" class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[22px] text-center flex-shrink-0 font-bold shadow-sm unread-badge bounce-animation">
                  {{ getUnreadCount(federationPresident.id) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Other Barangay Presidents -->
          <div v-if="filteredBarangayPresidents.length > 0" class="border-b border-slate-100/60">
            <div class="p-3 bg-gradient-to-r from-maroon-50/80 to-red-50/80">
              <h3 class="text-xs font-semibold text-slate-600 flex items-center flex-wrap">
                <Users class="h-4 w-4 mr-2 text-maroon-600" />
                <span class="mr-2">Other Barangay Presidents</span>
                <span class="bg-maroon-100 text-maroon-800 text-xs px-2 py-1 rounded-full font-bold">
                  {{ filteredBarangayPresidents.length }}
                </span>
              </h3>
            </div>
            <div
              v-for="president in filteredBarangayPresidents"
              :key="president.id"
              @click="selectChat(president)"
              :class="[
                'contact-item contact-list-item hover:bg-gradient-to-r hover:from-maroon-50/50 hover:to-red-50/50 cursor-pointer transition-all duration-200 border-l-4 group',
                selectedChat?.id === president.id 
                  ? 'bg-gray-200 border-maroon-600 shadow-sm contact-list-item selected'
                  : 'border-transparent hover:border-maroon-400/50'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white avatar-initials">
                    <span class="text-white font-bold text-lg">{{ getInitials(president.name || 'Barangay President') }}</span>
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm pulse-animation"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-900 truncate text-responsive-sm">
                    {{ president.name || 'Barangay President' }}
                  </p>
                  <p class="text-xs text-slate-500 font-medium truncate barangay-name">Barangay {{ president.barangay }}</p>
                </div>
                <div v-if="getUnreadCount(president.id)" class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[22px] text-center flex-shrink-0 font-bold shadow-sm unread-badge bounce-animation">
                  {{ getUnreadCount(president.id) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Members in Same Barangay -->
          <div v-if="filteredMembers.length > 0" class="border-b border-slate-100/60">
            <div class="p-3 bg-gradient-to-r from-maroon-50/80 to-red-50/80">
              <h3 class="text-xs font-semibold text-slate-600 flex items-center flex-wrap">
                <UserCheck class="h-4 w-4 mr-2 text-maroon-600" />
                <span class="mr-2">Members in {{ currentUserBarangay }}</span>
                <span class="bg-maroon-100 text-maroon-800 text-xs px-2 py-1 rounded-full font-bold">
                  {{ filteredMembers.length }}
                </span>
              </h3>
            </div>
            <div
              v-for="member in filteredMembers"
              :key="member.id"
              @click="selectChat(member)"
              :class="[
                'contact-item contact-list-item hover:bg-gradient-to-r hover:from-maroon-50/50 hover:to-red-50/50 cursor-pointer transition-all duration-200 border-l-4 group',
                selectedChat?.id === member.id 
                  ? 'bg-gray-250 border-maroon-600 shadow-sm contact-list-item selected'
                  : 'border-transparent hover:border-maroon-400/50'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 bg-maroon-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white avatar-initials">
                    <span class="text-white font-bold text-lg">{{ getInitials(member.name || 'Member') }}</span>
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm pulse-animation"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-900 truncate text-responsive-sm">
                    {{ member.name || 'Member' }}
                  </p>
                  <p class="text-xs text-slate-500 font-medium">Member</p>
                </div>
                <div v-if="getUnreadCount(member.id)" class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[22px] text-center flex-shrink-0 font-bold shadow-sm unread-badge bounce-animation">
                  {{ getUnreadCount(member.id) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoadingContacts" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-maroon-500 border-t-transparent mx-auto"></div>
            <p class="mt-3 text-slate-500 text-sm font-medium">Loading contacts...</p>
          </div>

          <!-- Empty State -->
          <div v-if="!isLoadingContacts && !federationPresident && filteredBarangayPresidents.length === 0 && filteredMembers.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle class="h-8 w-8 text-slate-400" />
            </div>
            <p class="text-slate-500 text-sm font-medium">No contacts available</p>
          </div>

          <!-- Debug Info (remove in production) -->
          <div v-if="debugInfo" class="p-3 bg-yellow-50 border-t border-yellow-200">
            <p class="text-xs text-yellow-700">{{ debugInfo }}</p>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col min-w-0 md:flex-shrink bg-white">
        <!-- Mobile Header -->
        <div class="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-4 flex items-center justify-between relative z-30 shadow-sm sticky top-0">
          <button 
            @click="openMobileSidebar"
            class="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
          >
            <Menu class="h-5 w-5" />
          </button>
          <h1 class="text-lg font-bold text-slate-900">Messages</h1>
          <div class="w-9"></div>
        </div>

        <!-- No Chat Selected -->
        <div v-if="!selectedChat" class="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div class="text-center max-w-sm">
            <div class="w-20 h-20 bg-gradient-to-br from-maroon-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle class="h-10 w-10 text-maroon-600" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">Start a conversation</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-6">Choose a contact from the sidebar to begin messaging</p>
            <button 
              @click="openMobileSidebar"
              class="md:hidden px-6 py-3 bg-gradient-to-r from-maroon-600 to-maroon-700 text-white rounded-xl hover:from-maroon-700 hover:to-maroon-800 transition-all duration-200 font-semibold shadow-lg active:scale-95"
            >
              View Contacts
            </button>
          </div>
        </div>

        <!-- Chat Interface -->
        <div v-else class="flex-1 flex flex-col min-h-0">
          <!-- Chat Header -->
          <div class="p-4 border-b border-slate-200/60 bg-gradient-to-r from-maroon-100 to-red-100 backdrop-blur-xl shadow-sm sticky top-0 z-10">
            <div class="flex items-center space-x-4">
              <button 
                @click="selectedChat = null"
                class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
              >
                <ArrowLeft class="h-5 w-5" />
              </button>
              <div class="relative flex-shrink-0">
                <div :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white avatar-initials',
                  selectedChat.role === 'FederationPresident' ? 'bg-yellow-500' : 
                  selectedChat.role === 'BarangayPresident' ? 'bg-blue-500' : 'bg-maroon-500'
                ]">
                  <span class="text-white font-bold text-lg">{{ getInitials(selectedChat.name || 'Unknown') }}</span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm pulse-animation"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-slate-900 truncate text-responsive-base">{{ selectedChat.name || 'Unknown' }}</h3>
                <p class="text-sm text-slate-500 truncate font-medium">{{ getChatSubtitle(selectedChat) }}</p>
              </div>
            </div>
          </div>

          <!-- Messages Area -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-maroon-50 to-red-50 messages-container message-container-mobile md:message-container-desktop">
            <div
              v-for="message in currentMessages"
              :key="message.id"
              :class="[
                'flex message-item',
                message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
              ]"
            >
              <div :class="[
                'max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative',
                message.senderId === currentUser?.uid
                  ? 'bg-gradient-to-r from-maroon-700 to-maroon-600 text-white rounded-br-md message-bubble-sent'
                  : 'bg-white text-slate-900 border border-slate-200/60 rounded-bl-md message-bubble-received'
              ]">
                <p :class="[
                  'text-sm leading-relaxed break-words',
                  message.senderId === currentUser?.uid ? 'text-black' : 'text-slate-900'
                ]">{{ message.text }}</p>
                <p :class="[
                  'text-xs mt-2 font-medium message-timestamp',
                  message.senderId === currentUser?.uid ? 'text-maroon-600' : 'text-slate-400'
                ]">
                  {{ formatMessageTime(message.timestamp) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-4 border-t border-slate-200/60 bg-white/95 backdrop-blur-xl">
            <form @submit.prevent="sendMessage" class="flex space-x-3">
              <div class="flex-1">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Type your message..."
                  class="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200/60 rounded-2xl focus:ring-3 focus:ring-maroon-500/50 focus:border-maroon-500/50 transition-all duration-200 placeholder-maroon-400"
                />
              </div>
              <button
                type="submit"
                :disabled="!newMessage.trim()"
                :class="[
                  'px-4 py-3 rounded-2xl transition-all duration-200 flex-shrink-0 shadow-lg active:scale-95',
                  newMessage.trim()
                    ? 'bg-gradient-to-r from-maroon-600 to-maroon-700 text-white hover:from-maroon-700 hover:to-maroon-800'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                ]"
              >
                <Send class="h-5 w-5" />
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
  closeMobileSidebar()
  nextTick(() => {
    scrollToBottom()
  })
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
      senderName: currentUserName.value || 'Barangay President',
      senderRole: 'BarangayPresident',
      receiverId: selectedChat.value.id,
      receiverName: selectedChat.value.name || 'Unknown',
      receiverRole: selectedChat.value.role || 'Unknown',
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
      currentUserName.value = userData.name || userData.firstName || userData.fullName || 'Barangay President'
      currentUserBarangay.value = userData.barangay || 'Unknown'
    }
  } catch (error) {
    console.error('Error fetching current user data:', error)
  }
}

const fetchFederationPresident = async () => {
  try {
    debugInfo.value = 'Fetching Federation President...'
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
      
      return
    }

    debugInfo.value = 'No documents in admins collection, trying alternative...'
    await fetchFederationPresidentAlternative()
  } catch (error) {
    console.error('Error fetching federation president:', error)
    debugInfo.value = `Error: ${error.message}`
    await fetchFederationPresidentAlternative()
  }
}

const fetchFederationPresidentAlternative = async () => {
  try {
    debugInfo.value = 'Trying alternative approach...'
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
      
      return
    }

    const knownFederationPresidentUID = 'FEDERATION_PRESIDENT_UID'
    if (knownFederationPresidentUID !== 'FEDERATION_PRESIDENT_UID') {
      federationPresident.value = {
        id: knownFederationPresidentUID,
        name: 'Federation President',
        role: 'FederationPresident'
      }
      debugInfo.value = 'Using known Federation President UID'
      return
    }
    
  } catch (error) {
    console.error('Error in alternative Federation President fetch:', error)
    debugInfo.value = `Alternative fetch error: ${error.message}`
  }
}

const fetchBarangayPresidents = async () => {
  try {
    const presidentsQuery = query(collection(db, 'barangay_presidents'))
    const snapshot = await getDocs(presidentsQuery)
    
    const presidents = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (doc.id !== currentUser.value?.uid) {
        presidents.push({
          id: doc.id,
          name: data.name || data.firstName || data.fullName || 'Barangay President',
          barangay: data.barangay || 'Unknown',
          role: 'BarangayPresident',
          ...data
        })
      }
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

const getInitials = (name) => {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  } else {
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }
}
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
.bg-maroon-900 { background-color: #3a0a0d; }

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
.from-maroon-800 { --tw-gradient-from: #4a0e12; }

.via-maroon-50 { --tw-gradient-via: #fdf2f8; }
.via-maroon-100 { --tw-gradient-via: #fce7f3; }
.via-maroon-600 { --tw-gradient-via: #701a23; }
.via-maroon-700 { --tw-gradient-via: #5c1417; }

.to-maroon-100 { --tw-gradient-to: #fce7f3; }
.to-maroon-200 { --tw-gradient-to: #f9d4e8; }
.to-maroon-600 { --tw-gradient-to: #701a23; }
.to-maroon-700 { --tw-gradient-to: #5c1417; }
.to-maroon-800 { --tw-gradient-to: #4a0e12; }

.to-red-50 { --tw-gradient-to: #fef2f2; }
.to-red-100 { --tw-gradient-to: #fee2e2; }

.placeholder-maroon-400::placeholder { color: #8b0000; }

/* Custom scrollbar */
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

/* Animations */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

.bounce-animation {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Responsive text sizes */
.text-responsive-sm {
  font-size: 0.875rem;
}

.text-responsive-base {
  font-size: 1rem;
}

/* Message bubble styles */
.message-bubble-sent {
  animation: slide-in-right 0.5s ease-out;
}

.message-bubble-received {
  animation: slide-in-left 0.5s ease-out;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Message container styles */
.message-container-mobile {
  padding-bottom: 60px; /* Adjust for mobile message input */
}

.message-container-desktop {
  padding-bottom: 0; /* No additional padding for desktop */
}
</style>
