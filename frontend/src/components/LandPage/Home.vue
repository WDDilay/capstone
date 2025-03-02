<template>
    <div class="home">
      <section class="hero bg-gradient-to-r from-purple-700 to-purple-600 text-white py-16">
        <div class="container mx-auto px-6">
          <div class="flex flex-wrap items-center justify-between">
            <div class="w-full md:w-1/2 mb-6 md:mb-0">
              <h1 class="text-4xl font-bold mb-4">Empowering Solo Parents</h1>
              <p class="text-lg mb-6">Join our community and access the support you need to thrive.</p>
              <router-link to="/register">
                <Button label="Get Started" class="p-button-raised p-button-lg bg-white text-purple-700 font-bold" />
              </router-link>
            </div>
            <div class="w-full md:w-1/2">
              <img src="@/assets/SPFAMILY.jpg" alt="Solo Parent Family" class="rounded-lg shadow-lg w-full" />
            </div>
          </div>
        </div>
      </section>
  
      <section class="features bg-gray-100 py-16">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-bold text-purple-900 text-center mb-8">How We Support You</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card v-for="feature in features" :key="feature.title" class="shadow-lg">
              <template #header>
                <div class="flex justify-center text-4xl text-purple-700">{{ feature.icon }}</div>
              </template>
              <template #title>
                <h3 class="text-xl font-semibold text-center">{{ feature.title }}</h3>
              </template>
              <template #content>
                <p class="text-gray-600 text-center">{{ feature.description }}</p>
              </template>
            </Card>
          </div>
        </div>
      </section>
  
      <section class="testimonials py-16">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-bold text-purple-900 text-center mb-8">Testimonials</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card v-for="testimonial in testimonials" :key="testimonial.author" class="shadow-lg">
              <template #content>
                <p class="italic mb-4">"{{ testimonial.text }}"</p>
                <p class="font-semibold text-purple-900">- {{ testimonial.author }}</p>
              </template>
            </Card>
          </div>
        </div>
      </section>
  
      <section class="cta bg-purple-700 text-white py-16 text-center">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p class="text-lg mb-6">Take the first step towards a supportive network of solo parents just like you.</p>
          <router-link to="/register">
            <Button label="Sign Up Now" class="p-button-raised p-button-lg bg-white text-purple-700 font-bold" />
          </router-link>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Button from 'primevue/button';
  import Card from 'primevue/card';
  
  const features = ref([
    { icon: '👥', title: 'Community Connection', description: 'Connect with other solo parents who understand your journey.' },
    { icon: '📚', title: 'Educational Resources', description: 'Access workshops and seminars to enhance your parenting skills.' },
    { icon: '💰', title: 'Financial Assistance', description: 'Get guidance on financial planning and available support programs.' }
  ]);
  
  const testimonials = ref([
  { 
    text: "Joining the Solo Parent Federation has been life-changing. The support and resources I received made my journey as a single parent much easier.", 
    author: "Sarah M." 
  },
  { 
    text: "I've found a community that understands my challenges and celebrates my victories. The Federation has been a true blessing for me and my children.", 
    author: "Michael T." 
  }
]);

  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  </style>