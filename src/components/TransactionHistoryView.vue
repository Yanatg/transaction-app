<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'; // Import watch and onUnmounted
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transactionStore'; // Adjust path if needed

const transactionStore = useTransactionStore();
const { transactions } = storeToRefs(transactionStore);

// --- State for Dropdown Sorting ---
const sortOptions = [
  { value: 'datetime_desc', text: 'Date (Newest First)' },
  { value: 'datetime_asc', text: 'Date (Oldest First)' },
  { value: 'amount_desc', text: 'Amount (Highest First)' },
  { value: 'amount_asc', text: 'Amount (Lowest First)' },
];
const selectedSortOption = ref(sortOptions[0].value); // Default to 'datetime_desc'
const sortKey = ref('datetime');
const sortDirection = ref('desc');

// --- Watcher to update sortKey and sortDirection based on dropdown ---
watch(selectedSortOption, (newValue) => {
  const [key, direction] = newValue.split('_');
  sortKey.value = key;
  sortDirection.value = direction;
});

// --- Computed property for sorted transactions ---
const sortedTransactions = computed(() => {
  const sorted = [...transactions.value];
  if (sortKey.value) {
    sorted.sort((a, b) => {
      let valA = a[sortKey.value];
      let valB = b[sortKey.value];
      if (sortKey.value === 'datetime') {
        valA = new Date(valA); valB = new Date(valB);
      } else if (sortKey.value === 'amount') {
        valA = Number(valA); valB = Number(valB);
        if (isNaN(valA)) valA = 0; if (isNaN(valB)) valB = 0;
      }
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      return sortDirection.value === 'desc' ? comparison * -1 : comparison;
    });
  }
  return sorted;
});


// --- Helper Function: Format Date/Time ---
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).replace(',', '');
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoString;
  }
};

// --- Computed Property: Entry Count Text ---
const entryCountText = computed(() => {
  const total = sortedTransactions.value.length;
  if (total === 0) return 'ไม่มีรายการ';
  return `แสดง 1 ถึง ${total} จาก ${total} รายการ`;
});

// --- Edit Modal State & Logic ---
const showEditModal = ref(false);
const editingTransaction = ref(null);
const editAmount = ref('');
const editAmountError = ref('');
const handleEdit = (transaction) => { editingTransaction.value = { ...transaction }; editAmount.value = String(transaction.amount); editAmountError.value = ''; showEditModal.value = true; };
const validateEditAmount = () => { editAmountError.value = ''; const numAmount = Number(editAmount.value); if (editAmount.value === '' || editAmount.value === null) { editAmountError.value = 'Amount is required.'; return false; } if (!/^\d+$/.test(editAmount.value)) { editAmountError.value = 'Please enter only numbers.'; return false; } if (numAmount < 0 || numAmount > 100000) { editAmountError.value = 'Amount must be between 0 and 100,000.'; return false; } return true; };
// --> confirmEdit uses showToast now (defined below)
const closeEditModal = () => { showEditModal.value = false; editingTransaction.value = null; editAmount.value = ''; editAmountError.value = ''; };

// --- Delete Modal State & Logic ---
const showDeleteModal = ref(false);
const deletingTransaction = ref(null);
const handleDelete = (transaction) => { deletingTransaction.value = transaction; showDeleteModal.value = true; };
// --> confirmDelete uses showToast now (defined below)
const closeDeleteModal = () => { showDeleteModal.value = false; deletingTransaction.value = null; };

// --- Toast Notification State & Logic ---
const toastMessage = ref('');
const toastType = ref('success'); // 'success' or 'error'
const toastTimeout = ref(null);

const showToast = (message, type = 'success', duration = 4000) => {
    toastMessage.value = message;
    toastType.value = type;
    if (toastTimeout.value) clearTimeout(toastTimeout.value);
    toastTimeout.value = setTimeout(() => { toastMessage.value = ''; }, duration);
};

// --- Updated confirmEdit to use showToast ---
const confirmEdit = () => {
  if (validateEditAmount()) {
    const newAmount = Number(editAmount.value);
    if (editingTransaction.value && editingTransaction.value.id !== null) {
      const result = transactionStore.updateTransaction(editingTransaction.value.id, newAmount);
      if (result.success) {
        showToast('Transaction updated successfully.', 'success'); // Show success toast
        closeEditModal();
      } else {
        editAmountError.value = result.message; // Keep error in modal
        // showToast(result.message, 'error'); // Optional: Also show error toast
        console.error("Edit failed:", result.message);
      }
    } else {
      editAmountError.value = "Error: No transaction selected.";
      // showToast("Error: No transaction selected.", 'error'); // Optional: Also show error toast
    }
  }
};

// --- Updated confirmDelete to use showToast ---
const confirmDelete = () => {
  if (deletingTransaction.value && deletingTransaction.value.id !== null) {
    const result = transactionStore.deleteTransaction(deletingTransaction.value.id);
    if (result.success) {
        showToast('Transaction deleted successfully.', 'success'); // Show success toast
        console.log(result.message);
    } else {
        showToast(`Error deleting transaction: ${result.message}`, 'error'); // Show error toast instead of alert
        console.error("Delete failed:", result.message);
    }
    closeDeleteModal();
  } else {
    showToast("Cannot confirm delete: No transaction selected.", 'error'); // Show error toast
    console.error("Cannot confirm delete: No transaction selected.");
    closeDeleteModal();
  }
};


// --- Clear toast timeout when component is unmounted ---
onUnmounted(() => {
    if (toastTimeout.value) {
        clearTimeout(toastTimeout.value);
    }
});

</script>

