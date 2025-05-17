<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Account Settings</h1>

    <!-- Profile Section -->
    <CardSection title="Profile Information">
      <form @submit.prevent="updateProfile">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField v-model="form.name" label="Full Name" required />
          <InputField v-model="form.contact" label="Contact Number" />
          <InputField v-model="form.address" label="Home Address" />
        </div>
        <Button type="submit" class="mt-4">Save Changes</Button>
      </form>
    </CardSection>

    <!-- Barangay Info -->
    <CardSection title="Barangay Assignment">
      <p class="text-gray-700">
        You are currently assigned to <strong>{{ form.barangay }}</strong> in <strong>{{ form.city }}</strong>.
      </p>
    </CardSection>

    <!-- Change Password -->
    <CardSection title="Change Password">
      <form @submit.prevent="changePassword">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField v-model="password.old" label="Current Password" type="password" required />
          <InputField v-model="password.new" label="New Password" type="password" required />
        </div>
        <Button type="submit" class="mt-4 bg-red-500 hover:bg-red-600">Update Password</Button>
      </form>
    </CardSection>

    <!-- Notification Preferences -->
    <CardSection title="Notifications">
      <div class="space-y-2">
        <label class="flex items-center">
          <input type="checkbox" v-model="notifications.email" class="mr-2" />
          Email Notifications
        </label>
        <label class="flex items-center">
          <input type="checkbox" v-model="notifications.sms" class="mr-2" />
          SMS Alerts
        </label>
      </div>
      <Button @click="saveNotifications" class="mt-4">Save Preferences</Button>
    </CardSection>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from "@/services/firebase"




const auth = getAuth()
const user = auth.currentUser

const form = ref({
  name: '',
  contact: '',
  address: '',
  barangay: '',
  city: '',
})

const password = ref({
  old: '',
  new: '',
})

const notifications = ref({
  email: true,
  sms: false,
})

async function loadMemberData() {
  if (!user) return
  const userRef = doc(db, 'members', user.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const data = snap.data()
    form.value = { ...form.value, ...data }
    notifications.value = data.notifications || notifications.value
  }
}

async function updateProfile() {
  if (!user) return
  const userRef = doc(db, 'members', user.uid)
  await updateDoc(userRef, {
    name: form.value.name,
    contact: form.value.contact,
    address: form.value.address,
  })
  alert('Profile updated!')
}

async function changePassword() {
  try {
    await updatePasswordWithOld(password.value.old, password.value.new)
    alert('Password changed!')
  } catch (error) {
    alert(error.message)
  }
}

async function saveNotifications() {
  if (!user) return
  await updateDoc(doc(db, 'members', user.uid), {
    notifications: notifications.value,
  })
  alert('Notification preferences saved!')
}

onMounted(loadMemberData)
</script>
