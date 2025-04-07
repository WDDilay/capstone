<template>
  <div class="login-container">
    <button class="back-button" @click="goToHome">
      <i class="pi pi-arrow-left"></i>
    </button>

    <div class="login-form-container">
      <h1 class="welcome-container">
        <img src="@/assets/SPFLOGO.png" alt="Logo" class="logo-img" />
        Application Form
      </h1>
      <p class="subtitle">Please complete all required information to register as a solo parent</p>
      
      <form @submit.prevent="handleRegistration" class="login-form">
        <!-- Name Information Group -->
        <div class="form-section">
          <div class="name-fields-container">
            <div class="name-field">
              <label for="lastName" class="form-label">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                v-model="formData.lastName" 
                placeholder="Enter your last name"
                required
              >
            </div>

            <div class="name-field">
              <label for="firstName" class="form-label">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="formData.firstName" 
                placeholder="Enter your first name"
                required
              >
            </div>
            
            <div class="name-field">
              <label for="middleName" class="form-label">Middle Name</label>
              <input 
                type="text" 
                id="middleName" 
                v-model="formData.middleName" 
                placeholder="Enter your middle name"
              >
            </div>
            
            <div class="name-field name-ext">
              <label for="nameExt" class="form-label">Name Ext</label>
              <select id="nameExt" v-model="formData.nameExt">
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
          </div>
        </div>
        
        <!-- Personal Information Group -->
        <div class="form-section">
          <div class="form-group-row">
            <div class="form-group">
              <label class="form-label">Gender</label>
              <div class="gender-options">
                <div class="gender-option">
                  <input 
                    type="radio" 
                    id="male" 
                    value="Male" 
                    v-model="formData.gender"
                    required
                  >
                  <label for="male">Male</label>
                </div>
                <div class="gender-option">
                  <input 
                    type="radio" 
                    id="female" 
                    value="Female" 
                    v-model="formData.gender"
                    required
                  >
                  <label for="female">Female</label>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="dateOfBirth" class="form-label">Date of Birth</label>
              <input 
                type="date" 
                id="dateOfBirth" 
                v-model="formData.dateOfBirth"
                @change="calculateAge"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="age" class="form-label">Age</label>
              <input 
                type="number" 
                id="age" 
                v-model="formData.age" 
                readonly
                placeholder="Auto-calculated"
              >
            </div>
            
            <div class="form-group">
              <label for="birthplace" class="form-label">Birthplace</label>
              <input 
                type="text" 
                id="birthplace" 
                v-model="formData.birthplace" 
                placeholder="City/Municipality of birth"
                required
              >
            </div>
          </div>
        </div>
        
        <!-- Address Information Group -->
        <div class="form-section">
          <div class="form-group-row">
            <div class="form-group">
              <label for="address" class="form-label">Address</label>
              <input 
                type="text" 
                id="address" 
                v-model="formData.address" 
                placeholder="House/Lot/Blk No., Street, Subdivision"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="barangay" class="form-label">Barangay</label>
              <div v-if="loadingBarangays" class="loading-indicator">
                <i class="pi pi-spin pi-spinner"></i> Loading barangays...
              </div>
              <select 
                v-else
                id="barangay" 
                v-model="formData.barangay"
                required
              >
                <option value="" disabled selected>Select barangay</option>
                <option v-for="brgy in barangays" :key="brgy.id" :value="brgy.name">
                  {{ brgy.name }}
                </option>
              </select>
              <p v-if="barangayError" class="error-message">{{ barangayError }}</p>
            </div>
          </div>
        </div>
        
        <!-- Contact Information Group -->
        <div class="form-section">
          <div class="form-group-row">
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <input 
                type="email" 
                id="email" 
                v-model="formData.email" 
                placeholder="Enter your email address"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="contactNumber" class="form-label">Contact Number</label>
              <input 
                type="text" 
                id="contactNumber" 
                v-model="formData.contactNumber" 
                placeholder="Enter your contact number"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="fbName" class="form-label">Facebook Name</label>
              <input 
                type="text" 
                id="fbName" 
                v-model="formData.fbName" 
                placeholder="Enter your Facebook name"
              >
            </div>
          </div>
        </div>
        
        <!-- Solo Parent Reason Group -->
        <div class="form-section">
          <div class="form-group">
            <label for="soloParentReason" class="form-label">Solo Parent Due To</label>
            <select 
              id="soloParentReason" 
              v-model="formData.soloParentReason"
              required
            >
              <option value="" disabled selected>Select reason</option>
              <option value="separated">Separated</option>
              <option value="widow">Widow/Widower</option>
              <option value="annulled">Annulled</option>
              <option value="ofw">OFW Partner</option>
              <option value="custody">Child Custody (CSWD Approved)</option>
              <option value="imprisoned">Imprisoned Spouse</option>
            </select>
          </div>
        </div>
        
        <!-- Children Information Group -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">Child's Name</label>
            <div v-for="(child, index) in children" :key="index" class="child-info">
              <div class="child-row">
                <div class="child-name-input">
                  <input 
                    type="text" 
                    :id="`childName${index}`" 
                    v-model="child.name" 
                    placeholder="Child's name"
                    required
                  >
                </div>
                <div class="child-age-select">
                  <select 
                    :id="`childAge${index}`" 
                    v-model="child.age"
                    required
                  >
                    <option value="" disabled selected>Age</option>
                    <option v-for="age in 18" :key="age" :value="age">{{ age }}</option>
                  </select>
                </div>
                <button 
                  type="button" 
                  class="remove-child-btn" 
                  @click="removeChild(index)"
                  v-if="children.length > 1"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
            <button type="button" class="add-child-btn" @click="addChild">
              <i class="pi pi-plus"></i> Add Another Child
            </button>
          </div>
        </div>
        
        <!-- Attachments Group - Modified for development -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">Attachments for Requirements</label>
            <p class="document-note">Please upload pictures of your requirements (ID, certificates, etc.)</p>
            <p class="development-note">Note: File uploads are temporarily disabled in development mode. This feature will be available in production.</p>
            
            <div v-for="(attachment, index) in attachments" :key="index" class="attachment-item">
              <div class="attachment-row">
                <div class="attachment-name">
                  <input 
                    type="text" 
                    :id="`attachmentName${index}`" 
                    v-model="attachment.name" 
                    placeholder="Document name/description"
                    required
                  >
                </div>
                <div class="attachment-file">
                  <input 
                    type="file" 
                    :id="`attachmentFile${index}`" 
                    @change="(e) => handleAttachmentChange(e, index)"
                    accept="image/*"
                  >
                </div>
                <button 
                  type="button" 
                  class="remove-attachment-btn" 
                  @click="removeAttachment(index)"
                  v-if="attachments.length > 1"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
              <div v-if="attachment.preview" class="attachment-preview">
                <img :src="attachment.preview" alt="Preview" class="preview-image" />
              </div>
            </div>
            
            <button type="button" class="add-child-btn" @click="addAttachment">
              <i class="pi pi-plus"></i> Add Another Attachment
            </button>
          </div>
          
          <!-- Conditional documents based on solo parent reason -->
          <div v-if="formData.soloParentReason" class="specific-documents">
            <h4 class="documents-subtitle">Required Documents Based on Status</h4>
            
            <!-- Sworn Affidavit of Barangay - Required for all -->
            <div class="form-group">
              <label for="barangayAffidavit" class="form-label">Sworn Affidavit of Barangay</label>
              <div class="file-input-container">
                <input 
                  type="file" 
                  id="barangayAffidavit" 
                  @change="handleFileChange($event, 'barangayAffidavit')"
                >
                <i class="pi pi-upload"></i>
              </div>
            </div>
            
            <div v-if="formData.soloParentReason === 'separated'" class="form-group">
              <label for="marriageCertificate" class="form-label">Marriage Certificate</label>
              <div class="file-input-container">
                <input 
                  type="file" 
                  id="marriageCertificate" 
                  @change="handleFileChange($event, 'marriageCertificate')"
                >
                <i class="pi pi-upload"></i>
              </div>
            </div>
            
            <div v-if="formData.soloParentReason === 'widow'" class="form-group">
              <label for="deathCertificate" class="form-label">Death Certificate</label>
              <div class="file-input-container">
                <input 
                  type="file" 
                  id="deathCertificate" 
                  @change="handleFileChange($event, 'deathCertificate')"
                >
                <i class="pi pi-upload"></i>
              </div>
            </div>
            
            <div v-if="formData.soloParentReason === 'custody'" class="form-group">
              <label for="custodyDocument" class="form-label">CSWD Custody Approval Document</label>
              <div class="file-input-container">
                <input 
                  type="file" 
                  id="custodyDocument" 
                  @change="handleFileChange($event, 'custodyDocument')"
                >
                <i class="pi pi-upload"></i>
              </div>
            </div>
            
            <div v-if="formData.soloParentReason === 'imprisoned'" class="form-group">
              <label for="imprisonmentDocument" class="form-label">Imprisonment Document</label>
              <div class="file-input-container">
                <input 
                  type="file" 
                  id="imprisonmentDocument" 
                  @change="handleFileChange($event, 'imprisonmentDocument')"
                >
                <i class="pi pi-upload"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Password Group -->
        <div class="form-section">
          <div class="form-group-row">
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="password-input-container">
                <input 
                  :type="showPassword ? 'text' : 'password'"
                  id="password" 
                  v-model="password" 
                  placeholder="Enter your password"
                  required
                >
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="togglePassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <i v-if="!showPassword" class="pi pi-eye"></i>
                  <i v-else class="pi pi-eye-slash"></i>
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label for="verifyPassword" class="form-label">Verify Password</label>
              <div class="password-input-container">
                <input 
                  :type="showVerifyPassword ? 'text' : 'password'"
                  id="verifyPassword" 
                  v-model="verifyPassword" 
                  placeholder="Confirm your password"
                  required
                >
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="toggleVerifyPassword"
                  :aria-label="showVerifyPassword ? 'Hide password' : 'Show password'"
                >
                  <i v-if="!showVerifyPassword" class="pi pi-eye"></i>
                  <i v-else class="pi pi-eye-slash"></i>
                </button>
              </div>
              <p v-if="passwordMismatch" class="error-message">Passwords do not match</p>
            </div>
          </div>
        </div>
        
        <Button type="submit" label="Submit Application" class="login-button" :disabled="passwordMismatch || isSubmitting" />
        
        <div v-if="isSubmitting" class="loading-overlay">
          <div class="spinner"></div>
          <p>Processing your application...</p>
        </div>
        
        <div class="form-footer">
          <p class="signup-prompt">
            Already have an account? <a href="#" class="signup-link" @click="goToLogin">Log In</a>
          </p>
        </div>
      </form>
    </div>
    
    <!-- Email Verification Dialog -->
    <Dialog 
      v-model:visible="showVerificationDialog" 
      header="Email Verification Required" 
      :closable="false"
      :modal="true"
      :style="{ width: '90%', maxWidth: '500px' }"
    >
      <div class="verification-content">
        <i class="pi pi-envelope verification-icon"></i>
        <p>A verification email has been sent to <strong>{{ formData.email }}</strong>.</p>
        <p>Please check your inbox and click the verification link to complete your registration.</p>
        <p class="verification-note">If you don't see the email, check your spam folder.</p>
        <div class="reference-code-container" v-if="referenceCode">
          <p class="reference-code-label">Your application reference code:</p>
          <div class="reference-code">{{ referenceCode }}</div>
          <p class="reference-code-note">Please save this code for future reference.</p>
        </div>
      </div>
      <template #footer>
        <div class="verification-actions">
          <Button label="Resend Email" @click="resendVerificationEmail" class="p-button-outlined" />
          <Button label="I've Verified" @click="checkVerificationStatus" class="p-button-primary" />
          <Button label="Go to Login" @click="goToLogin" class="p-button-secondary" />
        </div>
      </template>
    </Dialog>
    
    <!-- Success Dialog -->
    <Dialog 
      v-model:visible="showSuccessDialog" 
      header="Application Successful!" 
      :closable="true"
      :modal="true"
      :style="{ width: '90%', maxWidth: '500px' }"
    >
      <div class="success-content">
        <i class="pi pi-check-circle success-icon"></i>
        <h3>Congratulations!</h3>
        <p>You have successfully applied for Solo Parent membership.</p>
        <div class="reference-code-container">
          <p class="reference-code-label">Your application reference code:</p>
          <div class="reference-code">{{ referenceCode }}</div>
          <p class="reference-code-note">Please save this code for future reference.</p>
        </div>
      </div>
      <template #footer>
        <div class="success-actions">
          <Button label="Go to Login" @click="goToLogin" class="p-button-primary" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { auth, db } from '@/services/firebase'; // Removed storage import
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs,
  serverTimestamp
} from "firebase/firestore";

