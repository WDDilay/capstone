<template>
  <div class="login-container">
    <!-- Fixed background -->
    <div class="fixed-background"></div>
    
    <!-- Content wrapper -->
    <div class="content-wrapper">
      <button class="back-button" @click="goToHome">
        <i class="pi pi-arrow-left"></i>
      </button>

      <Header />

      <div class="login-form-container">
        <h1 class="welcome-container">
          <img src="@/assets/SPFLOGO.png" alt="Logo" class="logo-img" />
          Login
        </h1>
        <p class="subtitle">Join our community and access the support you need</p>
        
        <form @submit.prevent="handleLogin" class="login-form">
          
          <!-- Email Input -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-container">
              <i class="pi pi-envelope input-icon"></i>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                placeholder="Enter your email"
                required
              >
            </div>
          </div>
          
          <!-- Password Input -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-container">
              <i class="pi pi-lock input-icon"></i>
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

          <Button 
            type="submit" 
            label="Log In" 
            class="login-button" 
            :pt="{
              root: 'custom-login-button'
            }"
          />

          <div class="form-footer">
            <a href="#" class="forgot-password">Forgot Password?</a>
            <p class="signup-prompt">
              Don't have an account? <a href="#" class="signup-link" @click="goToSignup">Sign Up</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { auth, db, signInWithEmailAndPassword } from '@/services/firebase';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useUserStore } from '@/stores/user';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const toast = useToast();

const userStore = useUserStore(); // Access Pinia store

const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    console.log("✅ User Logged In:", user.uid); // Debugging

    let userData = null;
    let userRole = null;
    let userBarangay = null;

    // Check in "admins" collection
    const adminDocRef = doc(db, "admins", user.uid);
    const adminDocSnap = await getDoc(adminDocRef);

    if (adminDocSnap.exists()) {
      userData = adminDocSnap.data();
      userRole = userData.role;
      console.log("🔹 Found in Admins Collection:", userRole);
    } else {
      // Check in "barangay_presidents" collection
      const barangayDocRef = doc(db, "barangay_presidents", user.uid);
      const barangayDocSnap = await getDoc(barangayDocRef);

      if (barangayDocSnap.exists()) {
        userData = barangayDocSnap.data();
        userRole = userData.role;
        userBarangay = userData.barangay; // Get the barangay information
        console.log("🔹 Found in Barangay Presidents Collection:", userRole, "Barangay:", userBarangay);
      } else {
        // Check in "users" collection
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          userData = userDocSnap.data();
          userRole = userData.role;
          console.log("🔹 Found in Users Collection:", userRole);
        }
      }
    }

    if (userData && userRole) {
      // Store user data including barangay if available
      userStore.setUser({ 
        uid: user.uid, 
        ...userData,
        // Make sure barangay is included in the user store if it exists
        ...(userBarangay && { barangay: userBarangay })
      });

      // ✅ Redirect based on role
      switch (userRole) {
        case "FederationPresident":
          router.replace('/super-admin');
          break;
        case "BarangayPresident":
          // Pass the barangay as a query parameter to filter data on the admin page
          router.replace({
            path: '/barangay-admin',
            query: { barangay: userBarangay }
          });
          break;
        default:
          router.replace('/user-dashboard'); // Redirect general users
          break;
      }
    } else {
      console.error("❌ Error: User role not found.");
      toast.add({ severity: 'error', summary: 'Error', detail: 'User role not found.', life: 3000 });
    }
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    toast.add({ severity: 'error', summary: 'Login Failed', detail: error.message, life: 3000 });
  }
};

const goToSignup = () => {
  router.push('/register');
};

const goToHome = () => {
  router.push('/');
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden; /* Prevents scrolling */
}

/* Fixed background that cannot move */
.fixed-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #f0e6ff;
  z-index: -1; /* Behind all content */
}

/* Content wrapper */
.content-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 1;
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
  z-index: 10;
}

.back-button:hover {
  color: #8b3dff;
}

.login-form-container {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 5;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  color: #333;
  text-align: left;
}

/* 🔹 Input container for icon alignment */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

/* 🔹 Input field */
input {
  padding: 0.75rem;
  padding-left: 2.5rem; /* Space for the icon */
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

/* 🔹 Icon inside input */
.input-icon {
  position: absolute;
  left: 10px;
  color: #666;
  font-size: 1.2rem;
}

/* 🔹 Password toggle button */
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

.custom-login-button {
  background: #8b3dff !important;
  color: white !important;
  border: none !important;
  border-radius: 15px !important;
  font-size: 1rem !important;
  padding: 1rem !important;
  width: 100% !important;
  max-width: 200px !important;
  margin: 0 auto !important;
  display: block !important;
  transition: background 0.3s ease-in-out !important;
}

.custom-login-button:hover {
  background: #6e00ff !important;
}

.signup-link {
  color: #8b3dff;
  text-decoration: none;
  font-weight: 500;
  transition: text-decoration 0.3s ease-in-out;
}

.signup-link:hover {
  text-decoration: underline;
}

.form-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forgot-password, .signup-link {
  color: #8b3dff;
  text-decoration: none;
  font-weight: 500;
}

@media (max-width: 768px) {
  .login-form-container {
    margin: 2rem 1rem;
  }
}
</style>