<script setup>
import AppHeader from '@/components/AppHeader.vue'; // Adjust path if needed
import AppSidebar from '@/components/AppSidebar.vue'; // Adjust path if needed
</script>

<template>
  <div class="flex flex-col h-screen">
    <AppHeader />

    <div class="flex flex-1 overflow-hidden">
      <AppSidebar />

      <main class="flex-1 overflow-y-auto p-6 bg-white">
        <router-view />
      </main>
    </div>
  </div>
</template>
