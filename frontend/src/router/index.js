import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

// Views

//Landing Page
import LandPage from '../views/LandPage/LandPage.vue';
import Home from '../views/LandPage/Home.vue';
import About from '../views/LandPage/About.vue';

//Authentication
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Membership from '../views/auth/Membership.vue';

//Super Admin
import SuperAdmin from '../views/Superadmin/Superadmin.vue';
import Dashboard from '../views/Superadmin/Dashboard.vue';
import Events from '../views/Superadmin/Events.vue';
import Accounts from '../views/Superadmin/Accounts.vue';
import Members from '../views/Superadmin/Members.vue';

// Barangay Admin
import BarangayAdmin from '../views/BarangayAdmin/Barangay.vue';
import Data from '../views/BarangayAdmin/Data.vue';
import Announcements from '../views/BarangayAdmin/Announcements.vue';
import BarangayDashboard from '../views/BarangayAdmin/Dashboard.vue';
import Messages from '../views/BarangayAdmin/Message.vue';

const routes = [
  // Public routes
  { 
    path: '/', 
    name: 'LandPage', 
    component: LandPage,
    meta: { requiresAuth: false, allowedRoles: [] }
  },
  { 
    path: '/home', 
    name: 'Home', 
    component: Home,
    meta: { requiresAuth: false, allowedRoles: [] }
  },
  { 
    path: '/about', 
    name: 'About', 
    component: About,
    meta: { requiresAuth: false, allowedRoles: [] }
  },

  // Authentication routes
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { requiresAuth: false, allowedRoles: [] }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    meta: { requiresAuth: false, allowedRoles: [] }
  },
  {
    path: '/membership', 
    name: 'Membership', 
    component: Membership,
    meta: { requiresAuth: false, allowedRoles: [] }
  },

  // Super Admin routes
  { 
    path: '/super-admin', 
    component: SuperAdmin, 
    redirect: '/super-admin/super-dashboard',
    meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] },
    children: [
      { 
        path: 'super-dashboard', 
        component: Dashboard,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      },
      { 
        path: 'events', 
        component: Events,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      },
      { 
        path: 'accounts', 
        component: Accounts,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      },
      { 
        path: 'members', 
        component: Members,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      }
    ] 
  },

  // Barangay Admin routes
  { 
    path: '/barangay-admin', 
    component: BarangayAdmin, 
    redirect: '/barangay-admin/dashboard',
    meta: { requiresAuth: true, allowedRoles: ['BarangayPresident'] },
    children: [
      { 
        path: 'dashboard', 
        component: BarangayDashboard,
        meta: { requiresAuth: true, allowedRoles: ['BarangayPresident'] }
      },
      { 
        path: 'data', 
        component: Data,
        meta: { requiresAuth: true, allowedRoles: ['BarangayPresident'] }
      },
      { 
        path: 'announcements', 
        component: Announcements,
        meta: { requiresAuth: true, allowedRoles: ['BarangayPresident'] }
      },
      { 
        path: 'messages', 
        component: Messages,
        meta: { requiresAuth: true, allowedRoles: ['BarangayPresident'] }
      }
    ] 
  },
  
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Single comprehensive navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.user !== null;
  const userRole = userStore.role;
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // Check if user has permission for this route
  const hasPermission = to.matched.every(record => {
    // If no roles specified or empty array, allow access
    if (!record.meta.allowedRoles || record.meta.allowedRoles.length === 0) {
      return true;
    }
    // Otherwise check if user role is in the allowed roles
    return record.meta.allowedRoles.includes(userRole);
  });

  // Public routes - redirect authenticated users to their dashboard
  if (!requiresAuth && isAuthenticated) {
    if (userRole === 'FederationPresident') {
      return next('/super-admin');
    } else if (userRole === 'BarangayPresident') {
      return next('/barangay-admin');
    }
  }
  
  // Protected routes - check authentication and permissions
  if (requiresAuth) {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      return next('/login');
    } else if (!hasPermission) {
      // Authenticated but wrong role
      if (userRole === 'FederationPresident') {
        return next('/super-admin');
      } else if (userRole === 'BarangayPresident') {
        return next('/barangay-admin');
      } else {
        // Fallback if role is unknown
        return next('/login');
      }
    }
  }
  
  // If we got here, proceed normally
  next();
});

export default router;