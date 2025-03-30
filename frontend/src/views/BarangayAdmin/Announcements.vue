```vue type="vue" project="Barangay Events Calendar" file="barangayevents.vue"
[v0-no-op-code-block-prefix]<template>
  <div class="bg-gradient-to-br from-surface-50 to-surface-100 min-h-screen overflow-hidden">
    <div class="max-w-7xl mx-auto p-6 md:p-8">
      <header class="mb-8 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 mb-2">
          Barangay Events Calendar
        </h1>
        <p class="text-surface-600 text-lg">Stay updated with important events in your barangay</p>
      </header>

      <div class="mb-6 flex flex-wrap justify-between items-center gap-4 animate-fade-in" style="animation-delay: 0.2s;">
        <!-- Add Event Button - Only visible to BarangayPresident or FederationPresident -->
        <Button 
          v-if="canAddEvents"
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
            <!-- Custom Calendar View -->
            <div class="custom-calendar">
              <!-- Calendar Header -->
              <div class="calendar-header">
                <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
              </div>
              
              <!-- Calendar Days -->
              <div class="calendar-days">
                <div 
                  v-for="(day, index) in calendarDays" 
                  :key="index" 
                  :class="[
                    'calendar-day',
                    { 'current-month': day.currentMonth },
                    { 'today': isToday(day.date) },
                    { 'selected': isSameDay(day.date, date) }
                  ]"
                  @click="selectDate(day.date)"
                >
                  <div class="day-number">{{ day.dayNumber }}</div>
                  
                  <!-- Events for this day -->
                  <div class="day-events">
                    <div 
                      v-for="(event, eventIndex) in getDayEvents(day.date).slice(0, 3)" 
                      :key="eventIndex" 
                      :class="[
                        'day-event',
                        getEventTypeColor(event.type).replace('bg-', '')
                      ]"
                      @click.stop="openEditEventDialog(event)"
                    >
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-time">{{ formatTime(event.date) }}</div>
                    </div>
                    
                    <!-- Show +X more if there are more than 3 events -->
                    <div 
                      v-if="getDayEvents(day.date).length > 3" 
                      class="more-events"
                      @click.stop="showMoreEvents(day.date)"
                    >
                      +{{ getDayEvents(day.date).length - 3 }} more
                    </div>
                  </div>
                </div>
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
                    <div v-if="event.barangay" class="flex items-center text-sm text-surface-500 mt-1">
                      <i class="pi pi-home mr-1 text-xs"></i>
                      Barangay: {{ event.barangay }}
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
                    <div v-if="event.barangay" class="flex items-center text-sm text-surface-500 mt-1">
                      <i class="pi pi-home mr-1 text-xs"></i>
                      Barangay: {{ event.barangay }}
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
      <!-- Enhanced Modal Event Dialog -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="eventDialog" class="modal-backdrop" @click="hideEventDialog">
            <div class="modal-container" @click.stop>
              <div class="modal-content">
                <!-- Header -->
                <div class="modal-header">
                  <h2 class="modal-title">
                    {{ editMode ? 'Edit Event' : 'Create New Event' }}
                  </h2>
                  <Button 
                    icon="pi pi-times" 
                    @click="hideEventDialog" 
                    class="p-button-rounded p-button-text close-button"
                    aria-label="Close"
                  />
                </div>
                
                <!-- Body -->
                <div class="modal-body">
                  <!-- Read-only mode indicator for Federation President events -->
                  <div v-if="isFederationPresidentEvent && !isCurrentUserFederationPresident" class="read-only-notice">
                    <i class="pi pi-info-circle mr-2"></i>
                    This event was created by a Federation President and cannot be edited.
                  </div>
                  
                  <div class="form-group">
                    <label for="eventTitle">Event Title</label>
                    <InputText 
                      id="eventTitle" 
                      v-model="newEvent.title" 
                      required 
                      autofocus 
                      class="form-control"
                      placeholder="Enter event title"
                      :disabled="isReadOnlyMode"
                    />
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="eventDate">Date</label>
                      <DatePicker 
                        id="eventDate" 
                        v-model="newEvent.date" 
                        dateFormat="yy-mm-dd" 
                        showIcon 
                        @date-select="updateEventDate"
                        class="date-picker"
                        :disabled="isReadOnlyMode"
                      />
                    </div>
                    
                    <div class="form-group">
                      <label for="eventTime">Time</label>
                      <DatePicker
                        id="eventTime" 
                        v-model="newEvent.date" 
                        timeOnly 
                        hourFormat="12"
                        showIcon
                        class="time-picker"
                        :disabled="isReadOnlyMode"
                      />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="eventLocation">Location</label>
                    <InputText 
                      id="eventLocation" 
                      v-model="newEvent.location" 
                      class="form-control"
                      placeholder="Enter event location"
                      :disabled="isReadOnlyMode"
                    />
                  </div>
                  
                  <!-- Barangay field - only shown for BarangayPresident -->
                  <div v-if="user?.role === 'BarangayPresident' || newEvent.barangay" class="form-group">
                    <label for="eventBarangay">Barangay</label>
                    <InputText 
                      id="eventBarangay" 
                      v-model="newEvent.barangay" 
                      class="form-control barangay-input"
                      :value="user?.barangay || newEvent.barangay"
                      disabled
                      placeholder="Your barangay"
                    />
                  </div>
                  
                  <!-- Created By field - shown for all events -->
                  <div v-if="newEvent.createdBy" class="form-group">
                    <label for="eventCreatedBy">Created By</label>
                    <InputText 
                      id="eventCreatedBy" 
                      v-model="newEvent.createdBy" 
                      class="form-control creator-input"
                      disabled
                    />
                  </div>
                  
                  <div class="form-group">
                    <label for="eventType">Event Type</label>
                    <Dropdown 
                      id="eventType" 
                      v-model="newEvent.type" 
                      :options="eventTypes" 
                      optionLabel="label" 
                      optionValue="value"
                      placeholder="Select Event Type" 
                      required 
                      class="form-control"
                      :disabled="isReadOnlyMode"
                    >
                      <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex items-center">
                          <span :class="`event-type-indicator ${getEventTypeColor(slotProps.value).replace('bg-', '')}`"></span>
                          {{ getEventTypeLabel(slotProps.value) }}
                        </div>
                        <span v-else>{{ slotProps.placeholder }}</span>
                      </template>
                      <template #option="slotProps">
                        <div class="flex items-center">
                          <span :class="`event-type-indicator ${getEventTypeColor(slotProps.option.value).replace('bg-', '')}`"></span>
                          {{ slotProps.option.label }}
                        </div>
                      </template>
                    </Dropdown>
                  </div>
                  
                  <div class="form-group">
                    <label for="eventDescription">Description</label>
                    <Textarea 
                      id="eventDescription" 
                      v-model="newEvent.description" 
                      rows="3" 
                      class="form-control"
                      placeholder="Add details about this event"
                      :disabled="isReadOnlyMode"
                    />
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="modal-footer">
                  <Button 
                    v-if="editMode && canEditEvent(newEvent)"
                    label="Delete" 
                    icon="pi pi-trash" 
                    class="delete-button" 
                    @click="confirmDeleteEvent" 
                  />
                  <div class="action-buttons">
                    <Button 
                      label="Close" 
                      icon="pi pi-times" 
                      class="cancel-button" 
                      @click="hideEventDialog" 
                    />
                    <Button 
                      v-if="!isReadOnlyMode"
                      :label="editMode ? 'Save Changes' : 'Add Event'" 
                      icon="pi pi-check" 
                      class="save-button" 
                      @click="saveEvent" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

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
      
      <!-- More Events Dialog -->
      <Dialog 
        v-model:visible="moreEventsDialog" 
        :header="moreEventsDate ? formatFullDate(moreEventsDate) : 'Events'" 
        :modal="true" 
        :style="{width: '500px'}"
      >
        <div v-if="moreEventsDate && moreEventsList.length > 0" class="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar p-3">
          <div 
            v-for="event in moreEventsList" 
            :key="event.id" 
            class="p-3 rounded-lg hover:bg-surface-50 transition-all duration-300 ease-in-out border border-surface-100 cursor-pointer"
            @click="openEditEventDialog(event); moreEventsDialog = false;"
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
                <div v-if="event.barangay" class="flex items-center text-sm text-surface-500 mt-1">
                  <i class="pi pi-home mr-1 text-xs"></i>
                  Barangay: {{ event.barangay }}
                </div>
                <p v-if="event.description" class="text-sm text-surface-500 mt-1">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-4 text-center text-surface-500">
          No events for this day
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { format, isSameDay, isAfter, startOfDay, addMonths, subMonths, getDate, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, addDays, getMonth, getYear, isToday as dateFnsIsToday, startOfWeek, endOfWeek } from 'date-fns';
import { db } from '@/services/firebase'; // Ensure this points to your Firebase configuration
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, getDocs, orderBy, Timestamp, where } from 'firebase/firestore';
import { useUserStore } from "@/stores/user"; 

// Import PrimeVue components
import DatePicker from 'primevue/datepicker'; // Changed from Calendar to DatePicker
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { Teleport, Transition } from 'vue';

const date = ref(new Date());
const events = ref([]);
const userStore = useUserStore();
const user = computed(() => userStore.user);
const eventDialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
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

// For more events dialog
const moreEventsDialog = ref(false);
const moreEventsDate = ref(null);
const moreEventsList = ref([]);

// Weekday headers
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const selectedDateEvents = ref([]);

const eventTypes = [
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Reminder', label: 'Reminder' }
];

// Check if user can add events (only FederationPresident or BarangayPresident)
const canAddEvents = computed(() => {
  return user.value?.role === 'FederationPresident' || user.value?.role === 'BarangayPresident';
});

// Check if current user is a Federation President
const isCurrentUserFederationPresident = computed(() => {
  return user.value?.role === 'FederationPresident';
});

// Check if the current event was created by a Federation President
const isFederationPresidentEvent = computed(() => {
  return newEvent.value.createdBy === 'FederationPresident';
});

// Determine if the form should be in read-only mode
const isReadOnlyMode = computed(() => {
  // If it's a Federation President event and current user is not a Federation President
  if (isFederationPresidentEvent.value && !isCurrentUserFederationPresident.value) {
    return true;
  }
  
  // If it's edit mode but user can't edit this event
  if (editMode.value && !canEditEvent(newEvent.value)) {
    return true;
  }
  
  return false;
});

// Check if user can edit/delete an event
const canEditEvent = (event) => {
  // Only Federation President can edit Federation President events
  if (event.createdBy === 'FederationPresident') {
    return user.value?.role === 'FederationPresident';
  }
  
  // BarangayPresident can only edit their own events
  if (user.value?.role === 'BarangayPresident') {
    return event.createdBy === 'BarangayPresident' && event.barangay === user.value?.barangay;
  }
  
  return false;
};

// Generate calendar days for the current month view
const calendarDays = computed(() => {
  const currentMonth = date.value;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(day => ({
    date: day,
    dayNumber: getDate(day),
    currentMonth: isSameMonth(day, currentMonth)
  }));
});

// Function to check if a date is today
const isToday = (dateToCheck) => {
  return dateFnsIsToday(dateToCheck);
};

// Function to select a date
const selectDate = (selectedDate) => {
  date.value = selectedDate;
};

// Function to get events for a specific day
const getDayEvents = (day) => {
  return events.value.filter(event => isSameDay(new Date(event.date), day));
};

// Function to show more events dialog
const showMoreEvents = (dayDate) => {
  moreEventsDate.value = dayDate;
  moreEventsList.value = getDayEvents(dayDate);
  moreEventsDialog.value = true;
};

// Fetch events from Firestore on component mount with filtering
const fetchEvents = async () => {
  try {
    console.log("Fetching events...");
    console.log("Current user:", user.value);
    
    const eventsCollection = collection(db, "announcements");
    
    // Create a query based on user role and barangay
    let q;
    
    if (user.value?.role === 'FederationPresident') {
      // Federation President can see all events
      q = query(eventsCollection, orderBy("date", "asc"));
    } else if (user.value?.role === 'BarangayPresident') {
      // Barangay President can see events created by Federation President and their own barangay events
      q = query(
        eventsCollection,
        where('createdBy', 'in', ['FederationPresident', 'BarangayPresident']),
        orderBy("date", "asc")
      );
    } else {
      // Regular members can only see events from Federation President and their own barangay
      q = query(
        eventsCollection,
        where('createdBy', 'in', ['FederationPresident', 'BarangayPresident']),
        orderBy("date", "asc")
      );
    }
    
    console.log("Executing query...");
    const querySnapshot = await getDocs(q);
    
    console.log("Query results:", querySnapshot.size, "documents found");
    
    // Process the results with additional filtering
    const fetchedEvents = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Document data:", data);
      
      // Additional filtering for barangay-specific events
      if (user.value?.role !== 'FederationPresident') {
        // For BarangayPresident and regular members, filter by barangay
        if (data.createdBy === 'BarangayPresident' && 
            data.barangay !== user.value?.barangay && 
            user.value?.role !== 'FederationPresident') {
          // Skip events from other barangays
          return;
        }
      }
      
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

// Set up real-time updates with filtering
const setupRealtimeUpdates = () => {
  try {
    const eventsCollection = collection(db, "announcements");
    
    // Create a query based on user role and barangay
    let q;
    
    if (user.value?.role === 'FederationPresident') {
      // Federation President can see all events
      q = query(eventsCollection, orderBy("date", "asc"));
    } else if (user.value?.role === 'BarangayPresident') {
      // Barangay President can see events created by Federation President and their own barangay events
      q = query(
        eventsCollection,
        where('createdBy', 'in', ['FederationPresident', 'BarangayPresident']),
        orderBy("date", "asc")
      );
    } else {
      // Regular members can only see events from Federation President and their own barangay
      q = query(
        eventsCollection,
        where('createdBy', 'in', ['FederationPresident', 'BarangayPresident']),
        orderBy("date", "asc")
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Real-time update received");
      
      const updatedEvents = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Additional filtering for barangay-specific events
        if (user.value?.role !== 'FederationPresident') {
          // For BarangayPresident and regular members, filter by barangay
          if (data.createdBy === 'BarangayPresident' && 
              data.barangay !== user.value?.barangay && 
              user.value?.role !== 'FederationPresident') {
            // Skip events from other barangays
            return;
          }
        }
        
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
      
      console.log("Processed events:", updatedEvents);
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

// Function to update calendar event indicators - simplified since we're using our custom calendar
function updateCalendarEventIndicators() {
  // We don't need this function anymore since we're showing events directly in our custom calendar
  // But we'll keep it as a no-op for compatibility with existing code
  console.log("Calendar events updated");
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
    // Check if user has permission to delete
    if (!canEditEvent(newEvent.value)) {
      alert("You don't have permission to delete this event");
      return;
    }
    
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
      // Check if user has permission to edit
      if (!canEditEvent(newEvent.value)) {
        alert("You don't have permission to edit this event");
        return;
      }
      
      // Update existing event
      const eventRef = doc(db, 'announcements', newEvent.value.id);
      await updateDoc(eventRef, {
        title: newEvent.value.title,
        date: newEvent.value.date,
        type: newEvent.value.type,
        isHoliday: newEvent.value.type === 'Holiday',
        description: newEvent.value.description,
        location: newEvent.value.location
        // Don't update createdBy or barangay
      });
      console.log("Event updated successfully");
    } else {
      // Add new event
      const eventsCollection = collection(db, 'announcements');
      
      // Set the barangay field based on user role
      let barangayValue = '';
      if (user.value?.role === 'BarangayPresident') {
        barangayValue = user.value?.barangay || '';
      }
      
      const docRef = await addDoc(eventsCollection, {
        title: newEvent.value.title,
        date: newEvent.value.date,
        type: newEvent.value.type,
        isHoliday: newEvent.value.type === 'Holiday',
        description: newEvent.value.description,
        location: newEvent.value.location,
        createdBy: user.value?.role || '',
        barangay: barangayValue,
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

/* Calendar header with weekday names */
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.weekday {
  padding: 8px;
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
}

/* Calendar days grid */
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.calendar-day:hover {
  background-color: #f1f5f9;
}

.calendar-day.current-month {
  background-color: #ffffff;
}

.calendar-day:not(.current-month) {
  background-color: #f8fafc;
}

.calendar-day.today {
  background-color: #eff6ff;
  border: 1px solid #3b82f6;
}

.calendar-day.selected {
  background-color: #dbeafe;
}

.day-number {
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  color: #334155;
  margin-bottom: 4px;
}

.today .day-number {
  color: #3b82f6;
  font-weight: 600;
}

/* Events styling */
.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  flex: 1;
}

.day-event {
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.7rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.day-event:hover {
  filter: brightness(1.1);
}

.day-event .event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-event .event-time {
  font-size: 0.6rem;
  opacity: 0.9;
}

.more-events {
  font-size: 0.7rem;
  color: #64748b;
  text-align: center;
  padding: 2px;
  cursor: pointer;
}

.more-events:hover {
  text-decoration: underline;
}

/* Event colors */
.blue-500 {
  background-color: #3b82f6;
}

.purple-500 {
  background-color: #8b5cf6;
}

.red-500 {
  background-color: #ef4444;
}

.amber-500 {
  background-color: #f59e0b;
}

.gray-500 {
  background-color: #6b7280;
}

/* Original styles from your code */
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

/* CSS Variables for primary colors with RGB values for box-shadow */
:root {
  --primary-100-rgb: 224, 231, 255;
  --primary-300-rgb: 165, 180, 252;
  --primary-400-rgb: 129, 140, 248;
  --primary-500-rgb: 99, 102, 241;
  --primary-600-rgb: 79, 70, 229;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-day {
    padding: 2px;
  }
  
  .day-number {
    font-size: 1rem;
  }
  
  .day-event {
    font-size: 0.65rem;
    padding: 1px 2px;
  }
}

/* Modern Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 90%;
  max-width: 550px;
  max-height: 90vh; /* This ensures it takes at most 90% of the viewport height */
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  background-color: white;
  display: flex;
  flex-direction: column;
  transform: translateY(0);
  transition: transform 0.3s ease-out;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 90vh;
}

.modal-header {
  background: linear-gradient(to right, var(--primary-600, #4f46e5), var(--primary-400, #818cf8));
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  flex-shrink: 0; /* Prevent header from shrinking */
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* This enables scrolling */
  flex: 1; /* This allows the body to take available space */
  scrollbar-width: thin;
  scrollbar-color: var(--primary-400, #818cf8) var(--surface-100, #f1f5f9);
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--surface-100, #f1f5f9);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--primary-400, #818cf8);
  border-radius: 20px;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  flex-shrink: 0; /* Prevent footer from shrinking */
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.625rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-control:focus {
  border-color: var(--primary-400, #818cf8);
  box-shadow: 0 0 0 3px rgba(var(--primary-400-rgb, 129, 140, 248), 0.2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.date-picker, .time-picker {
  width: 100%;
}

.event-type-indicator {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  margin-right: 0.5rem;
}

.barangay-input, .creator-input {
  background-color: #f1f5f9;
  color: #64748b;
}

.delete-button {
  background-color: transparent !important;
  color: #ef4444 !important;
  border: 1px solid #ef4444 !important;
}

.delete-button:hover {
  background-color: #fef2f2 !important;
}

.cancel-button {
  background-color: transparent !important;
  color: #64748b !important;
  border: 1px solid #e2e8f0 !important;
}

.cancel-button:hover {
  background-color: #f1f5f9 !important;
}

.save-button {
  background: linear-gradient(to right, var(--primary-600, #4f46e5), var(--primary-400, #818cf8)) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 6px -1px rgba(var(--primary-600-rgb, 79, 70, 229), 0.2), 0 2px 4px -2px rgba(var(--primary-600-rgb, 79, 70, 229), 0.1) !important;
  transition: all 0.2s ease !important;
}

.save-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 15px -3px rgba(var(--primary-600-rgb, 79, 70, 229), 0.2), 0 4px 6px -4px rgba(var(--primary-600-rgb, 79, 70, 229), 0.1) !important;
}

/* Read-only notice styling */
.read-only-notice {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

/* Modal transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-in 0.3s ease-out forwards;
}

.modal-fade-leave-active .modal-container {
  animation: modal-out 0.2s ease-in forwards;
}

@keyframes modal-in {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
}

/* Responsive adjustments for the modal */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .delete-button {
    margin-right: auto;
    margin-left: 0;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  .cancel-button, .save-button {
    flex: 1;
  }
}
</style>