
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import axios from 'axios';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import toastMixin from '@/mixins/toastMixin';

axios.defaults.baseURL = 'http://127.0.0.1:8000/api/';
axios.defaults.headers.common['Content-Type'] = 'application/json';

loadFonts();
const app = createApp(App);
app.use(router);
app.use(VueSweetalert2);
app.use(vuetify);
app.mixin(toastMixin); 

app.mount('#app');





// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'
// import vuetify from './plugins/vuetify'
// import { loadFonts } from './plugins/webfontloader'
// import axios from 'axios';
// import VueSweetalert2 from 'vue-sweetalert2';
// import 'sweetalert2/dist/sweetalert2.min.css';
// import toastMixin from '@/mixins/toastMixin';


// axios.defaults.baseURL = 'http://127.0.0.1:8000/api/';  // Set your backend URL here
// axios.defaults.headers.common['Content-Type'] = 'application/json';

// loadFonts()

// createApp(App)
//   .use(router)
//   .use(VueSweetalert2)
//   .use(vuetify)
//   .use.mixin(toastMixin)
//   .mount('#app')