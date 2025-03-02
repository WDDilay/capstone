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
          
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <div class="input-container">
              <i class="pi pi-user input-icon"></i>
              <input type="text" id="firstName" v-model="firstName" placeholder="Enter your first name" required>
            </div>
          </div>
  
          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <div class="input-container">
              <i class="pi pi-user input-icon"></i>
              <input type="text" id="lastName" v-model="lastName" placeholder="Enter your last name" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-container">
              <i class="pi pi-envelope input-icon"></i>
              <input type="email" id="email" v-model="email" placeholder="Enter your email" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-container">
              <i class="pi pi-lock input-icon"></i>
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" placeholder="Enter your password" required>
              <button type="button" class="toggle-password" @click="togglePassword">
                <i v-if="!showPassword" class="pi pi-eye"></i>
                <i v-else class="pi pi-eye-slash"></i>
              </button>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { auth, db } from '@/services/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const router = useRouter();
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const toast = useToast();

const handleRegistration = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      role: "Visitor"
    });
    toast.add({ severity: 'success', summary: 'Success', detail: 'Registration successful!', life: 3000 });
    router.push('/login');
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Registration failed.', life: 3000 });
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
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
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

/* Input Fields */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #777;
  font-size: 1.2rem;
}

input {
  padding: 0.8rem;
  padding-left: 2.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  transition: border 0.3s ease-in-out;
}

input:focus {
  border-color: #8b3dff;
  outline: none;
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
  margin: 1rem auto !important;
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
}

.login-link {
  color: #8b3dff;
  font-weight: bold;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
