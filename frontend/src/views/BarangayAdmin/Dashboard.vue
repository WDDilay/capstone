<template>
  <div class="p-4 md:p-6">
    <!-- Welcome section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Welcome back, Admin</h1>
      <p class="text-gray-500">Here's what's happening with your federation today.</p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div v-for="(stat, index) in stats" :key="index" 
        class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm font-medium mb-1">{{ stat.title }}</p>
            <div class="flex items-baseline">
              <h3 class="text-2xl font-bold text-gray-800">{{ stat.value }}</h3>
              <span v-if="stat.trend !== undefined" :class="[stat.trend > 0 ? 'text-green-500' : 'text-red-500', 'text-xs font-medium ml-2 flex items-center']">
                <component :is="stat.trend > 0 ? 'TrendingUp' : 'TrendingDown'" class="h-3 w-3 mr-1" />
                {{ Math.abs(stat.trend) }}%
              </span>
            </div>
          </div>
          <div :class="['rounded-lg p-3', stat.bgColor]">
            <component :is="stat.icon" class="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Rest of your dashboard code remains unchanged -->
    <!-- Charts section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
      <!-- Member growth chart -->
      <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">Member Growth</h2>
          <div class="flex items-center space-x-2">
            <Button 
              label="Monthly" 
              class="p-button-text p-button-sm" 
              :class="{ 'p-button-primary': chartPeriod === 'monthly' }"
              @click="chartPeriod = 'monthly'"
            />
            <Button 
              label="Weekly" 
              class="p-button-text p-button-sm" 
              :class="{ 'p-button-primary': chartPeriod === 'weekly' }"
              @click="chartPeriod = 'weekly'"
            />
          </div>
        </div>
        <div class="h-64">
          <Chart type="line" :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Distribution by barangay -->
      <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">Distribution by Barangay</h2>
          <Button icon="pi pi-ellipsis-h" class="p-button-text p-button-rounded p-button-sm" />
        </div>
        <div class="h-64">
          <Chart type="doughnut" :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <!-- Recent members and activity sections remain unchanged -->
    <!-- ... -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { 
  Users, MapPin, MessageSquare, Package, TrendingUp, TrendingDown, 
  UserPlus, RefreshCw, Bell, Ban, Search, Edit, Trash2, Calendar,
  FileText, Book, Download, FileSpreadsheet, Video
} from 'lucide-vue-next';

// Firebase imports
import { db, auth } from '@/services/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';

// Services
const confirm = useConfirm();
const toast = useToast();

// State
const searchQuery = ref('');
const chartPeriod = ref('monthly');
const isLoading = ref(true);
const error = ref(null);
const currentBarangay = ref('');
const totalMembers = ref(0);
const activeResources = ref(42); // Placeholder, replace with real data later
const newMessages = ref(18); // Placeholder, replace with real data later
const totalAnnouncements = ref(7); // Placeholder, replace with real data later
const membersLastMonth = ref(0);
const membersByBarangay = ref({});

// Stats data with reactive values
const stats = computed(() => [
  { 
    title: 'Total Members', 
    value: isLoading.value ? '...' : totalMembers.value.toLocaleString(), 
    icon: Users, 
    bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    trend: calculateTrend(totalMembers.value, membersLastMonth.value)
  },
  { 
    title: 'Active Resources', 
    value: activeResources.value, 
    icon: Package, 
    bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
    trend: 8.2
  },
  { 
    title: 'New Messages', 
    value: newMessages.value, 
    icon: MessageSquare, 
    bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
    trend: -3.4
  },
  { 
    title: 'Announcements', 
    value: totalAnnouncements.value, 
    icon: Bell, 
    bgColor: 'bg-gradient-to-r from-amber-500 to-amber-600',
    trend: 5.1
  }
]);

