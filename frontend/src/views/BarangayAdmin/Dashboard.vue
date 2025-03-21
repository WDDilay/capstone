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
                <span :class="[stat.trend > 0 ? 'text-green-500' : 'text-red-500', 'text-xs font-medium ml-2 flex items-center']">
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
  
      <!-- Recent members and activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <!-- Recent members -->
        <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800">Recent Members</h2>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search members..."
                class="pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
              />
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <DataTable 
              :value="filteredData" 
              class="p-datatable-sm border-spacing-y-2 border-separate"
              :paginator="true"
              :rows="5"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              responsiveLayout="scroll"
              stripedRows
              v-model:filters="filters"
              filterDisplay="menu"
            >
              <Column field="name" header="Name">
                <template #body="slotProps">
                  <div class="flex items-center gap-3">
                    <Avatar 
                      :image="slotProps.data.avatar || '/placeholder.svg?height=32&width=32'" 
                      shape="circle" 
                      class="h-8 w-8" 
                    />
                    <div>
                      <p class="font-medium text-gray-800">{{ slotProps.data.name }}</p>
                      <p class="text-xs text-gray-500">{{ slotProps.data.email }}</p>
                    </div>
                  </div>
                </template>
              </Column>
              
              <Column field="barangay" header="Barangay">
                <template #body="slotProps">
                  <div class="flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-gray-400" />
                    <span>{{ slotProps.data.barangay }}</span>
                  </div>
                </template>
              </Column>
              
              <Column field="status" header="Status">
                <template #body="slotProps">
                  <Tag 
                    :severity="slotProps.data.status === 'Active' ? 'success' : 'danger'"
                    :value="slotProps.data.status"
                    :icon="slotProps.data.status === 'Active' ? 'pi pi-check-circle' : 'pi pi-times-circle'"
                    class="text-xs"
                  />
                </template>
              </Column>
              
              <Column header="Actions" style="width: 100px">
                <template #body="slotProps">
                  <div class="flex gap-2">
                    <Button 
                      class="p-button-text p-button-rounded p-button-sm"
                      @click="editRecord(slotProps.data)"
                    >
                      <Edit class="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button 
                      class="p-button-text p-button-rounded p-button-sm"
                      @click="confirmDelete(slotProps.data)"
                    >
                      <Trash2 class="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          
          <div class="flex justify-end mt-4">
            <Button 
              label="View All Members" 
              icon="pi pi-arrow-right" 
              class="p-button-text p-button-sm" 
            />
          </div>
        </div>
  
        <!-- Recent activity -->
        <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800">Recent Activity</h2>
            <Button icon="pi pi-ellipsis-h" class="p-button-text p-button-rounded p-button-sm" />
          </div>
          
          <div class="space-y-4">
            <div v-for="(activity, index) in activities" :key="index" class="flex gap-3">
              <div :class="['rounded-full p-2', activity.color]">
                <component :is="activity.icon" class="h-4 w-4 text-white" />
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ activity.title }}</p>
                <p class="text-sm text-gray-500 mt-1">{{ activity.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
          
          <div class="flex justify-center mt-4">
            <Button 
              label="Load More" 
              icon="pi pi-arrow-down" 
              class="p-button-text p-button-sm" 
            />
          </div>
        </div>
      </div>
  
      <!-- Announcements and resources -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Announcements -->
        <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800">Announcements</h2>
            <Button 
              label="Create" 
              icon="pi pi-plus" 
              class="p-button-primary p-button-sm" 
            />
          </div>
          
          <div class="space-y-4">
            <div v-for="(announcement, index) in announcements" :key="index" 
              class="p-4 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer">
              <div class="flex justify-between">
                <h3 class="font-medium text-gray-800">{{ announcement.title }}</h3>
                <Badge :value="announcement.isNew ? 'New' : ''" severity="info" v-if="announcement.isNew" />
              </div>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ announcement.content }}</p>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-gray-400 flex items-center">
                  <Calendar class="h-3 w-3 mr-1" />
                  {{ announcement.date }}
                </span>
                <Button label="Read More" text size="small" />
              </div>
            </div>
          </div>
        </div>
  
        <!-- Resources -->
        <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800">Resources</h2>
            <Button 
              label="Upload" 
              icon="pi pi-upload" 
              class="p-button-primary p-button-sm" 
            />
          </div>
          
          <div class="space-y-3">
            <div v-for="(resource, index) in resources" :key="index" 
              class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-colors">
              <div class="flex items-center gap-3">
                <div :class="['rounded-full p-2', resource.bgColor]">
                  <component :is="resource.icon" class="h-4 w-4 text-white" />
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ resource.name }}</p>
                  <p class="text-xs text-gray-500">{{ resource.category }} • {{ resource.size }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Tag 
                  :severity="resource.status === 'Available' ? 'success' : 'warning'"
                  :value="resource.status"
                  class="text-xs"
                />
                <Button class="p-button-text p-button-rounded p-button-sm">
                  <Download class="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-4">
            <Button 
              label="View All Resources" 
              icon="pi pi-arrow-right" 
              class="p-button-text p-button-sm" 
            />
          </div>
        </div>
      </div>
  
      <!-- Delete Confirmation Dialog -->
      <ConfirmDialog></ConfirmDialog>
      <Toast />
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
  
  // Services
  const confirm = useConfirm();
  const toast = useToast();
  
  // State
  const searchQuery = ref('');
  const chartPeriod = ref('monthly');
  // Stats data
  const stats = ref([
    { 
      title: 'Total Members', 
      value: '1,254', 
      icon: Users, 
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      trend: 12.5
    },
    { 
      title: 'Active Resources', 
      value: '42', 
      icon: Package, 
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      trend: 8.2
    },
    { 
      title: 'New Messages', 
      value: '18', 
      icon: MessageSquare, 
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      trend: -3.4
    },
    { 
      title: 'Announcements', 
      value: '7', 
      icon: Bell, 
      bgColor: 'bg-gradient-to-r from-amber-500 to-amber-600',
      trend: 5.1
    }
  ]);
  
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
  const announcements = ref([
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
  onMounted(() => {
    // Any initialization code
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