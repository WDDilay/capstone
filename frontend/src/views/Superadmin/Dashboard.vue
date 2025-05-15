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
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Monthly Resource Distribution</h2>
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center">
            <label for="year-select" class="mr-2 text-sm text-gray-600">Year:</label>
            <select 
              id="year-select" 
              v-model="selectedYear" 
              @change="fetchResourceDistribution"
              class="border rounded px-2 py-1 text-sm"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="flex items-center">
            <label for="view-type" class="mr-2 text-sm text-gray-600">View:</label>
            <select 
              id="view-type" 
              v-model="chartViewType" 
              class="border rounded px-2 py-1 text-sm"
            >
              <option value="percentage">Percentage</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>
        </div>
        <div v-if="isLoadingChartData" class="flex justify-center items-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
        </div>
        <Chart v-else type="bar" :data="resourceDistributionData" :options="resourceChartOptions" class="h-64" />
        <div class="mt-4">
          <div class="text-sm text-gray-500 mb-2">Resource Types:</div>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="(color, type) in resourceTypeColors" 
              :key="type" 
              class="flex items-center text-xs"
            >
              <div :style="`background-color: ${color}`" class="w-3 h-3 rounded-full mr-1"></div>
              <span>{{ type }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Monthly Resource Supply Pie Chart -->
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Monthly Resource Supply</h2>
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center">
            <label for="supply-month-select" class="mr-2 text-sm text-gray-600">Month:</label>
            <select 
              id="supply-month-select" 
              v-model="selectedSupplyMonth" 
              @change="updateResourceSupplyChart"
              class="border rounded px-2 py-1 text-sm"
            >
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }} {{ selectedSupplyYear }}
              </option>
            </select>
          </div>
          <div class="flex items-center">
            <label for="supply-year-select" class="mr-2 text-sm text-gray-600">Year:</label>
            <select 
              id="supply-year-select" 
              v-model="selectedSupplyYear" 
              @change="fetchResourceSupply"
              class="border rounded px-2 py-1 text-sm"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        <div v-if="isLoadingSupplyData" class="flex justify-center items-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
        </div>
        <div v-else-if="!hasSupplyData" class="flex justify-center items-center h-64 text-gray-500">
          No resource supply data for this month
        </div>
        <Chart v-else type="pie" :data="resourceSupplyData" :options="supplyPieChartOptions" class="h-64" />
        <div class="mt-4 text-sm text-gray-600">
          Total resources added: {{ totalResourcesAdded }}
        </div>
      </div>
    </div>

    <!-- Second Row of Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Resource Supply Trend</h2>
        <div class="mb-4 flex items-center">
          <div class="flex items-center">
            <label for="trend-year-select" class="mr-2 text-sm text-gray-600">Year:</label>
            <select 
              id="trend-year-select" 
              v-model="selectedTrendYear" 
              @change="fetchResourceSupplyTrend"
              class="border rounded px-2 py-1 text-sm"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        <div v-if="isLoadingTrendData" class="flex justify-center items-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
        </div>
        <Chart v-else type="line" :data="resourceSupplyTrendData" :options="trendChartOptions" class="h-64" />
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

    <!-- Recent Resource Distributions -->
    <div class="mt-8 bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-lg font-semibold mb-4 text-gray-700">Recent Resource Distributions</h2>
      <div v-if="isLoadingResourceHistory" class="flex justify-center items-center h-32">
        <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
      </div>
      <div v-else-if="recentResourceDistributions.length === 0" class="text-center py-8 text-gray-500">
        No recent resource distributions found
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="distribution in recentResourceDistributions" :key="distribution.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(distribution.requestDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ distribution.barangay }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(item, index) in distribution.requestedItems" 
                    :key="index"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :style="`background-color: ${getResourceTypeColorWithOpacity(item.resourceType, 0.2)}; color: ${getResourceTypeColor(item.resourceType)}`"
                  >
                    {{ item.resourceName }}: {{ item.quantity }} {{ item.unit }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': distribution.status === 'Pending',
                    'bg-green-100 text-green-800': distribution.status === 'Approved',
                    'bg-red-100 text-red-800': distribution.status === 'Rejected'
                  }"
                >
                  {{ distribution.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
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
import { collection, getDocs, query, orderBy, Timestamp, where, limit } from 'firebase/firestore';

// Stats Cards Data
const stats = ref([
  { title: 'Total Members', value: '0', icon: 'pi pi-users', bgColor: 'bg-blue-500' },
  { title: 'New Applications', value: '0', icon: 'pi pi-file', bgColor: 'bg-green-500' },
  { title: 'Upcoming Events', value: '0', icon: 'pi pi-calendar', bgColor: 'bg-yellow-500' },
  { title: 'Resources Distributed', value: '0', icon: 'pi pi-box', bgColor: 'bg-purple-500' },
]);

// Loading states
const isLoadingChartData = ref(true);
const isLoadingResourceHistory = ref(true);
const isLoadingSupplyData = ref(true);
const isLoadingTrendData = ref(true);

// Months array for selection
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Year selection for resource distribution
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const availableYears = ref([currentYear, currentYear - 1, currentYear - 2]);
const selectedYear = ref(currentYear);
const chartViewType = ref('percentage');

// Resource supply chart selections
const selectedSupplyMonth = ref(currentMonth);
const selectedSupplyYear = ref(currentYear);
const selectedTrendYear = ref(currentYear);

// Resource type colors
const resourceTypeColors = ref({
  'Financial': '#3B82F6', // blue
  'Medical': '#EF4444',   // red
  'Educational': '#F59E0B', // amber
  'Legal': '#8B5CF6',     // purple
  'Livelihood': '#10B981', // emerald
  'Housing': '#EC4899',   // pink
  'Food': '#14B8A6',      // teal
  'Other': '#6B7280'      // gray
});

// Get color for resource type
const getResourceTypeColor = (type) => {
  return resourceTypeColors.value[type] || '#6B7280'; // Default to gray
};

// Get color with opacity
const getResourceTypeColorWithOpacity = (type, opacity) => {
  const hexColor = getResourceTypeColor(type);
  // Convert hex to rgba
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Resource Distribution Data
const resourceDistributionData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: []
});

// Resource Supply Data
const resourceSupplyData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: []
  }]
});

