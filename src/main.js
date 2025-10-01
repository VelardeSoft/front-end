import {createApp} from 'vue'
import './style.css'
import App from './app.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
// import primevue components
import 'primeicons/primeicons.css'
import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/saga-blue/theme.css';

import pinia from "./pinia.js";

// import primeflex}
import 'primeflex/primeflex.css';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.use(pinia);
app.mount('#app')

