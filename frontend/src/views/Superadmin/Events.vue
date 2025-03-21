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
              <div class="flex gap-2">
                <Button 
                  @click="previousMonth" 
                  icon="pi pi-chevron-left" 
                  class="p-button-sm p-button-outlined text-white border-white hover:bg-white/20 transition-colors duration-300"
                />
                <Button 
                  @click="nextMonth" 
                  icon="pi pi-chevron-right" 
                  class="p-button-sm p-button-outlined text-white border-white hover:bg-white/20 transition-colors duration-300"
                />
                <Button 
                  @click="setToday" 
                  label="Today" 
                  class="p-button-sm p-button-outlined text-white border-white hover:bg-white/20 transition-colors duration-300 ml-2"
                />
              </div>
            </div>
          </div>
          
          <div class="p-4 relative">
            <DatePicker
              v-model="date" 
              :inline="true" 
              :showWeek="true" 
              @date-select="handleDateSelect"
              class="custom-calendar w-full"
              ref="datepicker"
            />
            
            <!-- Event Indicators -->
            <div v-for="(dayEvents, index) in calendarEventsByDay" :key="index">
              <div 
                v-if="dayEvents.length > 0"
                :class="[
                  'event-day-indicator', 
                  `day-${index + 1}`
                ]"
              >
                <div 
                  v-for="(event, eventIndex) in dayEvents.slice(0, 3)" 
                  :key="`${index}-${eventIndex}`"
                  :class="[
                    'event-indicator', 
                    getEventTypeColor(event.type).replace('bg-', 'event-')
                  ]"
                  :title="event.title"
                ></div>
                <div v-if="dayEvents.length > 3" class="more-events">+{{ dayEvents.length - 3 }}</div>
              </div>
            </div>
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
                    <div class="flex items-center text-sm text-surface-500 mt-1">
                      <i class="pi pi-clock mr-1 text-xs"></i>
                      {{ formatTime(event.date) }}
                    </div>
                    <div v-if="event.location" class="flex items-center text-sm text-surface-500 mt-1">
                      <i class="pi pi-map-marker mr-1 text-xs"></i>
                      {{ event.location }}
                    </div>
                    <p v-if="event.description" class="text-sm text-surface-500 mt-1">{{ event.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Event Dialog with Time and Location -->
      <Dialog 
        v-model:visible="eventDialog" 
        :header="editMode ? 'Edit Event' : 'Add New Event'" 
        :modal="true" 
        class="p-fluid no-scrollbar-dialog" 
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
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div class="field">
              <label for="eventDate" class="block text-sm font-medium text-surface-700 mb-2">Date</label>
              <DatePicker 
                id="eventDate" 
                v-model="newEvent.date" 
                dateFormat="yy-mm-dd" 
                showIcon 
                @date-select="updateEventDate" 
              />
            </div>
            
            <div class="field">
              <label for="eventTime" class="block text-sm font-medium text-surface-700 mb-2">Time</label>
              <DatePicker
                id="eventTime" 
                v-model="newEvent.date" 
                timeOnly 
                hourFormat="12"
                showIcon
              />
            </div>
          </div>
          
          <div class="field mb-5">
            <label for="eventLocation" class="block text-sm font-medium text-surface-700 mb-2">Location</label>
            <InputText 
              id="eventLocation" 
              v-model="newEvent.location" 
              class="w-full p-inputtext-sm rounded-lg border-surface-200 shadow-sm"
              placeholder="Enter event location"
            />
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
              v-if="editMode"
              label="Delete" 
              icon="pi pi-trash" 
              class="p-button-danger p-button-text mr-auto" 
              @click="confirmDeleteEvent" 
            />
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

      <!-- Confirmation Dialog for Delete -->
      <Dialog 
        v-model:visible="deleteDialog" 
        header="Confirm Delete" 
        :modal="true" 
        :style="{width: '450px'}"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3 text-yellow-500 text-2xl" style="vertical-align: middle;"></i>
          <span>Are you sure you want to delete this event?</span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
          <Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteEvent" />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { format, isSameDay, isAfter, startOfDay, addMonths, subMonths, getDate, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO } from 'date-fns';
import { db } from '@/services/firebase'; // Ensure this points to your Firebase configuration
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useUserStore } from "@/stores/user"; 

// Import PrimeVue components
import DatePicker from 'primevue/datepicker'; // Changed from Calendar to DatePicker
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
const deleteDialog = ref(false);
const editMode = ref(false);
const datepicker = ref(null);
const newEvent = ref({
  id: '',
  title: '',
  date: new Date(),
  type: 'Meeting', // Default type
  isHoliday: false,
  description: '',
  location: '',
  createdBy: '',
  barangay: ''
});

const selectedDateEvents = ref([]);

const eventTypes = [
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Reminder', label: 'Reminder' }
];

// Fetch events from Firestore on component mount
const fetchEvents = async () => {
  try {
    console.log("Fetching events...");
    console.log("Current user:", user.value);
    
    const eventsCollection = collection(db, "announcements");
    
    // Create a basic query without filters first
    let q = query(eventsCollection, orderBy("date", "asc"));
    
    console.log("Executing query...");
    const querySnapshot = await getDocs(q);
    
    console.log("Query results:", querySnapshot.size, "documents found");
    
    // Process the results
    const fetchedEvents = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Document data:", data);
      
      // Handle different date formats
      let eventDate;
      if (data.date instanceof Timestamp) {
        eventDate = data.date.toDate();
      } else if (data.date && typeof data.date === 'string') {
        eventDate = new Date(data.date);
      } else {
        eventDate = new Date();
      }
      
      // Determine event type
      let eventType = data.type || 'Meeting';
      if (!['Meeting', 'Workshop', 'Holiday', 'Reminder'].includes(eventType)) {
        eventType = 'Meeting'; // Default type
      }
      
      fetchedEvents.push({
        id: doc.id,
        title: data.title || 'Untitled Event',
        date: eventDate,
        type: eventType,
        isHoliday: data.isHoliday || false,
        description: data.description || '',
        location: data.location || '',
        createdBy: data.createdBy || '',
        barangay: data.barangay || ''
      });
    });
    
    console.log("Processed events:", fetchedEvents);
    events.value = fetchedEvents;
    
    // Update calendar event indicators after events are loaded
    nextTick(() => {
      updateCalendarEventIndicators();
    });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

// Set up real-time updates
const setupRealtimeUpdates = () => {
  try {
    const eventsCollection = collection(db, "announcements");
    const q = query(eventsCollection, orderBy("date", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Real-time update received");
      
      const updatedEvents = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle different date formats
        let eventDate;
        if (data.date instanceof Timestamp) {
          eventDate = data.date.toDate();
        } else if (data.date && typeof data.date === 'string') {
          eventDate = new Date(data.date);
        } else {
          eventDate = new Date();
        }
        
        // Determine event type
        let eventType = data.type || 'Meeting';
        if (!['Meeting', 'Workshop', 'Holiday', 'Reminder'].includes(eventType)) {
          eventType = 'Meeting'; // Default type
        }
        
        updatedEvents.push({
          id: doc.id,
          title: data.title || 'Untitled Event',
          date: eventDate,
          type: eventType,
          isHoliday: data.isHoliday || false,
          description: data.description || '',
          location: data.location || '',
          createdBy: data.createdBy || '',
          barangay: data.barangay || ''
        });
      });
      
      events.value = updatedEvents;
      
      // Update calendar event indicators after events are loaded
      nextTick(() => {
        updateCalendarEventIndicators();
      });
    }, (error) => {
      console.error("Error in real-time updates:", error);
    });
    
    // Return the unsubscribe function
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up real-time updates:", error);
    return () => {}; // Return empty function if setup fails
  }
};

