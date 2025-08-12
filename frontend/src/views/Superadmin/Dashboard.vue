<template>
  <div class="p-3 sm:p-4 lg:p-6 bg-gray-100 min-h-screen">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Dashboard</h1>
    
    <!-- Stats Cards - Responsive Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      <div class="flex items-center p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
           :class="{
             'bg-blue-200': stat.title === 'Total Members',
             'bg-green-200': stat.title === 'New Applications', 
             'bg-yellow-200': stat.title === 'Upcoming Events',
             'bg-violet-200': stat.title === 'Resources Distributed'
           }"
           v-for="(stat, index) in stats" :key="index">
        <div class="p-3 sm:p-4 rounded-full text-white" :class="stat.bgColor">
          <i :class="stat.icon + ' text-xl sm:text-2xl'" ></i>
        </div>
        <div class="ml-3 sm:ml-4 min-w-0 flex-1">
          <p class="text-gray-600 text-xs sm:text-sm font-medium truncate">{{ stat.title }}</p>
          <p class="text-2xl sm:text-3xl font-bold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>
    
    <!-- Charts Row 1 - Resource Distribution & Supply -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <!-- Resource Distribution Chart -->
      <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Monthly Resource Distribution</h2>
        
        <!-- Controls - Responsive Layout -->
        <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div class="flex flex-col xs:flex-row xs:items-center gap-2">
            <label for="year-select" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Year:</label>
            <select 
              id="year-select"
              v-model="selectedYear"
              @change="fetchResourceDistribution"
              class="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 xs:flex-initial"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="flex flex-col xs:flex-row xs:items-center gap-2">
            <label for="view-type" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">View:</label>
            <select 
              id="view-type"
              v-model="chartViewType"
              class="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 xs:flex-initial"
            >
              <option value="percentage">Percentage</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>
        </div>
        
        <!-- Chart Container -->
        <div v-if="isLoadingChartData" class="flex justify-center items-center h-48 sm:h-64">
          <i class="pi pi-spin pi-spinner text-2xl sm:text-3xl text-primary-500"></i>
        </div>
        <div v-else class="h-48 sm:h-64">
          <Chart type="bar" :data="resourceDistributionData" :options="resourceChartOptions" class="h-full" />
        </div>
        
        <!-- Legend - Responsive Grid -->
        <div class="mt-4">
          <div class="text-xs sm:text-sm text-gray-500 mb-2">Resource Types:</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1 sm:gap-2">
            <div 
              v-for="(color, type) in resourceTypeColors"
              :key="type"
              class="flex items-center text-xs"
            >
              <div :style="`background-color: ${color}`" class="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"></div>
              <span class="truncate">{{ type }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Resource Supply Chart -->
      <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Monthly Resource Supply</h2>
        
        <!-- Controls - Responsive Layout -->
        <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div class="flex flex-col xs:flex-row xs:items-center gap-2">
            <label for="supply-month-select" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Month:</label>
            <select 
              id="supply-month-select"
              v-model="selectedSupplyMonth"
              @change="updateResourceSupplyChart"
              class="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 xs:flex-initial"
            >
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }} {{ selectedSupplyYear }}
              </option>
            </select>
          </div>
          <div class="flex flex-col xs:flex-row xs:items-center gap-2">
            <label for="supply-year-select" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Year:</label>
            <select 
              id="supply-year-select"
              v-model="selectedSupplyYear"
              @change="fetchResourceSupply"
              class="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 xs:flex-initial"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        
        <!-- Chart Container -->
        <div v-if="isLoadingSupplyData" class="flex justify-center items-center h-48 sm:h-64">
          <i class="pi pi-spin pi-spinner text-2xl sm:text-3xl text-primary-500"></i>
        </div>
        <div v-else-if="!hasSupplyData" class="flex justify-center items-center h-48 sm:h-64 text-gray-500 text-sm">
          No resource supply data for this month
        </div>
        <div v-else class="h-48 sm:h-64">
          <Chart type="pie" :data="resourceSupplyData" :options="supplyPieChartOptions" class="h-full" />
        </div>
        
        <div class="mt-4 text-xs sm:text-sm text-gray-600">
          Total resources added: {{ totalResourcesAdded }}
        </div>
      </div>
    </div>
    
    <!-- Charts Row 2 - Trend & Members -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <!-- Resource Supply Trend -->
      <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Resource Supply Trend</h2>
        
        <div class="mb-4 flex items-center">
          <div class="flex flex-col xs:flex-row xs:items-center gap-2">
            <label for="trend-year-select" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Year:</label>
            <select 
              id="trend-year-select"
              v-model="selectedTrendYear"
              @change="fetchResourceSupplyTrend"
              class="border rounded px-2 py-1 text-xs sm:text-sm"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoadingTrendData" class="flex justify-center items-center h-48 sm:h-64">
          <i class="pi pi-spin pi-spinner text-2xl sm:text-3xl text-primary-500"></i>
        </div>
        <div v-else class="h-48 sm:h-64">
          <Chart type="line" :data="resourceSupplyTrendData" :options="trendChartOptions" class="h-full" />
        </div>
      </div>
      
      <!-- Members by Barangay -->
      <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Members by Barangay</h2>
        
        <!-- Controls - Responsive Layout -->
        <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div class="flex items-center">
            <button 
              @click="refreshMemberData"
              class="px-3 py-1 text-xs sm:text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              :disabled="isLoadingMemberData"
            >
              <i class="pi pi-refresh mr-1" :class="{ 'pi-spin': isLoadingMemberData }"></i>
              Refresh
            </button>
          </div>
          <div class="flex flex-col xs:flex-row xs:items-center gap-2">
            <label for="member-chart-type" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Chart Type:</label>
            <select 
              id="member-chart-type"
              v-model="memberChartType"
              class="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 xs:flex-initial"
            >
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
        
        <!-- Chart Container -->
        <div v-if="isLoadingMemberData" class="flex justify-center items-center h-48 sm:h-64">
          <i class="pi pi-spin pi-spinner text-2xl sm:text-3xl text-primary-500"></i>
        </div>
        <div v-else-if="membersByBarangay.length === 0" class="flex justify-center items-center h-48 sm:h-64 text-gray-500 text-sm">
          No member data available
        </div>
        <div v-else class="h-48 sm:h-64">
          <Chart :type="memberChartType" :data="memberDistributionData" :options="memberChartOptions" class="h-full" />
        </div>
        
        <!-- Member Stats -->
        <div class="mt-4">
          <div class="text-xs sm:text-sm text-gray-500 mb-2">Total Members: {{ totalMembers }}</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
            <div v-for="(item, index) in membersByBarangay.slice(0, 6)" :key="index" class="flex items-center">
              <div 
                :style="`background-color: ${barangayColors[index % barangayColors.length]}`"
                class="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
              ></div>
              <span class="truncate">{{ item.barangay }}: {{ item.count }}</span>
            </div>
          </div>
          <div v-if="membersByBarangay.length > 6" class="text-xs text-gray-500 mt-2">
            And {{ membersByBarangay.length - 6 }} more barangays...
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pre-Registration Analytics - Full Width on Mobile -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <!-- Pre-Registration Trends -->
      <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Pre-Registration Trends</h2>
        
        <!-- Controls - Responsive Layout -->
        <div class="mb-4 flex flex-col gap-3 sm:gap-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <button 
              @click="refreshPreRegData"
              class="px-3 py-1 text-xs sm:text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors self-start"
              :disabled="isLoadingPreRegData"
            >
              <i class="pi pi-refresh mr-1" :class="{ 'pi-spin': isLoadingPreRegData }"></i>
              Refresh
            </button>
            
            <div class="flex flex-col xs:flex-row xs:items-center gap-2">
              <label for="prereg-time-range" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Time Range:</label>
              <select 
                id="prereg-time-range"
                v-model="preRegTimeRange"
                @change="fetchPreRegistrationData"
                class="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 xs:flex-initial"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
          
          <div class="flex flex-col xs:flex-row xs:items-center gap-2">
            <label for="prereg-chart-type" class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Chart Type:</label>
            <select 
              id="prereg-chart-type"
              v-model="preRegChartType"
              class="border rounded px-2 py-1 text-xs sm:text-sm min-w-0 flex-1 xs:flex-initial"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
        
        <!-- Chart Container -->
        <div v-if="isLoadingPreRegData" class="flex justify-center items-center h-48 sm:h-64">
          <i class="pi pi-spin pi-spinner text-2xl sm:text-3xl text-primary-500"></i>
        </div>
        <div v-else-if="preRegistrationsByDate.length === 0" class="flex justify-center items-center h-48 sm:h-64 text-gray-500 text-sm">
          No pre-registration data available
        </div>
        <div v-else class="h-48 sm:h-64">
          <Chart :type="preRegChartType" :data="preRegChartData" :options="preRegChartOptions" class="h-full" />
        </div>
        
        <!-- Pre-Registration Stats -->
        <div class="mt-4">
          <div class="text-xs sm:text-sm text-gray-500 mb-2">Total Pre-Registrations: {{ totalPreRegistrations }}</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
            <div v-for="(item, index) in preRegistrationsByBarangay.slice(0, 6)" :key="index" class="flex items-center">
              <div 
                :style="`background-color: ${barangayColors[index % barangayColors.length]}`"
                class="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
              ></div>
              <span class="truncate">{{ item.barangay }}: {{ item.count }}</span>
            </div>
          </div>
          <div v-if="preRegistrationsByBarangay.length > 6" class="text-xs text-gray-500 mt-2">
            And {{ preRegistrationsByBarangay.length - 6 }} more barangays...
          </div>
        </div>
      </div>
      
      <!-- Recent Activities -->
      <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Recent Activities</h2>
        <div class="max-h-64 sm:max-h-80 overflow-y-auto custom-scrollbar">
          <ul class="divide-y">
            <li v-for="activity in recentActivities" :key="activity.id" class="py-3 sm:py-4 flex items-start sm:items-center justify-between hover:bg-gray-50 px-2 sm:px-4 rounded-lg transition">
              <div class="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <i class="pi pi-calendar text-blue-500 text-base sm:text-lg mt-1 sm:mt-0 flex-shrink-0"></i>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm font-medium text-gray-800 truncate">{{ activity.title }}</p>
                  <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ activity.description }} - {{ formatDateTime(activity.date) }}</p>
                </div>
              </div>
              <Tag :value="activity.type" :severity="getEventTypeSeverity(activity.type)" class="px-2 py-1 text-xs ml-2 flex-shrink-0" />
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Bottom Row - Upcoming Events & Resource History -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <!-- Upcoming Events -->
      <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-surface-200 animate-fade-in">
        <h2 class="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-surface-800 flex items-center">
          <i class="pi pi-calendar mr-2 text-primary-600"></i>
          Upcoming Events
        </h2>
        
        <div v-if="upcomingEvents.length > 0" class="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto custom-scrollbar">
          <div 
            v-for="event in upcomingEvents"
            :key="event.id"
            class="p-3 rounded-lg hover:bg-surface-50 transition-all duration-300 ease-in-out border border-surface-100 cursor-pointer transform hover:-translate-y-1 hover:shadow-md"
          >
            <div class="flex items-start gap-3">
              <span :class="`${getEventTypeColor(event.type)} w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-1.5 flex-shrink-0`"></span>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-surface-900 text-sm sm:text-base truncate">{{ event.title }}</h3>
                <div class="flex items-center text-xs sm:text-sm text-surface-500 mt-1">
                  <i class="pi pi-clock mr-1 text-xs"></i>
                  <span class="truncate">{{ formatDateTime(event.date) }}</span>
                </div>
                <div v-if="event.location" class="flex items-center text-xs sm:text-sm text-surface-500 mt-1">
                  <i class="pi pi-map-marker mr-1 text-xs"></i>
                  <span class="truncate">{{ event.location }}</span>
                </div>
                <p v-if="event.description" class="text-xs text-surface-500 mt-1 line-clamp-2">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-surface-500 text-center py-8 text-sm">No upcoming events</p>
      </div>
      
      <!-- Recent Resource Distributions - Mobile Optimized Table -->
      <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Recent Resource Distributions</h2>
        
        <div v-if="isLoadingResourceHistory" class="flex justify-center items-center h-32">
          <i class="pi pi-spin pi-spinner text-2xl sm:text-3xl text-primary-500"></i>
        </div>
        <div v-else-if="recentResourceDistributions.length === 0" class="text-center py-8 text-gray-500 text-sm">
          No recent resource distributions found
        </div>
        <div v-else class="max-h-64 sm:max-h-80 overflow-auto custom-scrollbar">
          <!-- Mobile Card Layout -->
          <div class="block sm:hidden space-y-3">
            <div v-for="distribution in recentResourceDistributions" :key="distribution.id" class="border border-gray-200 rounded-lg p-3">
              <div class="flex justify-between items-start mb-2">
                <div class="text-sm font-medium text-gray-900">{{ distribution.barangay }}</div>
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
              </div>
              <div class="text-xs text-gray-600 mb-2">{{ formatDate(distribution.requestDate) }}</div>
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
            </div>
          </div>
          
          <!-- Desktop Table Layout -->
          <div class="hidden sm:block">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resources</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="distribution in recentResourceDistributions" :key="distribution.id" class="hover:bg-gray-50">
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(distribution.requestDate) }}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ distribution.barangay }}
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900">
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
                  <td class="px-4 py-4 whitespace-nowrap">
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
  { title: 'Total Members', value: '0', icon: 'pi pi-users', bgColor: 'bg-blue-600' },
  { title: 'New Applications', value: '0', icon: 'pi pi-file', bgColor: 'bg-green-600' },
  { title: 'Upcoming Events', value: '0', icon: 'pi pi-calendar', bgColor: 'bg-yellow-600' },
  { title: 'Resources Distributed', value: '0', icon: 'pi pi-box', bgColor: 'bg-violet-600' },
]);

