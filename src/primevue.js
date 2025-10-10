import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Dropdown from 'primevue/dropdown';
import DataView from 'primevue/dataview';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Panel from 'primevue/panel';
import Calendar from 'primevue/calendar';
import InputMask from 'primevue/inputmask';
import ProgressSpinner from 'primevue/progressspinner';
import Sidebar from 'primevue/sidebar';

export default (app) => {
    app.use(PrimeVue, {
        theme: {
            preset: Aura
        }
    })

    app.component('pv-button', Button);
    app.component('pv-select-button', SelectButton);
    app.component('pv-float-label', FloatLabel);
    app.component('pv-input-text', InputText);
    app.component('pv-multi-select', MultiSelect);
    app.component('pv-dropdown', Dropdown);
    app.component('pv-data-view', DataView);
    app.component('pv-textarea', Textarea);
    app.component('pv-input-number', InputNumber);
    app.component('pv-data-table', DataTable);
    app.component('pv-column', Column);
    app.component('pv-panel', Panel);
    app.component('pv-calendar', Calendar);
    app.component('pv-input-mask', InputMask);
    app.component('pv-progress-spinner', ProgressSpinner);
    app.component('pv-sidebar', Sidebar);
}