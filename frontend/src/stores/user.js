import { defineStore } from "pinia";
import { ref, computed, nextTick } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref(null);

  const setUser = (userData) => {
    console.log("Setting user:", userData); // Debugging line
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
        const storedUser = JSON.parse(localStorage.getItem("user"));
        user.value = storedUser;
        console.log("Restored user from localStorage:", storedUser); // Debugging line
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem("user");
      }
    }
  };

  // Initialize the store after component mount
  nextTick(() => {
    initializeStore();
  });

  // Get user role (ensure it's not undefined)
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
