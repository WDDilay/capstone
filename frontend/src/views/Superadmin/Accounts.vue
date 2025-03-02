<template>
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header class="mb-8 animate-fade-in">
          <div class="flex justify-between items-center">
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900">
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">
                Barangay President Accounts
              </span>
            </h1>
          </div>
          <p class="mt-2 text-xl text-gray-600">
            Manage accounts for Solo Parent program administrators
          </p>
        </header>
  
        <div class="mb-6 flex justify-between items-center animate-fade-in" style="animation-delay: 0.2s;">
          <Button 
            @click="openNewAccountDialog" 
            icon="pi pi-plus" 
            label="Add Account" 
            class="p-button-rounded bg-gradient-to-r from-primary-500 to-primary-700 border-none shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          />
          
          <span class="text-gray-600">
            Total Accounts: {{ accounts.length }}
          </span>
        </div>
  
        <div class="rounded-xl shadow-sm overflow-hidden transition-colors duration-300 ease-in-out animate-fade-in bg-white border-gray-200">
          <DataTable 
            :value="accounts" 
            :paginator="true" 
            :rows="10" 
            responsive-layout="scroll"
            :global-filter-fields="['name', 'username', 'barangay']" 
            v-model:filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            rowsPerPageOptions="[5,10,25,50]"
          >
            <template #header>
              <div class="flex justify-between items-center py-2">
                <h2 class="text-lg font-medium text-gray-700">
                  Account List
                </h2>
                <span class="p-input-icon-left">
                  <i class="pi pi-search text-gray-500" />
                  <InputText 
                    v-model="filters['global'].value" 
                    placeholder="Search accounts" 
                    class="p-inputtext-sm border-0 bg-transparent"
                  />
                </span>
              </div>
            </template>
            
            <Column field="name" header="Name" sortable>
              <template #body="slotProps">
                <span class="font-medium text-gray-900">{{ slotProps.data.name }}</span>
              </template>
            </Column>
            <Column field="username" header="Username" sortable>
              <template #body="slotProps">
                <span class="font-mono text-sm text-gray-600">
                  {{ slotProps.data.username }}
                </span>
              </template>
            </Column>
            <Column field="barangay" header="Barangay" sortable>
              <template #body="slotProps">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', 
                  getBadgeColor(slotProps.data.barangay)]">
                  {{ slotProps.data.barangay }}
                </span>
              </template>
            </Column>
            <Column header="Actions" :exportable="false" style="min-width:8rem">
              <template #body="slotProps">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2" @click="editAccount(slotProps.data)" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="confirmDeleteAccount(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>
  
        <Dialog 
          v-model:visible="accountDialog" 
          :style="{width: '450px'}" 
          :header="editMode ? 'Edit Account' : 'Add New Account'" 
          :modal="true" 
          class="p-fluid custom-dialog"
        >
          <div class="field mb-4">
            <label for="name" class="block text-sm font-medium mb-1 text-gray-700">Name</label>
            <InputText id="name" v-model.trim="account.name" required autofocus :class="{'p-invalid': submitted && !account.name}" />
            <small class="p-error" v-if="submitted && !account.name">Name is required.</small>
          </div>
          <div class="field mb-4">
            <label for="username" class="block text-sm font-medium mb-1 text-gray-700">Username</label>
            <InputText id="username" v-model.trim="account.username" required :class="{'p-invalid': submitted && !account.username}" />
            <small class="p-error" v-if="submitted && !account.username">Username is required.</small>
          </div>
          <div class="field mb-4">
            <label for="password" class="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <Password id="password" v-model="account.password" required :class="{'p-invalid': submitted && !account.password}" :feedback="false" toggleMask />
            <small class="p-error" v-if="submitted && !account.password">Password is required.</small>
          </div>
          <div class="field mb-4">
            <label for="barangay" class="block text-sm font-medium mb-1 text-gray-700">Barangay</label>
            <Dropdown id="barangay" v-model="account.barangay" :options="barangays" optionLabel="name" optionValue="name" placeholder="Select a Barangay" :class="{'p-invalid': submitted && !account.barangay}" />
            <small class="p-error" v-if="submitted && !account.barangay">Barangay is required.</small>
          </div>
          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-primary bg-gradient-to-r from-primary-500 to-primary-700 border-none" @click="saveAccount" />
          </template>
        </Dialog>
  
        <Dialog v-model:visible="deleteAccountDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
          <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="account" class="text-gray-700">Are you sure you want to delete <b>{{ account.name }}</b>'s account?</span>
          </div>
          <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteAccountDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteAccount" />
          </template>
        </Dialog>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, reactive, computed } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import Password from 'primevue/password';
  
  const toast = useToast();
  
  const accounts = ref([]);
  const accountDialog = ref(false);
  const deleteAccountDialog = ref(false);
  const account = ref({});
  const submitted = ref(false);
  const filters = ref({
    'global': { value: null, matchMode: 'contains' }
  });
  const editMode = ref(false);
  
  const barangays = [
    { name: 'Barangay 1' },
    { name: 'Barangay 2' },
    { name: 'Barangay 3' },
    { name: 'Barangay 4' },
    { name: 'Barangay 5' },
  ];
  
  onMounted(() => {
    // Simulated API call to fetch accounts
    accounts.value = [
      { id: 1, name: 'John Doe', username: 'johndoe', barangay: 'Barangay 1' },
      { id: 2, name: 'Jane Smith', username: 'janesmith', barangay: 'Barangay 2' },
      { id: 3, name: 'Alice Johnson', username: 'alicej', barangay: 'Barangay 3' },
      { id: 4, name: 'Bob Wilson', username: 'bobw', barangay: 'Barangay 4' },
      { id: 5, name: 'Eva Martinez', username: 'evam', barangay: 'Barangay 5' },
    ];
  });
  
  const openNewAccountDialog = () => {
    account.value = {};
    submitted.value = false;
    accountDialog.value = true;
    editMode.value = false;
  };
  
  const hideDialog = () => {
    accountDialog.value = false;
    submitted.value = false;
  };
  
  const saveAccount = () => {
    submitted.value = true;
  
    if (account.value.name && account.value.username && account.value.password && account.value.barangay) {
      if (account.value.id) {
        accounts.value[findIndexById(account.value.id)] = {...account.value};
        toast.add({severity:'success', summary: 'Successful', detail: 'Account Updated', life: 3000});
      } else {
        account.value.id = createId();
        accounts.value.push(account.value);
        toast.add({severity:'success', summary: 'Successful', detail: 'Account Created', life: 3000});
      }
  
      accountDialog.value = false;
      account.value = {};
    }
  };
  
  const editAccount = (editAccount) => {
    account.value = {...editAccount};
    accountDialog.value = true;
    editMode.value = true;
  };
  
  const confirmDeleteAccount = (deleteAccount) => {
    account.value = deleteAccount;
    deleteAccountDialog.value = true;
  };
  
  const deleteAccount = () => {
    accounts.value = accounts.value.filter(val => val.id !== account.value.id);
    deleteAccountDialog.value = false;
    account.value = {};
    toast.add({severity:'success', summary: 'Successful', detail: 'Account Deleted', life: 3000});
  };
  
  const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < accounts.value.length; i++) {
      if (accounts.value[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  };
  
  const createId = () => {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };
  
  const getBadgeColor = (barangay) => {
    const colors = {
      'Barangay 1': 'bg-blue-100 text-blue-800',
      'Barangay 2': 'bg-green-100 text-green-800',
      'Barangay 3': 'bg-yellow-100 text-yellow-800',
      'Barangay 4': 'bg-red-100 text-red-800',
      'Barangay 5': 'bg-purple-100 text-purple-800',
    };
    return colors[barangay] || 'bg-gray-100 text-gray-800';
  };
  </script>
  
  <style scoped>
  /* Custom scrollbar */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: theme('colors.primary.400') theme('colors.gray.200');
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: theme('colors.gray.200');
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: theme('colors.primary.400');
    border-radius: 20px;
    border: 3px solid theme('colors.gray.200');
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  /* Custom dialog styling */
  .custom-dialog {
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .custom-dialog::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-dialog::-webkit-scrollbar-track {
    background: theme('colors.gray.200');
  }
  
  .custom-dialog::-webkit-scrollbar-thumb {
    background-color: theme('colors.primary.400');
    border-radius: 20px;
    border: 3px solid theme('colors.gray.200');
  }
  
  /* DataTable modern styling */
  :deep(.p-datatable) {
    border-radius: 1rem;
    border: 1px solid #e5e7eb;
  }
  
  :deep(.p-datatable .p-datatable-header) {
    background: transparent;
    border: none;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    background: transparent;
    border: none;
    color: #6b7280;
    font-weight: 500;
    font-size: 0.875rem;
    padding: 0.75rem 1.5rem;
    white-space: nowrap;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr) {
    border-bottom: 1px solid #f3f4f6;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:last-child) {
    border-bottom: none;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    border: none;
    padding: 1rem 1.5rem;
    color: #374151;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #f9fafb;
  }
  
  /* Monospace font for username column */
  :deep(.p-datatable .p-datatable-tbody > tr > td.username-cell) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.875rem;
  }
  
  /* Enhanced pagination styling */
  :deep(.p-paginator) {
    background: transparent;
    border: none;
    padding: 1rem 1.5rem;
  }
  
  :deep(.p-paginator .p-paginator-pages .p-paginator-page) {
    min-width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    margin: 0 0.125rem;
    transition: background-color 0.2s ease;
  }
  
  :deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background-color: theme('colors.primary.500');
    color: white;
  }
  
  :deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
    background-color: theme('colors.gray.100');
  }
  
  :deep(.p-paginator .p-paginator-first, .p-paginator .p-paginator-prev, .p-paginator .p-paginator-next, .p-paginator .p-paginator-last) {
    min-width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    margin: 0 0.125rem;
    transition: background-color 0.2s ease;
  }
  
  :deep(.p-paginator .p-paginator-first:not(.p-disabled):hover, .p-paginator .p-paginator-prev:not(.p-disabled):hover, .p-paginator .p-paginator-next:not(.p-disabled):hover, .p-paginator .p-paginator-last:not(.p-disabled):hover) {
    background-color: theme('colors.gray.100');
  }
  </style>