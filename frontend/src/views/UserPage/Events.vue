<template>
  <div class="bg-gradient-to-br from-surface-50 to-surface-100 min-h-screen overflow-hidden">
    <div class="max-w-7xl mx-auto p-6 md:p-8">
      <header class="mb-8 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-red-900 mb-2">
          Barangay Events Calendar
        </h1>
        <p class="text-surface-600 text-lg">Stay updated with important events in your barangay</p>
      </header>

      <div class="mb-6 flex flex-wrap justify-between items-center gap-4 animate-fade-in" style="animation-delay: 0.2s;">
        <div class="flex flex-wrap gap-4 text-sm font-medium">
          <span
            v-for="type in eventTypes"
            :key="type.value"
            class="flex items-center bg-white rounded-full px-3 py-1 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
          >
            <span :class="`w-3 h-3 ${getEventTypeColor(type.value)} rounded-full mr-2`"></span>
            {{ type.label }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- CALENDAR -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-surface-200 animate-fade-in" style="animation-delay: 0.4s;">
          <div class="p-4 bg-gradient-to-r from-red-900 to-red-800 text-white">
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
              <!-- Weekday Header -->
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

                  <!-- Events for this day (from processed calendar events only) -->
                  <div class="day-events">
                    <div
                      v-for="(event, eventIndex) in getDayEvents(day.date).slice(0, 3)"
                      :key="eventIndex"
                      :class="[
                        'day-event',
                        getEventTypeColor(event.type).replace('bg-', '')
                      ]"
                      @click.stop="showEventDetails(event)"
                    >
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-time">{{ formatTime(event.date) }}</div>
                    </div>

                    <!-- Show +X more if there are > 3 events for same day (within the 5 calendar-cap) -->
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
            <!-- /Custom Calendar View -->
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <div class="space-y-6">
          <!-- Upcoming Events (overflow beyond 5) -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-surface-200 animate-fade-in" style="animation-delay: 0.6s;">
            <h2 class="text-xl font-semibold mb-4 text-surface-800 flex items-center">
              <i class="pi pi-calendar mr-2 text-red-900"></i>
              Upcoming Events
            </h2>

            <div v-if="upcomingEvents.length > 0" class="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div
                v-for="event in upcomingEvents"
                :key="event.id"
                class="p-3 rounded-lg hover:bg-surface-50 transition-all duration-300 ease-in-out border border-surface-100 cursor-pointer transform hover:-translate-y-1 hover:shadow-md"
                @click="showEventDetails(event)"
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

          <!-- Events on Selected Date (only from the 5 calendar events) -->
          <div
            v-if="selectedDateEvents.length > 0"
            class="bg-white rounded-2xl shadow-xl p-6 border border-surface-200 animate-fade-in"
            style="animation-delay: 0.8s;"
          >
            <h2 class="text-xl font-semibold mb-4 text-surface-800">
              Events on {{ formatFullDate(date) }}
            </h2>
            <div class="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div
                v-for="event in selectedDateEvents"
                :key="event.id"
                class="p-3 rounded-lg hover:bg-surface-50 transition-all duration-300 ease-in-out border border-surface-100 cursor-pointer transform hover:-translate-y-1 hover:shadow-md"
                @click="showEventDetails(event)"
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
          <!-- /Events on Selected Date -->
        </div>
      </div>

      <!-- Event Details Dialog (read-only) -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="eventDetailsDialog" class="modal-backdrop" @click="hideEventDetailsDialog">
            <div class="modal-container" @click.stop>
              <div class="modal-content">
                <div class="modal-header bg-gradient-to-r from-red-900 to-red-800">
                  <h2 class="modal-title">Event Details</h2>
                  <Button
                    icon="pi pi-times"
                    @click="hideEventDetailsDialog"
                    class="p-button-rounded p-button-text close-button"
                    aria-label="Close"
                  />
                </div>

                <div class="modal-body">
                  <div class="read-only-notice">
                    <i class="pi pi-info-circle mr-2"></i>
                    This is a read-only view of the event.
                  </div>

                  <div class="event-detail-item">
                    <h3 class="detail-label">Event Title</h3>
                    <p class="detail-value">{{ selectedEvent.title }}</p>
                  </div>

                  <div class="event-detail-row">
                    <div class="event-detail-item">
                      <h3 class="detail-label">Date</h3>
                      <p class="detail-value">{{ formatDate(selectedEvent.date) }}</p>
                    </div>

                    <div class="event-detail-item">
                      <h3 class="detail-label">Time</h3>
                      <p class="detail-value">{{ formatTime(selectedEvent.date) }}</p>
                    </div>
                  </div>

                  <div class="event-detail-item">
                    <h3 class="detail-label">Location</h3>
                    <p class="detail-value">{{ selectedEvent.location || 'Not specified' }}</p>
                  </div>

                  <div class="event-detail-item">
                    <h3 class="detail-label">Barangay</h3>
                    <p class="detail-value">{{ selectedEvent.barangay || 'Not specified' }}</p>
                  </div>

                  <div class="event-detail-item">
                    <h3 class="detail-label">Created By</h3>
                    <p class="detail-value">{{ selectedEvent.createdBy || 'Unknown' }}</p>
                  </div>

                  <div class="event-detail-item">
                    <h3 class="detail-label">Event Type</h3>
                    <div class="flex items-center">
                      <span :class="`event-type-indicator ${getEventTypeColor(selectedEvent.type).replace('bg-', '')}`"></span>
                      {{ getEventTypeLabel(selectedEvent.type) }}
                    </div>
                  </div>

                  <div class="event-detail-item">
                    <h3 class="detail-label">Description</h3>
                    <p class="detail-value description">{{ selectedEvent.description || 'No description provided' }}</p>
                  </div>
                </div>

                <div class="modal-footer">
                  <Button
                    label="Close"
                    icon="pi pi-times"
                    class="cancel-button"
                    @click="hideEventDetailsDialog"
                  />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- More events on a single day (if >3 within the 5-calendar-cap) -->
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
            @click="showEventDetails(event); moreEventsDialog = false;"
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
import { ref, computed, onMounted, watch } from 'vue';
import {
  format,
  isSameDay,
  isAfter,
  startOfDay,
  addMonths,
  subMonths,
  getDate,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday as dateFnsIsToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';

import { db } from '@/services/firebase';
import { collection, getDocs, query, orderBy, Timestamp, where, onSnapshot } from 'firebase/firestore';
import { useUserStore } from "@/stores/user";

// PrimeVue
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { Teleport, Transition } from 'vue';

const date = ref(new Date());
const events = ref([]);
const userStore = useUserStore();
const user = computed(() => userStore.user);

// dialogs
const eventDetailsDialog = ref(false);
const selectedEvent = ref({
  id: '',
  title: '',
  date: new Date(),
  type: 'Meeting',
  description: '',
  location: '',
  createdBy: '',
  barangay: ''
});
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

/**
 * CORE RULES:
 * 1) Remove past events (only today & future).
 * 2) Sort ascending by date.
 * 3) Keep only first 5 for the CALENDAR.
 * 4) Overflow -> Upcoming list (right panel).
 */
const processedEvents = computed(() => {
  const today = startOfDay(new Date());

  // Filter out past events
  const future = events.value.filter((e) => {
    const d = new Date(e.date);
    return isAfter(d, today) || isSameDay(d, today);
  });

  // Sort earliest → latest
  future.sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    calendar: future.slice(0, 5),
    upcoming: future.slice(5)
  };
});

