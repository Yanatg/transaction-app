<script setup>
import { ref, onUnmounted } from 'vue'; // Import onUnmounted
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transactionStore'; // Adjust path if needed

const transactionStore = useTransactionStore();

// eslint-disable-next-line no-unused-vars
const { balance, formattedBalance } = storeToRefs(transactionStore);

const amount = ref('');
const amountError = ref('');

// --- State for the confirmation modal ---
const showConfirmModal = ref(false);
const confirmDetails = ref({ amount: null, type: null });

// --- NEW: State for the success message ---
const successMessage = ref('');
const successTimeout = ref(null); // To store the setTimeout ID

// --- Validation ---
const validateAmount = () => {
  amountError.value = '';
  successMessage.value = ''; // Clear success message on new input validation
  if (successTimeout.value) clearTimeout(successTimeout.value); // Clear timeout on new validation

  const numAmount = Number(amount.value);
  if (amount.value === '' || amount.value === null) {
    amountError.value = 'กรุณาระบุจำนวนเงิน.'; return false;
  }
  if (!/^\d+$/.test(amount.value)) {
    amountError.value = 'กรุณาใส่เฉพาะตัวเลข'; return false;
  }
  if (numAmount <= 0 || numAmount > 100000) {
    amountError.value = 'จำนวนเงินต้องอยู่ระหว่าง 1 ถึง 100,000 บาท'; return false;
  }
  return true;
};

// --- Modified Event Handlers ---
const handleDeposit = () => {
  if (validateAmount()) {
    confirmDetails.value = { amount: Number(amount.value), type: 'Deposit' };
    showConfirmModal.value = true;
    amountError.value = '';
  }
};

const handleWithdraw = () => {
  if (validateAmount()) {
    confirmDetails.value = { amount: Number(amount.value), type: 'Withdraw' };
    showConfirmModal.value = true;
    amountError.value = '';
  }
};

// --- Updated: Function to proceed after modal confirmation ---
const proceedWithTransaction = () => {
  if (!confirmDetails.value.type || confirmDetails.value.amount === null) return;

  console.log(`Proceeding with ${confirmDetails.value.type}:`, confirmDetails.value.amount);
  const result = transactionStore.addTransaction(
    confirmDetails.value.type,
    confirmDetails.value.amount
  );

  if (result.success) {
    console.log(result.message);
    // ** NEW: Show Success Message **
    const formattedAmount = confirmDetails.value.amount?.toLocaleString('en-US');
    const actionText = confirmDetails.value.type === 'Deposit' ? 'ฝากเงิน' : 'ถอนเงิน'; // Thai action text
    successMessage.value = `ทำรายการ ${actionText} จำนวน ${formattedAmount} บาท สำเร็จ`; // Set the success message

    // Clear previous timeout if exists
    if (successTimeout.value) clearTimeout(successTimeout.value);
    // Set timeout to clear the message after 4 seconds
    successTimeout.value = setTimeout(() => {
        successMessage.value = '';
    }, 4000);
    // ** END NEW **

    amount.value = ''; // Clear input on success
    amountError.value = '';
  } else {
    // Show error from store
    amountError.value = result.message;
    successMessage.value = ''; // Ensure success message is clear on error
     if (successTimeout.value) clearTimeout(successTimeout.value); // Clear timeout on error
  }

  closeModal(); // Close modal regardless
};

// --- Function to close/cancel modal ---
const closeModal = () => {
  showConfirmModal.value = false;
  confirmDetails.value = { amount: null, type: null };
};

// --- NEW: Clear timeout when component is unmounted ---
onUnmounted(() => {
    if (successTimeout.value) {
        clearTimeout(successTimeout.value);
    }
});

</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-4">ฝาก / ถอน</h1>
    <div v-if="successMessage" class="mb-4 p-3 text-center text-sm text-green-800 bg-green-100 rounded border border-green-300 transition-opacity duration-300" role="alert">
        {{ successMessage }}
    </div>
    <div class="flex items-center justify-center">
      <div class="mt-2 p-6 relative max-w-md">
         <p class="mb-4 text-lg">
           จำนวนเงินคงเหลือ:
           <span class="font-semibold">{{ formattedBalance }} บาท</span>
         </p>
         <label for="amount" class="block text-lg font-medium text-gray-700 mb-1">จำนวนเงิน *</label>
         <input
           type="text"
           id="amount"
           v-model="amount"
           placeholder="กรอกจำนวนเงิน (1 - 100,000)"
           @input="validateAmount"
           :class="{ 'border-red-500': amountError }"
           class="mb-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
           aria-describedby="amount-error"
         />
         <p v-if="amountError" id="amount-error" class="text-red-500 text-xs italic mb-3">
           {{ amountError }}
         </p>
         <div class="flex space-x-4 mt-4">
           <button
             @click="handleDeposit"
             class="bg-green-500 hover:bg-green-600 w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50"
             :disabled="!!amountError || !amount"
           >
             ฝาก
           </button>
           <button
             @click="handleWithdraw"
             class="bg-red-500 hover:bg-red-600 w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50"
             :disabled="!!amountError || !amount"
           >
             ถอน
           </button>
         </div>
       </div>
     </div>
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 px-4"
    >
      <div class="relative mx-auto p-4 border w-full max-w-sm shadow-lg rounded-md bg-white">
        <div class="mt-2 text-start">
          <h3 class="text-base md:text-lg leading-6 font-medium text-gray-900 mb-2">
            ยืนยันการฝาก-ถอน
          </h3>
          <div class="mb-4">
            <p class="text-sm md:text-base text-gray-700">
              {{ confirmDetails.type === "Deposit" ? "ฝาก" : "ถอน" }} จำนวนเงิน:
              <span class="font-semibold">{{
                confirmDetails.amount?.toLocaleString("en-US")
              }}</span>
              บาท
            </p>
          </div>
          <div class="items-center py-2 flex flex-row justify-start space-x-4">
            <button
              @click="proceedWithTransaction"
              class="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ยืนยัน
            </button>
            <button
              @click="closeModal"
              class="px-4 py-2 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Add specific styles if needed */
</style>