// Calculate percentage trend
const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Fetch total members count
const fetchTotalMembers = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // First, verify that the current user is in the barangay_presidents collection
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Check if user is in barangay_presidents collection
    const barangayPresidentDocRef = doc(db, 'barangay_presidents', user.uid);
    const barangayPresidentDoc = await getDoc(barangayPresidentDocRef);
    
    if (!barangayPresidentDoc.exists()) {
      console.error('User not found in barangay_presidents collection');
      error.value = 'Your user account is not properly set up as a Barangay President. Please contact the system administrator.';
      return;
    }
    
    const barangayPresidentData = barangayPresidentDoc.data();
    if (barangayPresidentData.role !== 'BarangayPresident') {
      console.error('User does not have BarangayPresident role');
      error.value = `Your role is set to "${barangayPresidentData.role}" instead of "BarangayPresident". Please contact the system administrator.`;
      return;
    }
    
    // Store the barangay for filtering
    currentBarangay.value = barangayPresidentData.barangay;
    console.log('User verified as BarangayPresident for:', currentBarangay.value);
    
    // Now fetch active members count for this barangay
    const activeUsersQuery = query(
      collection(db, 'users'),
      where('barangay', '==', currentBarangay.value),
      where('role', '==', 'Member'),
      where('status', '==', 'Active')
    );
    
    // Set up real-time listener for member count
    const unsubscribe = onSnapshot(activeUsersQuery, (snapshot) => {
      totalMembers.value = snapshot.docs.length;
      console.log('Total active members:', totalMembers.value);
      isLoading.value = false;
    }, (err) => {
      console.error('Error fetching members:', err);
      error.value = 'Error fetching members: ' + err.message;
      isLoading.value = false;
    });
    
    // Fetch members from last month for trend calculation
    // This is a one-time query, not a real-time listener
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // For simplicity, we'll just use 90% of current count as last month's count
    // In a real app, you would query based on registration date
    membersLastMonth.value = Math.floor(totalMembers.value * 0.9);
    
    return unsubscribe;
  } catch (err) {
    console.error('Error in fetchTotalMembers:', err);
    error.value = 'Error fetching data: ' + err.message;
    isLoading.value = false;
    return null;
  }
};

// Rest of your existing code remains unchanged
// Chart data
const chartData = computed(() => {
  return {
    labels: chartPeriod.value === 'monthly' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] 
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Members',
        data: chartPeriod.value === 'monthly' 
          ? [65, 59, 80, 81, 56, 55] 
          : [28, 32, 19, 24],
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderColor: 'rgba(147, 51, 234, 0.8)',
        tension: 0.4
      },
      {
        label: 'Active Members',
        data: chartPeriod.value === 'monthly' 
          ? [28, 48, 40, 19, 86, 27] 
          : [15, 25, 20, 30],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        font: {
          size: 12
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawBorder: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

// Doughnut chart data
const doughnutData = {
  labels: ['Poblacion', 'San Miguel', 'San Roque', 'Sta. Cruz', 'Others'],
  datasets: [
    {
      data: [540, 325, 190, 120, 79],
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      hoverBackgroundColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(107, 114, 128, 1)'
      ]
    }
  ]
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        font: {
          size: 12
        }
      }
    }
  },
  cutout: '70%'
};

// Sample data for table
const data = ref([
  {
    id: 1,
    name: "Maria Santos",
    email: "maria.santos@example.com",
    barangay: "Poblacion",
    contact: "09123456789",
    status: "Active",
    avatar: "/placeholder.svg?height=32&width=32"
  },
  {
    id: 2,
    name: "Jose Garcia",
    email: "jose.garcia@example.com",
    barangay: "San Miguel",
    contact: "09187654321",
    status: "Blocked",
    avatar: "/placeholder.svg?height=32&width=32"
  },
  {
    id: 3,
    name: "Ana Reyes",
    email: "ana.reyes@example.com",
    barangay: "Poblacion",
    contact: "09187654322",
    status: "Active",
    avatar: "/placeholder.svg?height=32&width=32"
  },
  {
    id: 4,
    name: "Pedro Lim",
    email: "pedro.lim@example.com",
    barangay: "San Roque",
    contact: "09187654323",
    status: "Active",
    avatar: "/placeholder.svg?height=32&width=32"
  },
  {
    id: 5,
    name: "Sofia Cruz",
    email: "sofia.cruz@example.com",
    barangay: "San Miguel",
    contact: "09187654324",
    status: "Blocked",
    avatar: "/placeholder.svg?height=32&width=32"
  }
]);

// Activities data
const activities = ref([
  {
    title: 'New Member Registered',
    time: '30 minutes ago',
    description: 'Sofia Cruz from San Miguel has registered as a new member.',
    icon: UserPlus,
    color: 'bg-blue-500'
  },
  {
    title: 'Resource Updated',
    time: '2 hours ago',
    description: 'Parenting Guide resource has been updated with new information.',
    icon: RefreshCw,
    color: 'bg-green-500'
  },
  {
    title: 'Announcement Posted',
    time: 'Yesterday',
    description: 'New announcement about the upcoming community meeting has been posted.',
    icon: Bell,
    color: 'bg-purple-500'
  },
  {
    title: 'Member Status Changed',
    time: '2 days ago',
    description: 'Jose Garcia has been blocked due to policy violation.',
    icon: Ban,
    color: 'bg-red-500'
  }
]);

