<template>
    <div class="home">
        <Header/>
        <Home/>
    </div>
  </template>
  
  <script>
  import Header from '@/components/LandPage/Header.vue';
  import Home from '@/components/LandPage/Home.vue';
  
  export default {
    name: 'HomeView',
    components: {
      Header,
      Home
    }
  }
  </script>
  