// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/components/LoginView.vue';
import DashboardLayout from '@/layouts/DasboardLayout.vue';
import DepositWithdrawView from '@/components/DepositWithdrawView.vue'; 
import TransactionHistoryView from '@/components/TransactionHistoryView.vue'; 

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/deposit' 
      },
      {
        path: 'deposit', 
        name: 'deposit-withdraw',
        component: DepositWithdrawView 
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: TransactionHistoryView 
      }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isLoggedIn) {
    next('/'); 
  } else {
    next(); 
  }
});

export default router;