import { createApp } from 'vue'
import { createPinia } from 'pinia'; // Import Pinia
import App from './App.vue'
import router from './router';
import './index.css'; // Or the correct path to your CSS file


const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router); // <-- Tell the Vue app to use the router

app.mount('#app');