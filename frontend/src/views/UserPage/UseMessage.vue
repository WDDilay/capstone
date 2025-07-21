<template>
  <div class="h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
    <!-- Mobile Overlay -->
    <div 
      v-if="showMobileSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
      @click="closeMobileSidebar"
    ></div>

    <!-- Layout Container -->
    <div class="h-full flex">
      <!-- Chat List Sidebar -->
      <div 
        class="bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300 ease-out shadow-xl"
        :class="[
          'md:w-80 md:relative md:translate-x-0 md:flex-shrink-0 md:z-10',
          'fixed inset-y-0 left-0 w-full sm:w-80 md:static z-50',
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
      >
        <!-- Header -->
        <div class="p-4 border-b border-slate-200/60 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20"></div>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <h2 class="text-xl font-bold text-white flex items-center">
                <MessageCircle class="h-6 w-6 mr-2" />
                Messages
              </h2>
              <p class="text-indigo-100 text-sm font-medium">{{ currentUserBarangay }}</p>
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
              class="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 placeholder-slate-400"
            />
          </div>
        </div>

        <!-- Contact Categories -->
        <div class="flex-1 overflow-y-auto">
          <!-- Barangay President -->
          <div v-if="barangayPresident" class="border-b border-slate-100/60">
            <div class="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
              <h3 class="text-xs font-semibold text-slate-600 flex items-center">
                <Crown class="h-4 w-4 mr-2 text-blue-500" />
                Barangay President
              </h3>
            </div>
            <div
              @click="selectChat(barangayPresident)"
              :class="[
                'p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 cursor-pointer transition-all duration-200 border-l-4 group',
                selectedChat?.id === barangayPresident.id 
                  ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-500 shadow-sm' 
                  : 'border-transparent hover:border-blue-300/50'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                    <Crown class="h-6 w-6 text-white" />
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-900 truncate">
                    {{ barangayPresident.name || 'Barangay President' }}
                  </p>
                  <p class="text-xs text-slate-500 font-medium">Barangay President</p>
                </div>
                <div v-if="getUnreadCount(barangayPresident.id)" class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[22px] text-center flex-shrink-0 font-bold shadow-sm">
                  {{ getUnreadCount(barangayPresident.id) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Other Members -->
          <div v-if="filteredMembers.length > 0" class="border-b border-slate-100/60">
            <div class="p-3 bg-gradient-to-r from-emerald-50/80 to-green-50/80">
              <h3 class="text-xs font-semibold text-slate-600 flex items-center flex-wrap">
                <Users class="h-4 w-4 mr-2 text-emerald-500" />
                <span class="mr-2">Members</span>
                <span class="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">
                  {{ filteredMembers.length }}
                </span>
              </h3>
            </div>
            <div
              v-for="member in filteredMembers"
              :key="member.id"
              @click="selectChat(member)"
              :class="[
                'p-4 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/50 cursor-pointer transition-all duration-200 border-l-4 group',
                selectedChat?.id === member.id 
                  ? 'bg-gradient-to-r from-emerald-50/80 to-green-50/80 border-emerald-500 shadow-sm' 
                  : 'border-transparent hover:border-emerald-300/50'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                    <User class="h-6 w-6 text-white" />
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-900 truncate">
                    {{ member.name || 'Member' }}
                  </p>
                  <p class="text-xs text-slate-500 font-medium">Member</p>
                </div>
                <div v-if="getUnreadCount(member.id)" class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[22px] text-center flex-shrink-0 font-bold shadow-sm">
                  {{ getUnreadCount(member.id) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoadingContacts" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
            <p class="mt-3 text-slate-500 text-sm font-medium">Loading contacts...</p>
          </div>

          <!-- Empty State -->
          <div v-if="!isLoadingContacts && !barangayPresident && filteredMembers.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle class="h-8 w-8 text-slate-400" />
            </div>
            <p class="text-slate-500 text-sm font-medium">No contacts available</p>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col min-w-0 md:flex-shrink bg-white">
        <!-- Mobile Header -->
        <div class="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-4 flex items-center justify-between relative z-30 shadow-sm">
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
            <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle class="h-10 w-10 text-indigo-500" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">Start a conversation</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-6">Choose a contact from the sidebar to begin messaging</p>
            <button 
              @click="openMobileSidebar"
              class="md:hidden px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg active:scale-95"
            >
              View Contacts
            </button>
          </div>
        </div>

        <!-- Chat Interface -->
        <div v-else class="flex-1 flex flex-col min-h-0">
          <!-- Chat Header -->
          <div class="p-4 border-b border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-sm">
            <div class="flex items-center space-x-4">
              <button 
                @click="selectedChat = null"
                class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
              >
                <ArrowLeft class="h-5 w-5" />
              </button>

              <div class="relative flex-shrink-0">
                <div :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white',
                  getChatHeaderColor(selectedChat)
                ]">
                  <component :is="getChatHeaderIcon(selectedChat)" class="h-6 w-6 text-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-slate-900 truncate">{{ selectedChat.name || 'Unknown' }}</h3>
                <p class="text-sm text-slate-500 truncate font-medium">{{ getChatSubtitle(selectedChat) }}</p>
              </div>
            </div>
          </div>

          <!-- Messages Area -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50/50 to-slate-100/50">
            <div
              v-for="message in currentMessages"
              :key="message.id"
              :class="[
                'flex',
                message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
              ]"
            >
              <div :class="[
                'max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative',
                message.senderId === currentUser?.uid
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md'
                  : 'bg-white text-slate-900 border border-slate-200/60 rounded-bl-md'
              ]">
                <p class="text-sm leading-relaxed break-words">{{ message.text }}</p>
                <p :class="[
                  'text-xs mt-2 font-medium',
                  message.senderId === currentUser?.uid ? 'text-indigo-100' : 'text-slate-400'
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
                  class="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                :disabled="!newMessage.trim()"
                :class="[
                  'px-4 py-3 rounded-2xl transition-all duration-200 flex-shrink-0 shadow-lg active:scale-95',
                  newMessage.trim() 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700' 
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
  console.log('Opening mobile sidebar')
  showMobileSidebar.value = true
}

const closeMobileSidebar = () => {
  console.log('Closing mobile sidebar')
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
  closeMobileSidebar()
  nextTick(() => {
    scrollToBottom()
  })
}

const getChatHeaderColor = (contact) => {
  if (contact.role === 'BarangayPresident') {
    return 'bg-gradient-to-br from-blue-500 to-indigo-600'
  } else {
    return 'bg-gradient-to-br from-emerald-500 to-green-600'
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
    const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      currentUserBarangay.value = userData.barangay || ''
      currentUserName.value = userData.name || userData.firstName || userData.fullName || 'Member'
      return
    }

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
      if (data.role === 'Member' || !data.role) {
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
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Smooth scrolling */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Message animations */
.flex > div {
  animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Prevent horizontal scroll */
.min-w-0 {
  min-width: 0;
}

/* Enhanced focus states */
input:focus {
  outline: none;
}

button:focus {
  outline: none;
}

/* Backdrop blur support */
@supports (backdrop-filter: blur(12px)) {
  .backdrop-blur-xl {
    backdrop-filter: blur(12px);
  }
}
</style>