const upcomingEvents = computed(() => processedEvents.value.upcoming);

// Build calendar grid
const calendarDays = computed(() => {
  const currentMonth = date.value;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => ({
    date: day,
    dayNumber: getDate(day),
    currentMonth: isSameMonth(day, currentMonth)
  }));
});

const isToday = (d) => dateFnsIsToday(d);
const selectDate = (d) => { date.value = d; };

// For a given day, use ONLY the 5 calendar events
const getDayEvents = (day) => {
  return processedEvents.value.calendar.filter((e) => isSameDay(new Date(e.date), day));
};

const showMoreEvents = (dayDate) => {
  moreEventsDate.value = dayDate;
  moreEventsList.value = getDayEvents(dayDate);
  moreEventsDialog.value = true;
};

const showEventDetails = (event) => {
  selectedEvent.value = { ...event };
  eventDetailsDialog.value = true;
};

const hideEventDetailsDialog = () => {
  eventDetailsDialog.value = false;
};

// Fetch events (initial)
const fetchEvents = async () => {
  const eventsCollection = collection(db, "announcements");
  const q = query(
    eventsCollection,
    where("createdBy", "in", ["BarangayPresident", "FederationPresident"]),
    orderBy("date", "asc")
  );
  const querySnapshot = await getDocs(q);

  const list = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.createdBy === 'BarangayPresident' && user.value?.barangay && data.barangay !== user.value.barangay) {
      return;
    }
    const eventDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
    const type = ['Meeting', 'Workshop', 'Holiday', 'Reminder'].includes(data.type) ? data.type : 'Meeting';
    list.push({
      id: doc.id,
      title: data.title || 'Untitled Event',
      date: eventDate,
      type,
      description: data.description || '',
      location: data.location || '',
      createdBy: data.createdBy || '',
      barangay: data.barangay || ''
    });
  });

  events.value = list;
};

