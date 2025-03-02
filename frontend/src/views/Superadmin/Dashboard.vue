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
          <Chart type="bar" :data="monthlyDistributionData" :options="chartOptions" class="h-64" />
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
            <li v-for="activity in recentActivities" :key="activity.date" class="py-4 flex items-center justify-between hover:bg-gray-50 px-4 rounded-lg transition">
              <div class="flex items-center space-x-4">
                <i class="pi pi-user text-blue-500 text-lg"></i>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ activity.user }}</p>
                  <p class="text-xs text-gray-600">{{ activity.activity }} - {{ activity.date }}</p>
                </div>
              </div>
              <Tag :value="activity.status" :severity="getStatusSeverity(activity.status)" class="px-2 py-1 text-xs" />
            </li>
          </ul>
        </div>
  
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <h2 class="text-lg font-semibold mb-4 text-gray-700">Upcoming Events</h2>
          <ul class="divide-y">
            <li v-for="event in upcomingEvents" :key="event.id" class="py-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-gray-800">{{ event.title }}</h3>
                  <p class="text-sm text-gray-600">{{ event.date }} at {{ event.time }}</p>
                  <p class="text-sm text-gray-500">{{ event.location }}</p>
                </div>
                <Tag :value="event.type" :severity="getEventTypeSeverity(event.type)" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Chart from 'primevue/chart';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Tag from 'primevue/tag';
  
  const stats = ref([
    { title: 'Total Members', value: '1,248', icon: 'pi pi-users', bgColor: 'bg-blue-500' },
    { title: 'New Applications', value: '54', icon: 'pi pi-file', bgColor: 'bg-green-500' },
    { title: 'Upcoming Events', value: '12', icon: 'pi pi-calendar', bgColor: 'bg-yellow-500' },
    { title: 'Support Tickets', value: '28', icon: 'pi pi-ticket', bgColor: 'bg-red-500' },
  ]);
  
  const monthlyDistributionData = ref({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { label: 'New Members', data: [65, 59, 80, 81, 56, 55, 40, 70, 75, 62, 58, 90], backgroundColor: '#3B82F6' },
      { label: 'Events Held', data: [28, 48, 40, 19, 86, 27, 90, 35, 42, 50, 45, 70], backgroundColor: '#10B981' }
    ]
  });
  
  const memberDistributionData = ref({
    labels: ['Single Mothers', 'Single Fathers', 'Widowed', 'Separated'],
    datasets: [{ data: [540, 325, 210, 173], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }]
  });
  
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  });
  
  const pieChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  });
  
  const recentActivities = ref([
    { date: '2023-07-01', user: 'John Doe', activity: 'Created a new account', status: 'Completed' },
    { date: '2023-07-01', user: 'Jane Smith', activity: 'Submitted application', status: 'Pending' },
    { date: '2023-06-30', user: 'Robert Johnson', activity: 'Updated profile information', status: 'Completed' },
  ]);
  
  const upcomingEvents = ref([
    { id: 1, title: 'Parenting Workshop', date: '2023-07-15', time: '10:00 AM', location: 'Community Center', type: 'Workshop' },
    { id: 2, title: 'Financial Aid Seminar', date: '2023-07-18', time: '2:00 PM', location: 'City Hall', type: 'Seminar' }
  ]);
  
  const getStatusSeverity = (status) => status === 'Completed' ? 'success' : status === 'Pending' ? 'warning' : 'info';
  const getEventTypeSeverity = (type) => type === 'Workshop' ? 'info' : type === 'Seminar' ? 'warning' : 'success';
  </script>
  