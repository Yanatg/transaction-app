// vitest.config.js
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue'; // Use the Vite plugin for Vue within Vitest
import path from 'path';

export default defineConfig({
  plugins: [
    vue(), // Process Vue files during tests
  ],
  test: {
    globals: true, // Make describe, it, expect, etc. globally available
    environment: 'happy-dom', // Use happy-dom for DOM simulation
    // Optional: Setup file for things to run before tests
    // setupFiles: './tests/setup.js',
  },
  resolve: {
    alias: {
      // Ensure the '@' alias points to your src directory, matching Vue CLI's default
      '@': path.resolve(__dirname, './src'),
    },
  },
});