// src/components/AppHeader.vue
<script setup>
import { useRouter } from 'vue-router';
import { defineEmits } from 'vue';
// ** NEW: Import the store **
import { useTransactionStore } from '@/stores/transactionStore'; // Adjust path if needed

const router = useRouter();
const emit = defineEmits(['toggle-sidebar']);
// ** NEW: Get store instance **
const transactionStore = useTransactionStore();

const handleLogout = () => {
  console.log('Logging out...');

  // ** NEW: Reset the transaction store state **
  transactionStore.resetStore();

  // Clear login status from localStorage
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');

  // Navigate to login page
  router.push('/');
};

const triggerToggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>

<template>
  <header class="bg-white shadow-md p-4 flex justify-between items-center relative z-20">
     <div class="flex items-center space-x-4">
        <button @click="triggerToggleSidebar" class="text-gray-600 focus:outline-none md:hidden" aria-label="Toggle sidebar">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
        <div class="text-xl font-bold text-gray-800">Clicknext</div>
     </div>
    <button @click="handleLogout" class="bg-gray-800 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm">
      Logout
    </button>
  </header>
</template>