<template>
  <div class="fixed top-0 left-0 z-40 h-screen transition-all duration-300"
       :class="{ 'w-72': !sidebarStore.collapsed, 'w-16': sidebarStore.collapsed }">
    <div class="h-full px-3 py-4 overflow-y-auto bg-primary text-white">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3" v-if="!sidebarStore.collapsed">
          <img :src="spfLogo" alt="Logo" class="w-8 h-8" />
          <span class="text-xl font-semibold whitespace-nowrap">Solo Parent</span>
        </div>
        <button @click="sidebarStore.toggle" class="p-1 rounded-lg hover:bg-primary-600 focus:outline-none">
          <i :class="sidebarStore.collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" class="text-xl"></i>
        </button>
      </div>
            
      <ul class="space-y-2 font-medium">
        <li v-for="(item, index) in menuItems" :key="index">
          <router-link :to="item.route" 
                       class="flex items-center p-2 rounded-lg hover:bg-primary-600 group relative"
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
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSidebarStore } from '@/stores/sidebar';
import { auth, db } from '@/services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import spfLogo from '@/assets/SPFLOGO.png';

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
  { name: 'Support', icon: 'pi pi-question-circle', route: '/super-admin/support' },
  { name: 'Backup & Recovery', icon: 'pi pi-database', route: '/superadmin/backup' },
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
.notification-badge {
  background-color: #ef4444;
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
