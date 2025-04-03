// src/stores/transactionStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Store the initial state separately to easily reset to it
const initialBalance = 1000000;
const initialTransactions = [
  {
    id: 1,
    datetime: "2022-06-06T10:19:53Z",
    amount: 20000,
    type: "Deposit",
    email: "email@gmail.com",
  },
  {
    id: 2,
    datetime: "2022-02-15T21:24:24Z",
    amount: 40000,
    type: "Withdraw",
    email: "email@gmail.com",
  },
  {
    id: 3,
    datetime: "2021-12-31T23:59:49Z",
    amount: 100000,
    type: "Withdraw",
    email: "email@gmail.com",
  },
];

export const useTransactionStore = defineStore("transactions", () => {
  // --- State ---
  // Initialize state using the constants defined above
  const balance = ref(initialBalance);
  const transactions = ref([...initialTransactions]); // Use spread to clone array

  // --- Getters ---
  const formattedBalance = computed(() => {
    // Format balance with commas, handling potential non-numeric values gracefully
    const numBalance = Number(balance.value);
    return isNaN(numBalance) ? "0" : numBalance.toLocaleString("en-US");
  });

  // --- Actions ---
  function addTransaction(type, amount) {
    // Ensure amount is a number before proceeding
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      // Handle invalid amount if necessary, though validation should catch this in component
      return { success: false, message: "Invalid transaction amount." };
    }

    if (type === "Deposit") {
      balance.value += numAmount;
    } else if (type === "Withdraw") {
      if (numAmount > balance.value) {
        return { success: false, message: "ยอดเงินคงเหลือไม่เพียงพอ" };
      }
      balance.value -= numAmount;
    } else {
      return { success: false, message: "ประเภทธุรกรรมไม่ถูกต้อง" };
    }

    const newTransaction = {
      id: Date.now(), // Simple unique ID
      datetime: new Date().toISOString(), // Current date and time
      amount: numAmount, // Use the validated numeric amount
      type: type,
      email: localStorage.getItem("userEmail") || "email@gmail.com",
    };
    transactions.value.unshift(newTransaction); // Add to beginning
    return { success: true, message: `${type} successful.` };
  }

  function updateTransaction(id, newAmount) {
    // Ensure newAmount is a number
    const numNewAmount = Number(newAmount);
    if (isNaN(numNewAmount) || numNewAmount < 0) {
      // Allow 0 when editing
      return { success: false, message: "จำนวนเงินไม่ถูกต้องสำหรับการอัปเดต" };
    }

    const transactionIndex = transactions.value.findIndex((t) => t.id === id);
    if (transactionIndex === -1) {
      return { success: false, message: "ไม่พบธุรกรรม" };
    }

    const transaction = transactions.value[transactionIndex];
    // Ensure oldAmount is treated as a number
    const numOldAmount = Number(transaction.amount);
    if (isNaN(numOldAmount)) {
      console.error(`Invalid old amount found for transaction ID: ${id}`);
      return {
        success: false,
        message: "Cannot update due to invalid existing data.",
      };
    }

    const difference = numNewAmount - numOldAmount;

    let potentialNewBalance;
    if (transaction.type === "Deposit") {
      potentialNewBalance = balance.value + difference;
    } else {
      // type === 'Withdraw'
      potentialNewBalance = balance.value - difference;
    }

    if (potentialNewBalance < 0) {
      return { success: false, message: "Edit results in negative balance." };
    }

    // Apply the changes
    balance.value = potentialNewBalance;
    transactions.value[transactionIndex].amount = numNewAmount; // Store the numeric amount

    console.log(`Transaction ${id} updated. Balance recalculated.`);
    return { success: true, message: "อัปเดตธุรกรรมสำเร็จแล้ว" };
  }

  function deleteTransaction(id) {
    const transactionIndex = transactions.value.findIndex((t) => t.id === id);
    if (transactionIndex === -1) {
      return { success: false, message: "ไม่พบธุรกรรม" };
    }

    const transactionToDelete = transactions.value[transactionIndex];
    // Ensure amount is treated as a number
    const amount = Number(transactionToDelete.amount);
    if (isNaN(amount)) {
      console.error(`Invalid amount found for transaction ID to delete: ${id}`);
      return {
        success: false,
        message: "ไม่สามารถลบได้เนื่องจากข้อมูลที่มีอยู่ไม่ถูกต้อง",
      };
    }
    const type = transactionToDelete.type;

    // --- RE-ADDED BALANCE ADJUSTMENT LOGIC ---
    // Adjust balance *before* removing the transaction
    // Deleting a deposit means balance decreases
    // Deleting a withdrawal means balance increases
    if (type === "Deposit") {
      balance.value -= amount;
    } else {
      // type === 'Withdraw'
      balance.value += amount;
    }
    // --- END RE-ADDED BALANCE ADJUSTMENT LOGIC ---

    // Remove the transaction from the array
    transactions.value.splice(transactionIndex, 1);

    console.log(`Transaction ${id} deleted. Balance recalculated.`); // Log message updated
    return { success: true, message: "Transaction deleted successfully." };
  }

  // ** NEW: Action to reset the store state **
  function resetStore() {
    balance.value = initialBalance;
    transactions.value = [...initialTransactions]; // Reset to initial values using spread
    console.log("Transaction store has been reset.");
  }

  return {
    // State
    balance,
    transactions,
    // Getters
    formattedBalance,
    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction, // Delete action (no balance change)
    resetStore, // Reset action
  };
}); // End of defineStore