// Loading states
const isLoadingChartData = ref(true);
const isLoadingResourceHistory = ref(true);
const isLoadingSupplyData = ref(true);
const isLoadingTrendData = ref(true);
const isLoadingMemberData = ref(true);

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

// Member analytics data
const membersByBarangay = ref([]);
const totalMembers = ref(0);
const memberChartType = ref('pie');

// Pre-registration analytics data
const preRegistrationsByDate = ref([]);
const preRegistrationsByBarangay = ref([]);
const totalPreRegistrations = ref(0);
const preRegChartType = ref('line');
const preRegTimeRange = ref('30'); // days
const isLoadingPreRegData = ref(true);

// Colors for barangay chart
const barangayColors = [
  '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#6B7280', '#F97316', '#84CC16',
  '#06B6D4', '#8B5A2B', '#DC2626', '#7C3AED', '#059669'
];

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

// Member Distribution Data (updated with real data)
const memberDistributionData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: []
  }]
});

// Pre-Registration Chart Data
const preRegChartData = computed(() => {
  if (preRegistrationsByDate.value.length === 0) {
    return { labels: [], datasets: [] };
  }
  
  const labels = preRegistrationsByDate.value.map(item => item.date);
  const data = preRegistrationsByDate.value.map(item => item.count);
  
  return {
    labels: labels,
    datasets: [{
      label: 'Pre-Registrations',
      data: data,
      borderColor: '#3B82F6',
      backgroundColor: preRegChartType.value === 'bar' ? '#3B82F6' : 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: preRegChartType.value === 'line'
    }]
  };
});

