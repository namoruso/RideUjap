import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { instalarClerk } from './plugins/clerk'

const app = createApp(App)

app.use(createPinia())
instalarClerk(app)
app.use(router)

app.mount('#app')
