import {createApp} from 'vue'
import './style.css'
import App from './app.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
import pinia from "./pinia.js";
import 'primeflex/primeflex.css';
import i18n from './i18n.js';
import router from './router.js';

// Importar componentes de PrimeVue
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import ProgressSpinner from 'primevue/progressspinner';
import DataView from 'primevue/dataview';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

// Registrar componentes globalmente
app.component('Button', Button);
app.component('pv-button', Button); // Mantener compatibilidad con código existente
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Toast', Toast);
app.component('Dropdown', Dropdown);
app.component('Textarea', Textarea);
app.component('Chip', Chip);
app.component('Message', Message);
app.component('Tag', Tag);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Dialog', Dialog);
app.component('Calendar', Calendar);
app.component('InputNumber', InputNumber);
app.component('ProgressSpinner', ProgressSpinner);
app.component('DataView', DataView);

// Registrar servicios
app.use(ToastService);
app.use(pinia);
app.use(i18n);
app.use(router);
app.mount('#app')
