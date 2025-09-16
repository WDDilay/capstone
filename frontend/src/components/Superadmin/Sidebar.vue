<template>
  <div class="fixed top-0 left-0 z-40 h-screen transition-all duration-300"
       :class="{ 'w-72': !sidebarStore.collapsed, 'w-16': sidebarStore.collapsed }">
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Header section with dark maroon -->
      <div class="bg-maroon-800 px-3 py-4 flex-shrink-0">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <img :src="spfLogo" alt="Logo" class="w-8 h-8" />
            <span class="text-xl font-semibold whitespace-nowrap text-white">Solo Parent</span>
          </div>
          <div class="flex items-center justify-center w-full" v-if="sidebarStore.collapsed">
            <img :src="spfLogo" alt="Logo" class="w-8 h-8" />
          </div>
          <button @click="sidebarStore.toggle" 
                  class="p-1 rounded-lg hover:bg-maroon-700 focus:outline-none text-white flex-shrink-0"
                  :class="{ 'absolute top-4 right-2': sidebarStore.collapsed }">
            <i :class="sidebarStore.collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" class="text-xl"></i>
          </button>
        </div>
      </div>
      
      <!-- Menu section with light maroon/cream - takes remaining height -->
      <div class="bg-maroon-50 px-3 py-4 flex-1 h-full">
        <ul class="space-y-2 font-medium">
          <li v-for="(item, index) in menuItems" :key="index">
            <router-link :to="item.route"
                         class="flex items-center p-2 rounded-lg hover:bg-maroon-200 hover:text-maroon-900 group relative transition-colors duration-200 text-maroon-700"
                         :class="{ 'justify-center': sidebarStore.collapsed }">
              <i :class="item.icon" class="text-xl"></i>
              <span class="ml-3" v-if="!sidebarStore.collapsed">{{ item.name }}</span>
              
              <!-- Notification badge for messages -->
              <div v-if="item.route === '/super-admin/Messages' && totalUnreadCount > 0"
                   class="notification-badge"
                   :class="{ 'badge-collapsed': sidebarStore.collapsed }">
                {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSidebarStore } from '@/stores/sidebar';
import { auth, db } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import spfLogo from '@/assets/solologo.jpg';

const sidebarStore = useSidebarStore();

// Message notification state
const currentUser = ref(null);
const totalUnreadCount = ref(0);
let unsubscribeMessages = null;

// Setup message notifications
const setupMessageNotifications = () => {
  currentUser.value = auth.currentUser;
  
  if (!currentUser.value) return;

  const messagesQuery = query(
    collection(db, "messages"),
    where("receiverId", "==", currentUser.value.uid),
    where("read", "==", false),
    orderBy("timestamp", "desc")
  );

  unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
    totalUnreadCount.value = snapshot.size;
  });
};

const menuItems = ref([
  { name: 'Dashboard', icon: 'pi pi-home', route: '/super-admin/super-dashboard' },
  { name: 'Sentiment', icon: 'pi pi-comments', route: '/super-admin/sentiment' },
  { name: 'Members', icon: 'pi pi-users', route: '/super-admin/members' },
  { name: 'Events', icon: 'pi pi-calendar', route: '/super-admin/events' },
  { name: 'Applications', icon: 'pi pi-file', route: '/super-admin/application' },
  { name: 'Pre-Register', icon: 'pi pi-file', route: '/super-admin/pre-register' },
   { name: 'AdminPosting', icon: 'pi pi-file', route: '/super-admin/admin-posting' },
  { name: 'Resources', icon: 'pi pi-envelope', route: '/super-admin/resources' },
  { name: 'Accounts', icon: 'pi pi-user', route: '/super-admin/accounts' },
  { name: 'Messages', icon: 'pi pi-comments', route: '/super-admin/Messages' },
  
]);

// Lifecycle
onMounted(() => {
  setupMessageNotifications();
});

onUnmounted(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
});
</script>

<style scoped>
/* Custom maroon color definitions */
.bg-maroon-800 {
  background-color: #7f1d1d; /* Dark maroon for header */
}

.bg-maroon-700 {
  background-color: #991b1b; /* Medium maroon for hover states */
}

.bg-maroon-50 {
  background-color: #fef7f7; /* Very light maroon/cream for menu background */
}

.bg-maroon-200 {
  background-color: #fecaca; /* Light maroon for hover */
}

.text-maroon-700 {
  color: #b91c1c; /* Medium maroon for text */
}

.text-maroon-900 {
  color: #7f1d1d; /* Dark maroon for hover text */
}

.hover\:bg-maroon-700:hover {
  background-color: #991b1b;
}

.hover\:bg-maroon-200:hover {
  background-color: #fecaca;
}

.hover\:text-maroon-900:hover {
  color: #7f1d1d;
}

.notification-badge {
  background-color: #dc2626; /* Red for notifications (complementary to maroon) */
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 8px;
  top: 8px;
  animation: pulse 2s infinite;
}

.badge-collapsed {
  right: -8px;
  top: -8px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>