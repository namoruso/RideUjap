<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { NuevoViaje } from '@/types'

const auth = useAuthStore()
const emit = defineEmits<{ publicar: [viaje: NuevoViaje] }>()

const hoy = new Date().toISOString().split('T')[0] as string

const form = reactive({
  origen: '',
  destino: '',
  puntoEncuentro: '',
  fecha: hoy,
  hora: '',
  cuposDisponibles: 1,
  descripcionVehiculo: '',
})

const errores = reactive<Partial<Record<string, string>>>({})
const enviado = ref(false)

function validar(): boolean {
  errores['origen'] = form.origen.trim() ? undefined : 'El origen es requerido'
  errores['destino'] = form.destino.trim() ? undefined : 'El destino es requerido'
  errores['fecha'] = form.fecha ? undefined : 'La fecha es requerida'
  errores['hora'] = form.hora ? undefined : 'La hora es requerida'
  errores['descripcionVehiculo'] = form.descripcionVehiculo.trim()
    ? undefined
    : 'Describe tu vehículo (marca, modelo, color, placa)'
  errores['cuposDisponibles'] =
    form.cuposDisponibles >= 1 && form.cuposDisponibles <= 8
      ? undefined
      : 'Los cupos deben estar entre 1 y 8'
  return !Object.values(errores).some(Boolean)
}

function handleSubmit() {
  if (!validar()) return

  const nuevoViaje: NuevoViaje = {
    origen: form.origen.trim(),
    destino: form.destino.trim(),
    puntoEncuentro: form.puntoEncuentro.trim() || undefined,
    fecha: form.fecha,
    hora: form.hora,
    cuposDisponibles: form.cuposDisponibles,
    descripcionVehiculo: form.descripcionVehiculo.trim(),
  }

  emit('publicar', nuevoViaje)
  enviado.value = true

  form.origen = ''
  form.destino = ''
  form.puntoEncuentro = ''
  form.fecha = hoy
  form.hora = ''
  form.cuposDisponibles = 1
  form.descripcionVehiculo = ''

  setTimeout(() => (enviado.value = false), 3000)
}
</script>

<template>
  <form class="formulario-publicar" novalidate @submit.prevent="handleSubmit">
    <!-- Origen / Destino -->
    <div class="form-grid-2">
      <div class="campo">
        <label for="fp-origen">Punto de salida <span class="req">*</span></label>
        <input id="fp-origen" v-model="form.origen" type="text" placeholder="Ej. Entrada principal UJAP" :class="{ 'input-error': errores['origen'] }" />
        <span v-if="errores['origen']" class="error-msg">{{ errores['origen'] }}</span>
      </div>
      <div class="campo">
        <label for="fp-destino">Destino <span class="req">*</span></label>
        <input id="fp-destino" v-model="form.destino" type="text" placeholder="Ej. Terminal San Diego" :class="{ 'input-error': errores['destino'] }" />
        <span v-if="errores['destino']" class="error-msg">{{ errores['destino'] }}</span>
      </div>
    </div>

    <!-- Punto de encuentro -->
    <div class="campo">
      <label for="fp-encuentro">Punto de encuentro exacto <span class="opt">(opcional)</span></label>
      <input id="fp-encuentro" v-model="form.puntoEncuentro" type="text" placeholder="Ej. Portón principal, frente a la caseta de seguridad" />
    </div>

    <!-- Fecha / Hora / Cupos -->
    <div class="form-grid-3">
      <div class="campo">
        <label for="fp-fecha">Fecha <span class="req">*</span></label>
        <input id="fp-fecha" v-model="form.fecha" type="date" :min="hoy" :class="{ 'input-error': errores['fecha'] }" />
        <span v-if="errores['fecha']" class="error-msg">{{ errores['fecha'] }}</span>
      </div>
      <div class="campo">
        <label for="fp-hora">Hora de salida <span class="req">*</span></label>
        <input id="fp-hora" v-model="form.hora" type="time" :class="{ 'input-error': errores['hora'] }" />
        <span v-if="errores['hora']" class="error-msg">{{ errores['hora'] }}</span>
      </div>
      <div class="campo">
        <label for="fp-cupos">Cupos disponibles <span class="req">*</span></label>
        <input id="fp-cupos" v-model.number="form.cuposDisponibles" type="number" min="1" max="8" :class="{ 'input-error': errores['cuposDisponibles'] }" />
        <span v-if="errores['cuposDisponibles']" class="error-msg">{{ errores['cuposDisponibles'] }}</span>
      </div>
    </div>

    <!-- Vehículo -->
    <div class="campo">
      <label for="fp-vehiculo">Descripción del vehículo <span class="req">*</span></label>
      <input id="fp-vehiculo" v-model="form.descripcionVehiculo" type="text" placeholder="Ej. Toyota Corolla gris, placa AB123CD" :class="{ 'input-error': errores['descripcionVehiculo'] }" />
      <span v-if="errores['descripcionVehiculo']" class="error-msg">{{ errores['descripcionVehiculo'] }}</span>
      <span class="ayuda">Para que los pasajeros identifiquen tu vehículo fácilmente</span>
    </div>

    <div class="form-acciones">
      <button type="submit" class="btn-publicar">Publicar viaje</button>
      <p v-if="enviado" class="exito" role="status">Viaje publicado correctamente</p>
    </div>
  </form>
</template>

<style scoped>
.formulario-publicar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid-2,
.form-grid-3 {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .form-grid-2 { grid-template-columns: 1fr 1fr; }
  .form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.campo label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

.req { color: #e74c3c; }
.opt { font-weight: 400; font-size: 0.78rem; color: var(--color-text); opacity: 0.6; }

.campo input {
  padding: 0.65rem 0.875rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.campo input:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}

.campo input.input-error { border-color: #e74c3c; }
.error-msg { font-size: 0.8rem; color: #e74c3c; font-weight: 500; }
.ayuda { font-size: 0.78rem; color: var(--color-text); opacity: 0.6; }

.form-acciones {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}

.btn-publicar {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  background: var(--ride-green);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 2px 8px rgba(11, 110, 79, 0.25);
}

.btn-publicar:hover {
  background: var(--ride-green-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(11, 110, 79, 0.35);
}

.exito {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ride-green);
}
</style>
