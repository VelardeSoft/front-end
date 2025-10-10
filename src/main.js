import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import primevue from './primevue.js'
import i18n from './i18n.js'
import router from './router.js'
import pinia from './pinia.js'

const app = createApp(App);

app.use(primevue);  // primevue(app);
app.use(i18n);
app.use(router);
app.use(pinia);
app.mount('#app')

