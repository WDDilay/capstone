import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import PrimeVue from 'primevue/config'
import './assets/main.css';

//pinia
import { createPinia } from 'pinia';


// Import PrimeVue styles (Required)
import 'primeicons/primeicons.css';


//Prime Vue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import ToastService from 'primevue/toastservice'; 
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';

// Create Vue app
const app = createApp(App)
const pinia = createPinia();

app.use(pinia); 

// Use PrimeVue
app.use(PrimeVue)
app.use(ToastService);
app.use(ConfirmationService);


//component
app.component('Button', Button);
app.component('Card', Card);
app.component('Avatar', Avatar);
app.component('ConfirmDialog', ConfirmDialog);

// Mount the app
app.use(router)
app.mount('#app')


