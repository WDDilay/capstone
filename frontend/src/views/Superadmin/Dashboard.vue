<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="(stat, index) in stats" :key="index" 
           class="flex items-center p-6 bg-white rounded-xl shadow-lg">
        <div class="p-4 rounded-full text-white" :class="stat.bgColor">
          <i :class="stat.icon + ' text-2xl'" ></i>
        </div>
        <div class="ml-4">
          <p class="text-gray-500 text-sm">{{ stat.title }}</p>
          <p class="text-3xl font-bold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Monthly Distribution</h2>
        <div v-if="isLoadingChartData" class="flex justify-center items-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
        </div>
        <Chart v-else type="bar" :data="monthlyDistributionData" :options="chartOptions" class="h-64" />
      </div>
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Member Distribution</h2>
        <Chart type="pie" :data="memberDistributionData" :options="pieChartOptions" class="h-64" />
      </div>
    </div>

    <!-- Recent Activities & Upcoming Events -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Recent Activities</h2>
        <ul class="divide-y">
          <li v-for="activity in recentActivities" :key="activity.id" class="py-4 flex items-center justify-between hover:bg-gray-50 px-4 rounded-lg transition">
            <div class="flex items-center space-x-4">
              <i class="pi pi-calendar text-blue-500 text-lg"></i>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ activity.title }}</p>
                <p class="text-xs text-gray-600">{{ activity.description }} - {{ formatDateTime(activity.date) }}</p>
              </div>
            </div>
            <Tag :value="activity.type" :severity="getEventTypeSeverity(activity.type)" class="px-2 py-1 text-xs" />
          </li>
        </ul>
      </div>

      <!-- Upcoming Events Section -->
      <div class="bg-white rounded-2xl shadow-xl p-6 border border-surface-200 animate-fade-in">
        <h2 class="text-xl font-semibold mb-4 text-surface-800 flex items-center">
          <i class="pi pi-calendar mr-2 text-primary-600"></i>
          Upcoming Events
        </h2>
        
        <div v-if="upcomingEvents.length > 0" class="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
          <div 
            v-for="event in upcomingEvents" 
            :key="event.id" 
            class="p-3 rounded-lg hover:bg-surface-50 transition-all duration-300 ease-in-out border border-surface-100 cursor-pointer transform hover:-translate-y-1 hover:shadow-md"
          >
            <div class="flex items-start gap-3">
              <span :class="`${getEventTypeColor(event.type)} w-3 h-3 rounded-full mt-1.5`"></span>
              <div class="flex-1">
                <h3 class="font-medium text-surface-900">{{ event.title }}</h3>
                <div class="flex items-center text-sm text-surface-500 mt-1">
                  <i class="pi pi-clock mr-1 text-xs"></i>
                  {{ formatDateTime(event.date) }}
                </div>
                <div v-if="event.location" class="flex items-center text-sm text-surface-500 mt-1">
                  <i class="pi pi-map-marker mr-1 text-xs"></i>
                  {{ event.location }}
                </div>
                <p v-if="event.description" class="text-xs text-surface-500 mt-1 line-clamp-2">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-surface-500 text-center py-4">No upcoming events</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'primevue/chart';
import Tag from 'primevue/tag';
import { format, isAfter, isSameDay, startOfDay, getMonth, getYear } from 'date-fns';
import { db } from '@/services/firebase';
import { collection, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';

// Stats Cards Data
const stats = ref([
  { title: 'Total Members', value: '0', icon: 'pi pi-users', bgColor: 'bg-blue-500' },
  { title: 'New Applications', value: '0', icon: 'pi pi-file', bgColor: 'bg-green-500' },
  { title: 'Upcoming Events', value: '0', icon: 'pi pi-calendar', bgColor: 'bg-yellow-500' },
  { title: 'Support Tickets', value: '28', icon: 'pi pi-ticket', bgColor: 'bg-red-500' },
]);

// Loading state for chart data
const isLoadingChartData = ref(true);

// Chart Data
const monthlyDistributionData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    { label: 'New Members', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#3B82F6' },
    { label: 'Events Held', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#10B981' }
  ]
});

