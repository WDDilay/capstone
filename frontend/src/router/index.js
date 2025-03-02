import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user'; // Import Pinia store

// Views

//Landing Page
import LandPage from '../views/LandPage/LandPage.vue';
import Home from '../views/LandPage/Home.vue';
import About from '../views/LandPage/About.vue';

//Authentication
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';

//Super Admin
import SuperAdmin from '../views/Superadmin/Superadmin.vue';
import Dashboard from '../views/Superadmin/Dashboard.vue';
import Events from '../views/Superadmin/Events.vue';
import Accounts from '../views/Superadmin/Accounts.vue';


const routes = [
  { path: '/', name: 'LandPage', component: LandPage },
  { path: '/home', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/super-admin', component: SuperAdmin, 
    redirect: '/super-admin/super-dashboard', // ✅ Corrected redirect path
    children: [
      { path: 'super-dashboard', component: Dashboard }, // ✅ Removed leading "/"
      {path: 'events', component: Events },
      {path: 'accounts', component: Accounts }
] 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔹 Navigation Guard: Prevent logged-in users from accessing Login & Landing Page
router.beforeEach((to, from, next) => {
  const userStore = useUserStore(); // Access user state
  const isAuthenticated = userStore.user !== null; // Check if logged in

  // If logged in, prevent access to login/register/landing page
  if (isAuthenticated && (to.path === '/' || to.path === '/login' || to.path === '/register')) {
    next('/super-admin'); // Redirect to the dashboard or admin panel
  } else {
    next(); // Continue navigation
  }
});

export default router;