<template>
  <div>
    <h1 class="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
      ประวัติรายการฝาก / ถอน
    </h1>
    <Transition name="fade">
        <div
            v-if="toastMessage"
            :class="[
                'fixed', 'top-5', 'left-1/2', '-translate-x-1/2', // Centering
                'px-4', 'py-2', 'rounded', 'shadow-md', 'text-sm', 'font-medium', 'z-50', // Base styling
                toastType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : '',
                toastType === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : ''
            ]"
            role="alert"
        >
            {{ toastMessage }}
        </div>
    </Transition>
    <div class="mb-4 flex items-center justify-start">
        <label for="sort-select" class="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
        <select
            id="sort-select"
            v-model="selectedSortOption"
            class="block w-auto pl-3 pr-8 py-1 text-xs md:text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.text }}
            </option>
        </select>
    </div>

    <div class="mt-2">
      <div v-if="transactions.length === 0" class="text-center text-gray-500 py-4">
        ไม่มีรายการฝาก / ถอน
      </div>
      <table v-else class="min-w-full w-full bg-white shadow-md rounded text-xs md:text-sm">
        <thead class="bg-gray-200">
            <tr>
                <th class="py-1 px-2 md:py-2 md:px-4 border-b text-left font-semibold text-gray-600 uppercase tracking-wider">Datetime</th>
                <th class="py-1 px-2 md:py-2 md:px-4 border-b text-left font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th class="py-1 px-2 md:py-2 md:px-4 border-b text-left font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="py-1 px-2 md:py-2 md:px-4 border-b text-left font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th class="py-1 px-2 md:py-2 md:px-4 border-b text-left font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in sortedTransactions" :key="transaction.id" class="hover:bg-gray-50">
            <td class="py-1 px-2 md:py-2 md:px-4 border-b text-gray-700">{{ formatDateTime(transaction.datetime) }}</td>
            <td class="py-1 px-2 md:py-2 md:px-4 border-b text-gray-700">{{ transaction.amount?.toLocaleString('en-US') }}</td>
            <td class="py-1 px-2 md:py-2 md:px-4 border-b">
              <span :class="{ 'text-green-600': transaction.type === 'Deposit', 'text-red-600': transaction.type === 'Withdraw' }" class="font-semibold">
                {{ transaction.type === 'Deposit' ? 'ฝาก' : 'ถอน' }}
              </span>
            </td>
            <td class="py-1 px-2 md:py-2 md:px-4 border-b text-gray-700 hidden md:table-cell">{{ transaction.email }}</td>
            <td class="py-1 px-2 md:py-2 md:px-4 border-b">
              <button v-if="transaction.type === 'Deposit'" @click="handleEdit(transaction)" class="text-blue-500 hover:underline">Edit</button>
              <button v-if="transaction.type === 'Withdraw'" @click="handleDelete(transaction)" class="text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="transactions.length > 0" class="mt-4 text-sm text-gray-600">
        {{ entryCountText }}
      </p>
    </div>
    <div v-if="showEditModal && editingTransaction" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 px-4">
      <div class="relative mx-auto p-4 border w-full max-w-sm shadow-lg rounded-md bg-white">
        <div class="mt-2 text-start">
           <h3 class="text-base md:text-lg leading-6 font-medium text-gray-900 mb-2">
              แก้ไขจำนวนเงิน {{ editingTransaction.type === 'Deposit' ? 'ฝาก' : 'ถอน' }}
           </h3>
          <div class="text-sm md:text-base text-gray-500 mb-1">
              ของวันที่: {{ formatDateTime(editingTransaction.datetime) }}
          </div>
          <div class="text-sm md:text-base text-gray-500 mb-4">
              จากอีเมล: {{ editingTransaction.email }}
          </div>
          <div class="mt-2 mb-4">
              <label for="editAmount" class="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน *</label>
              <input
                  type="text"
                  id="editAmount"
                  v-model="editAmount"
                  @input="validateEditAmount"
                  placeholder="Enter new amount (0 - 100,000)"
                  :class="{ 'border-red-500': editAmountError }"
                  class="mb-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
                  aria-describedby="edit-amount-error"
              />
              <p v-if="editAmountError" id="edit-amount-error" class="text-red-500 text-xs italic">
                  {{ editAmountError }}
              </p>
          </div>
          <div class="items-center py-2 flex flex-row justify-start space-x-4">
              <button
                  @click="confirmEdit"
                  class="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                  :disabled="!!editAmountError"
              >
                  ยืนยัน
              </button>
              <button
                  @click="closeEditModal"
                  class="px-4 py-2 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                  ยกเลิก
              </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal && deletingTransaction" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 px-4">
      <div class="relative mx-auto p-4 border w-full max-w-sm shadow-lg rounded-md bg-white">
        <div class="mt-2 text-start">
           <h3 class="text-base md:text-lg leading-6 font-medium text-gray-900 mb-2">ยืนยันการลบ</h3>
           <div class="mb-4 space-y-1 text-sm md:text-base">
            <p class="text-gray-700">
                จำนวนเงิน {{ deletingTransaction.type === 'Deposit' ? 'ฝาก' : 'ถอน' }} <span class="font-semibold">{{ deletingTransaction.amount?.toLocaleString('en-US') }}</span> บาท
            </p>
            <p class="text-gray-500">
                ของวันที่: {{ formatDateTime(deletingTransaction.datetime) }}
            </p>
            <p class="text-gray-500">
                จากอีเมล: {{ deletingTransaction.email }}
            </p>
          </div>
          <div class="items-center py-2 flex flex-row justify-start space-x-4">
            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              ยืนยัน
            </button>
            <button
              @click="closeDeleteModal"
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
/* Basic fade transition for the toast */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>