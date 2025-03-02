<template>
  <div class="app">
    <main>
      <router-view></router-view>
      <Toast />
    </main>
  </div>
</template>

<script setup>
import { Toast } from 'primevue/toast';
</script>

<style>
@import 'primeicons/primeicons.css';
</style>

