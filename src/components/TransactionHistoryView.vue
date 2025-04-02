<script setup>
// No logic needed for this placeholder
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-4">
      Transaction History
    </h1>
    <p class="text-gray-600">
      This is where the transaction history table will go.
    </p>
     <div class="mt-6 overflow-x-auto">
        <table class="min-w-full bg-white shadow-md rounded">
            <thead class="bg-gray-200">
                <tr>
                    <th class="py-2 px-4 border-b text-left">Datetime</th>
                    <th class="py-2 px-4 border-b text-left">Amount</th>
                    <th class="py-2 px-4 border-b text-left">Status</th>
                     <th class="py-2 px-4 border-b text-left">Email</th>
                    <th class="py-2 px-4 border-b text-left">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr class="hover:bg-gray-50">
                    <td class="py-2 px-4 border-b">06/06/2022 10:19:53</td>
                    <td class="py-2 px-4 border-b">20,000</td>
                    <td class="py-2 px-4 border-b">Deposit</td>
                    <td class="py-2 px-4 border-b">email@gmail.com</td>
                    <td class="py-2 px-4 border-b">
                        <button class="text-blue-500 hover:underline mr-2">Edit</button>
                        <button class="text-red-500 hover:underline">Delete</button>
                    </td>
                </tr>
                 <tr class="hover:bg-gray-50">
                    <td class="py-2 px-4 border-b">15/02/2022 21:24:24</td>
                    <td class="py-2 px-4 border-b">40,000</td>
                    <td class="py-2 px-4 border-b">Withdraw</td>
                     <td class="py-2 px-4 border-b">email@gmail.com</td>
                    <td class="py-2 px-4 border-b">
                         <button class="text-blue-500 hover:underline mr-2">Edit</button>
                        <button class="text-red-500 hover:underline">Delete</button>
                    </td>
                </tr>
                 <tr class="hover:bg-gray-50">
                    <td class="py-2 px-4 border-b">31/12/2021 23:59:49</td>
                    <td class="py-2 px-4 border-b">100,000</td>
                    <td class="py-2 px-4 border-b">Withdraw</td>
                     <td class="py-2 px-4 border-b">email@gmail.com</td>
                    <td class="py-2 px-4 border-b">
                         <button class="text-blue-500 hover:underline mr-2">Edit</button>
                        <button class="text-red-500 hover:underline">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
         <p class="mt-4 text-sm text-gray-600">Showing 1 to 3 of 3 entries</p>
     </div>
  </div>
</template>

<style scoped>
/* Add specific styles if needed */
</style>