const router = useRouter();
const toast = useToast();
const showPassword = ref(false);
const showVerifyPassword = ref(false);
const password = ref('');
const verifyPassword = ref('');
const barangays = ref([]);
const loadingBarangays = ref(true);
const barangayError = ref('');
const isSubmitting = ref(false);
const showVerificationDialog = ref(false);
const showSuccessDialog = ref(false);
const referenceCode = ref('');
const currentUser = ref(null);
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

const passwordMismatch = computed(() => {
  if (password.value && verifyPassword.value) {
    return password.value !== verifyPassword.value;
  }
  return false;
});

const formData = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  nameExt: '',
  dateOfBirth: '',
  age: '',
  birthplace: '',
  gender: '',
  address: '',
  barangay: '',
  email: '',
  contactNumber: '',
  fbName: '',
  soloParentReason: '',
});

// Generate a unique reference code
const generateReferenceCode = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const nameCode = formData.lastName.substring(0, 2).toUpperCase();
  return `SP-${nameCode}${timestamp}-${random}`;
};

// Fetch barangays from Firebase
const fetchBarangays = async () => {
  loadingBarangays.value = true;
  barangayError.value = '';
  
  try {
    const barangaysCollection = collection(db, "barangays");
    const barangaysSnapshot = await getDocs(barangaysCollection);
    
    const barangaysList = [];
    barangaysSnapshot.forEach((doc) => {
      barangaysList.push({
        id: doc.id,
        name: doc.data().name
      });
    });
    
    // Sort barangays alphabetically
    barangaysList.sort((a, b) => a.name.localeCompare(b.name));
    
    barangays.value = barangaysList;
  } catch (error) {
    console.error("Error fetching barangays:", error);
    barangayError.value = "Failed to load barangays. Please try again later.";
  } finally {
    loadingBarangays.value = false;
  }
};

