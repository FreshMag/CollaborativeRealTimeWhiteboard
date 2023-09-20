import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap';
import store from "core-js/internals/shared-store";
import axios from "axios";

const app = createApp(App);
app.config.globalProperties.$socket = {};

axios.defaults.withCredentials = true;

app.use(store).use(router).mount('#app');



