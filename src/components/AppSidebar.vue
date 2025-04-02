<script setup>
// No specific script logic needed for this simple example
</script>

<template>
  <aside class="w-64 bg-gray-100 p-4 h-full shadow-md">
    <nav>
      <ul>
        <li class="mb-2">
          <router-link
            to="/dashboard/deposit"
            class="block py-2 px-4 rounded hover:bg-gray-200"
            active-class="bg-gray-300 font-semibold"
          >
            Deposit / Withdraw
          </router-link>
        </li>
        <li class="mb-2">
          <router-link
            to="/dashboard/transactions"
            class="block py-2 px-4 rounded hover:bg-gray-200"
            active-class="bg-gray-300 font-semibold"
          >
            Transaction
          </router-link>
        </li>
        </ul>
    </nav>
  </aside>
</template>

<style scoped>
/* Add any sidebar-specific styles if needed */
/* Ensure sidebar takes full height if needed */
aside {
  min-height: calc(100vh - 64px); /* Adjust 64px based on actual header height */
}
</style>