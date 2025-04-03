// src/stores/transactionStore.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTransactionStore } from '@/stores/transactionStore'; // Adjust path as needed

// Mock localStorage for testing email retrieval
const localStorageMock = (() => {
  let store = {
    // Pre-seed with a potential email for testing addTransaction
    userEmail: 'testuser@example.com'
  };
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('Transaction Store', () => {
  // Setup function to create a fresh Pinia instance and store before each test
  beforeEach(() => {
    setActivePinia(createPinia());
    // Optional: Clear mock localStorage before each test if needed
    // localStorageMock.clear();
    // localStorageMock.setItem('userEmail', 'testuser@example.com'); // Re-seed if cleared
  });

  // --- Test Initial State ---
  it('initializes with correct balance and seed data', () => {
    const store = useTransactionStore();
    expect(store.balance).toBe(1000000);
    expect(store.transactions.length).toBe(3);
    expect(store.formattedBalance).toBe('1,000,000'); // Test getter too
  });

  // --- Test addTransaction ---
  it('adds a deposit, updates balance, and adds transaction to history', () => {
    const store = useTransactionStore();
    const initialBalance = store.balance;
    const initialCount = store.transactions.length;
    const depositAmount = 50000;

    const result = store.addTransaction('Deposit', depositAmount);

    expect(result.success).toBe(true);
    expect(store.balance).toBe(initialBalance + depositAmount);
    expect(store.transactions.length).toBe(initialCount + 1);
    // Check the newest transaction (added via unshift)
    const newTransaction = store.transactions[0];
    expect(newTransaction.type).toBe('Deposit');
    expect(newTransaction.amount).toBe(depositAmount);
    expect(newTransaction.email).toBe('testuser@example.com'); // Check if email from localStorage mock was used
    expect(newTransaction.id).toBeTypeOf('number');
    expect(newTransaction.datetime).toBeTypeOf('string');
  });

  it('adds a withdrawal, updates balance, and adds transaction to history', () => {
    const store = useTransactionStore();
    const initialBalance = store.balance;
    const initialCount = store.transactions.length;
    const withdrawAmount = 30000;

    const result = store.addTransaction('Withdraw', withdrawAmount);

    expect(result.success).toBe(true);
    expect(store.balance).toBe(initialBalance - withdrawAmount);
    expect(store.transactions.length).toBe(initialCount + 1);
    const newTransaction = store.transactions[0];
    expect(newTransaction.type).toBe('Withdraw');
    expect(newTransaction.amount).toBe(withdrawAmount);
  });

  it('prevents withdrawal if amount exceeds balance', () => {
    const store = useTransactionStore();
    store.balance = 500; // Set low balance for test
    const initialCount = store.transactions.length;
    const withdrawAmount = 1000;

    const result = store.addTransaction('Withdraw', withdrawAmount);

    expect(result.success).toBe(false);
    expect(result.message).toContain('ยอดเงินคงเหลือไม่เพียงพอ');
    expect(store.balance).toBe(500); // Balance should remain unchanged
    expect(store.transactions.length).toBe(initialCount); // No transaction added
  });

  it('returns error for invalid transaction type in addTransaction', () => {
    const store = useTransactionStore();
    const initialBalance = store.balance;
    const initialCount = store.transactions.length;

    const result = store.addTransaction('InvalidType', 100);

    expect(result.success).toBe(false);
    expect(result.message).toContain('ประเภทธุรกรรมไม่ถูกต้อง');
    expect(store.balance).toBe(initialBalance);
    expect(store.transactions.length).toBe(initialCount);
  });

   it('returns error for non-positive amount in addTransaction', () => {
    const store = useTransactionStore();
    const result1 = store.addTransaction('Deposit', 0);
    const result2 = store.addTransaction('Deposit', -100);

    expect(result1.success).toBe(false);
    expect(result2.success).toBe(false);
    expect(result1.message).toContain('Invalid transaction amount');
  });

  // --- Test updateTransaction ---
  it('updates a deposit transaction amount and recalculates balance', () => {
    const store = useTransactionStore();
    const transactionToUpdate = store.transactions.find(t => t.type === 'Deposit'); // Find the first deposit
    if (!transactionToUpdate) throw new Error("Seed data missing deposit for test");

    const initialBalance = store.balance;
    const oldAmount = transactionToUpdate.amount;
    const newAmount = oldAmount + 5000; // Increase deposit amount

    const result = store.updateTransaction(transactionToUpdate.id, newAmount);

    expect(result.success).toBe(true);
    expect(transactionToUpdate.amount).toBe(newAmount); // Amount in object updated
    // Balance should increase by the difference (newAmount - oldAmount)
    expect(store.balance).toBe(initialBalance + (newAmount - oldAmount));
  });

   it('updates a withdrawal transaction amount and recalculates balance', () => {
    const store = useTransactionStore();
    const transactionToUpdate = store.transactions.find(t => t.type === 'Withdraw'); // Find the first withdrawal
    if (!transactionToUpdate) throw new Error("Seed data missing withdrawal for test");

    const initialBalance = store.balance;
    const oldAmount = transactionToUpdate.amount;
    const newAmount = oldAmount - 10000; // Decrease withdrawal amount (should increase balance)

    const result = store.updateTransaction(transactionToUpdate.id, newAmount);

    expect(result.success).toBe(true);
    expect(transactionToUpdate.amount).toBe(newAmount);
    // Balance should change by the negative of the difference: initial - (newAmount - oldAmount)
    expect(store.balance).toBe(initialBalance - (newAmount - oldAmount));
  });

  it('deletes a transaction and recalculates balance correctly', () => {
    const store = useTransactionStore();
    const initialBalance = store.balance;
    const initialCount = store.transactions.length;
    // Find a specific transaction to delete (e.g., the first withdrawal)
    const transactionToDelete = store.transactions.find(t => t.type === 'Withdraw');
    if (!transactionToDelete) throw new Error("Seed data missing withdrawal for test");

    const deletedAmount = Number(transactionToDelete.amount);
    const deletedId = transactionToDelete.id;

    // Calculate expected balance: Deleting a withdrawal INCREASES balance
    const expectedBalance = initialBalance + deletedAmount;

    const result = store.deleteTransaction(deletedId);

    expect(result.success).toBe(true);
    expect(store.transactions.length).toBe(initialCount - 1);
    expect(store.transactions.find(t => t.id === deletedId)).toBeUndefined();
    // ** MODIFIED Assertion: Verify balance WAS recalculated correctly **
    expect(store.balance).toBe(expectedBalance);
  });

  it('returns error if deleting non-existent transaction', () => {
     const store = useTransactionStore();
     const result = store.deleteTransaction(99999); // Non-existent ID
     expect(result.success).toBe(false);
     expect(result.message).toContain('ไม่พบธุรกรรม');
  });
});