onMounted(() => {
  console.log("Component mounted");
  fetchEvents();
  const unsubscribe = setupRealtimeUpdates();
  
  // Clean up the subscription when the component is unmounted
  return () => {
    unsubscribe();
  };
});

// Watchers to update selected date events
watch(date, updateSelectedDateEvents);
watch(events, updateSelectedDateEvents, { deep: true });

// Computed property for upcoming events
const upcomingEvents = computed(() => {
  const today = startOfDay(new Date());
  return events.value
    .filter(event => {
      const eventDate = new Date(event.date);
      return isAfter(eventDate, today) || isSameDay(eventDate, today);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Limit to 5 upcoming events
});

// Computed property to organize events by calendar day
const calendarEventsByDay = computed(() => {
  const currentMonth = date.value;
  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  // Initialize array with empty arrays for each day
  const eventsByDay = Array(daysInMonth.length).fill().map(() => []);
  
  // Populate events for each day
  events.value.forEach(event => {
    const eventDate = new Date(event.date);
    if (isSameMonth(eventDate, currentMonth)) {
      const dayOfMonth = getDate(eventDate) - 1; // Adjust for 0-based index
      if (eventsByDay[dayOfMonth]) {
        eventsByDay[dayOfMonth].push(event);
      }
    }
  });
  
  return eventsByDay;
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

// Functions to navigate between months
function nextMonth() {
  date.value = addMonths(date.value, 1);
  nextTick(() => {
    updateCalendarEventIndicators();
  });
}

function previousMonth() {
  date.value = subMonths(date.value, 1);
  nextTick(() => {
    updateCalendarEventIndicators();
  });
}

// Function to update calendar event indicators
function updateCalendarEventIndicators() {
  nextTick(() => {
    if (datepicker.value) {
      const datepickerEl = datepicker.value.$el;
      const dayElements = datepickerEl.querySelectorAll('.p-datepicker-calendar td[data-pc-section="day"]');
      
      dayElements.forEach(dayEl => {
        const dateAttr = dayEl.getAttribute('data-date');
        if (dateAttr) {
          try {
            const cellDate = new Date(dateAttr);
            if (!isNaN(cellDate.getTime())) {
              const dayOfMonth = cellDate.getDate();
              
              // Check if this date has events
              const hasEvents = calendarEventsByDay.value[dayOfMonth - 1]?.length > 0;
              
              if (hasEvents) {
                dayEl.classList.add('has-events');
              } else {
                dayEl.classList.remove('has-events');
              }
            }
          } catch (e) {
            console.error("Error processing date:", e);
          }
        }
      });
    }
  });
}

// Open New Event Dialog
const openNewEventDialog = () => {
  newEvent.value = { 
    id: '',
    title: '', 
    date: date.value, 
    type: 'Meeting', 
    isHoliday: false,
    description: '',
    location: '',
    createdBy: user.value?.role || '',
    barangay: user.value?.barangay || ''
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

// Confirm Delete Event
const confirmDeleteEvent = () => {
  deleteDialog.value = true;
};

// Delete Event
const deleteEvent = async () => {
  try {
    await deleteDoc(doc(db, 'announcements', newEvent.value.id));
    deleteDialog.value = false;
    eventDialog.value = false;
  } catch (error) {
    console.error('Error deleting event:', error);
  }
};

// Save Event to Firestore (Add or Update)
const saveEvent = async () => {
  if (!newEvent.value.title.trim()) {
    alert("Please enter an event title");
    return;
  }
  
  if (!newEvent.value.type) {
    newEvent.value.type = 'Meeting'; // Default type
  }

  try {
    if (editMode.value) {
      // Update existing event
      const eventRef = doc(db, 'announcements', newEvent.value.id);
      await updateDoc(eventRef, {
        title: newEvent.value.title,
        date: newEvent.value.date,
        type: newEvent.value.type,
        isHoliday: newEvent.value.type === 'Holiday',
        description: newEvent.value.description,
        location: newEvent.value.location
      });
      console.log("Event updated successfully");
    } else {
      // Add new event
      const eventsCollection = collection(db, 'announcements');
      const docRef = await addDoc(eventsCollection, {
        title: newEvent.value.title,
        date: newEvent.value.date,
        type: newEvent.value.type,
        isHoliday: newEvent.value.type === 'Holiday',
        description: newEvent.value.description,
        location: newEvent.value.location,
        createdBy: user.value?.role || '',
        barangay: user.value?.barangay || '',
        createdAt: new Date()
      });
      console.log("Event added successfully with ID:", docRef.id);
    }
    eventDialog.value = false;
  } catch (error) {
    console.error('Error saving event:', error);
    alert("Error saving event: " + error.message);
  }
};

// Format date functions
const formatDate = (date) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch (e) {
    console.error("Date formatting error:", e);
    return "Invalid date";
  }
};

const formatTime = (date) => {
  try {
    return format(new Date(date), 'h:mm a');
  } catch (e) {
    console.error("Time formatting error:", e);
    return "Invalid time";
  }
};

const formatDateTime = (date) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy h:mm a');
  } catch (e) {
    console.error("DateTime formatting error:", e);
    return "Invalid date/time";
  }
};

const formatFullDate = (date) => {
  try {
    return format(new Date(date), 'MMMM d, yyyy');
  } catch (e) {
    console.error("Full date formatting error:", e);
    return "Invalid date";
  }
};

const formatMonthYear = (date) => {
  try {
    return format(new Date(date), 'MMMM yyyy');
  } catch (e) {
    console.error("Month/year formatting error:", e);
    return "Invalid date";
  }
};

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
  // Preserve the time when updating just the date
  const currentTime = newEvent.value.date;
  const newDate = new Date(value);
  
  if (currentTime) {
    newDate.setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds()
    );
  }
  
  newEvent.value.date = newDate;
};
</script>

<style scoped>
/* Custom calendar styling */
.custom-calendar {
  width: 100%;
  border-radius: 12px;
  position: relative;
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
  position: relative;
}

:deep(.p-datepicker-calendar td > span) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
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

/* Google Calendar-like event indicators */
.event-indicators-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.event-day-indicator {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 80%;
}

.event-indicator {
  height: 4px;
  width: 80%;
  border-radius: 2px;
}

.event-blue-500 {
  background-color: #3b82f6;
}

.event-purple-500 {
  background-color: #8b5cf6;
}

.event-red-500 {
  background-color: #ef4444;
}

.event-amber-500 {
  background-color: #f59e0b;
}

.event-gray-500 {
  background-color: #6b7280;
}

.more-events {
  font-size: 9px;
  color: #64748b;
  margin-top: 1px;
}

/* Position event indicators for each day */
:deep(.p-datepicker-calendar tr) {
  position: relative;
}

:deep(.p-datepicker-calendar td) {
  position: relative;
}

/* Generate day-X classes for all possible days */
.day-1 { left: calc(0% + 2.5rem / 2); }
.day-2 { left: calc(100% / 7 + 2.5rem / 2); }
.day-3 { left: calc(200% / 7 + 2.5rem / 2); }
.day-4 { left: calc(300% / 7 + 2.5rem / 2); }
.day-5 { left: calc(400% / 7 + 2.5rem / 2); }
.day-6 { left: calc(500% / 7 + 2.5rem / 2); }
.day-7 { left: calc(600% / 7 + 2.5rem / 2); }
.day-8 { left: calc(0% + 2.5rem / 2); }
.day-9 { left: calc(100% / 7 + 2.5rem / 2); }
.day-10 { left: calc(200% / 7 + 2.5rem / 2); }
.day-11 { left: calc(300% / 7 + 2.5rem / 2); }
.day-12 { left: calc(400% / 7 + 2.5rem / 2); }
.day-13 { left: calc(500% / 7 + 2.5rem / 2); }
.day-14 { left: calc(600% / 7 + 2.5rem / 2); }
.day-15 { left: calc(0% + 2.5rem / 2); }
.day-16 { left: calc(100% / 7 + 2.5rem / 2); }
.day-17 { left: calc(200% / 7 + 2.5rem / 2); }
.day-18 { left: calc(300% / 7 + 2.5rem / 2); }
.day-19 { left: calc(400% / 7 + 2.5rem / 2); }
.day-20 { left: calc(500% / 7 + 2.5rem / 2); }
.day-21 { left: calc(600% / 7 + 2.5rem / 2); }
.day-22 { left: calc(0% + 2.5rem / 2); }
.day-23 { left: calc(100% / 7 + 2.5rem / 2); }
.day-24 { left: calc(200% / 7 + 2.5rem / 2); }
.day-25 { left: calc(300% / 7 + 2.5rem / 2); }
.day-26 { left: calc(400% / 7 + 2.5rem / 2); }
.day-27 { left: calc(500% / 7 + 2.5rem / 2); }
.day-28 { left: calc(600% / 7 + 2.5rem / 2); }
.day-29 { left: calc(0% + 2.5rem / 2); }
.day-30 { left: calc(100% / 7 + 2.5rem / 2); }
.day-31 { left: calc(200% / 7 + 2.5rem / 2); }

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
  overflow: visible;
  padding: 0;
  border-radius: 1rem;
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

/* No scrollbar dialog styling */
.no-scrollbar-dialog {
  max-height: none;
  overflow: visible;
}

:deep(.no-scrollbar-dialog .p-dialog-content) {
  overflow: visible;
  padding: 0;
  border-radius: 1rem;
}

/* Add has-events styling */
:deep(.has-events) {
  position: relative;
}

:deep(.has-events::after) {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--primary-500, #6366f1);
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