<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();


const emailError = ref('');
const loginError = ref('');

const handleLogin = () => {
  console.log('Attempting login with:', email.value, password.value);

  emailError.value = '';
  loginError.value = '';

  // Validate Email
  if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address.';
    return; 
  }

  // Simulate Authentication
  if (email.value === 'email@gmail.com' && password.value === 'password') {
    console.log('Login Successful!');
     localStorage.setItem('isLoggedIn', 'true');
     emailError.value = '';
     loginError.value = '';
     router.push('/dashboard');
  } else {
    loginError.value = 'Invalid email or password.';
  }
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-white">
    <h1 class="text-3xl font-bold mb-6 text-center">Welcome to Clicknext transaction system!</h1>
    <div class="p-8 rounded w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email *</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Email"
            required
            :class="{ 'border-red-500': emailError }" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            aria-describedby="email-error"
          />
          <p v-if="emailError" id="email-error" class="text-red-500 text-xs italic mt-1">
            {{ emailError }}
          </p>
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password *</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Password"
            required
            :class="{ 'border-red-500': loginError }" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            aria-describedby="login-error"
          />
           <p v-if="loginError" id="login-error" class="text-red-500 text-xs italic">
             {{ loginError }}
          </p>
        </div>
        <div class="flex items-center justify-between mt-4"> <button
            type="submit"
            class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>