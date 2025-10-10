import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';

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
}