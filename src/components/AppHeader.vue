<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  console.log('Logging out...');
  // Remove the login status flag from localStorage
  localStorage.removeItem('isLoggedIn');
  // Redirect the user to the login page (root path '/')
  router.push('/');
};
</script>

<template>
  <header class="bg-white shadow-md p-4 flex justify-between items-center shadow-lg border-b">
    <div class="text-xl font-bold text-gray-800">
      Clicknext </div>
    <button
      @click="handleLogout"
      class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
    >
      Logout
    </button>
  </header>
</template>