// Pre-Registration Chart Options
const preRegChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
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
          return `${context.dataset.label}: ${context.raw} registrations`;
        }
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Registrations'
      },
      ticks: {
        stepSize: 1
      }
    }
  }
}));

// Chart Options
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

// Member Chart Options
const memberChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: memberChartType.value === 'bar' ? 'top' : 'right',
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
          const percentage = Math.round((value / totalMembers.value) * 100);
          return `${context.label}: ${value} members (${percentage}%)`;
        }
      }
    }
  },
  scales: memberChartType.value === 'bar' ? {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Members'
      }
    }
  } : {}
}));

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

// Fetch Members by Barangay
const fetchMembersByBarangay = async () => {
  try {
    isLoadingMemberData.value = true;
    
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    
    // Group members by barangay
    const barangayCount = {};
    let total = 0;
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const barangay = userData.barangay || 'Unknown';
      
      if (!barangayCount[barangay]) {
        barangayCount[barangay] = 0;
      }
      barangayCount[barangay]++;
      total++;
    });
    
    // Convert to array and sort by count (descending)
    const barangayArray = Object.entries(barangayCount)
      .map(([barangay, count]) => ({ barangay, count }))
      .sort((a, b) => b.count - a.count);
    
    membersByBarangay.value = barangayArray;
    totalMembers.value = total;
    
    // Update chart data
    updateMemberDistributionChart();
    
    // Update total members stat
    const totalMembersStat = stats.value.find(stat => stat.title === 'Total Members');
    if (totalMembersStat) {
      totalMembersStat.value = total.toString();
    }
    
    isLoadingMemberData.value = false;
  } catch (error) {
    console.error('Error fetching members by barangay:', error);
    isLoadingMemberData.value = false;
  }
};

