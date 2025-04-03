// src/layouts/DashboardLayout.vue
<script setup>
import { ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import AppSidebar from '@/components/AppSidebar.vue';


const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  console.log("Sidebar toggled:", isSidebarOpen.value);
};
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <div class="flex flex-1 overflow-hidden">
      <AppSidebar :is-open="isSidebarOpen" @close-sidebar="toggleSidebar" />

      <main class="flex-1 overflow-y-auto p-6 bg-white">
        <router-view />
      </main>
    </div>

    <div
        v-if="isSidebarOpen"
        @click="toggleSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
        aria-hidden="true"
    ></div>
  </div>
</template>
