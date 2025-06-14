<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p class="text-gray-600 mt-2">Manage your solo parent federation membership and preferences</p>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message.text" :class="[
        'mb-6 p-4 rounded-lg border',
        message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
      ]">
        {{ message.text }}
      </div>

      <div class="space-y-6">
        <!-- Profile Information -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <UserIcon class="w-5 h-5 mr-2" />
              Profile Information
            </h2>
          </div>
          <div class="p-6">
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    v-model="profile.fullName" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input 
                    v-model="profile.email" 
                    type="email" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    v-model="profile.phone" 
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input 
                    v-model="profile.dateOfBirth" 
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
                  <textarea 
                    v-model="profile.address" 
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                  <select 
                    v-model="profile.barangay"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Barangay</option>
                    <option v-for="barangay in barangayList" :key="barangay" :value="barangay">{{ barangay }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City/Municipality</label>
                  <input 
                    v-model="profile.city" 
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                :disabled="loading.profile"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading.profile ? 'Saving...' : 'Save Changes' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Family Information -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <HeartIcon class="w-5 h-5 mr-2" />
              Family Information
            </h2>
          </div>
          <div class="p-6">
            <form @submit.prevent="updateFamilyInfo" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                  <input 
                    v-model.number="familyInfo.numberOfChildren" 
                    type="number" 
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <select 
                    v-model="familyInfo.maritalStatus"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="separated">Separated</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                  <select 
                    v-model="familyInfo.employmentStatus"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Income Range</label>
                  <select 
                    v-model="familyInfo.incomeRange"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Range</option>
                    <option value="below-10k">Below ₱10,000</option>
                    <option value="10k-20k">₱10,000 - ₱20,000</option>
                    <option value="20k-30k">₱20,000 - ₱30,000</option>
                    <option value="30k-50k">₱30,000 - ₱50,000</option>
                    <option value="above-50k">Above ₱50,000</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                :disabled="loading.family"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading.family ? 'Saving...' : 'Update Family Info' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <ShieldCheckIcon class="w-5 h-5 mr-2" />
              Security Settings
            </h2>
          </div>
          <div class="p-6">
            <form @submit.prevent="changePassword" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input 
                    v-model="passwordForm.current" 
                    type="password" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    v-model="passwordForm.new" 
                    type="password" 
                    required
                    minlength="8"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    v-model="passwordForm.confirm" 
                    type="password" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                :disabled="loading.password"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading.password ? 'Updating...' : 'Change Password' }}
              </button>
            </form>

            <!-- Two-Factor Authentication -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <button 
                  @click="toggle2FA"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  ]"
                >
                  <span :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  ]"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Preferences -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <BellIcon class="w-5 h-5 mr-2" />
              Notification Preferences
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900">Email Notifications</h3>
                <p class="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <button 
                @click="notifications.email = !notifications.email"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notifications.email ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900">SMS Notifications</h3>
                <p class="text-sm text-gray-600">Receive important alerts via SMS</p>
              </div>
              <button 
                @click="notifications.sms = !notifications.sms"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  notifications.sms ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notifications.sms ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900">Push Notifications</h3>
                <p class="text-sm text-gray-600">Receive notifications in your browser</p>
              </div>
              <button 
                @click="notifications.push = !notifications.push"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notifications.push ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900">Program Updates</h3>
                <p class="text-sm text-gray-600">Get notified about new programs and benefits</p>
              </div>
              <button 
                @click="notifications.programs = !notifications.programs"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  notifications.programs ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  notifications.programs ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
            </div>

            <button 
              @click="saveNotifications"
              :disabled="loading.notifications"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading.notifications ? 'Saving...' : 'Save Preferences' }}
            </button>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <EyeOffIcon class="w-5 h-5 mr-2" />
              Privacy Settings
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900">Profile Visibility</h3>
                <p class="text-sm text-gray-600">Allow other members to see your profile</p>
              </div>
              <button 
                @click="privacy.profileVisible = !privacy.profileVisible"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  privacy.profileVisible ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900">Contact Information Sharing</h3>
                <p class="text-sm text-gray-600">Allow federation staff to share your contact info for programs</p>
              </div>
              <button 
                @click="privacy.contactSharing = !privacy.contactSharing"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  privacy.contactSharing ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  privacy.contactSharing ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
            </div>

            <button 
              @click="savePrivacy"
              :disabled="loading.privacy"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading.privacy ? 'Saving...' : 'Save Privacy Settings' }}
            </button>
          </div>
        </div>

        <!-- Account Management -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <CogIcon class="w-5 h-5 mr-2" />
              Account Management
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 class="text-base font-medium text-gray-900">Export Data</h3>
                <p class="text-sm text-gray-600">Download a copy of your account data</p>
              </div>
              <button 
                @click="exportData"
                class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Export
              </button>
            </div>

            <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 class="text-base font-medium text-red-900">Delete Account</h3>
                <p class="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <button 
                @click="showDeleteConfirm = true"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirm Account Deletion</h3>
          <p class="text-gray-600 mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
          <div class="flex space-x-3">
            <button 
              @click="deleteAccount"
              class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete Account
            </button>
            <button 
              @click="showDeleteConfirm = false"
              class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  UserIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  EyeOffIcon, 
  CogIcon 
} from 'lucide-vue-next'