const memberDistributionData = ref({
  labels: ['Single Mothers', 'Single Fathers', 'Widowed', 'Separated'],
  datasets: [{ data: [540, 325, 210, 173], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        title: function(context) {
          return context[0].label + ' ' + new Date().getFullYear();
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
});

const pieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' } }
});

// Recent Activities Data
const recentActivities = ref([]);

// Upcoming Events Data
const events = ref([]);
const upcomingEvents = computed(() => {
  const today = startOfDay(new Date());
  return events.value
    .filter(event => {
      const eventDate = new Date(event.date);
      return isAfter(eventDate, today) || isSameDay(eventDate, today);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
});

// Update "Upcoming Events" stat card
watch(upcomingEvents, (newUpcomingEvents) => {
  const upcomingEventsStat = stats.value.find(stat => stat.title === 'Upcoming Events');
  if (upcomingEventsStat) {
    upcomingEventsStat.value = newUpcomingEvents.length.toString();
  }
});

// Fetch Total Members
const fetchTotalMembers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    const totalMembersStat = stats.value.find(stat => stat.title === 'Total Members');
    if (totalMembersStat) {
      totalMembersStat.value = querySnapshot.size.toString();
    }
  } catch (error) {
    console.error('Error fetching total members:', error);
  }
};

// Fetch New Applications
const fetchNewApplications = async () => {
  try {
    const applicationsCollection = collection(db, 'applications');
    const querySnapshot = await getDocs(applicationsCollection);
    const newApplicationsStat = stats.value.find(stat => stat.title === 'New Applications');
    if (newApplicationsStat) {
      newApplicationsStat.value = querySnapshot.size.toString();
    }
  } catch (error) {
    console.error('Error fetching new applications:', error);
  }
};

// Fetch Monthly Distribution Data
const fetchMonthlyDistribution = async () => {
  try {
    isLoadingChartData.value = true;
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly counts
    const monthlyCounts = Array(12).fill(0);
    const monthlyEvents = Array(12).fill(0);
    
    // Fetch users created this year
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    // Process user data
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      
      if (userData.createdAt) {
        let creationDate;
        
        // Handle different timestamp formats
        if (userData.createdAt instanceof Timestamp) {
          creationDate = userData.createdAt.toDate();
        } else if (userData.createdAt.seconds) {
          creationDate = new Date(userData.createdAt.seconds * 1000);
        } else if (typeof userData.createdAt === 'string') {
          creationDate = new Date(userData.createdAt);
        }
        
        // If we have a valid date and it's from the current year
        if (creationDate && getYear(creationDate) === currentYear) {
          const month = getMonth(creationDate);
          monthlyCounts[month]++;
        }
      }
    });
    
    // Fetch events for this year
    const eventsCollection = collection(db, 'announcements');
    const eventsQuery = query(eventsCollection);
    const eventsSnapshot = await getDocs(eventsQuery);
    
    // Process events data
    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      
      if (eventData.date) {
        let eventDate;
        
        // Handle different timestamp formats
        if (eventData.date instanceof Timestamp) {
          eventDate = eventData.date.toDate();
        } else if (eventData.date.seconds) {
          eventDate = new Date(eventData.date.seconds * 1000);
        } else if (typeof eventData.date === 'string') {
          eventDate = new Date(eventData.date);
        }
        
        // If we have a valid date and it's from the current year
        if (eventDate && getYear(eventDate) === currentYear) {
          const month = getMonth(eventDate);
          monthlyEvents[month]++;
        }
      }
    });
    
    // Update chart data
    monthlyDistributionData.value = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { 
          label: 'New Members', 
          data: monthlyCounts, 
          backgroundColor: '#3B82F6' 
        },
        { 
          label: 'Events Held', 
          data: monthlyEvents, 
          backgroundColor: '#10B981' 
        }
      ]
    };
    
    isLoadingChartData.value = false;
  } catch (error) {
    console.error('Error fetching monthly distribution data:', error);
    isLoadingChartData.value = false;
  }
};

// Fetch Events
const fetchEvents = async () => {
  try {
    const eventsCollection = collection(db, 'announcements');
    const q = query(eventsCollection, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);

    const fetchedEvents = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let eventDate;
      if (data.date instanceof Timestamp) {
        eventDate = data.date.toDate();
      } else if (data.date && typeof data.date === 'string') {
        eventDate = new Date(data.date);
      } else {
        eventDate = new Date();
      }

      fetchedEvents.push({
        id: doc.id,
        title: data.title || 'Untitled Event',
        date: eventDate,
        type: data.type || 'Meeting',
        description: data.description || '',
        location: data.location || '',
      });
    });

    events.value = fetchedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Fetch Recent Activities
const fetchRecentActivities = async () => {
  try {
    const announcementsCollection = collection(db, 'announcements');
    const q = query(announcementsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const fetchedActivities = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let eventDate;
      if (data.date instanceof Timestamp) {
        eventDate = data.date.toDate();
      } else if (data.date && typeof data.date === 'string') {
        eventDate = new Date(data.date);
      } else {
        eventDate = new Date();
      }

      fetchedActivities.push({
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: eventDate,
        type: data.type || 'General',
      });
    });

    recentActivities.value = fetchedActivities.slice(0, 5);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
  }
};

// Format Date and Time
const formatDateTime = (date) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy h:mm a');
  } catch (e) {
    console.error('DateTime formatting error:', e);
    return 'Invalid date/time';
  }
};

// Event Type Color
const getEventTypeColor = (type) => {
  switch (type) {
    case 'Meeting': return 'bg-blue-500';
    case 'Workshop': return 'bg-purple-500';
    case 'Holiday': return 'bg-red-500';
    case 'Reminder': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

// Tag Severity
const getEventTypeSeverity = (type) => {
  switch (type) {
    case 'Meeting': return 'info';
    case 'Workshop': return 'success';
    case 'Holiday': return 'warning';
    case 'Reminder': return 'danger';
    default: return 'secondary';
  }
};

// Lifecycle Hook
onMounted(() => {
  fetchTotalMembers();
  fetchNewApplications();
  fetchMonthlyDistribution(); // New function to fetch monthly distribution data
  fetchEvents();
  fetchRecentActivities();
});
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-400, #818cf8) var(--surface-100, #f1f5f9);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--surface-100, #f1f5f9);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--primary-400, #818cf8);
  border-radius: 20px;
  border: 2px solid var(--surface-100, #f1f5f9);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>