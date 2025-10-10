import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import primevue from './primevue.js'

const app = createApp(App);

primevue(app);

app.mount('#app')

