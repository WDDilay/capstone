<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Header from '@/components/LandPage/Header.vue';


const team = [
  { 
    name: "De Lara, Geralyn F.", 
    role: "Founder", 
    image: "https://via.placeholder.com/100", 
    description: "Solo parent of 2 children, passionate about building supportive communities.",
    social: {
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  },
  { 
    name: "Dilay, Waren D.", 
    role: "Community Manager", 
    image: "https://via.placeholder.com/100", 
    description: "Dedicated to creating meaningful connections within our community.",
    social: {
      twitter: "#",
      linkedin: "#",
      instagram: "#"
    }
  },
  { 
    name: "Miranda, Vhybenica V.", 
    role: "Resource Coordinator", 
    image: "https://via.placeholder.com/100", 
    description: "Expert in connecting families with the support they need.",
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
  <div class="min-h-screen bg-gradient-to-b from-white to-purple-50 text-gray-900 flex flex-col items-center relative overflow-hidden">
    <!-- Decorative Elements -->
    <div class="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"></div>
    <div class="absolute top-1/3 right-10 w-32 h-32 bg-purple-400 rounded-full opacity-10"></div>
    
    

    <!-- Header -->
    <header class="text-center py-16 px-4 relative z-10">
      <div class="animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <h1 class="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-500 drop-shadow-lg">
          About SoloParent
        </h1>
        <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-5 leading-relaxed">
          Supporting and empowering solo parents through community connection and resources.
        </p>
        <div class="w-24 h-1 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mt-6 rounded-full"></div>
      </div>
    </header>

    <div class="content max-w-6xl px-6 w-full relative z-10">
      <!-- Mission and Values -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <Card class="p-6 bg-white shadow-lg border-t-4 border-t-purple-500 hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden">
          <template #header>
            <div class="bg-gradient-to-r from-purple-600 to-purple-400 h-2 w-full absolute top-0 left-0"></div>
          </template>
          <template #title>
            <div class="flex items-center space-x-3 mb-4">
              <div class="bg-purple-100 p-3 rounded-full">
                <i class="pi pi-compass text-purple-600 text-xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-purple-700">Our Mission</h2>
            </div>
          </template>
          <template #content>
            <p class="text-gray-700 text-lg leading-relaxed">
              Creating a supportive and inclusive community for solo parents to thrive, connect, and access valuable resources. We believe in the power of community to transform lives and create opportunities for growth.
            </p>
          </template>
        </Card>

        <Card class="p-6 bg-white shadow-lg border-t-4 border-t-purple-500 hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden">
          <template #header>
            <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-2 w-full absolute top-0 left-0"></div>
          </template>
          <template #title>
            <div class="flex items-center space-x-3 mb-4">
              <div class="bg-purple-100 p-3 rounded-full">
                <i class="pi pi-heart text-purple-600 text-xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-purple-700">Our Values</h2>
            </div>
          </template>
          <template #content>
            <ul class="mt-3 space-y-4 text-gray-700 text-lg">
              <li class="flex items-center">
                <span class="bg-purple-100 p-2 rounded-full mr-3">✨</span>
                <span>Community Support - Building networks that empower</span>
              </li>
              <li class="flex items-center">
                <span class="bg-purple-100 p-2 rounded-full mr-3">💪</span>
                <span>Empowerment - Providing tools for independence</span>
              </li>
              <li class="flex items-center">
                <span class="bg-purple-100 p-2 rounded-full mr-3">🤝</span>
                <span>Inclusivity - Welcoming all solo parents</span>
              </li>
              <li class="flex items-center">
                <span class="bg-purple-100 p-2 rounded-full mr-3">💡</span>
                <span>Resource Sharing - Knowledge is power</span>
              </li>
            </ul>
          </template>
        </Card>
      </div>

      <!-- Our Team Section -->
      <div class="text-center mb-12 animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <div class="inline-block relative">
          <h2 class="text-3xl font-bold text-purple-700 relative z-10">Our Amazing Team</h2>
          <div class="absolute -bottom-3 left-0 right-0 h-3 bg-purple-200 opacity-50 -z-10 transform -rotate-1"></div>
        </div>
        <p class="text-gray-600 max-w-2xl mx-auto mt-4 text-lg">
          Meet the dedicated individuals who make our mission possible.
        </p>
      </div>

      <!-- Team Members -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <div v-for="(member, index) in team" :key="member.name" 
             class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
             :style="{ transitionDelay: index * 100 + 'ms' }">
          <div class="bg-gradient-to-r from-purple-500 to-purple-700 h-24 relative">
            <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <Avatar :image="member.image" 
                      class="border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-500" 
                      shape="circle" 
                      size="xlarge" />
            </div>
          </div>
          <div class="pt-16 pb-8 px-6 text-center">
            <h3 class="text-2xl font-bold text-gray-800 mb-1">{{ member.name }}</h3>
            <div class="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              {{ member.role }}
            </div>
            <p class="text-gray-600 mb-6">{{ member.description }}</p>
            <div class="flex justify-center space-x-4">
              <a href="#" class="text-purple-400 hover:text-purple-600 transition-colors">
                <i class="pi pi-twitter text-lg"></i>
              </a>
              <a href="#" class="text-purple-400 hover:text-purple-600 transition-colors">
                <i class="pi pi-linkedin text-lg"></i>
              </a>
              <a href="#" class="text-purple-400 hover:text-purple-600 transition-colors">
                <i class="pi pi-instagram text-lg"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl shadow-xl p-10 max-w-3xl mx-auto mt-12 mb-20 relative overflow-hidden animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div class="relative z-10">
          <h2 class="text-3xl font-bold mb-4">Get in Touch</h2>
          <p class="text-purple-100 text-lg mb-8 max-w-lg mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <Button label="Contact Us" icon="pi pi-envelope" 
                   class="bg-white hover:bg-purple-50 text-purple-700 border-none py-3 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105" />
            <Button label="Join Community" icon="pi pi-users"
                   class="bg-purple-900 hover:bg-purple-950 text-white border-none py-3 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105" />
          </div>
        </div>
      </div>
      
      <!-- Testimonials Section -->
      <div class="mb-20 animate-on-scroll" :class="{ 'animate-fade-in-up': isVisible }">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-purple-700 relative inline-block">
            What Our Community Says
            <div class="absolute -bottom-3 left-0 right-0 h-3 bg-purple-200 opacity-50 -z-10 transform -rotate-1"></div>
          </h2>
        </div>
        
        <div class="bg-white rounded-xl p-8 shadow-lg relative">
          <div class="text-purple-300 text-9xl absolute top-4 left-6 leading-none opacity-20">"</div>
          <div class="relative z-10">
            <p class="text-gray-700 text-lg italic mb-6">
              "Joining SoloParent has been transformative for me and my children. The support and resources have helped us navigate challenges I never thought I could overcome on my own."
            </p>
            <div class="flex items-center">
              <Avatar image="https://via.placeholder.com/50" shape="circle" class="mr-4 border-2 border-purple-200" />
              <div>
                <h4 class="font-semibold text-gray-800">Maria Santos</h4>
                <p class="text-gray-500 text-sm">Community Member since 2022</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="w-full bg-purple-900 text-white py-10 px-6 relative z-10">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">SoloParent</h3>
          <p class="text-purple-200">
            Empowering solo parents through community and resources since 2020.
          </p>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li><a href="/" class="text-purple-200 hover:text-white transition-colors">Home</a></li>
            <li><a href="#" class="text-purple-200 hover:text-white transition-colors">Resources</a></li>
            <li><a href="#" class="text-purple-200 hover:text-white transition-colors">Events</a></li>
            <li><a href="#" class="text-purple-200 hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-4">Connect With Us</h3>
          <div class="flex space-x-4 mb-4">
            <a href="#" class="bg-purple-800 hover:bg-purple-700 p-2 rounded-full transition-colors">
              <i class="pi pi-facebook"></i>
            </a>
            <a href="#" class="bg-purple-800 hover:bg-purple-700 p-2 rounded-full transition-colors">
              <i class="pi pi-twitter"></i>
            </a>
            <a href="#" class="bg-purple-800 hover:bg-purple-700 p-2 rounded-full transition-colors">
              <i class="pi pi-instagram"></i>
            </a>
          </div>
          <p class="text-purple-200">
            Subscribe to our newsletter for updates
          </p>
        </div>
      </div>
      <div class="max-w-6xl mx-auto mt-8 pt-6 border-t border-purple-800 text-center text-purple-300 text-sm">
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