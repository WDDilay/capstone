<template>
  <div class="profile-settings">
    <div class="profile-header">
      <div class="profile-background"></div>
      <div class="profile-avatar-container">
        <img 
          src="/placeholder-profile.jpg" 
          alt="Profile Photo" 
          class="profile-avatar"
        />
        <button class="change-photo-btn">
          <Camera class="icon-sm" />
        </button>
      </div>
      <div class="profile-name">
        <h2>{{ userProfile.firstName }} {{ userProfile.middleName ? userProfile.middleName + ' ' : '' }}{{ userProfile.lastName }}{{ userProfile.nameExt ? ' ' + userProfile.nameExt : '' }}</h2>
        <p>{{ userProfile.role }}</p>
      </div>
    </div>

    <div class="settings-container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
        >
          <component :is="tab.icon" class="tab-icon" />
          {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Personal Information Tab -->
        <div v-if="activeTab === 'personal'" class="personal-info">
          <h3>Personal Information</h3>
          
          <form @submit.prevent="savePersonalInfo" class="form-grid">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input type="text" id="firstName" v-model="userProfile.firstName" placeholder="First Name">
            </div>
            
            <div class="form-group">
              <label for="middleName">Middle Name</label>
              <input type="text" id="middleName" v-model="userProfile.middleName" placeholder="Middle Name">
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input type="text" id="lastName" v-model="userProfile.lastName" placeholder="Last Name">
            </div>
            
            <div class="form-group">
              <label for="nameExt">Name Extension</label>
              <select id="nameExt" v-model="userProfile.nameExt">
                <option value="">None</option>
                <option value="Jr.">Jr.</option>
                <option value="Sr.">Sr.</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" v-model="userProfile.email" placeholder="Email" readonly>
            </div>
            
            <div class="form-group">
              <label for="fbName">Facebook Name</label>
              <input type="text" id="fbName" v-model="userProfile.fbName" placeholder="Facebook Name">
            </div>
            
            <div class="form-group">
              <label for="contactNumber">Contact Number</label>
              <input type="tel" id="contactNumber" v-model="userProfile.contactNumber" placeholder="Contact Number">
            </div>
            
            <div class="form-group">
              <label for="dateOfBirth">Date of Birth</label>
              <input type="date" id="dateOfBirth" v-model="userProfile.dateOfBirth">
            </div>
            
            <div class="form-group">
              <label for="birthplace">Birthplace</label>
              <input type="text" id="birthplace" v-model="userProfile.birthplace" placeholder="Birthplace">
            </div>
            
            <div class="form-group">
              <label for="gender">Gender</label>
              <select id="gender" v-model="userProfile.gender">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="barangay">Barangay</label>
              <input type="text" id="barangay" v-model="userProfile.barangay" readonly class="readonly-field">
              <small class="field-note">Your barangay cannot be changed. Contact support if this information is incorrect.</small>
            </div>
            
            <div class="form-group">
              <label for="referenceCode">Reference Code</label>
              <input type="text" id="referenceCode" v-model="userProfile.referenceCode" readonly class="readonly-field">
              <small class="field-note">This is your unique member ID</small>
            </div>
            
            <div class="form-group full-width">
              <label for="address">Complete Address</label>
              <textarea id="address" v-model="userProfile.address" placeholder="Your Address" rows="3"></textarea>
            </div>
            
            <div class="form-actions full-width">
              <button type="button" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-save">Save Changes</button>
            </div>
          </form>
        </div>
        
        <!-- Solo Parent Details Tab -->
        <div v-if="activeTab === 'soloParent'" class="solo-parent-info">
          <h3>Solo Parent Details</h3>
          
          <form @submit.prevent="saveSoloParentInfo" class="form-grid">
            <div class="form-group">
              <label for="statusDisplay">Status</label>
              <input type="text" id="statusDisplay" v-model="userProfile.status" readonly class="readonly-field">
            </div>
            
            <div class="form-group">
              <label for="createdAtDisplay">Date Registered</label>
              <input type="text" id="createdAtDisplay" :value="formatDate(userProfile.createdAt)" readonly class="readonly-field">
            </div>
            
            <div class="form-group">
              <label for="soloParentReason">Solo Parent Reason</label>
              <select id="soloParentReason" v-model="userProfile.soloParentReason">
                <option value="">Select Reason</option>
                <option value="annulled">Annulled</option>
                <option value="separated">Separated</option>
                <option value="widowed">Widowed</option>
                <option value="abandoned">Abandoned</option>
                <option value="single">Single</option>
              </select>
            </div>
            
            <!-- Children Section -->
            <div class="form-group full-width">
              <label>Children Information</label>
              <div class="children-list">
                <div v-for="(child, index) in userProfile.children" :key="index" class="child-item">
                  <div class="child-details">
                    <h4>{{ child.name || 'Unnamed Child' }}</h4>
                    <p>{{ child.age }} years old</p>
                  </div>
                  <div class="child-actions">
                    <button type="button" class="btn-edit-small" @click="editChild(index)">
                      <Edit class="icon-sm" />
                    </button>
                    <button type="button" class="btn-delete-small" @click="removeChild(index)">
                      <Trash class="icon-sm" />
                    </button>
                  </div>
                </div>
                
                <button type="button" class="btn-add-child" @click="addChild">
                  <Plus class="icon-sm" />
                  Add Child
                </button>
              </div>
            </div>
            
            <div class="form-actions full-width">
              <button type="button" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-save">Save Changes</button>
            </div>
          </form>
        </div>
        
        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="security-settings">
          <h3>Security Settings</h3>
          
          <form @submit.prevent="changePassword" class="form-grid">
            <div class="form-group full-width">
              <label for="currentPassword">Current Password</label>
              <input 
                :type="showCurrentPassword ? 'text' : 'password'" 
                id="currentPassword" 
                v-model="passwordForm.currentPassword" 
                placeholder="Enter current password"
              >
              <button 
                type="button" 
                class="toggle-password" 
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <EyeOff v-if="showCurrentPassword" class="icon-sm" />
                <Eye v-else class="icon-sm" />
              </button>
            </div>
            
            <div class="form-group full-width">
              <label for="newPassword">New Password</label>
              <input 
                :type="showNewPassword ? 'text' : 'password'" 
                id="newPassword" 
                v-model="passwordForm.newPassword" 
                placeholder="Enter new password"
              >
              <button 
                type="button" 
                class="toggle-password" 
                @click="showNewPassword = !showNewPassword"
              >
                <EyeOff v-if="showNewPassword" class="icon-sm" />
                <Eye v-else class="icon-sm" />
              </button>
            </div>
            
            <div class="form-group full-width">
              <label for="confirmPassword">Confirm New Password</label>
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="passwordForm.confirmPassword" 
                placeholder="Confirm new password"
              >
              <button 
                type="button" 
                class="toggle-password" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff v-if="showConfirmPassword" class="icon-sm" />
                <Eye v-else class="icon-sm" />
              </button>
            </div>
            
            <div class="password-requirements full-width">
              <p>Password must contain:</p>
              <ul>
                <li :class="{ met: passwordMeetsLength }">At least 8 characters</li>
                <li :class="{ met: passwordHasUppercase }">At least one uppercase letter</li>
                <li :class="{ met: passwordHasLowercase }">At least one lowercase letter</li>
                <li :class="{ met: passwordHasNumber }">At least one number</li>
                <li :class="{ met: passwordHasSpecial }">At least one special character</li>
              </ul>
            </div>
            
            <div class="form-actions full-width">
              <button type="button" class="btn-cancel">Cancel</button>
              <button 
                type="submit" 
                class="btn-save"
                :disabled="!passwordValid || !passwordForm.currentPassword"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
        
        <!-- Notifications Tab -->
        <div v-if="activeTab === 'notifications'" class="notification-settings">
          <h3>Notification Settings</h3>
          
          <div class="notification-options">
            <div v-for="(option, index) in notificationOptions" :key="index" class="notification-option">
              <div class="option-details">
                <h4>{{ option.title }}</h4>
                <p>{{ option.description }}</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="option.enabled">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="button" class="btn-save" @click="saveNotificationSettings">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Child Edit Modal -->
    <div v-if="showChildModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isNewChild ? 'Add Child' : 'Edit Child' }}</h3>
          <button class="modal-close" @click="closeChildModal">
            <X class="icon-sm" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="childName">Child's Name</label>
            <input type="text" id="childName" v-model="editingChild.name" placeholder="Child's Name">
          </div>
          <div class="form-group">
            <label for="childAge">Child's Age</label>
            <input type="number" id="childAge" v-model="editingChild.age" min="0" max="30">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeChildModal">Cancel</button>
          <button class="btn-save" @click="saveChild">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '@/stores/user';
import { 
  User, 
  Users, 
  Lock, 
  Bell, 
  Camera,
  Edit, 
  Plus,
  Eye,
  EyeOff,
  Trash,
  X
} from 'lucide-vue-next';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default {
  setup() {
    const toast = useToast();
    const userStore = useUserStore();
    const db = getFirestore();
    const auth = getAuth();

    // Tabs configuration
    const tabs = ref([
      { id: 'personal', name: 'Personal Information', icon: User },
      { id: 'soloParent', name: 'Solo Parent Details', icon: Users },
      { id: 'security', name: 'Security', icon: Lock },
      { id: 'notifications', name: 'Notifications', icon: Bell }
    ]);

    const activeTab = ref('personal');
    
    // Barangays data
    const barangays = ref([]);

    // User profile data
    const userProfile = ref({
      address: '',
      age: 0,
      attachments: [],
      barangay: '',
      birthplace: '',
      children: [],
      contactNumber: '',
      createdAt: null,
      dateOfBirth: '',
      documents: {},
      email: '',
      emailVerified: false,
      fbName: '',
      firstName: '',
      gender: '',
      lastName: '',
      middleName: '',
      nameExt: '',
      referenceCode: '',
      role: '',
      soloParentReason: '',
      status: '',
      updatedAt: null,
      updatedBy: '',
      userId: ''
    });

    // Child modal state
    const showChildModal = ref(false);
    const editingChildIndex = ref(-1);
    const editingChild = ref({ name: '', age: 0 });
    const isNewChild = computed(() => editingChildIndex.value === -1);

    // Password form
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Password visibility toggles
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);

    // Password validation
    const passwordMeetsLength = computed(() => {
      return passwordForm.value.newPassword.length >= 8;
    });

    const passwordHasUppercase = computed(() => {
      return /[A-Z]/.test(passwordForm.value.newPassword);
    });

    const passwordHasLowercase = computed(() => {
      return /[a-z]/.test(passwordForm.value.newPassword);
    });

    const passwordHasNumber = computed(() => {
      return /[0-9]/.test(passwordForm.value.newPassword);
    });

    const passwordHasSpecial = computed(() => {
      return /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.value.newPassword);
    });

    const passwordValid = computed(() => {
      return passwordMeetsLength.value && 
             passwordHasUppercase.value && 
             passwordHasLowercase.value && 
             passwordHasNumber.value && 
             passwordHasSpecial.value &&
             passwordForm.value.newPassword === passwordForm.value.confirmPassword;
    });

    // Notification options
    const notificationOptions = ref([
      {
        title: 'Event Notifications',
        description: 'Receive notifications about upcoming events and activities',
        enabled: true
      },
      {
        title: 'Announcements',
        description: 'Get notified when new announcements are made',
        enabled: true
      },
      {
        title: 'Messages',
        description: 'Receive notifications for new messages',
        enabled: true
      },
      {
        title: 'Resource Updates',
        description: 'Get notified about changes to your resource requests',
        enabled: true
      },
      {
        title: 'Email Notifications',
        description: 'Receive notifications via email',
        enabled: false
      }
    ]);

    // Fetch user data and barangays
    onMounted(async () => {
      await fetchUserProfile();
      await fetchBarangays();
    });

    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          userProfile.value = userDoc.data();
          
          // Ensure children array exists
          if (!userProfile.value.children) {
            userProfile.value.children = [];
          }
        } else {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'User profile not found',
            life: 3000
          });
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user profile: ' + error.message,
          life: 3000
        });
      }
    };
    
    const fetchBarangays = async () => {
      try {
        const barangaysCollection = collection(db, 'barangays');
        const barangaysSnapshot = await getDocs(barangaysCollection);
        
        barangays.value = barangaysSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load barangays: ' + error.message,
          life: 3000
        });
      }
    };

    // Form submission handlers
    const savePersonalInfo = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          firstName: userProfile.value.firstName,
          middleName: userProfile.value.middleName,
          lastName: userProfile.value.lastName,
          nameExt: userProfile.value.nameExt,
          fbName: userProfile.value.fbName,
          contactNumber: userProfile.value.contactNumber,
          dateOfBirth: userProfile.value.dateOfBirth,
          birthplace: userProfile.value.birthplace,
          gender: userProfile.value.gender,
          // barangay is not included here as it should not be editable
          address: userProfile.value.address,
          updatedAt: new Date(),
          updatedBy: user.uid
        });
        
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Personal information updated successfully',
          life: 3000
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update profile: ' + error.message,
          life: 3000
        });
      }
    };

    const saveSoloParentInfo = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          soloParentReason: userProfile.value.soloParentReason,
          children: userProfile.value.children,
          updatedAt: new Date(),
          updatedBy: user.uid
        });
        
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Solo parent details updated successfully',
          life: 3000
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update solo parent details: ' + error.message,
          life: 3000
        });
      }
    };

    const changePassword = async () => {
      if (!passwordValid.value) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please make sure your new password meets all requirements and matches the confirmation',
          life: 3000
        });
        return;
      }
      
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Re-authenticate user before changing password
        const credential = EmailAuthProvider.credential(
          user.email,
          passwordForm.value.currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, passwordForm.value.newPassword);
        
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed successfully',
          life: 3000
        });
        
        // Reset the form
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        let errorMessage = 'Failed to change password';
        
        if (error.code === 'auth/wrong-password') {
          errorMessage = 'Current password is incorrect';
        } else if (error.code === 'auth/requires-recent-login') {
          errorMessage = 'Please log in again before changing your password';
        }
        
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 3000
        });
      }
    };

    const saveNotificationSettings = () => {
      // In a real app, this would save notification preferences to the database
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Notification settings updated successfully',
        life: 3000
      });
    };

    // Child management functions
    const addChild = () => {
      editingChildIndex.value = -1;
      editingChild.value = { name: '', age: 0 };
      showChildModal.value = true;
    };

    const editChild = (index) => {
      editingChildIndex.value = index;
      editingChild.value = { ...userProfile.value.children[index] };
      showChildModal.value = true;
    };
    
    const removeChild = (index) => {
      userProfile.value.children.splice(index, 1);
      toast.add({
        severity: 'info',
        summary: 'Child Removed',
        detail: 'Child has been removed from your profile',
        life: 3000
      });
    };
    
    const saveChild = () => {
      if (!editingChild.value.name) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Child name is required',
          life: 3000
        });
        return;
      }
      
      if (isNewChild.value) {
        userProfile.value.children.push({ ...editingChild.value });
      } else {
        userProfile.value.children[editingChildIndex.value] = { ...editingChild.value };
      }
      
      closeChildModal();
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Child ${isNewChild.value ? 'added' : 'updated'} successfully`,
        life: 3000
      });
    };
    
    const closeChildModal = () => {
      showChildModal.value = false;
      editingChildIndex.value = -1;
      editingChild.value = { name: '', age: 0 };
    };

    // Helper functions
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return {
      toast,
      userStore,
      db,
      auth,
      tabs,
      activeTab,
      barangays,
      userProfile,
      showChildModal,
      editingChildIndex,
      editingChild,
      isNewChild,
      passwordForm,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordMeetsLength,
      passwordHasUppercase,
      passwordHasLowercase,
      passwordHasNumber,
      passwordHasSpecial,
      passwordValid,
      notificationOptions,
      fetchUserProfile,
      fetchBarangays,
      savePersonalInfo,
      saveSoloParentInfo,
      changePassword,
      saveNotificationSettings,
      addChild,
      editChild,
      removeChild,
      saveChild,
      closeChildModal,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-header {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(135deg, #8528d8, #a755ff);
}

.profile-avatar-container {
  position: relative;
  margin-top: 50px;
  z-index: 2;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  background-color: #f0f0f0;
  object-fit: cover;
}

.change-photo-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #8528d8;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.profile-name {
  margin-top: 8px;
  text-align: center;
}

.profile-name h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.profile-name p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
}

.settings-container {
  display: flex;
  gap: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs {
  width: 240px;
  background-color: #f9f9f9;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.tab-button:hover {
  background-color: rgba(133, 40, 216, 0.05);
  color: #8528d8;
}

.tab-button.active {
  background-color: rgba(133, 40, 216, 0.1);
  color: #8528d8;
  border-left-color: #8528d8;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-content {
  flex: 1;
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 14px;
  color: #333;
}

input, select, textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: #8528d8;
}

input[readonly], select[readonly], textarea[readonly] {
  background-color: #f9f9f9;
  cursor: default;
}

.readonly-field {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #666;
  cursor: not-allowed;
}

.field-note {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 32px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.toggle-password:hover {
  color: #8528d8;
}

.password-requirements {
  margin-top: 16px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.password-requirements p {
  margin: 0 0 8px 0;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.password-requirements ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #666;
}

.password-requirements li {
  margin-bottom: 4px;
}

.password-requirements li.met {
  color: #4CAF50;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.btn-cancel {
  padding: 10px 16px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.btn-save {
  padding: 10px 16px;
  background-color: #8528d8;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: #7020c0;
}

.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.child-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.child-details h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.child-details p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
}

.child-actions {
  display: flex;
  gap: 8px;
}

.btn-edit-small, .btn-delete-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-edit-small {
  border: 1px solid #8528d8;
  color: #8528d8;
}

.btn-delete-small {
  border: 1px solid #dc3545;
  color: #dc3545;
}

.btn-edit-small:hover {
  background-color: rgba(133, 40, 216, 0.1);
}

.btn-delete-small:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.btn-add-child {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background-color: transparent;
  border: 1px dashed #8528d8;
  border-radius: 8px;
  color: #8528d8;
  font-size: 14px;
  cursor: pointer;
}

.btn-add-child:hover {
  background-color: rgba(133, 40, 216, 0.05);
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.notification-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.option-details h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.option-details p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
}

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #8528d8;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.icon-sm {
  width: 16px;
  height: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }
  
  .tabs {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 16px;
  }
  
  .tab-button {
    border-left: none;
    border-bottom: 3px solid transparent;
    padding: 8px 16px;
  }
  
  .tab-button.active {
    border-left-color: transparent;
    border-bottom-color: #8528d8;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>