<template>
  <div class="calendar-container">
    <div class="calendar-wrapper">
      <header class="calendar-header">
        <h1 class="calendar-title">Events Calendar</h1>
        <p class="calendar-subtitle">Organize your schedule and never miss an important date</p>
      </header>

      <div class="calendar-controls">
        <Button 
          @click="openNewEventDialog" 
          icon="pi pi-plus" 
          label="Add Event" 
          class="add-event-btn"
        />
        
        <div class="event-types">
          <span 
            v-for="type in eventTypes" 
            :key="type.value" 
            class="event-type-badge"
          >
            <span :class="getEventTypeColor(type.value) + ' event-type-dot'"></span> 
            {{ type.label }}
          </span>
        </div>
      </div>

      <div class="calendar-layout">
        <div class="calendar-main">
          <div class="calendar-nav">
            <div class="calendar-nav-content">
              <h2 class="calendar-month">{{ formatMonthYear(date) }}</h2>
              <div class="nav-buttons">
                <Button 
                  @click="previousMonth" 
                  icon="pi pi-chevron-left" 
                  class="nav-btn"
                />
                <Button 
                  @click="nextMonth" 
                  icon="pi pi-chevron-right" 
                  class="nav-btn"
                />
                <Button 
                  @click="setToday" 
                  label="Today" 
                  class="nav-btn today-btn"
                />
              </div>
            </div>
          </div>
          
          <div class="calendar-grid-container">
            <div class="custom-calendar">
              <div class="calendar-header-days">
                <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
              </div>
              
              <div class="calendar-days">
                <div 
                  v-for="(day, index) in calendarDays" 
                  :key="index" 
                  :class="getCalendarDayClasses(day)"
                  @click="selectDate(day.date)"
                >
                  <div class="day-number">{{ day.dayNumber }}</div>
                  
                  <div class="day-events">
                    <div 
                      v-for="(event, eventIndex) in getDayEvents(day.date).slice(0, 3)" 
                      :key="eventIndex" 
                      :class="getDayEventClasses(event)"
                      @click.stop="openEditEventDialog(event)"
                    >
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-time">{{ formatTime(event.date) }}</div>
                    </div>
                    
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

        <div class="calendar-sidebar">
          <div class="upcoming-events-card">
            <h2 class="sidebar-title">
              <i class="pi pi-calendar"></i>
              Upcoming Events
            </h2>
            
            <div v-if="upcomingEvents.length > 0" class="events-list">
              <div 
                v-for="event in upcomingEvents" 
                :key="event.id" 
                class="event-card"
                @click="openEditEventDialog(event)"
              >
                <div class="event-card-content">
                  <span :class="getEventTypeColor(event.type) + ' event-dot'"></span>
                  <div class="event-details">
                    <h3 class="event-name">{{ event.title }}</h3>
                    <div class="event-datetime">
                      <i class="pi pi-clock"></i>
                      {{ formatDateTime(event.date) }}
                    </div>
                    <div v-if="event.location" class="event-location">
                      <i class="pi pi-map-marker"></i>
                      {{ event.location }}
                    </div>
                    <p v-if="event.description" class="event-description">{{ event.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="no-events">No upcoming events</p>
          </div>

          <div v-if="selectedDateEvents.length > 0" class="selected-date-card">
            <h2 class="sidebar-title">Events on {{ formatFullDate(date) }}</h2>
            <div class="events-list">
              <div 
                v-for="event in selectedDateEvents" 
                :key="event.id" 
                class="event-card"
                @click="openEditEventDialog(event)"
              >
                <div class="event-card-content">
                  <span :class="getEventTypeColor(event.type) + ' event-dot'"></span>
                  <div class="event-details">
                    <h3 class="event-name">{{ event.title }}</h3>
                    <div class="event-datetime">
                      <i class="pi pi-clock"></i>
                      {{ formatTime(event.date) }}
                    </div>
                    <div v-if="event.location" class="event-location">
                      <i class="pi pi-map-marker"></i>
                      {{ event.location }}
                    </div>
                    <p v-if="event.description" class="event-description">{{ event.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="eventDialog" class="modal-backdrop" @click="hideEventDialog">
            <div class="modal-container" @click.stop>
              <div class="modal-content">
                <div class="modal-header">
                  <h2 class="modal-title">
                    {{ editMode ? 'Edit Event' : 'Create New Event' }}
                  </h2>
                  <Button 
                    icon="pi pi-times" 
                    @click="hideEventDialog" 
                    class="close-button"
                    aria-label="Close"
                  />
                </div>
                
                <div class="modal-body">
                  <div class="form-group">
                    <label for="eventTitle">Event Title</label>
                    <InputText 
                      id="eventTitle" 
                      v-model="newEvent.title" 
                      required 
                      autofocus 
                      class="form-control"
                      placeholder="Enter event title"
                    />
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="eventDate">Date</label>
                      <DatePicker 
                        id="eventDate" 
                        v-model="newEventDate" 
                        dateFormat="yy-mm-dd" 
                        showIcon 
                        class="date-picker"
                      />
                    </div>
                    
                    <div class="form-group">
                      <label for="eventTime">Time</label>
                      <DatePicker
                        id="eventTime" 
                        v-model="newEventTime" 
                        timeOnly 
                        hourFormat="12"
                        showIcon
                        class="time-picker"
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
                    />
                  </div>
                  
                  <div class="form-group">
                    <label for="eventDescription">Description</label>
                    <Textarea 
                      id="eventDescription" 
                      v-model="newEvent.description" 
                      rows="3" 
                      class="form-control"
                      placeholder="Add details about this event"
                    />
                  </div>
                </div>
                
                <div class="modal-footer">
                  <Button 
                    v-if="editMode"
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

      <!-- Delete Dialog -->
      <Dialog 
        v-model:visible="deleteDialog" 
        header="Confirm Delete" 
        :modal="true" 
        :style="{width: '450px'}"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Are you sure you want to delete this event?</span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
          <Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="deleteEvent" />
        </template>
      </Dialog>
      
      <!-- More events dialog -->
      <Dialog 
        v-model:visible="moreEventsDialog" 
        :header="moreEventsDate ? formatFullDate(moreEventsDate) : 'Events'" 
        :modal="true" 
        :style="{width: '500px'}"
      >
        <div v-if="moreEventsDate && moreEventsList.length > 0" class="more-events-list">
          <div 
            v-for="event in moreEventsList" 
            :key="event.id" 
            class="event-card"
            @click="openEditEventDialog(event); moreEventsDialog = false;"
          >
            <div class="event-card-content">
              <span :class="getEventTypeColor(event.type) + ' event-dot'"></span>
              <div class="event-details">
                <h3 class="event-name">{{ event.title }}</h3>
                <div class="event-datetime">
                  <i class="pi pi-clock"></i>
                  {{ formatTime(event.date) }}
                </div>
                <div v-if="event.location" class="event-location">
                  <i class="pi pi-map-marker"></i>
                  {{ event.location }}
                </div>
                <p v-if="event.description" class="event-description">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-events">No events for this day</div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { format, isSameDay, isAfter, startOfDay, addMonths, subMonths, getDate, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { db } from '@/services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useUserStore } from "@/stores/user"; 

import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { Teleport, Transition } from 'vue';

// ------------------ state ------------------
const date = ref(new Date());
const events = ref([]);
const userStore = useUserStore();
const user = computed(() => userStore.user);

const eventDialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);

// main event object
const newEvent = ref({
  id: '',
  title: '',
  date: new Date(),
  type: 'Meeting',
  isHoliday: false,
  description: '',
  location: '',
  createdBy: '',
  barangay: ''
});

// separate date/time pickers
const newEventDate = ref(new Date());
const newEventTime = ref(new Date());

// dialogs
const moreEventsDialog = ref(false);
const moreEventsDate = ref(null);
const moreEventsList = ref([]);

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const selectedDateEvents = ref([]);

const eventTypes = [
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Reminder', label: 'Reminder' }
];

// ------------------ calendar computed ------------------
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

const isToday = (dateToCheck) => isSameDay(startOfDay(dateToCheck), startOfDay(new Date()));
const selectDate = (selectedDate) => { date.value = selectedDate; };

// Use ONLY the 5 earliest future/today events for calendar display
const activeCalendarEvents = computed(() => {
  const today = startOfDay(new Date());
  const futureEvents = events.value
    .filter(e => {
      const d = new Date(e.date);
      return isAfter(d, today) || isSameDay(d, today);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return futureEvents.slice(0, 5);
});

// Overflow beyond the 5 goes to Upcoming
const upcomingEvents = computed(() => {
  const today = startOfDay(new Date());
  const futureEvents = events.value
    .filter(e => {
      const d = new Date(e.date);
      return isAfter(d, today) || isSameDay(d, today);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return futureEvents.slice(5);
});

// Calendar day events come from the 5 kept for calendar
const getDayEvents = (day) => activeCalendarEvents.value.filter(e => isSameDay(new Date(e.date), day));

const showMoreEvents = (dayDate) => {
  moreEventsDate.value = dayDate;
  moreEventsList.value = getDayEvents(dayDate);
  moreEventsDialog.value = true;
};

const getCalendarDayClasses = (day) => ([
  'calendar-day',
  { 'current-month': day.currentMonth },
  { 'today': isToday(day.date) },
  { 'selected': isSameDay(day.date, date.value) }
]);

const getDayEventClasses = (event) => ([
  'day-event',
  getEventTypeColor(event.type).replace('bg-', '')
]);

// ------------------ firestore ------------------
const fetchEvents = async () => {
  try {
    const eventsCollection = collection(db, "announcements");
    const q = query(eventsCollection, orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    const fetchedEvents = [];
    querySnapshot.forEach((d) => {
      const data = d.data();
      let eventDate;
      if (data.date instanceof Timestamp) eventDate = data.date.toDate();
      else if (typeof data.date === 'string') eventDate = new Date(data.date);
      else if (data.date instanceof Date) eventDate = data.date;
      else eventDate = new Date();
      let eventType = ['Meeting', 'Workshop', 'Holiday', 'Reminder'].includes(data.type) ? data.type : 'Meeting';
      fetchedEvents.push({
        id: d.id,
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
    events.value = fetchedEvents;
    nextTick(() => updateCalendarEventIndicators());
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

const setupRealtimeUpdates = () => {
  try {
    const eventsCollection = collection(db, "announcements");
    const q = query(eventsCollection, orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedEvents = [];
      const today = startOfDay(new Date());
      snapshot.forEach((d) => {
        const data = d.data();
        let eventDate;
        if (data.date instanceof Timestamp) eventDate = data.date.toDate();
        else if (typeof data.date === 'string') eventDate = new Date(data.date);
        else if (data.date instanceof Date) eventDate = data.date;
        else eventDate = new Date();

        // keep only today/future in memory for realtime feel
        if (isAfter(eventDate, today) || isSameDay(eventDate, today)) {
          const eventType = ['Meeting', 'Workshop', 'Holiday', 'Reminder'].includes(data.type) ? data.type : 'Meeting';
          updatedEvents.push({
            id: d.id,
            title: data.title || 'Untitled Event',
            date: eventDate,
            type: eventType,
            isHoliday: data.isHoliday || false,
            description: data.description || '',
            location: data.location || '',
            createdBy: data.createdBy || '',
            barangay: data.barangay || ''
          });
        }
      });
      events.value = updatedEvents;
      nextTick(() => updateCalendarEventIndicators());
    }, (error) => {
      console.error("Error in real-time updates:", error);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up real-time updates:", error);
    return () => {};
  }
};

onMounted(() => {
  fetchEvents();
  const unsubscribe = setupRealtimeUpdates();
  return () => unsubscribe();
});

// keep the selected-date list in sync BUT only from the 5 calendar-kept events
function updateSelectedDateEvents() {
  selectedDateEvents.value = activeCalendarEvents.value.filter(e => isSameDay(new Date(e.date), date.value));
}
watch(date, updateSelectedDateEvents, { immediate: true });
watch([events], updateSelectedDateEvents, { deep: true });

// ------------------ nav ------------------
function setToday() { date.value = new Date(); }
function nextMonth() { date.value = addMonths(date.value, 1); nextTick(() => updateCalendarEventIndicators()); }
function previousMonth() { date.value = subMonths(date.value, 1); nextTick(() => updateCalendarEventIndicators()); }
function updateCalendarEventIndicators() { /* hook for badges if needed */ }

// ------------------ dialog open/close ------------------
const openNewEventDialog = () => {
  const base = new Date(date.value);
  const now = new Date();
  newEvent.value = { 
    id: '',
    title: '', 
    date: new Date(base),
    type: 'Meeting', 
    isHoliday: false,
    description: '',
    location: '',
    createdBy: user.value?.role || '',
    barangay: user.value?.barangay || ''
  };
  newEventDate.value = startOfDay(base);
  newEventTime.value = now;
  editMode.value = false;
  eventDialog.value = true;
};

const openEditEventDialog = (event) => {
  newEvent.value = { ...event };
  const dt = new Date(event.date);
  const dateOnly = startOfDay(dt);
  const timeCarrier = new Date();
  timeCarrier.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
  newEventDate.value = dateOnly;
  newEventTime.value = timeCarrier;
  editMode.value = true;
  eventDialog.value = true;
};

const hideEventDialog = () => { eventDialog.value = false; };
const confirmDeleteEvent = () => { deleteDialog.value = true; };

// ------------------ CRUD ------------------
const deleteEvent = async () => {
  try {
    await deleteDoc(doc(db, 'announcements', newEvent.value.id));
    deleteDialog.value = false;
    eventDialog.value = false;
  } catch (error) {
    console.error('Error deleting event:', error);
  }
};

function composeDateTime(dateOnly, timeOnly) {
  const d = new Date(dateOnly);
  const t = new Date(timeOnly);
  d.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
  return d;
}

const saveEvent = async () => {
  if (!newEvent.value.title.trim()) {
    alert("Please enter an event title");
    return;
  }
  if (!newEvent.value.type) newEvent.value.type = 'Meeting';

  const combined = composeDateTime(newEventDate.value, newEventTime.value);

  try {
    if (editMode.value) {
      const eventRef = doc(db, 'announcements', newEvent.value.id);
      await updateDoc(eventRef, {
        title: newEvent.value.title,
        date: combined,
        type: newEvent.value.type,
        isHoliday: newEvent.value.type === 'Holiday',
        description: newEvent.value.description,
        location: newEvent.value.location
      });
    } else {
      const eventsCollection = collection(db, 'announcements');
      await addDoc(eventsCollection, {
        title: newEvent.value.title,
        date: combined,
        type: newEvent.value.type,
        isHoliday: newEvent.value.type === 'Holiday',
        description: newEvent.value.description,
        location: newEvent.value.location,
        createdBy: user.value?.role || '',
        barangay: user.value?.barangay || '',
        createdAt: new Date()
      });
    }
    eventDialog.value = false;
  } catch (error) {
    console.error('Error saving event:', error);
    alert("Error saving event: " + error.message);
  }
};

// ------------------ formatters ------------------
const formatDateTime = (d) => { try { return format(new Date(d), 'MMM dd, yyyy h:mm a'); } catch { return "Invalid date/time"; } };
const formatTime = (d) => { try { return format(new Date(d), 'h:mm a'); } catch { return "Invalid time"; } };
const formatFullDate = (d) => { try { return format(new Date(d), 'MMMM d, yyyy'); } catch { return "Invalid date"; } };
const formatMonthYear = (d) => { try { return format(new Date(d), 'MMMM yyyy'); } catch { return "Invalid date"; } };

const getEventTypeColor = (type) => {
  switch(type) {
    case 'Meeting': return 'bg-blue-500';
    case 'Workshop': return 'bg-purple-500';
    case 'Holiday': return 'bg-red-500';
    case 'Reminder': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};
</script>

<style scoped>
/* (styles unchanged; included in full for completeness) */
.calendar-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  overflow: hidden;
}
.calendar-wrapper { max-width: 1400px; margin: 0 auto; padding: 2rem; }
.calendar-header { margin-bottom: 2rem; animation: fadeIn 0.5s ease-out; }
.calendar-title { font-size: 3rem; font-weight: bold; background: linear-gradient(135deg, #000000ff, #7d1313ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem; }
.calendar-subtitle { color: #64748b; font-size: 1.125rem; }
.calendar-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; animation: fadeIn 0.5s ease-out 0.2s both; }
.add-event-btn { background: linear-gradient(135deg, #000000ff, #7d1313ff) !important; border: none !important; color: white !important; padding: 0.75rem 1.5rem !important; border-radius: 0.75rem !important; font-weight: 600 !important; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -4px rgba(79, 70, 229, 0.4) !important; transition: all 0.3s ease !important; transform: translateY(0); }
.add-event-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4), 0 10px 10px -5px rgba(79, 70, 229, 0.2) !important; }
.event-types { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; font-weight: 500; }
.event-type-badge { display: flex; align-items: center; background: white; border-radius: 9999px; padding: 0.5rem 0.75rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }
.event-type-badge:hover { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.event-type-dot { width: 0.75rem; height: 0.75rem; border-radius: 50%; margin-right: 0.5rem; }
.calendar-layout { display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; }
.calendar-main { background: white; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; border: 1px solid #e2e8f0; animation: fadeIn 0.5s ease-out 0.4s both; }
.calendar-nav { background: linear-gradient(135deg, #000000ff, #7d1313ff); color: white; padding: 1rem 1.5rem; }
.calendar-nav-content { display: flex; justify-content: space-between; align-items: center; }
.calendar-month { font-size: 1.25rem; font-weight: 600; margin: 0; }
.nav-buttons { display: flex; gap: 0.5rem; }
.nav-btn { background: transparent !important; color: white !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; transition: all 0.3s ease !important; }
.nav-btn:hover { background: rgba(255, 255, 255, 0.2) !important; }
.today-btn { margin-left: 0.5rem; }
.calendar-grid-container { padding: 1rem; position: relative; }
.custom-calendar { width: 100%; border-radius: 0.75rem; position: relative; }
.calendar-header-days { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 0.5rem; }
.weekday { padding: 0.5rem; font-weight: 600; color: #64748b; font-size: 0.875rem; }
.calendar-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; }
.calendar-day { aspect-ratio: 1; padding: 0.25rem; border-radius: 0.5rem; cursor: pointer; position: relative; transition: all 0.2s ease; display: flex; flex-direction: column; overflow: hidden; }
.calendar-day:hover { background-color: #f1f5f9; }
.calendar-day.current-month { background-color: #ffffffff; }
.calendar-day:not(.current-month) { background-color: #f8f8f8ff; }
.calendar-day.today { background-color: #c5c5c5ff; border: 1px solid #b11919ff; }
.calendar-day.selected { background-color: #dbeafe; }
.day-number { font-size: 1.25rem; font-weight: 500; text-align: center; color: #334155; margin-bottom: 0.25rem; }
.today .day-number { color: #950b0bff; font-weight: 600; }
.day-events { display: flex; flex-direction: column; gap: 0.125rem; overflow: hidden; flex: 1; }
.day-event { padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.7rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.day-event:hover { filter: brightness(1.1); }
.event-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-time { font-size: 0.6rem; opacity: 0.9; }
.more-events { font-size: 0.7rem; color: #64748b; text-align: center; padding: 0.125rem; cursor: pointer; }
.more-events:hover { text-decoration: underline; }
.bg-blue-500 { background-color: #990b0bff; }
.bg-purple-500 { background-color: #641088ff; }
.bg-red-500 { background-color: #ef4444; }
.bg-amber-500 { background-color: #eccd00ff; }
.bg-gray-500 { background-color: #6b7280; }
.blue-500 { background-color: #034891ff; }
.purple-500 { background-color: #830a0aff; }
.red-500 { background-color: #ef4444; }
.amber-500 { background-color: #f59e0b; }
.gray-500 { background-color: #6b7280; }
.calendar-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
.upcoming-events-card, .selected-date-card { background: white; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); padding: 1.5rem; border: 1px solid #e2e8f0; animation: fadeIn 0.5s ease-out 0.6s both; }
.sidebar-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
.sidebar-title i { color: #770909ff; }
.events-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 300px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #4f46e5 #f1f5f9; }
.events-list::-webkit-scrollbar { width: 6px; }
.events-list::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
.events-list::-webkit-scrollbar-thumb { background-color: #770909ff; border-radius: 20px; border: 2px solid #f1f5f9; }
.event-card { padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.3s ease; transform: translateY(0); }
.event-card:hover { background-color: #f8fafc; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
.event-card-content { display: flex; align-items: flex-start; gap: 0.75rem; }
.event-dot { width: 0.75rem; height: 0.75rem; border-radius: 50%; margin-top: 0.375rem; flex-shrink: 0; }
.event-details { flex: 1; }
.event-name { font-weight: 500; color: #1e293b; margin: 0 0 0.25rem 0; }
.event-datetime, .event-location { display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; color: #615e5eff; margin-bottom: 0.25rem; }
.event-datetime i, .event-location i { font-size: 0.75rem; }
.event-description { font-size: 0.75rem; color: #64748b; margin: 0.25rem 0 0 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.no-events { color: #64748b; text-align: center; padding: 1rem; }
.more-events-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; padding: 0.75rem; scrollbar-width: thin; scrollbar-color: #4f46e5 #f1f5f9; }
.more-events-list::-webkit-scrollbar { width: 6px; }
.more-events-list::-webkit-scrollbar-track { background: #0080ffff; border-radius: 10px; }
.more-events-list::-webkit-scrollbar-thumb { background-color: #770909ff; border-radius: 20px; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-container { width: 90%; max-width: 550px; max-height: 90vh; border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); background-color: white; display: flex; flex-direction: column; transform: translateY(0); transition: transform 0.3s ease-out; }
.modal-content { display: flex; flex-direction: column; height: 100%; max-height: 90vh; }
.modal-header { background: linear-gradient(135deg, #000000ff, #7d1313ff); color: white; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; position: relative; flex-shrink: 0; }
.modal-title { font-size: 1.25rem; font-weight: 600; margin: 0; }
.close-button { color: white !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; background: transparent !important; border-radius: 50% !important; }
.close-button:hover { background: rgba(255, 255, 255, 0.2) !important; }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: #770909ff #f1f5f9; }
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
.modal-body::-webkit-scrollbar-thumb { background-color: #770909ff; border-radius: 20px; }
.modal-footer { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; background-color: #f8fafc; flex-shrink: 0; }
.action-buttons { display: flex; gap: 0.75rem; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.form-control { width: 100%; border-radius: 0.5rem; border: 1px solid #e2e8f0; padding: 0.625rem; font-size: 0.875rem; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
.form-control:focus { border-color: #770909ff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.date-picker, .time-picker { width: 100%; }
.delete-button { background-color: transparent !important; color: #ef4444 !important; border: 1px solid #ef4444 !important; }
.delete-button:hover { background-color: #fef2f2 !important; }
.cancel-button { background-color: transparent !important; color: #64748b !important; border: 1px solid #e2e8f0 !important; }
.cancel-button:hover { background-color: #f1f5f9 !important; }
.save-button { background: linear-gradient(135deg, #000000ff, #7d1313ff) !important; border: none !important; color: white !important; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -2px rgba(79, 70, 229, 0.1) !important; transition: all 0.2s ease !important; }
.save-button:hover { transform: translateY(-2px) !important; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2), 0 4px 6px -4px rgba(79, 70, 229, 0.1) !important; }
.confirmation-content { display: flex; align-items: center; gap: 0.75rem; }
.confirmation-content i { color: #7a694bff; font-size: 1.5rem; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-container { animation: modal-in 0.3s ease-out forwards; }
.modal-fade-leave-active .modal-container { animation: modal-out 0.2s ease-in forwards; }
@keyframes modal-in { 0% { opacity: 0; transform: translateY(30px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes modal-out { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(30px) scale(0.95); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 1024px) { .calendar-layout { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
  .calendar-wrapper { padding: 1rem; }
  .calendar-title { font-size: 2rem; }
  .calendar-controls { flex-direction: column; align-items: stretch; }
  .calendar-day { padding: 0.125rem; }
  .day-number { font-size: 1rem; }
  .day-event { font-size: 0.65rem; padding: 0.0625rem 0.125rem; }
}
@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .modal-footer { flex-direction: column; gap: 1rem; }
  .delete-button { margin-right: auto; margin-left: 0; }
  .action-buttons { width: 100%; }
  .cancel-button, .save-button { flex: 1; }
}
</style>
