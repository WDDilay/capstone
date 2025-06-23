<template>
    <div class="register-container">
      <button class="back-button" @click="goToHome">
        <i class="pi pi-arrow-left"></i>
      </button>
  
      <Header />
  
      <div class="register-form-container">
        <h1 class="welcome-container">
          <img src="@/assets/SPFLOGO.png" alt="Logo" class="logo-img" />
          Register
        </h1>
        <p class="subtitle">Join our community and access the support you need</p>
        
        <form @submit.prevent="handleRegistration" class="register-form">
          
          <!-- Replace the individual name field form-groups with this single row -->
          <div class="form-row">
            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
              <div class="input-container">
                <i class="pi pi-user input-icon"></i>
                <input type="text" id="lastName" v-model="lastName" placeholder="Last name" required>
              </div>
            </div>

            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
              <div class="input-container">
                <i class="pi pi-user input-icon"></i>
                <input type="text" id="firstName" v-model="firstName" placeholder="First name" required>
              </div>
            </div>

            <div class="form-group">
              <label for="middleName" class="form-label">Middle Name</label>
              <div class="input-container">
                <i class="pi pi-user input-icon"></i>
                <input type="text" id="middleName" v-model="middleName" placeholder="Middle name">
              </div>
            </div>

            <div class="form-group">
              <label for="nameExt" class="form-label">Extension</label>
              <div class="input-container">
                <i class="pi pi-user input-icon"></i>
                <select id="nameExt" v-model="nameExt" class="select-input">
                  <option value="">Ext.</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                  <option value="V">V</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="gender" class="form-label">Gender</label>
            <div class="input-container">
              <i class="pi pi-users input-icon"></i>
              <select id="gender" v-model="gender" class="select-input" required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="address" class="form-label">Address</label>
            <div class="input-container">
              <i class="pi pi-map-marker input-icon"></i>
              <input type="text" id="address" v-model="address" placeholder="Enter your address" required>
            </div>
          </div>

          <div class="form-group">
            <label for="barangay" class="form-label">Barangay</label>
            <div class="input-container">
              <i class="pi pi-map input-icon"></i>
              <select id="barangay" v-model="barangay" class="select-input" required :disabled="loadingBarangays">
                <option value="">{{ loadingBarangays ? 'Loading barangays...' : 'Select barangay' }}</option>
                <option v-for="brgy in barangays" :key="brgy.id" :value="brgy.name || brgy.id">
                  {{ brgy.name || brgy.id }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <div class="input-container">
              <i class="pi pi-envelope input-icon"></i>
              <input type="email" id="email" v-model="email" placeholder="Enter your email address" required>
            </div>
          </div>

          <div class="form-group">
            <label for="contactNumber" class="form-label">Contact Number</label>
            <div class="input-container">
              <i class="pi pi-phone input-icon"></i>
              <input type="tel" id="contactNumber" v-model="contactNumber" placeholder="Enter your contact number" required>
            </div>
          </div>

          <div class="form-group">
            <label for="facebookAccount" class="form-label">Facebook Account</label>
            <div class="input-container">
              <i class="pi pi-facebook input-icon"></i>
              <input type="text" id="facebookAccount" v-model="facebookAccount" placeholder="Enter your Facebook username/URL">
            </div>
          </div>
          
          
  
          <Button type="submit" label="Register" class="register-button" />
          
          <div class="form-footer">
            <p class="signup-prompt">Already have an account? <a href="#" class="login-link" @click="goToLogin">Log In</a></p>
          </div>
        </form>
      </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { auth, db } from '@/services/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { addDoc, collection, getDocs } from "firebase/firestore";

const router = useRouter();
const toast = useToast(); // Initialize useToast at the top level

const lastName = ref('');
const firstName = ref('');
const middleName = ref('');
const nameExt = ref('');
const gender = ref('');
const address = ref('');
const barangay = ref('');
const email = ref('');
const contactNumber = ref('');
const facebookAccount = ref('');

const barangays = ref([]);
const loadingBarangays = ref(false);

const fetchBarangays = async () => {
  try {
    loadingBarangays.value = true;
    const barangaysCollection = collection(db, "barangays");
    const barangaysSnapshot = await getDocs(barangaysCollection);
    barangays.value = barangaysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching barangays:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load barangays.', life: 3000 });
  } finally {
    loadingBarangays.value = false;
  }
};

onMounted(() => {
  fetchBarangays();
});

const handleRegistration = async () => {
  try {
    const userData = {
      lastName: lastName.value,
      firstName: firstName.value,
      middleName: middleName.value,
      nameExt: nameExt.value,
      gender: gender.value,
      address: address.value,
      barangay: barangay.value,
      email: email.value,
      contactNumber: contactNumber.value,
      facebookAccount: facebookAccount.value,
      role: "Visitor",
      timestamp: new Date()
    };

    // Save to 'preregistration' collection
    await addDoc(collection(db, "preregistration"), userData);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Registration successful!', life: 3000 });
    router.push('/login');
  } catch (error) {
    console.error("Error saving registration:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Registration failed.', life: 3000 });
  }
};

const goToHome = () => {
  router.push('/');
};

const goToLogin = () => {
  router.push('/login');
};
</script>
  
<style scoped>
/* Layout */
.register-container {
  min-height: 100vh;
  background: #f5f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  padding: 2rem 1rem;
}

/* Back Button */
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #5a5a5a;
  transition: color 0.3s;
}

.back-button:hover {
  color: #8b3dff;
}

/* Form Container */
.register-form-container {
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* Remove max-height and overflow-y */
}

/* Heading */
.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #333;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.logo-img {
  width: 50px;
  height: 50px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

/* Form Groups */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Input Fields */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #777;
  font-size: 1.2rem;
  z-index: 1;
}

input, .select-input {
  padding: 0.8rem;
  padding-left: 2.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  transition: border 0.3s ease-in-out;
  background: white;
}

input:focus, .select-input:focus {
  border-color: #8b3dff;
  outline: none;
}

.select-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Password Toggle */
.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  font-size: 1.2rem;
  z-index: 1;
}

.toggle-password:hover {
  color: #8b3dff;
}

/* Register Button */
.register-button {
  background: #8b3dff !important;
  color: white !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 1rem !important;
  padding: 0.9rem !important;
  width: 100% !important;
  max-width: 200px !important;
  margin: 1.5rem auto !important;
  display: block !important;
  transition: background 0.3s ease-in-out !important;
}

.register-button:hover {
  background: #6e00ff !important;
}

/* Footer */
.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.signup-prompt {
  font-size: 0.9rem;
  color: #666;
}

.login-link {
  color: #8b3dff;
  font-weight: bold;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* Add this new CSS rule for the name row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 0.7fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .register-form-container {
    max-width: 100%;
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .welcome-container {
    font-size: 1.3rem;
  }
  
  .logo-img {
    width: 40px;
    height: 40px;
  }

  .form-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>