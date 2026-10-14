<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { NuevoViaje } from '@/types'
import MapaTrayecto, { type InfoRuta, type PuntoMapa } from '@/components/MapaTrayecto.vue'
import InputLugar from '@/components/InputLugar.vue'
import { estaEnCarabobo } from '@/services/googleMaps'
import { hoyIso, salidaEsFutura } from '@/utils/fechas'

defineProps<{ enviando?: boolean; errorServidor?: string | null }>()
const emit = defineEmits<{ publicar: [viaje: NuevoViaje] }>()

const auth = useAuthStore()
const hoy = hoyIso()

function vehiculoPorDefecto(): string {
  const u = auth.usuario
  if (!u?.placa) return ''
  return [u.marcaVehiculo, u.modeloVehiculo, u.colorVehiculo].filter(Boolean).join(' ') + `, placa ${u.placa}`
}

const form = reactive({
  origen: '',
  destino: '',
  puntoEncuentro: '',
  fecha: hoy,
  hora: '',
  cuposDisponibles: 3,
  descripcionVehiculo: vehiculoPorDefecto(),
})

const origenMapa = ref<PuntoMapa | null>(null)
const destinoMapa = ref<PuntoMapa | null>(null)
const infoRuta = ref<InfoRuta>(null)
const errores = reactive<Partial<Record<string, string>>>({})

const fueraDeCarabobo = computed(
  () =>
    [origenMapa.value, destinoMapa.value].some((p) => p && !estaEnCarabobo(p)),
)

function onOrigen(p: PuntoMapa) {
  origenMapa.value = p
  if (p.label) form.origen = p.label
  errores['origen'] = undefined
}

function onDestino(p: PuntoMapa) {
  destinoMapa.value = p
  if (p.label) form.destino = p.label
  errores['destino'] = undefined
}

function validar(): boolean {
  const o = origenMapa.value
  const d = destinoMapa.value
  errores['origen'] = !form.origen.trim()
    ? '¿Cuál es el punto de salida?'
    : !o
      ? 'Elige una sugerencia, usa tu ubicación o marca el punto en el mapa'
      : undefined
  errores['destino'] = !form.destino.trim()
    ? '¿Cuál es el destino?'
    : !d
      ? 'Elige una sugerencia o marca el punto en el mapa'
      : o && Math.abs(o.lat - d.lat) < 1e-4 && Math.abs(o.lng - d.lng) < 1e-4
        ? 'El destino debe ser distinto del origen'
        : undefined
  errores['fecha'] = !form.fecha
    ? '¿Qué día sales?'
    : form.fecha < hoy
      ? 'La fecha no puede estar en el pasado'
      : undefined
  errores['hora'] = !form.hora
    ? '¿A qué hora sales?'
    : form.fecha && !salidaEsFutura(form.fecha, form.hora)
      ? 'La hora de salida ya pasó'
      : undefined
  errores['descripcionVehiculo'] = form.descripcionVehiculo.trim()
    ? undefined
    : '¿Cómo es tu vehículo (marca, modelo, color, placa)?'
  errores['cuposDisponibles'] =
    Number.isInteger(form.cuposDisponibles) && form.cuposDisponibles >= 1 && form.cuposDisponibles <= 8
      ? undefined
      : 'Los cupos deben estar entre 1 y 8'
  return !Object.values(errores).some(Boolean)
}

function handleSubmit() {
  if (!validar() || !auth.estaAutenticado || !origenMapa.value || !destinoMapa.value) return
  emit('publicar', {
    origen: form.origen.trim(),
    destino: form.destino.trim(),
    puntoEncuentro: form.puntoEncuentro.trim() || undefined,
    fecha: form.fecha,
    hora: form.hora,
    cuposDisponibles: form.cuposDisponibles,
    descripcionVehiculo: form.descripcionVehiculo.trim(),
    origenLat: origenMapa.value.lat,
    origenLng: origenMapa.value.lng,
    destinoLat: destinoMapa.value.lat,
    destinoLng: destinoMapa.value.lng,
  })
}
</script>

