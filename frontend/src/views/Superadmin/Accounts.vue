<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <!-- Enhanced Add Account Button -->
        <Button 
          @click="openNewAccountDialog" 
          icon="pi pi-plus" 
          label="Add Account" 
          class="p-button-rounded bg-gradient-to-r from-primary-500 to-primary-700 border-none shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 px-6 py-3 text-lg font-semibold"
        />
        
        <span class="text-gray-600 text-lg">
          Total Accounts: {{ accounts.length }}
        </span>
      </div>

      <!-- Enhanced DataTable -->
      <div class="rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out animate-fade-in bg-white">
        <DataTable 
          :value="paginatedAccounts" 
          :rows="rows" 
          :first="first"
          responsive-layout="scroll"
          :global-filter-fields="['name', 'username', 'barangay']" 
          v-model:filters="filters"
          :paginator="false"
          class="p-datatable-accounts"
        >
          <template #header>
            <div class="flex justify-between items-center py-3 px-4">
              <h2 class="text-xl font-semibold text-gray-800">
                Account List
              </h2>
              <span class="p-input-icon-left">
                <i class="pi pi-search text-gray-500" />
                <InputText 
                  v-model="filters['global'].value" 
                  placeholder="Search accounts" 
                  class="p-inputtext-sm border-0 bg-gray-100 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300"
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
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', ]">
                {{ slotProps.data.barangay }}
              </span>
            </template>
          </Column>
          <Column header="Actions" :exportable="false" style="min-width:8rem">
            <template #body="slotProps">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-text mr-2 text-blue-600 hover:bg-blue-100" @click="editAccount(slotProps.data)" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger hover:bg-red-100" @click="confirmDeleteAccount(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
        
        <!-- Separate Paginator component -->
        <Paginator 
          v-model:first="first" 
          v-model:rows="rows" 
          :total-records="filteredAccounts.length" 
          :rows-per-page-options="[5, 10, 20, 50]"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="border-t border-gray-200"
        />
      </div>

      <!-- Add/Edit Account Dialog -->
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
          <Dropdown 
  v-model="account.barangay" 
  :options="barangays" 
  optionLabel="name" 
  placeholder="Select Barangay"
  :virtualScrollerOptions="{ itemSize: 38 }"
  class="w-full"
/>


          <small class="p-error" v-show="submitted && !account.barangay">Barangay is required.</small>
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" class="p-button-primary bg-gradient-to-r from-primary-500 to-primary-700 border-none" @click="saveAccount" />
        </template>
      </Dialog>

      <!-- Delete Confirmation Dialog -->
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
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Password from 'primevue/password';
import Paginator from 'primevue/paginator';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth } from "@/services/firebase";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

const toast = useToast();

// State
const accounts = ref([]);
const accountDialog = ref(false);
const deleteAccountDialog = ref(false);
const account = ref({ barangay: null }); // Initialize barangay to null
const submitted = ref(false);
const filters = ref({ 'global': { value: null, matchMode: 'contains' } });
const editMode = ref(false);
const first = ref(0);
const rows = ref(10);
const barangays = ref([]);

// Fetch barangays from Firestore
const fetchBarangays = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "barangays"));
    barangays.value = querySnapshot.docs.map(doc => ({ name: doc.data().name }));
    console.log("Barangays fetched:", barangays.value);
  } catch (error) {
    console.error("Error fetching barangays:", error);
  }
};

// Fetch accounts in real-time
const fetchAccounts = () => {
  try {
    const unsubscribe = onSnapshot(collection(db, "barangay_presidents"), (snapshot) => {
      accounts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
    return unsubscribe; // Cleanup on component unmount
  } catch (error) {
    console.error("Error fetching accounts:", error);
    toast.add({ severity: "error", summary: "Error", detail: "Failed to fetch accounts", life: 3000 });
  }
};

// Computed properties
const filteredAccounts = computed(() => {
  if (!filters.value.global.value) return accounts.value;
  return accounts.value.filter(account => {
    return ['name', 'username', 'barangay'].some(field => {
      return String(account[field]).toLowerCase().includes(filters.value.global.value.toLowerCase());
    });
  });
});

const paginatedAccounts = computed(() => {
  const startIndex = first.value;
  const endIndex = startIndex + rows.value;
  return filteredAccounts.value.slice(startIndex, endIndex);
});

// Watch for filter changes
watch(() => filters.value.global.value, () => {
  first.value = 0;
});

// Open dialog for new account
const openNewAccountDialog = () => {
  account.value = { barangay: null }; // Reset barangay to null
  submitted.value = false;
  accountDialog.value = true;
  editMode.value = false;
};

// Hide dialog
const hideDialog = () => {
  accountDialog.value = false;
  submitted.value = false;
};

// Save or update account
const saveAccount = async () => {
  submitted.value = true;

  if (account.value.name && account.value.username && account.value.password && account.value.barangay) {
    try {
      if (editMode.value) {
        // Update logic (unchanged)
      } else {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, account.value.username, account.value.password);
        const user = userCredential.user;

        // Set display name in Firebase Auth
        await updateProfile(user, { displayName: account.value.name });

        // Save user data in Firestore
        const newUser = {
          id: user.uid,
          name: account.value.name,
          username: account.value.username,
          barangay: account.value.barangay,
          role: "BarangayPresident"
        };

        await addDoc(collection(db, "barangay_presidents"), newUser);
        await addDoc(collection(db, "admins"), newUser);

        toast.add({ severity: "success", summary: "Successful", detail: "Account Created", life: 3000 });
      }

      accountDialog.value = false;
      account.value = { barangay: null }; // Reset barangay to null
      editMode.value = false;
    } catch (error) {
      console.error("Error saving account:", error);
      toast.add({ severity: "error", summary: "Error", detail: "Failed to save account", life: 3000 });
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchBarangays();
  fetchAccounts();
});
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

:deep(.white-bg-dropdown .p-dropdown) {
  background-color: white !important;
  border: 1px solid #e2e8f0;
}

:deep(.white-bg-dropdown .p-dropdown-panel) {
  background-color: white !important;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}


/* Enhanced DataTable styling */
:deep(.p-datatable-accounts) {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.p-datatable-accounts .p-datatable-header) {
  background: #f9fafb;
  border: none;
  padding: 1.5rem;
}

:deep(.p-datatable-accounts .p-datatable-thead > tr > th) {
  background: #f3f4f6;
  border: none;
  color: #4b5563;
  font-weight: 600;
  padding: 1rem 1.5rem;
  white-space: nowrap;
}

:deep(.p-datatable-accounts .p-datatable-tbody > tr) {
  transition: background-color 0.2s ease;
}

:deep(.p-datatable-accounts .p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6;
}

:deep(.p-datatable-accounts .p-datatable-tbody > tr > td) {
  border: none;
  padding: 1rem 1.5rem;
  color: #1f2937;
}

/* Enhanced pagination styling */
:deep(.p-paginator) {
  background: #f9fafb;
  border: none;
  padding: 1rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2.5rem;
  height: 2.5rem;
  margin: 0 0.25rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
  border: none;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: theme('colors.primary.500');
  color: white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
  background-color: theme('colors.gray.200');
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  min-width: 2.5rem;
  height: 2.5rem;
  margin: 0 0.25rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
  border: none;
}

:deep(.p-paginator .p-paginator-first:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-prev:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-next:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-last:not(.p-disabled):hover) {
  background-color: theme('colors.gray.200');
}
</style>

