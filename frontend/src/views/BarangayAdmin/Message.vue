<template>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header class="mb-8 animate-fade-in">
          <div class="flex justify-between items-center">
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900">
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">
                Messages
              </span>
            </h1>
            <Button 
              @click="openNewMessageDialog" 
              icon="pi pi-plus" 
              label="New Message" 
              class="p-button-rounded bg-gradient-to-r from-primary-500 to-primary-700 border-none shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 px-6 py-3 text-lg font-semibold"
            />
          </div>
          <p class="mt-2 text-xl text-gray-600">
            Communicate with Solo Parents and Barangay Presidents
          </p>
        </header>
  
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style="animation-delay: 0.2s;">
          <!-- Contacts Panel -->
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-800">Conversations</h2>
              <div class="mt-3 relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <i class="pi pi-search text-gray-400"></i>
                </span>
                <InputText 
                  v-model="searchContact" 
                  placeholder="Search contacts" 
                  class="w-full pl-10 py-2 border border-gray-300 rounded-full text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div class="mt-3 flex gap-2">
                <Button 
                  @click="activeFilter = 'all'" 
                  :class="['p-button-sm p-button-rounded', activeFilter === 'all' ? 'bg-primary-500' : 'p-button-outlined']"
                  label="All"
                />
                <Button 
                  @click="activeFilter = 'soloParents'" 
                  :class="['p-button-sm p-button-rounded', activeFilter === 'soloParents' ? 'bg-primary-500' : 'p-button-outlined']"
                  label="Solo Parents"
                />
                <Button 
                  @click="activeFilter = 'barangay'" 
                  :class="['p-button-sm p-button-rounded', activeFilter === 'barangay' ? 'bg-primary-500' : 'p-button-outlined']"
                  label="Barangay"
                />
              </div>
            </div>
            <div class="overflow-y-auto" style="max-height: 500px;">
              <div 
                v-for="contact in filteredContacts" 
                :key="contact.id" 
                @click="selectContact(contact)"
                :class="['p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors', 
                  selectedContact && selectedContact.id === contact.id ? 'bg-primary-50' : '']"
              >
                <div class="flex items-center">
                  <div class="relative">
                    <Avatar :image="contact.avatar || '/placeholder.svg?height=40&width=40'" class="mr-3" size="large" />
                    <span 
                      v-if="contact.online" 
                      class="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    ></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <h3 class="text-sm font-medium text-gray-900 truncate">{{ contact.name }}</h3>
                      <span class="text-xs text-gray-500">{{ formatTime(contact.lastMessage?.timestamp) }}</span>
                    </div>
                    <p class="text-xs text-gray-500 truncate">
                      <span v-if="contact.lastMessage?.senderId === userId">You: </span>
                      {{ contact.lastMessage?.text || 'No messages yet' }}
                    </p>
                    <div class="flex items-center mt-1">
                      <Badge v-if="contact.unread" :value="contact.unread" class="mr-2" severity="danger" />
                      <Tag v-if="contact.type === 'soloParent'" severity="info" value="Solo Parent" />
                      <Tag v-else-if="contact.type === 'barangay'" severity="success" value="Barangay" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="filteredContacts.length === 0" class="p-4 text-center text-gray-500">
                No conversations found
              </div>
            </div>
          </div>
  
          <!-- Message Panel -->
          <div class="bg-white rounded-xl shadow-lg overflow-hidden lg:col-span-2">
            <div v-if="selectedContact" class="flex flex-col h-full" style="height: 600px;">
              <!-- Header -->
              <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <div class="flex items-center">
                  <Avatar :image="selectedContact.avatar || '/placeholder.svg?height=40&width=40'" class="mr-3" size="large" />
                  <div>
                    <h2 class="text-lg font-semibold text-gray-800">{{ selectedContact.name }}</h2>
                    <p class="text-xs text-gray-500">
                      {{ selectedContact.online ? 'Online' : 'Last seen ' + formatTime(selectedContact.lastSeen) }}
                    </p>
                  </div>
                </div>
                <div>
                  <Button icon="pi pi-phone" class="p-button-rounded p-button-text mr-2" />
                  <Button icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text" @click="toggleContactMenu" />
                  <Menu ref="contactMenu" :model="contactMenuItems" :popup="true" />
                </div>
              </div>
              
              <!-- Messages -->
              <div class="flex-1 overflow-y-auto p-4 bg-gray-50" ref="messagesContainer">
                <div v-for="(message, index) in currentMessages" :key="message.id" class="mb-4">
                  <!-- Date separator -->
                  <div 
                    v-if="showDateSeparator(message, index)" 
                    class="flex justify-center my-4"
                  >
                    <div class="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {{ formatDate(message.timestamp) }}
                    </div>
                  </div>
                  
                  <div 
                    :class="[
                      'max-w-[75%] rounded-lg p-3 shadow-sm', 
                      message.senderId === userId ? 
                        'ml-auto bg-primary-500 text-white rounded-br-none' : 
                        'bg-white text-gray-800 rounded-bl-none'
                    ]"
                  >
                    <div class="text-sm">{{ message.text }}</div>
                    <div 
                      :class="[
                        'text-xs mt-1 flex items-center', 
                        message.senderId === userId ? 'text-primary-100 justify-end' : 'text-gray-500'
                      ]"
                    >
                      {{ formatTime(message.timestamp) }}
                      <i 
                        v-if="message.senderId === userId" 
                        :class="[
                          'ml-1', 
                          message.read ? 'pi pi-check-circle' : 'pi pi-check'
                        ]"
                      ></i>
                    </div>
                  </div>
                </div>
                <div v-if="currentMessages.length === 0" class="flex items-center justify-center h-full">
                  <div class="text-center text-gray-500">
                    <i class="pi pi-comments text-4xl mb-2"></i>
                    <p>No messages yet</p>
                    <p class="text-sm">Send a message to start the conversation</p>
                  </div>
                </div>
              </div>
              
              <!-- Message Input -->
              <div class="p-3 border-t border-gray-200 bg-white">
                <div class="flex items-end gap-2">
                  <Button icon="pi pi-paperclip" class="p-button-rounded p-button-text" />
                  <Textarea 
                    v-model="newMessage" 
                    placeholder="Type a message..." 
                    class="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :autoResize="true"
                    rows="1"
                    @keydown.enter.prevent="sendMessage"
                  />
                  <Button 
                    icon="pi pi-send" 
                    class="p-button-rounded bg-primary-500 hover:bg-primary-600"
                    @click="sendMessage"
                    :disabled="!newMessage.trim()"
                  />
                </div>
              </div>
            </div>
            
            <div v-else class="flex items-center justify-center h-full" style="height: 600px;">
              <div class="text-center text-gray-500">
                <i class="pi pi-comments text-6xl mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Your Messages</h3>
                <p class="max-w-md mx-auto mb-4">Select a conversation or start a new one to send messages</p>
                <Button 
                  @click="openNewMessageDialog" 
                  icon="pi pi-plus" 
                  label="New Message" 
                  class="p-button-rounded bg-gradient-to-r from-primary-500 to-primary-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- New Message Dialog -->
      <Dialog 
        v-model:visible="newMessageDialog" 
        :style="{width: '500px'}" 
        :modal="true" 
        class="p-fluid enhanced-dialog"
        :header="false"
      >
        <div class="p-6 bg-white rounded-lg">
          <div class="flex items-center mb-6">
            <img src="/logo.png" alt="MSWD Logo" class="h-12 w-12 mr-3" />
            <h2 class="text-2xl font-bold text-gray-800">
              New Message
            </h2>
          </div>
          
          <p class="text-gray-600 mb-6">
            Start a new conversation with a Solo Parent or Barangay President
          </p>
  
          <div class="space-y-5">
            <div>
              <label for="recipientType" class="block text-sm font-medium mb-1 text-gray-700">Recipient Type</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-users text-gray-400"></i>
                </span>
                <Dropdown 
                  id="recipientType" 
                  v-model="newMessageData.recipientType" 
                  :options="recipientTypes" 
                  optionLabel="name" 
                  optionValue="value" 
                  placeholder="Select recipient type" 
                  class="w-full custom-dropdown"
                />
              </div>
            </div>
  
            <div>
              <label for="recipient" class="block text-sm font-medium mb-1 text-gray-700">Recipient</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-user text-gray-400"></i>
                </span>
                <Dropdown 
                  id="recipient" 
                  v-model="newMessageData.recipientId" 
                  :options="availableRecipients" 
                  optionLabel="name" 
                  optionValue="id" 
                  placeholder="Select recipient" 
                  class="w-full custom-dropdown"
                  :disabled="!newMessageData.recipientType"
                />
              </div>
            </div>
  
            <div>
              <label for="messageText" class="block text-sm font-medium mb-1 text-gray-700">Message</label>
              <Textarea 
                id="messageText"
                v-model="newMessageData.text" 
                rows="4" 
                placeholder="Type your message here..." 
                class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              class="p-button-text hover:bg-gray-200 transition-colors" 
              @click="newMessageDialog = false" 
            />
            <Button 
              label="Send" 
              icon="pi pi-send" 
              class="p-button-primary bg-gradient-to-r from-primary-500 to-primary-700 border-none shadow hover:shadow-md transition-all" 
              @click="startNewConversation"
              :disabled="!newMessageData.recipientId || !newMessageData.text.trim()"
            />
          </div>
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, nextTick, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Dialog from 'primevue/dialog';
  import Dropdown from 'primevue/dropdown';
  import Avatar from 'primevue/avatar';
  import Badge from 'primevue/badge';
  import Tag from 'primevue/tag';
  import Menu from 'primevue/menu';
  import { collection, query, where, orderBy, addDoc, getDocs, onSnapshot, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
  import { db, auth } from '@/services/firebase';
  
  const toast = useToast();
  const contactMenu = ref(null);
  const messagesContainer = ref(null);
  
  // User data
  const userId = ref(auth.currentUser?.uid || 'admin123'); // Fallback for demo
  const userName = ref(auth.currentUser?.displayName || 'Admin');
  
  // UI state
  const searchContact = ref('');
  const activeFilter = ref('all');
  const selectedContact = ref(null);
  const newMessage = ref('');
  const newMessageDialog = ref(false);
  const newMessageData = ref({
    recipientType: null,
    recipientId: null,
    text: ''
  });
  
  // Data
  const contacts = ref([]);
  const messages = ref({});
  const recipientTypes = [
    { name: 'Solo Parent', value: 'soloParent' },
    { name: 'Barangay President', value: 'barangay' }
  ];
  const soloParents = ref([]);
  const barangayPresidents = ref([]);
  
  // Contact menu items
  const contactMenuItems = [
    {
      label: 'View Profile',
      icon: 'pi pi-user',
      command: () => viewContactProfile()
    },
    {
      label: 'Mark as Read',
      icon: 'pi pi-check-circle',
      command: () => markAsRead()
    },
    {
      label: 'Delete Conversation',
      icon: 'pi pi-trash',
      command: () => deleteConversation()
    }
  ];
  
  // Computed properties
  const filteredContacts = computed(() => {
    let filtered = contacts.value;
    
    // Apply search filter
    if (searchContact.value) {
      const search = searchContact.value.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(search)
      );
    }
    
    // Apply type filter
    if (activeFilter.value !== 'all') {
      filtered = filtered.filter(contact => contact.type === activeFilter.value);
    }
    
    // Sort by last message timestamp (most recent first)
    return filtered.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.toMillis() || 0;
      const timeB = b.lastMessage?.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });
  });
  
  const currentMessages = computed(() => {
    if (!selectedContact.value) return [];
    return messages.value[selectedContact.value.id] || [];
  });
  
  const availableRecipients = computed(() => {
    if (newMessageData.value.recipientType === 'soloParent') {
      return soloParents.value;
    } else if (newMessageData.value.recipientType === 'barangay') {
      return barangayPresidents.value;
    }
    return [];
  });
  
  // Methods
  const toggleContactMenu = (event) => {
    contactMenu.value.toggle(event);
  };
  
  const selectContact = (contact) => {
    selectedContact.value = contact;
    
    // Mark messages as read when selecting a contact
    if (contact.unread) {
      markAsRead();
    }
    
    // Scroll to bottom of messages
    nextTick(() => {
      scrollToBottom();
    });
  };
  
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.value.trim() || !selectedContact.value) return;
    
    try {
      const messageData = {
        text: newMessage.value.trim(),
        senderId: userId.value,
        senderName: userName.value,
        recipientId: selectedContact.value.id,
        recipientName: selectedContact.value.name,
        timestamp: serverTimestamp(),
        read: false
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'messages'), messageData);
      
      // Clear input
      newMessage.value = '';
      
      // Scroll to bottom
      nextTick(() => {
        scrollToBottom();
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to send message', life: 3000 });
    }
  };
  
  const openNewMessageDialog = () => {
    newMessageData.value = {
      recipientType: null,
      recipientId: null,
      text: ''
    };
    newMessageDialog.value = true;
  };
  
  const startNewConversation = async () => {
    if (!newMessageData.value.recipientId || !newMessageData.value.text.trim()) return;
    
    try {
      // Find recipient details
      const recipients = newMessageData.value.recipientType === 'soloParent' 
        ? soloParents.value 
        : barangayPresidents.value;
      
      const recipient = recipients.find(r => r.id === newMessageData.value.recipientId);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }
      
      // Create message
      const messageData = {
        text: newMessageData.value.text.trim(),
        senderId: userId.value,
        senderName: userName.value,
        recipientId: recipient.id,
        recipientName: recipient.name,
        timestamp: serverTimestamp(),
        read: false
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'messages'), messageData);
      
      // Close dialog
      newMessageDialog.value = false;
      
      // Select the contact if it exists, or add it to the list
      const existingContact = contacts.value.find(c => c.id === recipient.id);
      
      if (existingContact) {
        selectContact(existingContact);
      } else {
        // Create new contact and add to list
        const newContact = {
          id: recipient.id,
          name: recipient.name,
          type: newMessageData.value.recipientType,
          avatar: recipient.avatar,
          online: false,
          lastSeen: new Date(),
          unread: 0
        };
        
        contacts.value.push(newContact);
        selectContact(newContact);
      }
      
      toast.add({ severity: 'success', summary: 'Success', detail: 'Message sent', life: 3000 });
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to send message', life: 3000 });
    }
  };
  
  const viewContactProfile = () => {
    // Implement view profile functionality
    toast.add({ severity: 'info', summary: 'Info', detail: 'View profile feature coming soon', life: 3000 });
  };
  
  const markAsRead = async () => {
    if (!selectedContact.value) return;
    
    try {
      // Update unread count in local state
      selectedContact.value.unread = 0;
      
      // Update messages in Firestore
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', userId.value),
        where('senderId', '==', selectedContact.value.id),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(messagesQuery);
      
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db, 'messages', document.id), {
          read: true
        });
      });
      
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to mark messages as read', life: 3000 });
    }
  };
  
  const deleteConversation = () => {
    // Implement delete conversation functionality
    toast.add({ severity: 'info', summary: 'Info', detail: 'Delete conversation feature coming soon', life: 3000 });
  };
  
  const showDateSeparator = (message, index) => {
    if (index === 0) return true;
    
    const prevMessage = currentMessages.value[index - 1];
    if (!prevMessage || !message.timestamp || !prevMessage.timestamp) return false;
    
    const prevDate = new Date(prevMessage.timestamp.toMillis());
    const currentDate = new Date(message.timestamp.toMillis());
    
    return prevDate.toDateString() !== currentDate.toDateString();
  };
  
  // Formatting helpers
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Timestamp 
      ? new Date(timestamp.toMillis()) 
      : new Date(timestamp);
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Timestamp 
      ? new Date(timestamp.toMillis()) 
      : new Date(timestamp);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Fetch data
  const fetchContacts = async () => {
    try {
      // In a real app, you would fetch this from Firestore
      // For demo purposes, we'll use mock data
      contacts.value = [
        {
          id: 'contact1',
          name: 'Maria Santos',
          type: 'soloParent',
          avatar: '/placeholder.svg?height=40&width=40',
          online: true,
          lastSeen: new Date(),
          unread: 3,
          lastMessage: {
            text: 'Thank you for your help!',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 5)),
            senderId: 'contact1'
          }
        },
        {
          id: 'contact2',
          name: 'Juan Dela Cruz',
          type: 'soloParent',
          avatar: '/placeholder.svg?height=40&width=40',
          online: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 30),
          unread: 0,
          lastMessage: {
            text: 'I will submit the documents tomorrow.',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 2)),
            senderId: 'admin123'
          }
        },
        {
          id: 'contact3',
          name: 'Brgy. San Isidro',
          type: 'barangay',
          avatar: '/placeholder.svg?height=40&width=40',
          online: true,
          lastSeen: new Date(),
          unread: 1,
          lastMessage: {
            text: 'We need to discuss the upcoming event.',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 5)),
            senderId: 'contact3'
          }
        },
        {
          id: 'contact4',
          name: 'Brgy. San Antonio',
          type: 'barangay',
          avatar: '/placeholder.svg?height=40&width=40',
          online: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3),
          unread: 0,
          lastMessage: {
            text: 'The list of solo parents has been updated.',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)),
            senderId: 'contact4'
          }
        },
        {
          id: 'contact5',
          name: 'Ana Reyes',
          type: 'soloParent',
          avatar: '/placeholder.svg?height=40&width=40',
          online: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 120),
          unread: 0,
          lastMessage: {
            text: 'When is the next support group meeting?',
            timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 48)),
            senderId: 'contact5'
          }
        }
      ];
      
      // Fetch messages for each contact
      contacts.value.forEach(contact => {
        fetchMessages(contact.id);
      });
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch contacts', life: 3000 });
    }
  };
  
  const fetchMessages = async (contactId) => {
    try {
      // In a real app, you would fetch this from Firestore
      // For demo purposes, we'll use mock data
      const mockMessages = [
        {
          id: `msg1-${contactId}`,
          text: 'Hello, how can I help you today?',
          senderId: userId.value,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)),
          read: true
        },
        {
          id: `msg2-${contactId}`,
          text: 'I need information about the Solo Parent ID application process.',
          senderId: contactId,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5)),
          read: true
        },
        {
          id: `msg3-${contactId}`,
          text: 'Sure, I can help with that. You will need to submit the following documents: valid ID, birth certificate of your child, and proof of solo parenthood.',
          senderId: userId.value,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 10)),
          read: true
        },
        {
          id: `msg4-${contactId}`,
          text: 'Thank you for the information. Where should I submit these documents?',
          senderId: contactId,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 15)),
          read: true
        },
        {
          id: `msg5-${contactId}`,
          text: 'You can submit them to your local Barangay office or directly to the MSWD office.',
          senderId: userId.value,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 20)),
          read: true
        }
      ];
      
      // Add the most recent message based on the contact's lastMessage
      if (contacts.value.find(c => c.id === contactId)?.lastMessage) {
        const contact = contacts.value.find(c => c.id === contactId);
        mockMessages.push({
          id: `msg-last-${contactId}`,
          text: contact.lastMessage.text,
          senderId: contact.lastMessage.senderId,
          timestamp: contact.lastMessage.timestamp,
          read: contact.lastMessage.senderId === userId.value || !contact.unread
        });
      }
      
      // Sort messages by timestamp
      messages.value[contactId] = mockMessages.sort((a, b) => {
        return a.timestamp.toMillis() - b.timestamp.toMillis();
      });
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch messages', life: 3000 });
    }
  };
  
  const fetchRecipients = async () => {
    try {
      // In a real app, you would fetch this from Firestore
      // For demo purposes, we'll use mock data
      soloParents.value = [
        { id: 'sp1', name: 'Maria Santos', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'sp2', name: 'Juan Dela Cruz', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'sp3', name: 'Ana Reyes', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'sp4', name: 'Pedro Lim', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'sp5', name: 'Sofia Garcia', avatar: '/placeholder.svg?height=40&width=40' }
      ];
      
      barangayPresidents.value = [
        { id: 'bp1', name: 'Brgy. San Isidro', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'bp2', name: 'Brgy. San Antonio', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'bp3', name: 'Brgy. Santa Maria', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'bp4', name: 'Brgy. San Jose', avatar: '/placeholder.svg?height=40&width=40' },
        { id: 'bp5', name: 'Brgy. San Miguel', avatar: '/placeholder.svg?height=40&width=40' }
      ];
      
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch recipients', life: 3000 });
    }
  };
  
  // Watch for changes
  watch(selectedContact, () => {
    nextTick(() => {
      scrollToBottom();
    });
  });
  
  // Lifecycle hooks
  onMounted(() => {
    fetchContacts();
    fetchRecipients();
  });
  </script>
  
  <style scoped>
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  /* Custom dropdown styling */
  :deep(.custom-dropdown .p-dropdown) {
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }
  
  :deep(.custom-dropdown .p-dropdown .p-dropdown-label) {
    padding-left: 2.5rem;
  }
  
  :deep(.p-dropdown-panel .p-dropdown-items) {
    padding: 0.5rem 0;
  }
  
  :deep(.p-dropdown-panel .p-dropdown-item) {
    padding: 0.75rem 1rem;
  }
  
  /* Enhanced dialog styling */
  .enhanced-dialog {
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  :deep(.enhanced-dialog .p-dialog-content) {
    padding: 0;
    border-radius: 1rem;
  }
  
  /* Custom scrollbar */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: theme('colors.primary.400') theme('colors.gray.200');
  }
  
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: theme('colors.gray.200');
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: theme('colors.primary.400');
    border-radius: 20px;
    border: 3px solid theme('colors.gray.200');
  }
  </style>