// Fetch Pre-Registration Data
const fetchPreRegistrationData = async () => {
  try {
    isLoadingPreRegData.value = true;
    
    const preregCollection = collection(db, 'preregistration');
    const querySnapshot = await getDocs(preregCollection);
    
    // Calculate date range
    const now = new Date();
    const daysBack = parseInt(preRegTimeRange.value);
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    // Group by date and barangay
    const dateCount = {};
    const barangayCount = {};
    let total = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let regDate;
      
      // Handle different timestamp formats
      if (data.timestamp instanceof Timestamp) {
        regDate = data.timestamp.toDate();
      } else if (data.timestamp && data.timestamp.seconds) {
        regDate = new Date(data.timestamp.seconds * 1000);
      } else if (typeof data.timestamp === 'string') {
        regDate = new Date(data.timestamp);
      } else {
        regDate = new Date(); // fallback to current date
      }
      
      // Only include registrations within the selected time range
      if (regDate >= startDate) {
        // Group by date
        const dateKey = regDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        if (!dateCount[dateKey]) {
          dateCount[dateKey] = 0;
        }
        dateCount[dateKey]++;
        
        // Group by barangay
        const barangay = data.barangay || 'Unknown';
        if (!barangayCount[barangay]) {
          barangayCount[barangay] = 0;
        }
        barangayCount[barangay]++;
        
        total++;
      }
    });
    
    // Convert to arrays and sort
    const dateArray = Object.entries(dateCount)
      .map(([date, count]) => ({ 
        date: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        count 
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const barangayArray = Object.entries(barangayCount)
      .map(([barangay, count]) => ({ barangay, count }))
      .sort((a, b) => b.count - a.count);
    
    preRegistrationsByDate.value = dateArray;
    preRegistrationsByBarangay.value = barangayArray;
    totalPreRegistrations.value = total;
    
    isLoadingPreRegData.value = false;
  } catch (error) {
    console.error('Error fetching pre-registration data:', error);
    isLoadingPreRegData.value = false;
  }
};

// Refresh pre-registration data
const refreshPreRegData = () => {
  fetchPreRegistrationData();
};

// Update Member Distribution Chart
const updateMemberDistributionChart = () => {
  if (membersByBarangay.value.length === 0) {
    memberDistributionData.value = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };
    return;
  }
  
  const labels = membersByBarangay.value.map(item => item.barangay);
  const data = membersByBarangay.value.map(item => item.count);
  const colors = membersByBarangay.value.map((_, index) => 
    barangayColors[index % barangayColors.length]
  );
  
  memberDistributionData.value = {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors,
      borderColor: colors,
      borderWidth: memberChartType.value === 'bar' ? 1 : 0
    }]
  };
};

