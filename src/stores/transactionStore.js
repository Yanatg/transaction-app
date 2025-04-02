// src/stores/transactionStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTransactionStore = defineStore('transactions', () => {
  // --- State ---
  // Initialize balance - maybe load from localStorage if needed for persistence beyond session?
  // For now, starting with the example value.
  const balance = ref(1000000);
  const transactions = ref([
      // Seed with example data from image 2 for testing TransactionHistoryView later
      // In a real app, this would likely start empty or be fetched.
       { id: 1, datetime: '2022-06-06T10:19:53Z', amount: 20000, type: 'Deposit', email: 'email@gmail.com' },
       { id: 2, datetime: '2022-02-15T21:24:24Z', amount: 40000, type: 'Withdraw', email: 'email@gmail.com' },
       { id: 3, datetime: '2021-12-31T23:59:49Z', amount: 100000, type: 'Withdraw', email: 'email@gmail.com' },
  ]);

  // --- Getters ---
  // Optional: Computed property for formatted balance
  const formattedBalance = computed(() => {
    return balance.value.toLocaleString('en-US'); // Formats with commas
  });

  // --- Actions ---
  function addTransaction(type, amount) {
    if (type === 'Deposit') {
      balance.value += amount;
    } else if (type === 'Withdraw') {
      if (amount > balance.value) {
        console.error("Withdrawal amount exceeds balance.");
        // Optionally throw an error or return a status
        return { success: false, message: 'Insufficient balance.' };
      }
      balance.value -= amount;
    } else {
        return { success: false, message: 'Invalid transaction type.' };
    }

    // Add to history
    const newTransaction = {
      id: Date.now(), // Simple unique ID generation
      datetime: new Date().toISOString(),
      amount: amount,
      type: type,
      // You might want to get the logged-in user's email here
      // Maybe store it in localStorage on login and retrieve it?
      email: localStorage.getItem('userEmail') || 'unknown@example.com'
    };
    transactions.value.unshift(newTransaction); // Add to the beginning of the array

    // Persist state? (Optional, for persistence beyond session)
    // localStorage.setItem('balance', balance.value);
    // localStorage.setItem('transactions', JSON.stringify(transactions.value));

     return { success: true, message: `${type} successful.` };
  }

  // // Example Edit/Delete functions (implement fully later for TransactionHistoryView)
  // function updateTransaction(id, newAmount) {
  //   // Find transaction, update amount, recalculate balance based on difference
  // }
  // function deleteTransaction(id) {
  //   // Find transaction, remove it, recalculate balance
  // }

  return {
    // State
    balance,
    transactions,
    // Getters
    formattedBalance,
    // Actions
    addTransaction,
    // updateTransaction, // Expose later
    // deleteTransaction, // Expose later
  };
});