// Real-time updates
const setupRealtimeUpdates = () => {
  const eventsCollection = collection(db, "announcements");
  const q = query(
    eventsCollection,
    where("createdBy", "in", ["BarangayPresident", "FederationPresident"]),
    orderBy("date", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const updated = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.createdBy === 'BarangayPresident' && user.value?.barangay && data.barangay !== user.value.barangay) return;
      const eventDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
      const type = ['Meeting', 'Workshop', 'Holiday', 'Reminder'].includes(data.type) ? data.type : 'Meeting';
      updated.push({
        id: doc.id,
        title: data.title || 'Untitled Event',
        date: eventDate,
        type,
        description: data.description || '',
        location: data.location || '',
        createdBy: data.createdBy || '',
        barangay: data.barangay || ''
      });
    });
    events.value = updated;
  });
};

onMounted(() => {
  fetchEvents();
  const unsub = setupRealtimeUpdates();
  return () => unsub();
});

// Keep "Events on Selected Date" in sync (only those within the 5 calendar events)
watch([date, processedEvents], () => {
  selectedDateEvents.value = processedEvents.value.calendar.filter((e) => isSameDay(new Date(e.date), date.value));
}, { immediate: true });

// Calendar navigation
function setToday() { date.value = new Date(); }
function nextMonth() { date.value = addMonths(date.value, 1); }
function previousMonth() { date.value = subMonths(date.value, 1); }

// Formatters
const formatDate = (d) => { try { return format(new Date(d), 'MMM dd, yyyy'); } catch { return 'Invalid date'; } };
const formatTime = (d) => { try { return format(new Date(d), 'h:mm a'); } catch { return 'Invalid time'; } };
const formatDateTime = (d) => { try { return format(new Date(d), 'MMM dd, yyyy h:mm a'); } catch { return 'Invalid date/time'; } };
const formatFullDate = (d) => { try { return format(new Date(d), 'MMMM d, yyyy'); } catch { return 'Invalid date'; } };
const formatMonthYear = (d) => { try { return format(new Date(d), 'MMMM yyyy'); } catch { return 'Invalid date'; } };

// Colors
const getEventTypeColor = (type) => {
  switch (type) {
    case 'Meeting': return 'bg-blue-500';
    case 'Workshop': return 'bg-purple-500';
    case 'Holiday': return 'bg-red-500';
    case 'Reminder': return 'bg-amber-500';
    case 'Announcement': return 'bg-maroon-500';
    default: return 'bg-gray-500';
  }
};
const getEventTypeLabel = (value) => eventTypes.find(t => t.value === value)?.label ?? '';
</script>

<style scoped>
/* Custom calendar styling */
.custom-calendar { width: 100%; border-radius: 12px; position: relative; }

