<template>
    <div class="p-6">
      <!-- Top Bar -->
      <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <!-- Search Bar -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, barangay, or status..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
          />
        </div>
  
        <!-- Action Buttons -->
        <div class="flex gap-2 flex-wrap justify-center">
          <button
            @click="exportToExcel"
            class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FileSpreadsheet class="w-5 h-5" />
            <span>Export to Excel</span>
          </button>
          <button
            @click="printData"
            class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Printer class="w-5 h-5" />
            <span>Print Data</span>
          </button>
        </div>
      </div>
  
      <!-- Table -->
      <div class="bg-white rounded-lg overflow-x-auto">
        <div class="hidden md:grid grid-cols-5 gap-4 py-4 px-6 border-b">
          <div class="text-gray-600 font-medium">Name</div>
          <div class="text-gray-600 font-medium">Barangay</div>
          <div class="text-gray-600 font-medium">Contact</div>
          <div class="text-gray-600 font-medium">Status</div>
          <div class="text-gray-600 font-medium">Actions</div>
        </div>
  
        <!-- Table Body for Larger Screens -->
        <div class="hidden md:block divide-y">
          <div
            v-for="user in paginatedUsers"
            :key="user.id"
            class="grid grid-cols-5 gap-4 py-4 px-6 items-center hover:bg-gray-50"
          >
            <div>{{ user.name }}</div>
            <div>{{ user.barangay }}</div>
            <div class="whitespace-nowrap">{{ user.contact }}</div>
            <div>
              <span
                :class="{
                  'px-2 py-1 rounded-full text-sm font-medium': true,
                  'bg-green-100 text-green-600': user.status === 'Active',
                  'bg-red-100 text-red-600': user.status === 'Blocked'
                }"
              >
                {{ user.status }}
              </span>
            </div>
            <div class="flex gap-2">
              <button @click="editUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                <Pencil class="w-5 h-5" />
              </button>
              <button @click="deleteUser(user)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
  
        <!-- Mobile View (Cards) -->
        <div class="md:hidden space-y-4">
          <div v-for="user in paginatedUsers" :key="user.id" class="bg-gray-50 p-4 rounded-lg">
            <p class="text-lg font-semibold">{{ user.name }}</p>
            <p class="text-sm text-gray-600">Barangay: {{ user.barangay }}</p>
            <p class="text-sm text-gray-600">Contact: {{ user.contact }}</p>
            <p class="text-sm font-medium" :class="user.status === 'Active' ? 'text-green-600' : 'text-red-600'">
              Status: {{ user.status }}
            </p>
            <div class="flex gap-2 mt-2">
              <button @click="editUser(user)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                <Pencil class="w-5 h-5" />
              </button>
              <button @click="deleteUser(user)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Pagination -->
      <div class="flex items-center justify-between px-6 py-4 border-t">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import * as XLSX from 'xlsx';
  import { 
    Search, 
    FileSpreadsheet, 
    Printer, 
    User, 
    MapPin, 
    Phone, 
    CheckCircle, 
    Settings, 
    Ban, 
    Pencil, 
    Trash2, 
    ChevronLeft, 
    ChevronRight 
  } from 'lucide-vue-next';
  
  // Sample data
  const users = ref([
    {
      id: 1,
      name: 'Maria Santos',
      barangay: 'Poblacion',
      contact: '09123456789',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jose Garcia',
      barangay: 'San Miguel',
      contact: '09187654321',
      status: 'Blocked'
    }
  ]);
  
  // Search and Pagination
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  
  // Filtered users based on search
  const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value;
    
    const query = searchQuery.value.toLowerCase();
    return users.value.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.barangay.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query) ||
      user.contact.includes(query)
    );
  });
  
  // Paginated users
  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUsers.value.slice(start, end);
  });
  
  // Calculate total pages
  const totalPages = computed(() => {
    return Math.ceil(filteredUsers.value.length / itemsPerPage) || 1;
  });
  
  // Pagination methods
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  // Export to Excel functionality
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredUsers.value.map(user => ({
      Name: user.name,
      Barangay: user.barangay,
      Contact: user.contact,
      Status: user.status
    }));
  
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
  
    // Save file
    XLSX.writeFile(wb, 'solo-parent-data.xlsx');
  };
  
  // Print functionality
  const printData = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 20px;">Solo Parent Federation Data</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Barangay</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Contact</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredUsers.value.map(user => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${user.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${user.barangay}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${user.contact}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${user.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Data</title>
        </head>
        <body>
          ${printContent.innerHTML}
          <scr>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </scr'+'ipt>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  // CRUD Operations
  const editUser = (user) => {
    // Implement edit functionality
    console.log('Editing user:', user);
  };
  
  const deleteUser = (user) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      users.value = users.value.filter(u => u.id !== user.id);
    }
  };
  </script>