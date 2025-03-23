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
import Members from '../views/Superadmin/Members.vue';

// Barangay Admin
import BarangayAdmin from '../views/BarangayAdmin/Barangay.vue';
import Data from '../views/BarangayAdmin/Data.vue';
import BarangayDashboard from '../views/BarangayAdmin/Dashboard.vue';
import Messages from '../views/BarangayAdmin/Message.vue';

// User Guard


const routes = [

  // Landing Page routes
  { path: '/', name: 'LandPage', component: LandPage },
  { path: '/home', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },

  // Authentication routes
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  //Super Admin routes
  { path: '/super-admin', component: SuperAdmin, 
    redirect: '/super-admin/super-dashboard', 
    children: [
      { path: 'super-dashboard', component: Dashboard },
      {path: 'events', component: Events },
      {path: 'accounts', component: Accounts },
      {path: 'members', component: Members }

] 
  },

  { path: '/barangay-admin', component: BarangayAdmin, 
    redirect: '/barangay-admin/dashboard', 
    children: [
      { path: 'dashboard', component: BarangayDashboard },
      {path: 'data', component: Data },
      {path: 'messages', component: Messages }
] 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.user !== null;
  const userRole = isAuthenticated ? userStore.user.role : null;
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // Check if route should redirect authenticated users
  const redirectIfAuth = to.matched.some(record => record.meta.redirectIfAuth);
  
  // Check if route requires a specific role
  const requiredRole = to.matched.find(record => record.meta.role)?.meta.role;
  
  // Handle authentication and role-based access
  if (requiresAuth && !isAuthenticated) {
    // Route requires auth but user is not authenticated
    next('/login');
  } else if (redirectIfAuth && isAuthenticated) {
    // User is authenticated but trying to access login/register
    // Redirect to appropriate dashboard based on role
    if (userRole === 'SuperAdmin') {
      next('/super-admin/super-dashboard');
    } else if (userRole === 'BarangayPresident') {
      next('/barangay-admin/dashboard');
    } else {
      // Default fallback if role is unknown
      next('/');
    }
  } else if (requiresAuth && requiredRole && userRole !== requiredRole) {
    // User is authenticated but doesn't have the required role
    // Redirect to appropriate dashboard based on their actual role
    if (userRole === 'SuperAdmin') {
      next('/super-admin/super-dashboard');
    } else if (userRole === 'BarangayPresident') {
      next('/barangay-admin/dashboard');
    } else {
      // If role is unknown, redirect to home
      next('/');
    }
  } else {
    // All checks passed, proceed to the requested route
    next();
  }
});

export default router;
