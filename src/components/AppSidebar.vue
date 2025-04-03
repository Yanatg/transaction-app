<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});


const emit = defineEmits(['close-sidebar']);

const handleLinkClick = () => {
    if (window.innerWidth < 768) {
        emit('close-sidebar');
    }
}
</script>

<template>
  <aside
    :class="[
      'bg-gray-100', 'shadow-md', 'h-full', 'z-20',
      'fixed', 'inset-y-0', 'left-0',
      'w-64',
      'transform', 'transition-transform', 'duration-300', 'ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'md:relative', 'md:translate-x-0', 'md:block'
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
</style>