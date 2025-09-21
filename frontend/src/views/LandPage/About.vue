<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Header from '@/components/LandPage/Header.vue';

const team = [
  { 
    name: "Annabel Quitos", 
    role: "Federation President", 
    image: "https://via.placeholder.com/100", 
    description: "Leading the Solo Parent Federation of Calapan with dedication and vision. Committed to advocating for solo parent rights and creating meaningful programs that support families in our community.",
    social: {
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  },
  { 
    name: "Elsie Espiritu", 
    role: "Secretary", 
    image: "https://via.placeholder.com/100", 
    description: "Managing organizational operations and communications for the Solo Parent Federation of Calapan. Ensures smooth coordination of events and maintains vital connections between members and leadership.",
    social: {
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  }
];

// Animation on scroll
const isVisible = ref(false);
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isVisible.value = true;
      }
    });
  });
  
  const sections = document.querySelectorAll('.animate-on-scroll');
  sections.forEach(section => {
    observer.observe(section);
  });
});
</script>

<template>
    <Header />
  <div class="min-h-screen bg-gradient-to-b from-white to-red-50 text-gray-900 flex flex-col items-center relative overflow-hidden">
    <!-- Updated decorative elements to maroon colors -->
    <div class="absolute top-0 left-0 w-64 h-64 bg-red-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-red-300 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"></div>
    <div class="absolute top-1/3 right-10 w-32 h-32 bg-red-400 rounded-full opacity-10"></div>
    
    <!-- Header -->
    <header class="text-center py-16 px-4 relative z-10">
      <div class="animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <!-- Updated gradient colors to maroon -->
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-red-600 drop-shadow-lg">
          About SoloParent
        </h1>
        <p class="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mt-5 leading-relaxed px-4">
          Supporting and empowering solo parents through community connection and resources.
        </p>
        <!-- Updated gradient to maroon -->
        <div class="w-24 h-1 bg-gradient-to-r from-red-400 to-red-600 mx-auto mt-6 rounded-full"></div>
      </div>
    </header>

    <div class="content max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
      <!-- Mission and Values -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20 animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <!-- Updated card colors to maroon and improved responsive spacing -->
        <Card class="p-6 lg:p-8 bg-white shadow-lg border-t-4 border-t-red-600 hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden">
          <template #header>
            <div class="bg-gradient-to-r from-red-700 to-red-500 h-2 w-full absolute top-0 left-0"></div>
          </template>
          <template #title>
            <div class="flex items-center space-x-3 mb-4">
              <div class="bg-red-100 p-3 rounded-full">
                <i class="pi pi-compass text-red-700 text-xl"></i>
              </div>
              <h2 class="text-2xl lg:text-3xl font-bold text-red-800">Our Mission</h2>
            </div>
          </template>
          <template #content>
            <p class="text-gray-700 text-lg lg:text-xl leading-relaxed">
              Creating a supportive and inclusive community for solo parents to thrive, connect, and access valuable resources. We believe in the power of community to transform lives and create opportunities for growth.
            </p>
          </template>
        </Card>

        <Card class="p-6 lg:p-8 bg-white shadow-lg border-t-4 border-t-red-600 hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden">
          <template #header>
            <div class="bg-gradient-to-r from-red-500 to-red-700 h-2 w-full absolute top-0 left-0"></div>
          </template>
          <template #title>
            <div class="flex items-center space-x-3 mb-4">
              <div class="bg-red-100 p-3 rounded-full">
                <i class="pi pi-heart text-red-700 text-xl"></i>
              </div>
              <h2 class="text-2xl lg:text-3xl font-bold text-red-800">Our Values</h2>
            </div>
          </template>
          <template #content>
            <ul class="mt-3 space-y-4 text-gray-700 text-lg lg:text-xl">
              <li class="flex items-center">
                <span class="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">⚖️</span>
                <span>Responsibility - Taking ownership of our actions and commitments to the community</span>
              </li>
              <li class="flex items-center">
                <span class="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">🤝</span>
                <span>Unity - Standing together as one supportive family of solo parents</span>
              </li>
              <li class="flex items-center">
                <span class="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">💝</span>
                <span>Service - Dedicating ourselves to helping others in our community thrive</span>
              </li>
              <li class="flex items-center">
                <span class="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">✨</span>
                <span>Honesty - Building trust through transparent and authentic relationships</span>
              </li>
            </ul>
          </template>
        </Card>
      </div>

      <!-- Our Team Section -->
      <div class="text-center mb-12 lg:mb-16 animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <div class="inline-block relative">
          <!-- Updated text color to maroon -->
          <h2 class="text-3xl lg:text-4xl xl:text-5xl font-bold text-red-800 relative z-10">Our Amazing Team</h2>
          <div class="absolute -bottom-3 left-0 right-0 h-3 bg-red-200 opacity-50 -z-10 transform -rotate-1"></div>
        </div>
        <p class="text-gray-600 max-w-3xl mx-auto mt-4 text-lg lg:text-xl px-4">
          Meet the dedicated individuals who make our mission possible.
        </p>
      </div>

      <!-- Team Members -->
      <!-- Enhanced responsive grid and improved spacing -->
      <div class="flex justify-center mb-20 animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl w-full">
          <div v-for="(member, index) in team" :key="member.name" 
               class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
               :style="{ transitionDelay: index * 100 + 'ms' }">
            <!-- Updated gradient to maroon -->
            <div class="bg-gradient-to-r from-red-600 to-red-800 h-16 relative">
            </div>
            <div class="pt-8 pb-8 px-6 text-center">
              <h3 class="text-xl lg:text-2xl font-bold text-gray-800 mb-1">{{ member.name }}</h3>
              <div class="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                {{ member.role }}
              </div>
              <p class="text-gray-600 mb-6 text-base lg:text-lg">{{ member.description }}</p>
              <div class="flex justify-center space-x-4">
                <a href="#" class="text-red-400 hover:text-red-700 transition-colors">
                  <i class="pi pi-twitter text-lg"></i>
                </a>
                <a href="#" class="text-red-400 hover:text-red-700 transition-colors">
                  <i class="pi pi-linkedin text-lg"></i>
                </a>
                <a href="#" class="text-red-400 hover:text-red-700 transition-colors">
                  <i class="pi pi-instagram text-lg"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <!-- Updated footer colors to maroon -->
    <footer class="w-full bg-red-900 text-white py-10 px-6 relative z-10">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">SoloParent</h3>
          <p class="text-red-200">
            Empowering solo parents through community and resources since 2020.
          </p>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li><a href="/" class="text-red-200 hover:text-white transition-colors">Home</a></li>
            <li><a href="#" class="text-red-200 hover:text-white transition-colors">Resources</a></li>
            <li><a href="#" class="text-red-200 hover:text-white transition-colors">Events</a></li>
            <li><a href="#" class="text-red-200 hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-4">Connect With Us</h3>
          <div class="flex space-x-4 mb-4">
            <!-- Added Facebook link as requested -->
            <a href="https://www.facebook.com/profile.php?id=61570079205779" target="_blank" class="bg-red-800 hover:bg-red-700 p-2 rounded-full transition-colors">
              <i class="pi pi-facebook"></i>
            </a>
            <a href="#" class="bg-red-800 hover:bg-red-700 p-2 rounded-full transition-colors">
              <i class="pi pi-twitter"></i>
            </a>
            <a href="#" class="bg-red-800 hover:bg-red-700 p-2 rounded-full transition-colors">
              <i class="pi pi-instagram"></i>
            </a>
          </div>
          <p class="text-red-200">
            Subscribe to our newsletter for updates
          </p>
        </div>
      </div>
      <div class="max-w-6xl mx-auto mt-8 pt-6 border-t border-red-800 text-center text-red-300 text-sm">
        © 2023 SoloParent. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation for team members */
.grid > div:nth-child(1) {
  animation-delay: 0.1s;
}
.grid > div:nth-child(2) {
  animation-delay: 0.3s;
}
.grid > div:nth-child(3) {
  animation-delay: 0.5s;
}
</style>
