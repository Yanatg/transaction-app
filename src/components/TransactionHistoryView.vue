<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transactionStore'; // Adjust path if needed

const transactionStore = useTransactionStore();
// Get reactive reference to the transactions array
const { transactions } = storeToRefs(transactionStore);

// --- Helper Function: Format Date/Time ---
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // Example format: DD/MM/YYYY HH:MM:SS
    return date.toLocaleString('en-GB', { // Or 'th-TH'
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoString;
  }
};

// --- Computed Property: Entry Count Text ---
const entryCountText = computed(() => {
  const total = transactions.value.length;
  if (total === 0) {
    return 'Showing 0 entries';
  }
  return `Showing 1 to ${total} of ${total} entries`;
});

// --- Edit Modal State & Logic ---
const showEditModal = ref(false);
const editingTransaction = ref(null);
const editAmount = ref('');
const editAmountError = ref('');

const handleEdit = (transaction) => {
  console.log('Editing transaction:', transaction);
  editingTransaction.value = { ...transaction }; // Clone
  editAmount.value = String(transaction.amount);
  editAmountError.value = '';
  showEditModal.value = true;
};

const validateEditAmount = () => {
  editAmountError.value = '';
  const numAmount = Number(editAmount.value);
  if (editAmount.value === '' || editAmount.value === null) {
    editAmountError.value = 'Amount is required.'; return false;
  }
  if (!/^\d+$/.test(editAmount.value)) {
    editAmountError.value = 'Please enter only numbers.'; return false;
  }
  // Assuming 0 is allowed when editing, unlike deposit/withdraw
  if (numAmount < 0 || numAmount > 100000) {
    editAmountError.value = 'Amount must be between 0 and 100,000.'; return false;
  }
  return true;
};

const confirmEdit = () => {
  if (validateEditAmount()) {
    const newAmount = Number(editAmount.value);
    if (editingTransaction.value && editingTransaction.value.id !== null) {
      const result = transactionStore.updateTransaction(editingTransaction.value.id, newAmount);
      if (result.success) {
        closeEditModal();
      } else {
        editAmountError.value = result.message;
        console.error("Edit failed:", result.message);
      }
    } else {
      editAmountError.value = "Error: No transaction selected.";
    }
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingTransaction.value = null;
  editAmount.value = '';
  editAmountError.value = '';
};

// --- Delete Modal State & Logic ---
const showDeleteModal = ref(false);
const deletingTransaction = ref(null);

const handleDelete = (transaction) => {
  console.log('Attempting to delete transaction:', transaction);
  deletingTransaction.value = transaction;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (deletingTransaction.value && deletingTransaction.value.id !== null) {
    const result = transactionStore.deleteTransaction(deletingTransaction.value.id);
    if (result.success) {
      console.log(result.message);
    } else {
      console.error("Delete failed:", result.message);
      alert(`Error deleting transaction: ${result.message}`); // Or handle error better
    }
    closeDeleteModal();
  } else {
    console.error("Cannot confirm delete: No transaction selected.");
    closeDeleteModal();
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingTransaction.value = null;
};

</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-4">
      Transaction History
    </h1>

    <div class="mt-6 overflow-x-auto">
      <div v-if="transactions.length === 0" class="text-center text-gray-500 py-4">
        No transaction history found.
      </div>

      <table v-else class="min-w-full bg-white shadow-md rounded">
        <thead class="bg-gray-200">
          <tr>
            <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Datetime</th>
            <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
            <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
            <th class="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
            <td class="py-2 px-4 border-b text-sm text-gray-700">{{ formatDateTime(transaction.datetime) }}</td>
            <td class="py-2 px-4 border-b text-sm text-gray-700">{{ transaction.amount?.toLocaleString('en-US') }}</td>
            <td class="py-2 px-4 border-b text-sm">
              <span :class="{ 'text-green-600': transaction.type === 'Deposit', 'text-red-600': transaction.type === 'Withdraw' }" class="font-semibold">
                {{ transaction.type }}
              </span>
            </td>
            <td class="py-2 px-4 border-b text-sm text-gray-700">{{ transaction.email }}</td>
            <td class="py-2 px-4 border-b text-sm">
              <button @click="handleEdit(transaction)" class="text-blue-500 hover:underline mr-2">Edit</button>
              <button @click="handleDelete(transaction)" class="text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="transactions.length > 0" class="mt-4 text-sm text-gray-600">
        {{ entryCountText }}
      </p>
    </div>

    <div v-if="showEditModal && editingTransaction" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative mx-auto p-5 border w-auto max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-gray-900 text-center mb-2">
              แก้ไขจำนวนเงิน {{ editingTransaction.type === 'Deposit' ? 'ฝาก' : 'ถอน' }}
          </h3>
          <div class="text-center text-sm text-gray-500 mb-1">
              ของวันที่: {{ formatDateTime(editingTransaction.datetime) }}
          </div>
          <div class="text-center text-sm text-gray-500 mb-4">
              จากอีเมล: {{ editingTransaction.email }}
          </div>
          <div class="mt-2 px-7 py-3">
              <label for="editAmount" class="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน *</label>
              <input
                  type="text"
                  id="editAmount"
                  v-model="editAmount"
                  @input="validateEditAmount"
                  placeholder="Enter new amount (0 - 100,000)"
                  :class="{ 'border-red-500': editAmountError }"
                  class="mb-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  aria-describedby="edit-amount-error"
              />
              <p v-if="editAmountError" id="edit-amount-error" class="text-red-500 text-xs italic mb-3">
                  {{ editAmountError }}
              </p>
          </div>
          <div class="items-center px-4 py-3 flex justify-center space-x-4">
              <button
                  @click="confirmEdit"
                  class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-24 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                  :disabled="!!editAmountError"
              >
                  ยืนยัน
              </button>
              <button
                  @click="closeEditModal"
                  class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                  ยกเลิก
              </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal && deletingTransaction" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative mx-auto p-5 border w-auto max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">ยืนยันการลบ</h3>
          <div class="mt-2 px-7 py-3 space-y-1">
            <p class="text-base text-gray-700">
                จำนวนเงิน {{ deletingTransaction.type === 'Deposit' ? 'ฝาก' : 'ถอน' }} <span class="font-semibold">{{ deletingTransaction.amount?.toLocaleString('en-US') }}</span> บาท
            </p>
            <p class="text-sm text-gray-500">
                ของวันที่: {{ formatDateTime(deletingTransaction.datetime) }}
            </p>
            <p class="text-sm text-gray-500">
                จากอีเมล: {{ deletingTransaction.email }}
            </p>
          </div>
          <div class="items-center px-4 py-3 flex justify-center space-x-4">
            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              ยืนยัน
            </button>
            <button
              @click="closeDeleteModal"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
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