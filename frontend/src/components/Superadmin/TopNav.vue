<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebar';
import { useUserStore } from '@/stores/user';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useConfirm } from 'primevue/useconfirm';

const userStore = useUserStore();
const sidebarStore = useSidebarStore();
const route = useRoute();
const router = useRouter();
const db = getFirestore();
const auth = getAuth();
const confirm = useConfirm();

const userName = ref('User');
const showNotifications = ref(false);
const showUserMenu = ref(false);

const fetchUserName = async () => {
  if (userStore.user && userStore.user.uid) {
    try {
      const userRef = doc(db, 'users', userStore.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userName.value = userSnap.data().name;
      } else {
        console.error('User document not found.');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  }
};

onMounted(fetchUserName);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) showNotifications.value = false;
};

const handleSignOut = () => {
  confirm.require({
    message: 'Are you sure you want to sign out?',
    header: 'Sign Out',
    icon: 'pi pi-power-off',
    acceptLabel: 'Sign Out',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-outlined p-button-secondary',
    accept: async () => {
      try {
        await signOut(auth);
        userStore.setUser(null);
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    reject: () => {
      console.log('Sign out cancelled');
    }
  });
};

const currentPage = computed(() => {
  const path = route.path;
  if (path.includes('/dashboard')) return 'Dashboard';
  if (path.includes('/members')) return 'Members';
  if (path.includes('/events')) return 'Events';
  if (path.includes('/applications')) return 'Applications';
  if (path.includes('/accounts')) return 'Accounts';
  if (path.includes('/settings')) return 'Settings';
  if (path.includes('/support')) return 'Support';
  if (path.includes('/backup')) return 'Backup & Recovery';
  return 'Dashboard';
});
</script>

<template>
  <div class="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b shadow-md">
    <div class="flex items-center">
      <button @click="sidebarStore.toggle" class="p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition md:hidden">
        <i class="pi pi-bars text-xl"></i>
      </button>
      <h1 class="ml-4 text-xl font-semibold text-gray-800">{{ currentPage }}</h1>
    </div>
    
    <div class="flex items-center gap-6">
        <div class="relative">
          <button @click="toggleNotifications" class="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none">
            <i class="pi pi-bell text-xl"></i>
            <span class="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">3</span>
          </button>
          <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
            <div class="p-3 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700">Notifications</h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <a href="#" class="block px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i class="pi pi-user text-blue-500 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">New member registration</p>
                    <p class="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
              </a>
              <a href="#" class="block px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i class="pi pi-calendar text-green-500 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">New event scheduled</p>
                    <p class="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </a>
              <a href="#" class="block px-4 py-3 hover:bg-gray-50">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <i class="pi pi-file text-yellow-500 text-xl"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">New application submitted</p>
                    <p class="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </a>
            </div>
            <a href="#" class="block text-center text-sm font-medium text-blue-600 bg-gray-50 p-2 hover:bg-gray-100">
              View all notifications
            </a>
          </div>
        </div>
      <div class="relative">
        <button @click="toggleUserMenu" class="flex items-center text-sm font-medium text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg transition">
          <span>{{ userName }}</span>
          <i class="pi pi-chevron-down ml-2 text-sm"></i>
        </button>
        <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200">
          <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
            <i class="pi pi-user mr-2"></i> Profile
          </a>
          <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
            <i class="pi pi-cog mr-2"></i> Settings
          </a>
          <div class="border-t border-gray-100"></div>
          <button @click="handleSignOut" class="relative block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition group">
            <i class="pi pi-sign-out mr-2"></i> Sign out
            <span class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <i class="pi pi-arrow-right text-red-500"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog />
</template>

<style>
/* Enhanced Styling for PrimeVue ConfirmDialog */
.p-dialog {
  border-radius: 12px !important;
  box-shadow: 0px 15px 35px rgba(0, 0, 0, 0.2) !important;
  overflow: hidden !important;
  border: none !important;
  max-width: 400px !important;
}

.p-dialog .p-dialog-header {
  background-color: white !important;
  padding: 1.5rem 1.5rem 0.75rem !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #111827 !important; /* Dark text */
  border-bottom: none !important;
}

.p-dialog .p-dialog-content {
  padding: 0.75rem 1.5rem 1.5rem !important;
  font-size: 1rem !important;
  color: #4b5563 !important;
  background-color: white !important;
}

.p-dialog .p-dialog-footer {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 0.75rem !important;
  padding: 1rem 1.5rem 1.5rem !important;
  border-top: none !important;
  background-color: white !important;
}

/* Icon styling */
.p-confirm-dialog-icon {
  font-size: 1.5rem !important;
  color: #ef4444 !important;
  margin-right: 0.75rem !important;
  background-color: rgba(239, 68, 68, 0.1) !important;
  padding: 0.75rem !important;
  border-radius: 50% !important;
}

/* Customize Buttons */
.p-confirm-dialog-accept {
  background-color: #ef4444 !important; /* Red for danger */
  border: none !important;
  padding: 0.625rem 1.25rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2) !important;
}

.p-confirm-dialog-accept:hover {
  background-color: #dc2626 !important; /* Darker red on hover */
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25) !important;
}

.p-confirm-dialog-reject {
  background-color: transparent !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  padding: 0.625rem 1.25rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  transition: all 0.2s ease !important;
}

.p-confirm-dialog-reject:hover {
  background-color: #f3f4f6 !important;
  border-color: #9ca3af !important;
}

/* Animation for dialog */
.p-dialog-enter-active {
  transition: all 0.3s ease-out !important;
}

.p-dialog-leave-active {
  transition: all 0.2s ease-in !important;
}

.p-dialog-enter-from,
.p-dialog-leave-to {
  opacity: 0 !important;
  transform: scale(0.95) !important;
}

/* Overlay styling */
.p-dialog-mask {
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(2px) !important;
}
</style>

