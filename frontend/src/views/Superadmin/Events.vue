<template>
  <div class="bg-gradient-to-br from-surface-50 to-surface-100 min-h-screen overflow-hidden">
    <div class="max-w-7xl mx-auto p-6 md:p-8">
      <header class="mb-8 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 mb-2">
          Events Calendar
        </h1>
        <p class="text-surface-600 text-lg">Organize your schedule and never miss an important date</p>
      </header>

      <div class="mb-6 flex flex-wrap justify-between items-center gap-4 animate-fade-in" style="animation-delay: 0.2s;">
        <!-- Enhanced Add Event Button -->
        <Button 
          @click="openNewEventDialog" 
          icon="pi pi-plus" 
          label="Add Event" 
          class="p-button-rounded bg-gradient-to-r from-primary-600 to-primary-400 border-none shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 px-6 py-3 text-white font-medium"
          :style="{
            boxShadow: '0 10px 15px -3px rgba(var(--primary-600-rgb), 0.3), 0 4px 6px -4px rgba(var(--primary-600-rgb), 0.4)'
          }"
        >
          <template #icon>
            <i class="pi pi-plus mr-2 text-lg"></i>
          </template>
        </Button>
        
        <div class="flex flex-wrap gap-4 text-sm font-medium">
          <span v-for="type in eventTypes" :key="type.value" class="flex items-center bg-white rounded-full px-3 py-1 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
            <span :class="`w-3 h-3 ${getEventTypeColor(type.value)} rounded-full mr-2`"></span> 
            {{ type.label }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-surface-200 animate-fade-in" style="animation-delay: 0.4s;">
          <div class="p-4 bg-gradient-to-r from-primary-600 to-primary-400 text-white">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold">
                {{ formatMonthYear(date) }}
              </h2>
              <Button 
                @click="setToday" 
                label="Today" 
                class="p-button-sm p-button-outlined text-white border-white hover:bg-white/20 transition-colors duration-300"
              />
            </div>
          </div>
          
          <div class="p-4">
            <Calendar 
              v-model="date" 
              :inline="true" 
              :showWeek="true" 
              @date-select="handleDateSelect"
              class="custom-calendar w-full"
            />
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-surface-200 animate-fade-in" style="animation-delay: 0.6s;">
            <h2 class="text-xl font-semibold mb-4 text-surface-800 flex items-center">
              <i class="pi pi-calendar mr-2 text-primary-600"></i>
              Upcoming Events
            </h2>
            
            <div v-if="upcomingEvents.length > 0" class="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div 
                v-for="event in upcomingEvents" 
                :key="event.id" 
                class="p-3 rounded-lg hover:bg-surface-50 transition-all duration-300 ease-in-out border border-surface-100 cursor-pointer transform hover:-translate-y-1 hover:shadow-md"
                @click="openEditEventDialog(event)"
              >
                <div class="flex items-start gap-3">
                  <span :class="`${getEventTypeColor(event.type)} w-3 h-3 rounded-full mt-1.5`"></span>
                  <div class="flex-1">
                    <h3 class="font-medium text-surface-900">{{ event.title }}</h3>
                    <div class="flex items-center text-sm text-surface-500 mt-1">
                      <i class="pi pi-clock mr-1 text-xs"></i>
                      {{ formatDate(event.date) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-surface-500 text-center py-4">No upcoming events</p>
          </div>

          <div v-if="selectedDateEvents.length > 0" class="bg-white rounded-2xl shadow-xl p-6 border border-surface-200 animate-fade-in" style="animation-delay: 0.8s;">
            <h2 class="text-xl font-semibold mb-4 text-surface-800">
              Events on {{ formatFullDate(date) }}
            </h2>
            <div class="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div 
                v-for="event in selectedDateEvents" 
                :key="event.id" 
                class="p-3 rounded-lg hover:bg-surface-50 transition-all duration-300 ease-in-out border border-surface-100 cursor-pointer transform hover:-translate-y-1 hover:shadow-md"
                @click="openEditEventDialog(event)"
              >
                <div class="flex items-start gap-3">
                  <span :class="`${getEventTypeColor(event.type)} w-3 h-3 rounded-full mt-1.5`"></span>
                  <div>
                    <h3 class="font-medium text-surface-900">{{ event.title }}</h3>
                    <p v-if="event.description" class="text-sm text-surface-500 mt-1">{{ event.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Event Dialog -->
      <Dialog 
        v-model:visible="eventDialog" 
        :header="editMode ? 'Edit Event' : 'Add New Event'" 
        :modal="true" 
        class="p-fluid custom-dialog" 
        :style="{width: '550px'}"
        :showHeader="false"
        :dismissableMask="true"
      >
        <div class="bg-gradient-to-r from-primary-600 to-primary-400 p-5 -m-4 mb-4 relative">
          <Button 
            icon="pi pi-times" 
            @click="hideEventDialog" 
            class="p-button-rounded p-button-text p-button-sm absolute right-3 top-3 text-white hover:bg-white/20"
          />
          <h2 class="text-2xl font-bold text-white mb-1">
            {{ editMode ? 'Edit Event' : 'Create New Event' }}
          </h2>
          <p class="text-white/80 text-sm">
            {{ editMode ? 'Update your event details' : 'Add details for your new event' }}
          </p>
        </div>
        
        <div class="p-4">
          <div class="field mb-5">
            <label for="eventTitle" class="block text-sm font-medium text-surface-700 mb-2">Event Title</label>
            <InputText 
              id="eventTitle" 
              v-model="newEvent.title" 
              required 
              autofocus 
              class="w-full p-inputtext-sm rounded-lg border-surface-200 shadow-sm"
              placeholder="Enter event title"
            />
          </div>
          
          <div class="field mb-5">
            <label for="eventDate" class="block text-sm font-medium text-surface-700 mb-2">Date</label>
            <Calendar id="eventDate" v-model="newEvent.date" dateFormat="yy-mm-dd" showIcon @date-select="updateEventDate" />

          </div>
          
          <div class="field mb-5">
            <label for="eventType" class="block text-sm font-medium text-surface-700 mb-2">Event Type</label>
            <Dropdown 
              id="eventType" 
              v-model="newEvent.type" 
              :options="eventTypes" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Select Event Type" 
              required 
              class="w-full p-inputtext-sm"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                  <span :class="`w-3 h-3 ${getEventTypeColor(slotProps.value)} rounded-full mr-2`"></span>
                  {{ getEventTypeLabel(slotProps.value) }}
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center">
                  <span :class="`w-3 h-3 ${getEventTypeColor(slotProps.option.value)} rounded-full mr-2`"></span>
                  {{ slotProps.option.label }}
                </div>
              </template>
            </Dropdown>
          </div>
          
          <div class="field mb-5">
            <label for="eventDescription" class="block text-sm font-medium text-surface-700 mb-2">Description</label>
            <Textarea 
              id="eventDescription" 
              v-model="newEvent.description" 
              rows="3" 
              class="w-full p-inputtext-sm rounded-lg border-surface-200 shadow-sm"
              placeholder="Add details about this event"
            />
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              class="p-button-text" 
              @click="hideEventDialog" 
            />
            <Button 
              label="Save Event" 
              icon="pi pi-check" 
              class="p-button-primary bg-gradient-to-r from-primary-600 to-primary-400 border-none shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 px-5" 
              @click="saveEvent" 
            />
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { format, isSameDay, isAfter, startOfDay } from 'date-fns';
import { db } from '@/services/firebase'; // Ensure this points to your Firebase configuration
import { collection, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, getDocs } from 'firebase/firestore';
import { useUserStore } from "@/stores/user"; 

// Import PrimeVue components
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

const date = ref(new Date());
const events = ref([]);
const userStore = useUserStore();
const user = computed(() => userStore.user);
const eventDialog = ref(false);
const editMode = ref(false);
const newEvent = ref({
  id: '',
  title: '',
  date: new Date(),
  type: '',
  isHoliday: false,
  description: ''
});

const selectedDateEvents = ref([]);

const eventTypes = [
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Reminder', label: 'Reminder' }
];

// Fetch events from Firestore on component mount
const fetchEvents = () => {
  if (!user.value) return;

  const eventsCollection = collection(db, "announcements");
  let filters = [where("createdBy", "==", "FederationPresident")];

  if (user.value.role === "BarangayPresident" || user.value.role === "Member") {
    filters.push(where("barangay", "==", user.value.barangay));
  }

  const q = query(eventsCollection, ...filters);

  onSnapshot(q, (snapshot) => {
    events.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
    }));
  });
};


onMounted(fetchEvents);

// Watchers to update selected date events
watch(date, updateSelectedDateEvents);
watch(events, updateSelectedDateEvents, { deep: true });

// Computed property for upcoming events
const upcomingEvents = computed(() => {
  return events.value
    .filter(event => isAfter(new Date(event.date), startOfDay(new Date())))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

// Function to update selected date events
function updateSelectedDateEvents() {
  selectedDateEvents.value = events.value.filter(event => 
    isSameDay(new Date(event.date), date.value)
  );
}

// Function to handle date selection
function handleDateSelect(value) {
  date.value = value;
}

// Function to set date to today
function setToday() {
  date.value = new Date();
}

// Open New Event Dialog
const openNewEventDialog = () => {
  newEvent.value = { 
    id: '',
    title: '', 
    date: date.value, 
    type: '', 
    isHoliday: false,
    description: ''
  };
  editMode.value = false;
  eventDialog.value = true;
};

// Open Edit Event Dialog
const openEditEventDialog = (event) => {
  newEvent.value = { ...event };
  editMode.value = true;
  eventDialog.value = true;
};

// Close Event Dialog
const hideEventDialog = () => {
  eventDialog.value = false;
};

// Save Event to Firestore (Add or Update)
const saveEvent = async () => {
  if (!newEvent.value.title.trim()) return;

  const eventsCollection = collection(db, 'announcements');

  try {
    if (editMode.value) {
      // Update existing event
      const eventRef = doc(db, 'announcements', newEvent.value.id);
      await updateDoc(eventRef, newEvent.value);
    } else {
      // Add new event
      const docRef = await addDoc(eventsCollection, newEvent.value);
      newEvent.value.id = docRef.id;
    }
    eventDialog.value = false;
  } catch (error) {
    console.error('Error saving event:', error);
  }
};

// Delete Event
const deleteEvent = async (eventId) => {
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    await deleteDoc(doc(db, 'announcements', eventId));
    events.value = events.value.filter(event => event.id !== eventId);
  } catch (error) {
    console.error('Error deleting event:', error);
  }
};


// Format date functions
const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');
const formatFullDate = (date) => format(new Date(date), 'MMMM d, yyyy');
const formatMonthYear = (date) => format(new Date(date), 'MMMM yyyy');

// Get event type color
const getEventTypeColor = (type) => {
  switch(type) {
    case 'Meeting': return 'bg-blue-500';
    case 'Workshop': return 'bg-purple-500';
    case 'Holiday': return 'bg-red-500';
    case 'Reminder': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

// Get event type label
const getEventTypeLabel = (value) => {
  const type = eventTypes.find(t => t.value === value);
  return type ? type.label : '';
};

const updateEventDate = (value) => {
  newEvent.value.date = startOfDay(value);
};
</script>

<style scoped>
/* Custom calendar styling */
.custom-calendar {
  width: 100%;
  border-radius: 12px;
}

:deep(.p-datepicker) {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: none;
  padding: 0.5rem;
}

:deep(.p-datepicker-header) {
  background-color: transparent;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}

:deep(.p-datepicker-calendar) {
  font-size: 0.95rem;
}

:deep(.p-datepicker-calendar th) {
  color: #64748b;
  font-weight: 600;
  padding: 0.5rem;
}

:deep(.p-datepicker-calendar td) {
  padding: 0.25rem;
}

:deep(.p-datepicker-calendar td > span) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

:deep(.p-datepicker-calendar td > span.p-highlight) {
  background-color: var(--primary-600, #4f46e5);
  color: white;
  font-weight: bold;
}

:deep(.p-datepicker-calendar td.p-datepicker-today > span) {
  background-color: #f1f5f9;
  color: #0f172a;
  border-color: transparent;
}

:deep(.p-datepicker-calendar td.p-datepicker-today > span.p-highlight) {
  background-color: var(--primary-600, #4f46e5);
  color: white;
}

/* Custom button styling */
:deep(.p-button) {
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

:deep(.p-button:focus) {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--primary-300, #a5b4fc);
}

:deep(.p-inputtext) {
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary-500, #6366f1);
  box-shadow: 0 0 0 2px var(--primary-100, #e0e7ff);
}

:deep(.p-dropdown) {
  border-radius: 0.5rem;
}

:deep(.p-dropdown:focus) {
  border-color: var(--primary-500, #6366f1);
  box-shadow: 0 0 0 2px var(--primary-100, #e0e7ff);
}

:deep(.p-dropdown-panel) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

:deep(.p-dialog) {
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

:deep(.p-dialog-content) {
  padding: 0;
  border-radius: 1rem;
}

/* Add event indicators to calendar */
:deep(.p-datepicker-calendar td) {
  position: relative;
}

:deep(.p-datepicker-calendar td[data-pc-section="day"]) {
  position: relative;
}

/* We'll add custom JS to add these classes to days with events */
:deep(.has-event:not(.p-highlight)) span::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--blue-500, #3b82f6);
}

:deep(.has-holiday:not(.p-highlight)) span::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--red-500, #ef4444);
}

/* Custom scrollbar */
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

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
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
  background: var(--surface-100, #f1f5f9);
  border-radius: 10px;
}

.custom-dialog::-webkit-scrollbar-thumb {
  background-color: var(--primary-400, #818cf8);
  border-radius: 20px;
  border: 2px solid var(--surface-100, #f1f5f9);
}

/* CSS Variables for primary colors with RGB values for box-shadow */
:root {
  --primary-100-rgb: 224, 231, 255;
  --primary-300-rgb: 165, 180, 252;
  --primary-400-rgb: 129, 140, 248;
  --primary-500-rgb: 99, 102, 241;
  --primary-600-rgb: 79, 70, 229;
}
</style>

<script>
// Add this script section to add event indicators to calendar days
export default {
  mounted() {
    this.addEventIndicators();
  },
  updated() {
    this.$nextTick(() => {
      this.addEventIndicators();
    });
  },
  methods: {
    addEventIndicators() {
      // Get all calendar day cells
      const dayCells = document.querySelectorAll('.p-datepicker-calendar td[data-pc-section="day"]');
      
      // Reset classes
      dayCells.forEach(cell => {
        cell.classList.remove('has-event', 'has-holiday');
      });
      
      // Add event indicators
      dayCells.forEach(cell => {
        const cellDate = new Date(cell.getAttribute('data-date'));
        if (!cellDate || isNaN(cellDate.getTime())) return;
        
        // Check if this date has events
        const hasEvent = this.events.some(event => 
          isSameDay(new Date(event.date), cellDate)
        );
        
        // Check if this date has holidays
        const hasHoliday = this.events.some(event => 
          isSameDay(new Date(event.date), cellDate) && event.isHoliday
        );
        
        if (hasHoliday) {
          cell.classList.add('has-holiday');
        } else if (hasEvent) {
          cell.classList.add('has-event');
        }
      });
    }
  }
}
</script>