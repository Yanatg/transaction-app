<script setup>
// ** FIX: Import defineProps and defineEmits from 'vue' **
import { defineProps, defineEmits } from 'vue';

// ** FIX: Call defineProps directly, no need for 'props' variable **
// Define the props this component accepts
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

// Define emit for closing sidebar when a link is clicked on mobile
const emit = defineEmits(['close-sidebar']);

const handleLinkClick = () => {
    // Close sidebar automatically when a link is clicked on mobile
    if (window.innerWidth < 768) { // 768px is Tailwind's default 'md' breakpoint
        emit('close-sidebar');
    }
}
</script>

<template>
  <aside
    :class="[
      'bg-gray-100', 'shadow-md', 'h-full', 'z-20', // Base styles & z-index above overlay
      'fixed', 'inset-y-0', 'left-0', // Mobile positioning: fixed
      'w-64', // Width
      'transform', 'transition-transform', 'duration-300', 'ease-in-out', // Transition
      isOpen ? 'translate-x-0' : '-translate-x-full', // Slide in/out based on isOpen state
      'md:relative', 'md:translate-x-0', 'md:block' // Desktop: relative, always visible block
    ]"
  >
    <div class="p-4"> 
        <nav>
            <ul>
                <li class="mb-2">
                <router-link
                    to="/dashboard/deposit"
                    @click="handleLinkClick"
                    class="block py-2 px-4 rounded hover:bg-gray-200"
                    active-class="bg-gray-300 font-semibold"
                >
                    Deposit / Withdraw
                </router-link>
                </li>
                <li class="mb-2">
                <router-link
                    to="/dashboard/transactions"
                     @click="handleLinkClick"
                    class="block py-2 px-4 rounded hover:bg-gray-200"
                    active-class="bg-gray-300 font-semibold"
                >
                    Transaction
                </router-link>
                </li>
            </ul>
        </nav>
    </div>
  </aside>
</template>

<style scoped>
/* Ensure sidebar takes full height */
/* 'h-full' class applied directly now */
/* Remove min-height style if previously added */
</style>