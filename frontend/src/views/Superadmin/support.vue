<template>
  <div class="support-container">
    <h2 class="title">📩 Support Management – Federation Admin</h2>

    <!-- Search & Filter -->
    <div class="controls">
      <input v-model="search" class="input" placeholder="🔍 Search by name or barangay..." />
      <select v-model="statusFilter" class="select">
        <option value="">All</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>

    <!-- Ticket List -->
    <div v-if="filteredSupport.length" class="ticket-list">
      <div
        v-for="ticket in filteredSupport"
        :key="ticket.id"
        class="ticket-card"
        @click="selectTicket(ticket)"
      >
        <div class="ticket-header">
          <strong>{{ ticket.fullName }}</strong>
          <span class="status" :class="ticket.status">{{ ticket.status }}</span>
        </div>
        <p class="barangay">{{ ticket.barangay }}</p>
        <p class="subject">{{ ticket.subject }}</p>
      </div>
    </div>
    <p v-else class="empty">No support requests found.</p>

    <!-- Modal for Viewing Ticket -->
    <div v-if="selected" class="modal-overlay">
      <div class="modal">
        <h3>📝 Support Ticket</h3>
        <p><strong>From:</strong> {{ selected.fullName }} ({{ selected.barangay }})</p>
        <p><strong>Subject:</strong> {{ selected.subject }}</p>
        <p><strong>Message:</strong> {{ selected.message }}</p>

        <textarea v-model="reply" placeholder="✉️ Type your reply..." class="textarea"></textarea>
        <div class="modal-actions">
          <button @click="sendReply" class="btn primary">Send Reply</button>

          <label>Status:
            <select v-model="selected.status" class="select small">
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
          <button @click="updateStatus" class="btn">Update Status</button>
        </div>

        <button class="btn danger" @click="selected = null">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/services/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query
} from 'firebase/firestore';

export default {
  name: 'Support',
  data() {
    return {
      supportRequests: [],
      selected: null,
      reply: '',
      search: '',
      statusFilter: '',
    };
  },
  computed: {
    filteredSupport() {
      const searchLower = this.search.toLowerCase();
      return this.supportRequests.filter((ticket) => {
        return (
          (ticket.fullName.toLowerCase().includes(searchLower) ||
            ticket.barangay.toLowerCase().includes(searchLower)) &&
          (this.statusFilter === '' || ticket.status === this.statusFilter)
        );
      });
    },
  },
  methods: {
    async fetchSupport() {
      try {
        const q = query(collection(db, 'support'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        this.supportRequests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error('Error fetching support:', error);
      }
    },
    selectTicket(ticket) {
      this.selected = { ...ticket };
      this.reply = ticket.adminReply || '';
    },
    async sendReply() {
      if (!this.reply.trim()) {
        alert('Please enter a reply.');
        return;
      }

      try {
        const ticketRef = doc(db, 'support', this.selected.id);
        await updateDoc(ticketRef, {
          adminReply: this.reply,
          status: 'in_progress',
          repliedAt: new Date(),
        });
        this.selected = null;
        this.reply = '';
        this.fetchSupport();
      } catch (error) {
        console.error('Failed to send reply:', error);
      }
    },
    async updateStatus() {
      try {
        const ticketRef = doc(db, 'support', this.selected.id);
        await updateDoc(ticketRef, {
          status: this.selected.status,
        });
        this.selected = null;
        this.fetchSupport();
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    },
  },
  mounted() {
    this.fetchSupport();
  },
};
</script>

<style scoped>
.support-container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}
.title {
  font-size: 24px;
  margin-bottom: 20px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.input, .select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  flex: 1;
  min-width: 200px;
}
.select.small {
  padding: 6px;
  font-size: 14px;
}
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ticket-card {
  padding: 15px;
  border: 1px solid #eee;
  border-left: 5px solid #3b82f6;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.ticket-card:hover {
  background: #f0f8ff;
}
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status {
  text-transform: uppercase;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  color: #fff;
}
.status.open {
  background: #f59e0b;
}
.status.in_progress {
  background: #3b82f6;
}
.status.resolved {
  background: #10b981;
}
.barangay {
  font-size: 13px;
  color: #555;
}
.subject {
  font-weight: bold;
}
.empty {
  text-align: center;
  color: #999;
  margin-top: 20px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  padding: 25px;
  width: 500px;
  max-width: 90%;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
}
.modal-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn.primary {
  background: #3b82f6;
  color: white;
}
.btn.danger {
  background: #ef4444;
  color: white;
}
</style>
