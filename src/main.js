import {createApp} from 'vue'
import './style.css'
import App from './app.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
import pinia from "./pinia.js";
import 'primeflex/primeflex.css';

import Button from 'primevue/button';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.component('pv-button', Button);

app.use(pinia);
app.mount('#app')

