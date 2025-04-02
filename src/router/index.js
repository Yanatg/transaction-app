// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/components/LoginView.vue';
import DashboardLayout from '@/layouts/DasboardLayout.vue'; // Import the layout
import DepositWithdrawView from '@/components/DepositWithdrawView.vue'; // Create this view later
import TransactionHistoryView from '@/components/TransactionHistoryView.vue'; // Create this view later

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    component: DashboardLayout, // Use the layout for all /dashboard/* routes
    meta: { requiresAuth: true }, // Optional: Add meta field for authentication check
    children: [
      {
        path: '', // Default child route for /dashboard (optional)
        redirect: '/dashboard/deposit' // Redirect /dashboard to /dashboard/deposit
      },
      {
        path: 'deposit', // Path is /dashboard/deposit
        name: 'deposit-withdraw',
        component: DepositWithdrawView // This renders inside DashboardLayout's <router-view>
      },
      {
        path: 'transactions', // Path is /dashboard/transactions
        name: 'transactions',
        component: TransactionHistoryView // This renders inside DashboardLayout's <router-view>
      }
    ]
  },
  // Catch-all route (optional)
  // { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Optional: Navigation Guard to check login status
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isLoggedIn) {
    next('/'); // Redirect to login if not logged in and route requires auth
  } else {
    next(); // Otherwise allow navigation
  }
});

export default router;