// Fetch barangays when component mounts
onMounted(() => {
  fetchBarangays();
});

// Calculate age based on date of birth
const calculateAge = () => {
  if (formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    formData.age = age;
  }
};

// Children array with name and age
const children = reactive([
  { name: '', age: '' }
]);

const addChild = () => {
  children.push({ name: '', age: '' });
};

const removeChild = (index) => {
  if (children.length > 1) {
    children.splice(index, 1);
  }
};

// Attachments array
const attachments = reactive([
  { name: '', file: null, preview: null }
]);

const addAttachment = () => {
  attachments.push({ name: '', file: null, preview: null });
};

const removeAttachment = (index) => {
  if (attachments.length > 1) {
    attachments.splice(index, 1);
  }
};

const handleAttachmentChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    attachments[index].file = file;
    
    // Create a preview for the image
    const reader = new FileReader();
    reader.onload = (e) => {
      attachments[index].preview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const files = reactive({
  barangayAffidavit: null,
  marriageCertificate: null,
  deathCertificate: null,
  custodyDocument: null,
  imprisonmentDocument: null,
});

const handleFileChange = (event, fileType) => {
  files[fileType] = event.target.files[0];
};

// Mock file upload for development environment
const mockUploadFile = async (file) => {
  if (!file) return null;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a mock URL
  return `mock-file-url-${Date.now()}`;
};

// Mock upload all attachments for development
const mockUploadAttachments = async () => {
  const attachmentUrls = [];
  const specificDocuments = {};
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create mock data for attachments
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    if (attachment.file && attachment.name) {
      attachmentUrls.push({
        name: attachment.name,
        url: `mock-attachment-url-${i}-${Date.now()}`
      });
    }
  }
  
  // Create mock data for specific documents
  if (files.barangayAffidavit) {
    specificDocuments.barangayAffidavit = `mock-barangay-affidavit-${Date.now()}`;
  }
  
  if (formData.soloParentReason === 'separated' && files.marriageCertificate) {
    specificDocuments.marriageCertificate = `mock-marriage-certificate-${Date.now()}`;
  }
  
  if (formData.soloParentReason === 'widow' && files.deathCertificate) {
    specificDocuments.deathCertificate = `mock-death-certificate-${Date.now()}`;
  }
  
  if (formData.soloParentReason === 'custody' && files.custodyDocument) {
    specificDocuments.custodyDocument = `mock-custody-document-${Date.now()}`;
  }
  
  if (formData.soloParentReason === 'imprisoned' && files.imprisonmentDocument) {
    specificDocuments.imprisonmentDocument = `mock-imprisonment-document-${Date.now()}`;
  }
  
  return {
    attachments: attachmentUrls,
    documents: specificDocuments
  };
};