<template>
  <form class="form-pub" novalidate @submit.prevent="handleSubmit">
    <section class="card" aria-labelledby="ruta-titulo">
      <header class="card-head">
        <div>
          <h2 id="ruta-titulo">Datos del recorrido</h2>
          <p>Escribe un lugar y elige una sugerencia de Google, usa tu ubicación o marca A/B en el mapa.</p>
        </div>
        <span class="paso">Paso 1 de 2</span>
      </header>

      <div class="grid-2">
        <div class="campo">
          <label for="fp-origen">
            <span class="dot dot--a" aria-hidden="true" />
            Punto de salida <span class="req">*</span>
          </label>
          <InputLugar
            id="fp-origen"
            v-model="form.origen"
            placeholder="Escribe una dirección o usa tu ubicación"
            :invalido="!!errores['origen']"
            :confirmado="!!origenMapa"
            @seleccionar="onOrigen"
            @invalidar="origenMapa = null"
          />
          <span v-if="errores['origen']" class="error-msg">{{ errores['origen'] }}</span>
        </div>

        <div class="campo">
          <label for="fp-destino">
            <span class="dot dot--b" aria-hidden="true" />
            Destino <span class="req">*</span>
          </label>
          <InputLugar
            id="fp-destino"
            v-model="form.destino"
            placeholder="Campus UJAP, San Diego…"
            :invalido="!!errores['destino']"
            :confirmado="!!destinoMapa"
            @seleccionar="onDestino"
            @invalidar="destinoMapa = null"
          />
          <span v-if="errores['destino']" class="error-msg">{{ errores['destino'] }}</span>
        </div>
      </div>

      <div class="campo">
        <label for="fp-encuentro">
          Punto de encuentro exacto <span class="opt">(recomendado)</span>
        </label>
        <input
          id="fp-encuentro"
          v-model="form.puntoEncuentro"
          type="text"
          placeholder="Ej. Portón principal, frente a la caseta"
        />
      </div>

      <MapaTrayecto
        :origen="origenMapa"
        :destino="destinoMapa"
        editable
        height="320px"
        @update:origen="onOrigen"
        @update:destino="onDestino"
        @update:ruta="infoRuta = $event"
      />
      <p v-if="fueraDeCarabobo" class="aviso-zona" role="status">
        Un punto está fuera de Carabobo. RideUJAP está pensado para recorridos de la zona del campus.
      </p>
      <p v-if="infoRuta" class="ruta-info">
        Trayecto estimado: <strong>{{ infoRuta.distanciaTexto }}</strong> ·
        <strong>{{ infoRuta.duracionTexto }}</strong>
      </p>
    </section>

    <section class="card" aria-labelledby="hora-titulo">
      <header class="card-head">
        <div>
          <h2 id="hora-titulo">Horario y capacidad</h2>
          <p>Fecha, hora de salida y asientos libres.</p>
        </div>
        <span class="paso">Paso 2 de 2</span>
      </header>

      <div class="grid-3">
        <div class="campo">
          <label for="fp-fecha">Fecha <span class="req">*</span></label>
          <input
            id="fp-fecha"
            v-model="form.fecha"
            type="date"
            :min="hoy"
            :class="{ 'input-error': errores['fecha'] }"
          />
          <span v-if="errores['fecha']" class="error-msg">{{ errores['fecha'] }}</span>
        </div>
        <div class="campo">
          <label for="fp-hora">Hora de salida <span class="req">*</span></label>
          <input
            id="fp-hora"
            v-model="form.hora"
            type="time"
            :class="{ 'input-error': errores['hora'] }"
          />
          <span v-if="errores['hora']" class="error-msg">{{ errores['hora'] }}</span>
        </div>
        <div class="campo">
          <label for="fp-cupos">Cupos disponibles <span class="req">*</span></label>
          <select id="fp-cupos" v-model.number="form.cuposDisponibles">
            <option v-for="n in 8" :key="n" :value="n">
              {{ n }} cupo{{ n === 1 ? '' : 's' }}
            </option>
          </select>
        </div>
      </div>

      <div class="campo">
        <label for="fp-vehiculo">Descripción del vehículo <span class="req">*</span></label>
        <input
          id="fp-vehiculo"
          v-model="form.descripcionVehiculo"
          type="text"
          placeholder="Ej. Toyota Corolla gris, placa AB123CD"
          :class="{ 'input-error': errores['descripcionVehiculo'] }"
        />
        <span v-if="errores['descripcionVehiculo']" class="error-msg">{{
          errores['descripcionVehiculo']
        }}</span>
        <span class="ayuda">Para que los pasajeros identifiquen tu auto al abordaje.</span>
      </div>
    </section>

    <div class="acciones">
      <button type="submit" class="btn-publicar" :disabled="enviando">
        {{ enviando ? 'Publicando…' : 'Publicar mi viaje ahora' }}
      </button>
      <p v-if="errorServidor" class="error-msg" role="alert">{{ errorServidor }}</p>
    </div>
    <p class="legal">
      Al publicar confirmas cumplir las normas de tránsito y el reglamento de convivencia UJAP. RideUJAP
      no es un servicio de taxi ni cobro comercial.
    </p>
  </form>
</template>

<style scoped>
.form-pub {
  display: grid;
  gap: 1.25rem;
}
.card {
  padding: 1.35rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1.15rem;
  background: var(--color-background);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-heading) 5%, transparent);
}
@media (min-width: 640px) {
  .card {
    padding: 1.6rem 1.5rem;
  }
}
.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.15rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--color-border);
}
.card-head h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-heading);
}
.card-head p {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: var(--color-text);
}
.paso {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.grid-2,
.grid-3 {
  display: grid;
  gap: 0.9rem;
  margin-bottom: 0.9rem;
}
@media (min-width: 640px) {
  .grid-2 {
    grid-template-columns: 1fr 1fr;
  }
  .grid-3 {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}
.campo label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-heading);
}
.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
}
.dot--a {
  background: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.dot--b {
  background: #dc2626;
  box-shadow: 0 0 0 3px color-mix(in srgb, #dc2626 18%, transparent);
}
.req {
  color: #dc2626;
  text-transform: none;
}
.opt {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text);
  opacity: 0.7;
}
.campo input,
.campo select {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.92rem;
  font-family: inherit;
}
.campo input:focus,
.campo select:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.campo input.input-error {
  border-color: #dc2626;
}
.error-msg {
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 600;
}
.ayuda {
  font-size: 0.75rem;
  color: var(--color-text);
}
.ruta-info {
  margin: 0.55rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text);
}
.acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem;
}
.btn-publicar {
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 0.85rem;
  background: var(--ride-green);
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 28%, transparent);
}
.btn-publicar:hover {
  background: var(--ride-green-hover);
}
.aviso-zona {
  margin: 0.55rem 0 0;
  font-size: 0.82rem;
  color: #b45309;
}
.btn-publicar:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.legal {
  margin: 0;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text);
}
</style>
