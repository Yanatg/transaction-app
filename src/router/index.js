import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/components/LoginView.vue'; // <-- Import your Login component
// Import other views/components as needed
// import DashboardView from '../views/DashboardView.vue';

const routes = [
    {
      path: '/', // This is the root path (e.g., http://localhost:8080/)
      name: 'login', // Give the route a name (optional but good practice)
      component: LoginView // Tell the router to load LoginView for this path
    },
    // Add routes for your other pages here
    // Example:
    // {
    //   path: '/dashboard',
    //   name: 'dashboard',
    //   component: DashboardView // The component shown after login
    // },
    // ... other routes
  ];
  
  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL), // Or createWebHashHistory()
    routes
  });
  
  export default router;