// Announcements data
const announcementsData = ref([
  { 
    title: 'Community Meeting', 
    date: 'Today', 
    content: 'Community meeting scheduled for next Friday at 3:00 PM at the main hall. All members are encouraged to attend as we will be discussing important updates and upcoming events for the federation.',
    isNew: true
  },
  { 
    title: 'New Resource Available', 
    date: 'Yesterday', 
    content: 'New educational materials for single parents are now available in our resource center. These materials cover topics such as child development, financial management, and self-care strategies.',
    isNew: true
  },
  { 
    title: 'Upcoming Workshop', 
    date: '3 days ago', 
    content: 'Join us for a workshop on financial planning for single parents on Saturday. The workshop will be conducted by financial experts and will provide practical advice on budgeting, saving, and investing.',
    isNew: false
  }
]);

// Resources data
const resources = ref([
  { 
    name: 'Parenting Guide', 
    category: 'Educational', 
    status: 'Available', 
    icon: Book, 
    bgColor: 'bg-blue-500',
    size: '2.4 MB'
  },
  { 
    name: 'Financial Aid Forms', 
    category: 'Documents', 
    status: 'Limited', 
    icon: FileText, 
    bgColor: 'bg-amber-500',
    size: '1.2 MB'
  },
  { 
    name: 'Community Support Kit', 
    category: 'Support', 
    status: 'Available', 
    icon: Package, 
    bgColor: 'bg-red-500',
    size: '4.8 MB'
  },
  { 
    name: 'Monthly Report', 
    category: 'Reports', 
    status: 'Available', 
    icon: FileSpreadsheet, 
    bgColor: 'bg-green-500',
    size: '3.1 MB'
  },
  { 
    name: 'Training Video', 
    category: 'Media', 
    status: 'Available', 
    icon: Video, 
    bgColor: 'bg-purple-500',
    size: '18.5 MB'
  }
]);

// Computed properties
const filteredData = computed(() => {
  if (!searchQuery.value) return data.value;
  
  const query = searchQuery.value.toLowerCase();
  return data.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.barangay.toLowerCase().includes(query) ||
    item.status.toLowerCase().includes(query) ||
    item.email.toLowerCase().includes(query) ||
    item.contact.includes(query)
  );
});

// Methods
const editRecord = (record) => {
  toast.add({ severity: 'info', summary: 'Edit', detail: `Editing ${record.name}`, life: 3000 });
  // Implement edit functionality
};

const confirmDelete = (record) => {
  confirm.require({
    message: `Are you sure you want to delete ${record.name}?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteRecord(record);
    }
  });
};

const deleteRecord = (record) => {
  // Implement delete functionality
  data.value = data.value.filter(item => item.id !== record.id);
  toast.add({ severity: 'success', summary: 'Deleted', detail: `${record.name} has been deleted`, life: 3000 });
};

// Lifecycle hooks
onMounted(async () => {
  // Fetch real data for the dashboard
  const unsubscribe = await fetchTotalMembers();
  
  // Cleanup on component unmount
  return () => {
    if (unsubscribe) unsubscribe();
  };
});
</script>

<style scoped>
/* Custom styles for the dashboard */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent;
  color: #6b7280;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: white;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  border: none;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f9fafb;
}

:deep(.p-button.p-button-primary) {
  background-color: hsl(271, 76%, 53%);
  border-color: hsl(271, 76%, 53%);
}

:deep(.p-button.p-button-primary:hover) {
  background-color: hsl(271, 76%, 48%);
  border-color: hsl(271, 76%, 48%);
}

:deep(.p-button.p-button-text) {
  color: #6b7280;
}

:deep(.p-button.p-button-text:hover) {
  background-color: #f3f4f6;
}

:deep(.p-button.p-button-text.p-button-primary) {
  color: hsl(271, 76%, 53%);
}

:deep(.p-button.p-button-text.p-button-primary:hover) {
  background-color: rgba(147, 51, 234, 0.1);
}

:deep(.p-tag) {
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
}

:deep(.p-paginator) {
  background-color: transparent;
  border: none;
}

:deep(.p-paginator .p-paginator-element) {
  min-width: 2rem;
  height: 2rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>