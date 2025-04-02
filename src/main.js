import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import './index.css'; // Or the correct path to your CSS file

const app = createApp(App);

app.use(router); // <-- Tell the Vue app to use the router

app.mount('#app');