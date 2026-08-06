import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { conductorEjemplo, vehiculoEjemplo, viajeEjemplo } from './data/ejemplos'

// Lab check: open DevTools (F12) → Console to see RideUJAP typed data
console.log('RideUJAP — Usuario:', conductorEjemplo)
console.log('RideUJAP — Vehiculo:', vehiculoEjemplo)
console.log('RideUJAP — Viaje:', viajeEjemplo)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