// Send verification email
const sendVerificationEmailToUser = async (user) => {
  if (!user) {
    console.error('User is undefined, cannot send verification email');
    return false;
  }
  
  try {
    await sendEmailVerification(user);
    console.log("Verification email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

// Resend verification email
const resendVerificationEmail = async () => {
  try {
    if (!currentUser.value) {
      // Sign in again to get the current user
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, password.value);
      currentUser.value = userCredential.user;
    }
    
    await sendEmailVerification(currentUser.value);
    toast.add({ severity: 'success', summary: 'Email Sent', detail: 'Verification email has been resent', life: 3000 });
  } catch (error) {
    console.error("Error resending verification email:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to resend verification email', life: 3000 });
  }
};

// Check if user has verified their email
const checkVerificationStatus = async () => {
  try {
    // Sign out and sign in again to refresh the user's auth state
    await signOut(auth);
    const userCredential = await signInWithEmailAndPassword(auth, formData.email, password.value);
    const user = userCredential.user;
    currentUser.value = user;
    
    // Force refresh the token to get the latest emailVerified status
    await user.reload();
    
    if (user.emailVerified) {
      try {
        // Update the application status in Firestore
        await setDoc(doc(db, "applications", user.uid), {
          emailVerified: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        showVerificationDialog.value = false;
        showSuccessDialog.value = true;
      } catch (firestoreError) {
        console.error("Error updating Firestore:", firestoreError);
        // Still show success even if Firestore update fails
        showVerificationDialog.value = false;
        showSuccessDialog.value = true;
      }
    } else {
      toast.add({ severity: 'warn', summary: 'Not Verified', detail: 'Your email is not verified yet. Please check your inbox.', life: 3000 });
    }
  } catch (error) {
    console.error("Error checking verification status:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to check verification status', life: 3000 });
  }
};

const handleRegistration = async () => {
  if (passwordMismatch.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 });
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    console.log("Starting registration process...");
    
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password.value);
    const user = userCredential.user;
    currentUser.value = user;
    console.log("User created in Authentication:", user.uid);
    
    // Generate reference code
    referenceCode.value = generateReferenceCode();
    console.log("Generated reference code:", referenceCode.value);
    
    // 2. Handle file uploads (mock in development)
    console.log("Processing attachments and documents...");
    let uploadResults = { attachments: [], documents: {} };
    
    // Use mock uploads in development to avoid CORS issues
    uploadResults = await mockUploadAttachments();
    console.log("Upload results:", uploadResults);
    
    // 3. Save application data to Firestore with user.uid as document ID
    try {
      console.log("Saving application data to Firestore...");
      await setDoc(doc(db, "applications", user.uid), {
        userId: user.uid,
        referenceCode: referenceCode.value,
        lastName: formData.lastName,
        firstName: formData.firstName,
        middleName: formData.middleName,
        nameExt: formData.nameExt,
        dateOfBirth: formData.dateOfBirth,
        age: formData.age,
        birthplace: formData.birthplace,
        gender: formData.gender,
        address: formData.address,
        barangay: formData.barangay,
        email: formData.email,
        contactNumber: formData.contactNumber,
        fbName: formData.fbName,
        children: children,
        soloParentReason: formData.soloParentReason,
        attachments: uploadResults.attachments,
        documents: uploadResults.documents,
        status: "Pending", // Default status for new applications
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false
      });
      console.log("Application data saved to Firestore");
    } catch (firestoreError) {
      console.error("Error saving to Firestore:", firestoreError);
      // Continue with the process even if Firestore save fails
    }
    
    // 4. Also save user data to users collection
    try {
      console.log("Saving user data to Firestore...");
      await setDoc(doc(db, "users", user.uid), {
        lastName: formData.lastName,
        firstName: formData.firstName,
        email: formData.email,
        role: "Applicant", // Default role for new registrations
        referenceCode: referenceCode.value,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("User data saved to Firestore");
    } catch (userSaveError) {
      console.error("Error saving user data:", userSaveError);
      // Continue with the process even if user data save fails
    }
    
    // 5. Send verification email
    console.log("Sending verification email...");
    await sendVerificationEmailToUser(user);
    
    // 6. Show verification dialog
    showVerificationDialog.value = true;
    
    console.log("Registration process completed successfully");
    
  } catch (error) {
    console.error("Registration Error:", error.code, error.message);
    let errorMessage = "Registration failed. Please try again.";
    
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered. Please use a different email or try logging in.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Please use a stronger password.";
    }
    
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
  } finally {
    isSubmitting.value = false;
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleVerifyPassword = () => {
  showVerifyPassword.value = !showVerifyPassword.value;
};

const goToHome = () => {
  router.push('/');
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: #f0e6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  padding: 2rem 1rem;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}

.back-button:hover {
  color: #8b3dff;
}

.login-form-container {
  max-width: 800px;
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #333;
  text-align: center;
  margin-bottom: 0.5rem;
}

.logo-img {
  width: 60px;
  height: 60px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.development-note {
  background-color: #fff3cd;
  color: #856404;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #ffeeba;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

/* Name fields specific styling */
.name-fields-container {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 10px 0;
  margin: -10px -10px 0 -10px;
}

.name-field {
  display: table-cell;
  vertical-align: top;
}

.name-field.name-ext {
  width: 100px;
}

.form-group-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.form-group-row .form-group {
  flex: 1 1 200px;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #333;
  text-align: left;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #8b3dff;
  box-shadow: 0 0 0 2px rgba(139, 61, 255, 0.1);
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.gender-options {
  display: flex;
  gap: 2rem;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Children section styles */
.child-info {
  margin-bottom: 0.75rem;
}

.child-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.child-name-input {
  flex: 3;
}

.child-age-select {
  flex: 1;
}

.add-child-btn {
  background: #f0e6ff;
  color: #8b3dff;
  border: 1px dashed #8b3dff;
  border-radius: 4px;
  padding: 0.5rem;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.add-child-btn:hover {
  background: #e6d9ff;
}

.remove-child-btn {
  background: none;
  border: none;
  color: #ff3d3d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.remove-child-btn:hover {
  color: #ff0000;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
}

.toggle-password:hover {
  color: #8b3dff;
}

.toggle-password i {
  font-size: 1.2rem;
}

.error-message {
  color: #ff3d3d;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.document-note {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.documents-subtitle {
  font-weight: 500;
  color: #8b3dff;
  margin: 1rem 0;
}

.specific-documents {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e0d0ff;
}

.login-button {
  background: #8b3dff;
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1rem;
  padding: 1rem !important;
  width: 100%;
  max-width: 250px;
  margin: 1.5rem auto 0;
  display: block;
}

.login-button:hover {
  background: #6e00ff;
}

.login-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.signup-prompt {
  color: #666;
  margin: 0;
}

.signup-link {
  color: #8b3dff;
  text-decoration: none;
  font-weight: 500;
}

.file-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-input-container i {
  color: #666;
}

.attachment-item {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
}

.attachment-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.attachment-name {
  flex: 1;
}

.attachment-file {
  flex: 2;
}

.attachment-preview {
  margin-top: 0.5rem;
  max-width: 200px;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-attachment-btn {
  background: none;
  border: none;
  color: #ff3d3d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.remove-attachment-btn:hover {
  color: #ff0000;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Verification Dialog Styles */
.verification-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.verification-icon {
  font-size: 3rem;
  color: #8b3dff;
  margin-bottom: 1rem;
}

.verification-note {
  font-style: italic;
  color: #666;
  margin-top: 1rem;
}

.verification-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Success Dialog Styles */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.success-icon {
  font-size: 3rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.success-actions {
  display: flex;
  justify-content: center;
}

/* Reference Code Styles */
.reference-code-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  width: 100%;
  text-align: center;
}

.reference-code-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.reference-code {
  font-size: 1.5rem;
  font-weight: 700;
  color: #8b3dff;
  padding: 0.5rem;
  background: #f0e6ff;
  border-radius: 4px;
  border: 1px dashed #8b3dff;
  margin: 0.5rem 0;
  letter-spacing: 1px;
}

.reference-code-note {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .login-form-container {
    margin: 1rem;
    padding: 1rem;
    max-width: 100%;
  }
  
  .form-section {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }
  
  .name-fields-container {
    display: flex;
    flex-direction: column;
    margin: 0;
    border-spacing: 0;
    gap: 0.5rem;
  }
  
  .name-field {
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
    padding: 0;
  }
  
  .name-field.name-ext {
    width: 100%;
  }
  
  .form-group-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group {
    width: 100%;
    margin-bottom: 0.5rem;
    gap: 0.25rem;
  }
  
  .gender-options {
    flex-direction: row;
    gap: 2rem;
    margin-top: 0.25rem;
  }
  
  .child-row {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  .child-info {
    margin-bottom: 0.5rem;
  }
  
  .child-name-input,
  .child-age-select {
    width: 100%;
  }
  
  .remove-child-btn {
    align-self: flex-end;
    margin-top: 0.25rem;
  }
  
  .attachment-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .attachment-name,
  .attachment-file {
    width: 100%;
  }
  
  .attachment-preview {
    max-width: 100%;
    margin-top: 0.5rem;
  }
  
  .form-label {
    margin-bottom: 0.25rem;
  }
  
  input, select {
    width: 100%;
    padding: 0.6rem;
  }
  
  .welcome-container {
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .logo-img {
    margin-bottom: 0.25rem;
  }
  
  .subtitle {
    margin-bottom: 1rem;
  }
  
  .add-child-btn {
    margin-top: 0.25rem;
  }
  
  .attachment-item {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
  }
  
  .specific-documents {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }
  
  .documents-subtitle {
    margin: 0.5rem 0;
  }
  
  .login-button {
    margin: 1rem auto 0;
  }
  
  .verification-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .reference-code {
    font-size: 1.2rem;
    word-break: break-all;
  }
}

/* Add a smaller screen breakpoint for very small devices */
@media (max-width: 480px) {
  .login-form-container {
    padding: 0.75rem;
  }
  
  .gender-options {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .login-button {
    max-width: 100%;
    padding: 0.75rem !important;
  }
}
</style>