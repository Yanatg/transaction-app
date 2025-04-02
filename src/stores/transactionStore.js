// src/stores/transactionStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTransactionStore = defineStore('transactions', () => {
  // --- State --- (Existing balance and transactions refs)
  const balance = ref(1000000);
  const transactions = ref([
     // Seed data...
       { id: 1, datetime: '2022-06-06T10:19:53Z', amount: 20000, type: 'Deposit', email: 'email@gmail.com' },
       { id: 2, datetime: '2022-02-15T21:24:24Z', amount: 40000, type: 'Withdraw', email: 'email@gmail.com' },
       { id: 3, datetime: '2021-12-31T23:59:49Z', amount: 100000, type: 'Withdraw', email: 'email@gmail.com' },
  ]);

  // --- Getters --- (Existing formattedBalance)
   const formattedBalance = computed(() => {
    return balance.value.toLocaleString('en-US');
  });

  // --- Actions --- (Existing addTransaction)
  function addTransaction(type, amount) {
    // ... (existing addTransaction logic) ...
     if (type === 'Deposit') {
      balance.value += amount;
    } else if (type === 'Withdraw') {
      if (amount > balance.value) {
        return { success: false, message: 'Insufficient balance.' };
      }
      balance.value -= amount;
    } else {
        return { success: false, message: 'Invalid transaction type.' };
    }
     const newTransaction = {
        id: Date.now(), // Simple unique ID (can be improved later)
        datetime: new Date().toISOString(), // Current date and time
        amount: amount, // The amount passed to the function
        type: type,     // The type ('Deposit' or 'Withdraw') passed to the function
        // Attempt to get email stored during login, otherwise use a placeholder
        email: localStorage.getItem('userEmail') || 'unknown@example.com'
     };
    transactions.value.unshift(newTransaction);
     return { success: true, message: `${type} successful.` };
  }

  // **NEW: Action to update a transaction**
  function updateTransaction(id, newAmount) {
    const transactionIndex = transactions.value.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      return { success: false, message: 'Transaction not found.' };
    }

    const transaction = transactions.value[transactionIndex];
    const oldAmount = transaction.amount;
    const difference = newAmount - oldAmount; // Positive if amount increased, negative if decreased

    let potentialNewBalance;
    if (transaction.type === 'Deposit') {
      // If a deposit amount changes, the balance changes by the difference
      potentialNewBalance = balance.value + difference;
    } else { // type === 'Withdraw'
      // If a withdrawal amount changes, the balance changes by the *negative* of the difference
      // (e.g., withdrawing less increases balance, withdrawing more decreases it)
      potentialNewBalance = balance.value - difference;
    }

    // Check if the balance adjustment is valid (doesn't go below zero)
    // This is a simplified check; real-world might be more complex
    if (potentialNewBalance < 0) {
        return { success: false, message: 'Edit results in negative balance.'}
    }

    // Apply the changes
    balance.value = potentialNewBalance;
    transactions.value[transactionIndex].amount = newAmount;
    // Optional: update a timestamp if needed
    // transactions.value[transactionIndex].lastEdited = new Date().toISOString();

    console.log(`Transaction ${id} updated. Balance recalculated.`);
    return { success: true, message: 'Transaction updated successfully.' };
  }

   // Example Delete function placeholder (implement fully later)
  // function deleteTransaction(id) { /* ... */ }
  // **NEW: Action to delete a transaction**
  function deleteTransaction(id) {
    const transactionIndex = transactions.value.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      return { success: false, message: 'Transaction not found.' };
    }

    const transactionToDelete = transactions.value[transactionIndex];
    const amount = transactionToDelete.amount;
    const type = transactionToDelete.type;

    // Adjust balance *before* removing the transaction
    // Deleting a deposit means balance decreases
    // Deleting a withdrawal means balance increases
    if (type === 'Deposit') {
      balance.value -= amount;
    } else { // type === 'Withdraw'
      balance.value += amount;
      // Note: No negative balance check needed here, as we are reversing a past withdrawal.
    }

    // Remove the transaction from the array
    transactions.value.splice(transactionIndex, 1);

    console.log(`Transaction ${id} deleted. Balance recalculated.`);
    return { success: true, message: 'Transaction deleted successfully.' };
  }

  // ... (rest of the store code: state, getters, actions definitions) ...

  return {
    // State
    balance,
    transactions,
    // Getters
    formattedBalance,
    // Actions
    addTransaction,
    updateTransaction, // <-- *** ADD THIS LINE ***
    deleteTransaction, // Expose later if needed
  };
}); // End of defineStore
