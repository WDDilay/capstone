<template>
  <header class="fixed top-0 left-0 w-full bg-gradient-to-r from-red-900 to-red-800 text-white shadow-md z-50">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-3">
        <img :src="logo" alt="Logo" class="w-12 h-12 rounded-full border-2 border-amber-300" />
        <div>
          <span class="text-xl font-bold">Solo Parent</span>
          <span class="block text-sm -mt-1">Federation</span>
        </div>
      </router-link>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-6">
        <router-link to="/" class="hover:text-amber-200 transition">Home</router-link>
        <router-link to="/about" class="hover:text-amber-200 transition">About</router-link>

        <!-- Account Dropdown -->
        <div class="relative" ref="dropdownRef">
          <button @click="toggleDropdown" class="flex items-center space-x-1 hover:text-amber-200 transition">
            <span>Account</span>
            <span :class="{'rotate-180': dropdownOpen}" class="transition-transform">&#9662;</span>
          </button>

          <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-36 bg-red-800 shadow-lg rounded-lg overflow-hidden z-50 border border-amber-300">
            <router-link to="/register" class="block px-4 py-2 hover:bg-red-700 hover:text-amber-100 transition">Register</router-link>
            <router-link to="/login" class="block px-4 py-2 hover:bg-red-700 hover:text-amber-100 transition">Login</router-link>
          </div>
        </div>
      </nav>

      <!-- Mobile Menu Button -->
      <button @click="toggleMobileMenu" class="md:hidden text-white hover:text-amber-200 focus:outline-none transition">
        <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
        <X v-else class="h-6 w-6" />
      </button>
    </div>

    <!-- Mobile Navigation -->
    <transition name="slide-fade">
      <div v-if="mobileMenuOpen" class="md:hidden bg-red-800 transition-all duration-300 border-t border-amber-300/30">
        <div class="flex flex-col items-center py-4 space-y-3">
          <router-link to="/" class="hover:text-amber-200 transition">Home</router-link>
          <router-link to="/about" class="hover:text-amber-200 transition">About</router-link>
          <router-link to="/register" class="hover:text-amber-200 transition">Register</router-link>
          <router-link to="/login" class="hover:text-amber-200 transition">Login</router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Menu, X } from 'lucide-vue-next';
import logo from '@/assets/solologo.jpg';

const mobileMenuOpen = ref(false);
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const dropdownOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>

<style>
/* Remove default body margin to eliminate gap */
body {
  margin: 0;
}
</style>