// Reactive data
const profile = reactive({
  fullName: 'Maria Santos',
  email: 'maria.santos@email.com',
  phone: '+63 912 345 6789',
  dateOfBirth: '1985-03-15',
  address: '123 Main Street, Subdivision',
  barangay: 'Barangay San Jose',
  city: 'Quezon City'
})

const familyInfo = reactive({
  numberOfChildren: 2,
  maritalStatus: 'separated',
  employmentStatus: 'employed',
  incomeRange: '20k-30k'
})

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

const notifications = reactive({
  email: true,
  sms: true,
  push: false,
  programs: true
})

const privacy = reactive({
  profileVisible: true,
  contactSharing: true
})

const security = reactive({
  twoFactorEnabled: false
})

const loading = reactive({
  profile: false,
  family: false,
  password: false,
  notifications: false,
  privacy: false
})

const message = ref({
  text: '',
  type: ''
})

const showDeleteConfirm = ref(false)

const barangayList = [
  'Barangay San Jose',
  'Barangay Santa Maria',
  'Barangay San Antonio',
  'Barangay Santo Domingo',
  'Barangay San Pedro',
  'Barangay Santa Cruz',
  'Barangay San Miguel',
  'Barangay San Rafael'
]

// Methods
const showMessage = (text, type = 'success') => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 5000)
}

const updateProfile = async () => {
  loading.profile = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    showMessage('Profile updated successfully!')
  } catch (error) {
    showMessage('Failed to update profile', 'error')
  } finally {
    loading.profile = false
  }
}

const updateFamilyInfo = async () => {
  loading.family = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showMessage('Family information updated successfully!')
  } catch (error) {
    showMessage('Failed to update family information', 'error')
  } finally {
    loading.family = false
  }
}

const changePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    showMessage('New passwords do not match', 'error')
    return
  }
  
  if (passwordForm.new.length < 8) {
    showMessage('Password must be at least 8 characters long', 'error')
    return
  }

  loading.password = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showMessage('Password changed successfully!')
    passwordForm.current = ''
    passwordForm.new = ''
    passwordForm.confirm = ''
  } catch (error) {
    showMessage('Failed to change password', 'error')
  } finally {
    loading.password = false
  }
}

const toggle2FA = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    security.twoFactorEnabled = !security.twoFactorEnabled
    showMessage(`Two-factor authentication ${security.twoFactorEnabled ? 'enabled' : 'disabled'}!`)
  } catch (error) {
    showMessage('Failed to update two-factor authentication', 'error')
  }
}

const saveNotifications = async () => {
  loading.notifications = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showMessage('Notification preferences saved!')
  } catch (error) {
    showMessage('Failed to save notification preferences', 'error')
  } finally {
    loading.notifications = false
  }
}

const savePrivacy = async () => {
  loading.privacy = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showMessage('Privacy settings saved!')
  } catch (error) {
    showMessage('Failed to save privacy settings', 'error')
  } finally {
    loading.privacy = false
  }
}

const exportData = async () => {
  try {
    const data = {
      profile,
      familyInfo,
      notifications,
      privacy,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solo-parent-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showMessage('Data exported successfully!')
  } catch (error) {
    showMessage('Failed to export data', 'error')
  }
}

const deleteAccount = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showMessage('Account deletion initiated. You will receive a confirmation email.')
    showDeleteConfirm.value = false
  } catch (error) {
    showMessage('Failed to delete account', 'error')
  }
}

// Load data on mount
onMounted(() => {
  // Simulate loading user data
  console.log('Settings page loaded')
})
</script>