<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transactionStore';

const transactionStore = useTransactionStore();

// eslint-disable-next-line no-unused-vars
const { balance, formattedBalance } = storeToRefs(transactionStore);

const amount = ref('');
const amountError = ref('');

// **NEW: State for the confirmation modal**
const showConfirmModal = ref(false);
const confirmDetails = ref({ // Store details for the modal
  amount: null,
  type: null // 'Deposit' or 'Withdraw'
});

// --- Validation ---
const validateAmount = () => {
  // (Validation logic remains the same as before)
  amountError.value = '';
  const numAmount = Number(amount.value);

  if (amount.value === '' || amount.value === null) {
    amountError.value = 'Amount is required.';
    return false;
  }
  if (!/^\d+$/.test(amount.value)) {
    amountError.value = 'Please enter only numbers.';
    return false;
  }
  if (numAmount <= 0 || numAmount > 100000) {
    amountError.value = 'Amount must be between 1 and 100,000.';
    return false;
  }
  // Note: We don't check for sufficient balance here anymore,
  // the store action will do that just before committing.
  return true;
};

// --- Modified Event Handlers ---
const handleDeposit = () => {
  if (validateAmount()) {
    // **Instead of calling store directly, set details and show modal**
    confirmDetails.value = {
      amount: Number(amount.value),
      type: 'Deposit'
    };
    showConfirmModal.value = true;
    amountError.value = ''; // Clear any previous validation error when showing modal
  }
};

const handleWithdraw = () => {
  if (validateAmount()) {
    // **Instead of calling store directly, set details and show modal**
    confirmDetails.value = {
      amount: Number(amount.value),
      type: 'Withdraw'
    };
    showConfirmModal.value = true;
    amountError.value = ''; // Clear any previous validation error when showing modal
  }
};

// **NEW: Function to proceed after modal confirmation**
const proceedWithTransaction = () => {
  if (!confirmDetails.value.type || confirmDetails.value.amount === null) return;

  console.log(`Proceeding with ${confirmDetails.value.type}:`, confirmDetails.value.amount);
  const result = transactionStore.addTransaction(
    confirmDetails.value.type,
    confirmDetails.value.amount
  );

  if (result.success) {
    console.log(result.message);
    amount.value = ''; // Clear input on success
    amountError.value = '';
  } else {
    // Show error from store (e.g., insufficient balance)
    // Display it back on the main input area
    amountError.value = result.message;
  }

  // Hide the modal and reset details
  closeModal();
};

// **NEW: Function to close/cancel modal**
const closeModal = () => {
  showConfirmModal.value = false;
  confirmDetails.value = { amount: null, type: null };
};

</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-4">
      ฝาก / ถอน
    </h1>
    <div class="mt-6 p-6 bg-gray-50 rounded shadow-md relative"> 
      <p class="mb-4 text-lg">จำนวนเงินคงเหลือ: <span class="font-semibold">{{ formattedBalance }} บาท</span></p>
      <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน *</label>
      <input
        type="text"
        id="amount"
        v-model="amount"
        placeholder="Enter amount (1 - 100,000)"
        @input="validateAmount"
        :class="{ 'border-red-500': amountError }"
        class="mb-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        aria-describedby="amount-error"
      />
      <p v-if="amountError" id="amount-error" class="text-red-500 text-xs italic mb-3">
        {{ amountError }}
      </p>

      <div class="flex space-x-4">
        <button
          @click="handleDeposit"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          :disabled="!!amountError || !amount"
        >
          Deposit
        </button>
        <button
          @click="handleWithdraw"
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          :disabled="!!amountError || !amount"
        >
          Withdraw
        </button>
      </div>
    </div>

    <div v-if="showConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">ยืนยันการฝาก-ถอน</h3> <div class="mt-2 px-7 py-3">
            <p class="text-base text-gray-700">
              {{ confirmDetails.type === 'Deposit' ? 'ฝาก' : 'ถอน' }} จำนวนเงิน: <span class="font-semibold">{{ confirmDetails.amount?.toLocaleString('en-US') }}</span> บาท </p>
          </div>
          <div class="items-center px-4 py-3 flex justify-center space-x-4">
             <button
               @click="proceedWithTransaction"
               class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-24 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
             >
               ยืนยัน </button>
            <button
              @click="closeModal"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              ยกเลิก </button>
          </div>
        </div>
      </div>
    </div>
     </div>
</template>

<style scoped>
/* Add specific styles if needed */
</style>