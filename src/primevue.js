import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

import Button from 'primevue/button';

export default (app) => {
    app.use(PrimeVue, {
        theme: {
            preset: Aura
        }
    })

    app.component('pv-button', Button);
}