// Refresh member data
const refreshMemberData = () => {
  fetchMembersByBarangay();
};

// Watch for chart type changes
watch(memberChartType, () => {
  updateMemberDistributionChart();
});

// Watch for pre-registration chart type and time range changes
watch(preRegChartType, () => {
  // Chart will automatically update due to computed property
});

watch(preRegTimeRange, () => {
  fetchPreRegistrationData();
});

// Fetch Total Members (kept for compatibility)
const fetchTotalMembers = async () => {
  // This is now handled by fetchMembersByBarangay
  return;
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
  fetchMembersByBarangay(); // Fetch member data first
  fetchNewApplications();
  fetchResourceDistribution();
  fetchResourceSupply();
  fetchRecentResourceDistributions();
  fetchEvents();
  fetchRecentActivities();
  fetchPreRegistrationData();
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Extra small devices (phones, 576px and down) */
@media (max-width: 575.98px) {
  .xs\:flex-row {
    flex-direction: row;
  }
  
  .xs\:items-center {
    align-items: center;
  }
  
  .xs\:flex-initial {
    flex: initial;
  }
}

/* Ensure proper touch scrolling on mobile */
.overflow-y-auto, .overflow-auto {
  -webkit-overflow-scrolling: touch;
}

/* Prevent horizontal scroll on mobile */
.min-w-0 {
  min-width: 0;
}

/* Responsive text utilities */
@media (max-width: 640px) {
  .text-responsive {
    font-size: 0.875rem;
  }
}

/* Ensure charts are responsive */
.chart-container {
  position: relative;
  height: 100%;
  width: 100%;
}

/* Mobile-friendly table alternatives */
@media (max-width: 640px) {
  .mobile-card {
    display: block;
  }
  
  .desktop-table {
    display: none;
  }
}

@media (min-width: 641px) {
  .mobile-card {
    display: none;
  }
  
  .desktop-table {
    display: block;
  }
}
</style>