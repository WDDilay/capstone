<template>
  <div class="settings-container" :class="{ dark: settings.theme === 'dark' }">
    <h2 class="title">⚙️ Federation Settings</h2>

    <form @submit.prevent="updateSettings" class="settings-form">
      <div class="form-section">
        <label>Federation Name</label>
        <input v-model="settings.federationName" required />

        <label>Full Name</label>
        <input v-model="settings.fullName" required />

        <label>Email</label>
        <input v-model="settings.email" type="email" required />

        <label>Contact Number</label>
        <input v-model="settings.contactNumber" required />
      </div>

      <div class="form-section">
        <label>Region</label>
        <input v-model="settings.region" required />

        <label>City / Municipality</label>
        <input v-model="settings.city" required />

        <label>Federation Office Address</label>
        <textarea v-model="settings.address" required />
      </div>

      <!-- Dark Mode Toggle -->
      <div class="form-section toggle">
        <label>🌓 Theme Mode</label>
        <select v-model="settings.theme">
          <option value="light">🌞 Light</option>
          <option value="dark">🌙 Dark</option>
        </select>
      </div>

      <button type="submit" class="btn primary">💾 Save Settings</button>
    </form>
  </div>
</template>

<script>
import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default {
  name: 'FederationSettings',
  data() {
    return {
      settings: {
        fullName: '',
        email: '',
        contactNumber: '',
        federationName: '',
        region: '',
        city: '',
        address: '',
        theme: 'light',
      },
      federationId: 'federation_president', // use your actual doc ID
    };
  },
  methods: {
    async fetchSettings() {
      const ref = doc(db, 'admins', this.federationId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        this.settings = { ...snap.data() };
      }
    },
    async updateSettings() {
      const ref = doc(db, 'admins', this.federationId);
      await updateDoc(ref, this.settings);
      alert('✅ Settings saved successfully.');
    },
  },
  mounted() {
    this.fetchSettings();
  },
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: auto;
  padding: 30px;
  font-family: 'Segoe UI', sans-serif;
  transition: background 0.3s ease, color 0.3s ease;
}

.settings-container.dark {
  background: #1e293b;
  color: white;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
}

.settings-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.settings-container.dark .settings-form {
  background: #334155;
}

.form-section {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.toggle {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
}

input, textarea, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
}

.settings-container.dark input,
.settings-container.dark textarea,
.settings-container.dark select {
  background: #1e293b;
  color: white;
  border: 1px solid #64748b;
}

textarea {
  resize: vertical;
  height: 80px;
}

.btn {
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  background: #2563eb;
}
</style>
