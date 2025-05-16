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

// User Page

import UserDashboard from '@/views/UserPage/UserDashboard.vue';
import UserPage from '@/views/UserPage/UserPage.vue';
import events from '@/views/UserPage/Events.vue';
import Profile from '@/views/UserPage/Profile.vue';
import user_resource from '@/views/UserPage/user_resource.vue';

//Super Admin
import SuperAdmin from '../views/Superadmin/Superadmin.vue';
import Dashboard from '../views/Superadmin/Dashboard.vue';
import Events from '../views/Superadmin/Events.vue';
import Accounts from '../views/Superadmin/Accounts.vue';
import Members from '../views/Superadmin/Members.vue';
import Application from '../views/Superadmin/Application.vue';
import Notification from '../views/Superadmin/Notification.vue';
import resources from '../views/Superadmin/resources.vue';
import support from '../views/Superadmin/support.vue';
import settings from '../views/Superadmin/settings.vue';

// Barangay Admin
import BarangayAdmin from '../views/BarangayAdmin/Barangay.vue';
import Data from '../views/BarangayAdmin/Data.vue';
import Announcements from '../views/BarangayAdmin/Announcements.vue';
import BarangayDashboard from '../views/BarangayAdmin/Dashboard.vue';
import Messages from '../views/BarangayAdmin/Message.vue';
import BarangayInventory from '../views/BarangayAdmin/BarangayInventory.vue';
import Applications from '../views/BarangayAdmin/Application.vue';
import { Apple } from 'lucide-vue-next';


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
      },
      {
        path: 'application', 
        component: Application,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      },
      {
        path: 'notification', 
        component: Notification,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      },
      {
        path: 'resources', 
        component: resources,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      },
       {
        path: 'support', 
        component: support,
        meta: { requiresAuth: true, allowedRoles: ['FederationPresident'] }
      },
      {
        path: 'settings', 
        component: settings,
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
        path: 'application', 
        component: Applications,
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
      },
       { 
        path: 'BarangayInventory', 
        component: BarangayInventory,
        meta: { requiresAuth: true, allowedRoles: ['BarangayPresident'] }
      }
    ] 
  },
  
  //User PAge
  { 
    path: '/user-dashboard', 
    component: UserDashboard, 
    meta: { requiresAuth: true, allowedRoles: ['Member'] },
    redirect: '/user-dashboard/UserPage',
    children: [
      { 
        path: 'UserPage', 
        component: UserPage,
        meta: { requiresAuth: true, allowedRoles: ['Member'] },
      },
      { 
        path: 'Events', 
        component: events,
        meta: { requiresAuth: true, allowedRoles: ['Member'] },
      },
      { 
        path: 'Profile', 
        component: Profile,
        meta: { requiresAuth: true, allowedRoles: ['Member'] },
      },
      { 
        path: 'user_resource', 
        component: user_resource,
        meta: { requiresAuth: true, allowedRoles: ['Member'] },
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

  console.log("Current user role:", userRole); // Debugging line
  console.log("Is authenticated:", isAuthenticated); // Additional debugging

  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Check if user has permission for this route
  const hasPermission = to.matched.every(record => {
    if (!record.meta.allowedRoles || record.meta.allowedRoles.length === 0) {
      return true;
    }
    return record.meta.allowedRoles.includes(userRole);
  });

  // Public routes - redirect authenticated users to their dashboard
  if (!requiresAuth && isAuthenticated) {
    if (userRole === 'FederationPresident') {
      return next('/super-admin');
    } else if (userRole === 'BarangayPresident') {
      return next('/barangay-admin');
    } else if (userRole === 'Member') {
      return next('/user-dashboard');
    }
  }
  
  // Protected routes - check authentication and permissions
  if (requiresAuth) {
    if (!isAuthenticated) {
      return next('/login');
    } else if (!hasPermission) {
      if (userRole === 'FederationPresident') {
        return next('/super-admin');
      } else if (userRole === 'BarangayPresident') {
        return next('/barangay-admin');
      } else if (userRole === 'Member') {
        return next('/user-dashboard');
      } else {
        return next('/login');
      }
    }
  }

  // Proceed normally if everything is okay
  next();
});


export default router;