// Resource Supply Trend Data
const resourceSupplyTrendData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: []
});

// Track if we have supply data for the selected month
const hasSupplyData = ref(false);
const totalResourcesAdded = ref(0);

// Monthly resource supply data by month and year
const resourceSupplyByMonth = ref({});

// Resource Chart Options
const resourceChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { 
      position: 'bottom',
      display: false // Hide legend as we'll create a custom one
    },
    tooltip: {
      callbacks: {
        title: function(context) {
          return context[0].label + ' ' + selectedYear.value;
        },
        label: function(context) {
          const value = context.raw;
          if (chartViewType.value === 'percentage') {
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          } else {
            return `${context.dataset.label}: ${value} units`;
          }
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          if (chartViewType.value === 'percentage') {
            return value + '%';
          }
          return value;
        }
      },
      max: chartViewType.value === 'percentage' ? 100 : undefined
    }
  }
}));

// Supply Pie Chart Options
const supplyPieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { 
      position: 'right',
      labels: {
        boxWidth: 15,
        font: {
          size: 11
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.chart.getDatasetMeta(0).total;
          const percentage = Math.round((value / total) * 100);
          return `${context.label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
});

// Trend Chart Options
const trendChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { 
      position: 'bottom',
      labels: {
        boxWidth: 15,
        font: {
          size: 11
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Quantity'
      }
    }
  }
});

// Member Distribution Data
const memberDistributionData = ref({
  labels: ['Single Mothers', 'Single Fathers', 'Widowed', 'Separated'],
  datasets: [{ data: [540, 325, 210, 173], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }]
});

const pieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' } }
});

// Recent Activities Data
const recentActivities = ref([]);

// Recent Resource Distributions
const recentResourceDistributions = ref([]);

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

// Fetch Resource Distribution Data
const fetchResourceDistribution = async () => {
  try {
    isLoadingChartData.value = true;
    
    // Initialize monthly data structure
    const monthlyData = Array(12).fill().map(() => ({}));
    
    // Fetch resource requests for the selected year
    const requestsCollection = collection(db, 'request_history');
    const startDate = new Date(selectedYear.value, 0, 1); // January 1st of selected year
    const endDate = new Date(selectedYear.value, 11, 31, 23, 59, 59); // December 31st of selected year
    
    // Create a query - note that we're including all statuses now, not just approved
    const requestsQuery = query(
      requestsCollection,
      where('requestDate', '>=', Timestamp.fromDate(startDate)),
      where('requestDate', '<=', Timestamp.fromDate(endDate))
    );
    
    const querySnapshot = await getDocs(requestsQuery);
    
    // Process request data
    querySnapshot.forEach((doc) => {
      const requestData = doc.data();
      
      if (requestData.requestDate && requestData.requestedItems) {
        let requestDate;
        
        // Handle different timestamp formats
        if (requestData.requestDate instanceof Timestamp) {
          requestDate = requestData.requestDate.toDate();
        } else if (requestData.requestDate.seconds) {
          requestDate = new Date(requestData.requestDate.seconds * 1000);
        } else if (typeof requestData.requestDate === 'string') {
          requestDate = new Date(requestData.requestDate);
        }
        
        // If we have a valid date
        if (requestDate) {
          const month = getMonth(requestDate);
          
          // Process each requested item
          requestData.requestedItems.forEach(item => {
            const resourceType = item.resourceType || 'Other';
            const quantity = parseFloat(item.quantity) || 0;
            
            // Initialize resource type if not exists
            if (!monthlyData[month][resourceType]) {
              monthlyData[month][resourceType] = 0;
            }
            
            // Add quantity
            monthlyData[month][resourceType] += quantity;
          });
        }
      }
    });
    
    // Calculate total resources per month for percentage calculation
    const monthlyTotals = monthlyData.map(month => {
      return Object.values(month).reduce((sum, quantity) => sum + quantity, 0);
    });
    
    // Get unique resource types across all months
    const allResourceTypes = new Set();
    monthlyData.forEach(month => {
      Object.keys(month).forEach(type => allResourceTypes.add(type));
    });
    
    // Create datasets for each resource type
    const datasets = Array.from(allResourceTypes).map(resourceType => {
      const color = getResourceTypeColor(resourceType);
      
      // Calculate monthly values (percentage or quantity)
      const monthlyValues = monthlyData.map((month, index) => {
        const value = month[resourceType] || 0;
        if (chartViewType.value === 'percentage') {
          return monthlyTotals[index] > 0 ? (value / monthlyTotals[index]) * 100 : 0;
        } else {
          return value;
        }
      });
      
      return {
        label: resourceType,
        data: monthlyValues,
        backgroundColor: color
      };
    });
    
    // Update chart data
    resourceDistributionData.value = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: datasets
    };
    
    // Update resources distributed stat
    const totalResourcesDistributed = monthlyTotals.reduce((sum, total) => sum + total, 0);
    const resourcesStat = stats.value.find(stat => stat.title === 'Resources Distributed');
    if (resourcesStat) {
      resourcesStat.value = Math.round(totalResourcesDistributed).toString();
    }
    
    isLoadingChartData.value = false;
  } catch (error) {
    console.error('Error fetching resource distribution data:', error);
    isLoadingChartData.value = false;
  }
};

// Fetch Resource Supply Data
const fetchResourceSupply = async () => {
  try {
    isLoadingSupplyData.value = true;
    
    // Fetch resources from spfresource collection
    const resourcesCollection = collection(db, 'spfresource');
    const querySnapshot = await getDocs(resourcesCollection);
    
    // Initialize data structure for all months
    const yearData = {};
    for (let month = 0; month < 12; month++) {
      yearData[month] = {};
    }
    
    // Process resource data
    querySnapshot.forEach((doc) => {
      const resourceData = doc.data();
      
      if (resourceData.dateAdded) {
        let addedDate;
        
        // Handle different timestamp formats
        if (resourceData.dateAdded instanceof Timestamp) {
          addedDate = resourceData.dateAdded.toDate();
        } else if (resourceData.dateAdded.seconds) {
          addedDate = new Date(resourceData.dateAdded.seconds * 1000);
        } else if (typeof resourceData.dateAdded === 'string') {
          addedDate = new Date(resourceData.dateAdded);
        }
        
        // If we have a valid date
        if (addedDate) {
          const year = getYear(addedDate);
          const month = getMonth(addedDate);
          
          // Only process resources from the selected year
          if (year === selectedSupplyYear.value) {
            const resourceType = resourceData.type || 'Other';
            const quantity = parseFloat(resourceData.quantity) || 0;
            
            // Initialize resource type if not exists
            if (!yearData[month][resourceType]) {
              yearData[month][resourceType] = 0;
            }
            
            // Add quantity
            yearData[month][resourceType] += quantity;
          }
        }
      }
    });
    
    // Store the data for later use
    resourceSupplyByMonth.value = yearData;
    
    // Update the chart for the selected month
    updateResourceSupplyChart();
    
    // Also update the trend chart
    fetchResourceSupplyTrend();
    
    isLoadingSupplyData.value = false;
  } catch (error) {
    console.error('Error fetching resource supply data:', error);
    isLoadingSupplyData.value = false;
  }
};

// Update Resource Supply Chart for selected month
const updateResourceSupplyChart = () => {
  const monthData = resourceSupplyByMonth.value[selectedSupplyMonth.value] || {};
  const resourceTypes = Object.keys(monthData);
  
  // Check if we have data for this month
  hasSupplyData.value = resourceTypes.length > 0;
  
  if (hasSupplyData.value) {
    const values = resourceTypes.map(type => monthData[type]);
    const colors = resourceTypes.map(type => getResourceTypeColor(type));
    
    // Calculate total resources added
    totalResourcesAdded.value = values.reduce((sum, value) => sum + value, 0);
    
    // Update chart data
    resourceSupplyData.value = {
      labels: resourceTypes,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    };
  } else {
    // Reset chart data
    resourceSupplyData.value = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };
    totalResourcesAdded.value = 0;
  }
};

// Fetch Resource Supply Trend Data
const fetchResourceSupplyTrend = () => {
  try {
    isLoadingTrendData.value = true;
    
    // Get all resource types across all months
    const allResourceTypes = new Set();
    Object.values(resourceSupplyByMonth.value).forEach(monthData => {
      Object.keys(monthData).forEach(type => allResourceTypes.add(type));
    });
    
    // Create datasets for each resource type
    const datasets = Array.from(allResourceTypes).map(resourceType => {
      const color = getResourceTypeColor(resourceType);
      
      // Get monthly values
      const monthlyValues = Array(12).fill().map((_, month) => {
        const monthData = resourceSupplyByMonth.value[month] || {};
        return monthData[resourceType] || 0;
      });
      
      return {
        label: resourceType,
        data: monthlyValues,
        borderColor: color,
        backgroundColor: getResourceTypeColorWithOpacity(resourceType, 0.2),
        tension: 0.4
      };
    });
    
    // Update chart data
    resourceSupplyTrendData.value = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: datasets
    };
    
    isLoadingTrendData.value = false;
  } catch (error) {
    console.error('Error creating resource supply trend data:', error);
    isLoadingTrendData.value = false;
  }
};

// Watch for chart view type changes
watch(chartViewType, () => {
  fetchResourceDistribution();
});

// Watch for supply year changes
watch(selectedSupplyYear, () => {
  fetchResourceSupply();
});

// Watch for supply month changes
watch(selectedSupplyMonth, () => {
  updateResourceSupplyChart();
});

// Watch for trend year changes
watch(selectedTrendYear, () => {
  fetchResourceSupply(); // This will also update the trend chart
});

// Fetch Recent Resource Distributions
const fetchRecentResourceDistributions = async () => {
  try {
    isLoadingResourceHistory.value = true;
    
    const requestsCollection = collection(db, 'request_history');
    const requestsQuery = query(
      requestsCollection,
      orderBy('requestDate', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(requestsQuery);
    
    const distributions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      distributions.push({
        id: doc.id,
        ...data
      });
    });
    
    recentResourceDistributions.value = distributions;
    isLoadingResourceHistory.value = false;
  } catch (error) {
    console.error('Error fetching recent resource distributions:', error);
    isLoadingResourceHistory.value = false;
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

// Format Date only
const formatDate = (date) => {
  try {
    if (date instanceof Timestamp) {
      return format(date.toDate(), 'MMM dd, yyyy');
    } else if (date && date.seconds) {
      return format(new Date(date.seconds * 1000), 'MMM dd, yyyy');
    } else if (date) {
      return format(new Date(date), 'MMM dd, yyyy');
    }
    return 'N/A';
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid date';
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
  fetchResourceDistribution();
  fetchResourceSupply();
  fetchRecentResourceDistributions();
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