/* Calendar header with weekday names */
.calendar-header { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 8px; }
.weekday { padding: 8px; font-weight: 600; color: #64748b; font-size: 0.875rem; }

/* Calendar days grid */
.calendar-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.calendar-day { aspect-ratio: 1; padding: 4px; border-radius: 8px; cursor: pointer; position: relative; transition: all 0.2s ease; display: flex; flex-direction: column; overflow: hidden; }
.calendar-day:hover { background-color: #f1f5f9; }
.calendar-day.current-month { background-color: #ffffff; }
.calendar-day:not(.current-month) { background-color: #f8fafc; }
.calendar-day.today { background-color: #eff6ff; border: 1px solid #3b82f6; }
.calendar-day.selected { background-color: #dbeafe; }

.day-number { font-size: 1.25rem; font-weight: 500; text-align: center; color: #334155; margin-bottom: 4px; }
.today .day-number { color: #3b82f6; font-weight: 600; }

/* Events styling */
.day-events { display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex: 1; }
.day-event { padding: 2px 4px; border-radius: 4px; font-size: 0.7rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.day-event:hover { filter: brightness(1.1); }
.day-event .event-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.day-event .event-time { font-size: 0.6rem; opacity: 0.9; }
.more-events { font-size: 0.7rem; color: #64748b; text-align: center; padding: 2px; cursor: pointer; }
.more-events:hover { text-decoration: underline; }

/* Event colors (used after replacing 'bg-') */
.blue-500 { background-color: #3b82f6; }
.purple-500 { background-color: #8b5cf6; }
.red-500 { background-color: #ef4444; }
.amber-500 { background-color: #f59e0b; }
.gray-500 { background-color: #6b7280; }
.maroon-500 { background-color: #800000; }

/* Custom scrollbar */
.custom-scrollbar { scrollbar-width: thin; scrollbar-color: #800000 var(--surface-100, #f1f5f9); }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--surface-100, #f1f5f9); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #800000; border-radius: 20px; border: 2px solid var(--surface-100, #f1f5f9); }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }

/* Modal styling */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-container { width: 90%; max-width: 550px; max-height: 90vh; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); background-color: white; display: flex; flex-direction: column; transform: translateY(0); transition: transform 0.3s ease-out; }
.modal-content { display: flex; flex-direction: column; height: 100%; max-height: 90vh; }
.modal-header { background: linear-gradient(to right, #800000, #8b0000); color: white; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; position: relative; flex-shrink: 0; }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: #800000 var(--surface-100, #f1f5f9); }
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-track { background: var(--surface-100, #f1f5f9); border-radius: 10px; }
.modal-body::-webkit-scrollbar-thumb { background-color: #800000; border-radius: 20px; }
.modal-footer { padding: 1rem 1.5rem; display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid #e2e8f0; background-color: #f8fafc; flex-shrink: 0; }

/* Event details styling */
.event-detail-item { margin-bottom: 1.25rem; }
.event-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
.detail-label { font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem; }
.detail-value { font-size: 1rem; color: #334155; }
.detail-value.description { white-space: pre-line; line-height: 1.5; }
.event-type-indicator { display: inline-block; width: 0.75rem; height: 0.75rem; border-radius: 9999px; margin-right: 0.5rem; }

/* Read-only notice styling */
.read-only-notice { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1.25rem; display: flex; align-items: center; font-size: 0.875rem; }

/* Modal transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-container { animation: modal-in 0.3s ease-out forwards; }
.modal-fade-leave-active .modal-container { animation: modal-out 0.2s ease-in forwards; }
@keyframes modal-in { 0% { opacity: 0; transform: translateY(30px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes modal-out { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(30px) scale(0.95); } }

/* Responsive */
@media (max-width: 768px) {
  .calendar-day { padding: 2px; }
  .day-number { font-size: 1rem; }
  .day-event { font-size: 0.65rem; padding: 1px 2px; }
  .event-detail-row { grid-template-columns: 1fr; }
}

/* Cancel button */
.cancel-button { background-color: transparent !important; color: #64748b !important; border: 1px solid #e2e8f0 !important; }
.cancel-button:hover { background-color: #f1f5f9 !important; }
</style>
