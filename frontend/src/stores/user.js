import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref(null);

  const setUser = (userData) => {
    user.value = userData;
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const clearUser = () => {
    user.value = null;
    localStorage.removeItem("user");
  };

  // Restore user data on refresh or page load
  const initializeStore = () => {
    if (localStorage.getItem("user")) {
      try {
        user.value = JSON.parse(localStorage.getItem("user"));
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem("user");
      }
    }
  };
  
  // Initialize on store creation
  initializeStore();

  // Get user role
  const role = computed(() => user.value?.role || null);
  
  // Check if user is authenticated
  const isAuthenticated = computed(() => user.value !== null);

  return { 
    user, 
    setUser, 
    clearUser,
    role,
    isAuthenticated
  };
});