<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import { useAuthStore } from '@/stores/auth'
import type { UsuarioPublico } from '@/types'
import TarjetaUsuario from '@/components/TarjetaUsuario.vue'
import EncabezadoRide from '@/components/EncabezadoRide.vue'

const route = useRoute()
const router = useRouter()
const store = useViajesStore()
const auth = useAuthStore()

const conductor = ref<UsuarioPublico | null>(null)
const mensaje = ref('')
const mensajeError = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const viajeId = computed(() => Number(route.params['id']))
const viaje = computed(() => store.getViajeById(viajeId.value))

const esConductorDelViaje = computed(
  () => auth.estaAutenticado && viaje.value?.idConductor === auth.usuario?.id,
)

const yaUnido = computed(() => store.yaUnido(viajeId.value))

const fechaFormateada = computed(() => {
  if (!viaje.value?.fecha) return ''
  const [y, m, d] = viaje.value.fecha.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('es-VE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
})

function formatHora(h: string) {
  const [hh, mm] = h.split(':')
  const hora = parseInt(hh ?? '0')
  return `${hora % 12 || 12}:${mm} ${hora >= 12 ? 'PM' : 'AM'}`
}

async function cargarConductor(idConductor: number) {
  try {
    const res = await fetch(`${API_URL}/usuarios/${idConductor}`)
    if (res.ok) conductor.value = await res.json()
  } catch (e) {
    console.error('No se pudo cargar el conductor:', e)
  }
}

async function handleUnirse() {
  mensajeError.value = ''
  mensaje.value = ''
  if (!auth.estaAutenticado) { router.push('/login'); return }
  const result = await store.unirseAViaje(viajeId.value)
  if (result.ok) mensaje.value = result.mensaje
  else mensajeError.value = result.mensaje
}

async function handleAbandonar() {
  mensajeError.value = ''
  mensaje.value = ''
  const result = await store.abandonarViaje(viajeId.value)
  if (result.ok) mensaje.value = result.mensaje
  else mensajeError.value = result.mensaje
}

const pasajeros = ref<UsuarioPublico[]>([])
const nuevaHora = ref('')
const mostrarModalEditarHora = ref(false)
const mostrarModalConfirmacion = ref(false)

function intentarEliminarViaje() {
  mostrarModalConfirmacion.value = true
}

function cancelarEliminar() {
  mostrarModalConfirmacion.value = false
}

async function confirmarEliminarViaje() {
  mostrarModalConfirmacion.value = false
  mensajeError.value = ''
  mensaje.value = ''
  const result = await store.eliminarViaje(viajeId.value)
  if (result.ok) {
    // Usamos el mensaje de la app, pero podríamos redirigir tras un timeout corto
    router.push('/mis-viajes')
  } else {
    mensajeError.value = result.mensaje
  }
}

function intentarEditarHora() {
  nuevaHora.value = viaje.value?.hora || ''
  mostrarModalEditarHora.value = true
}

function cancelarEditarHora() {
  mostrarModalEditarHora.value = false
}

async function confirmarEditarHora() {
  if (!nuevaHora.value) {
    mensajeError.value = 'Debes seleccionar una nueva hora'
    return
  }
  mensajeError.value = ''
  mensaje.value = ''
  const result = await store.editarHoraViaje(viajeId.value, nuevaHora.value)
  if (result.ok) {
    mensaje.value = result.mensaje
    mostrarModalEditarHora.value = false
  } else {
    mensajeError.value = result.mensaje
  }
}

onMounted(async () => {
  if (store.viajes.length === 0) await store.cargarViajes()
  const v = store.getViajeById(viajeId.value)
  if (!v) { router.replace('/viajes'); return }
  await cargarConductor(v.idConductor)
})

watch(viaje, async (v) => {
  if (v && !conductor.value) await cargarConductor(v.idConductor)
  if (v && esConductorDelViaje.value) {
    pasajeros.value = await store.obtenerPasajeros(v.id)
    nuevaHora.value = v.hora
  }
}, { immediate: true })
</script>

<template>
  <main class="detalle-view page-content">
    <button type="button" class="btn-volver" @click="router.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
      Volver
    </button>

    <div v-if="viaje" class="detalle-grid">
      <!-- Panel principal -->
      <section class="panel-viaje" aria-labelledby="detalle-titulo">
        <EncabezadoRide :titulo="`${viaje.origen} → ${viaje.destino}`" subtitulo="Detalle del viaje" />

        <dl class="info-lista">
          <div v-if="viaje.puntoEncuentro" class="info-item">
            <dt class="info-label">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Punto de encuentro
            </dt>
            <dd class="info-val">{{ viaje.puntoEncuentro }}</dd>
          </div>
          <div class="info-item">
            <dt class="info-label">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Fecha
            </dt>
            <dd class="info-val">{{ fechaFormateada }}</dd>
          </div>
          <div class="info-item">
            <dt class="info-label">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Hora de salida
            </dt>
            <dd class="info-val">{{ formatHora(viaje.hora) }}</dd>
          </div>
          <div class="info-item">
            <dt class="info-label">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              Cupos disponibles
            </dt>
            <dd class="info-val">{{ viaje.cuposDisponibles }} de {{ viaje.cuposTotal }}</dd>
          </div>
          <div class="info-item">
            <dt class="info-label">Estado</dt>
            <dd class="info-val">
              <span :class="['badge', `badge--${viaje.estado.replace(' ', '-')}`]">{{ viaje.estado }}</span>
            </dd>
          </div>
        </dl>

        <!-- Acciones -->
        <div class="acciones">
          <template v-if="esConductorDelViaje">
            <div class="aviso-info">Este es tu viaje publicado</div>
            <button type="button" class="btn-abandonar" @click="intentarEliminarViaje">Eliminar viaje</button>
            <button type="button" class="btn-secundario" @click="intentarEditarHora">Editar hora</button>
          </template>

          <template v-else-if="!auth.estaAutenticado">
            <p class="aviso-login">
              <RouterLink to="/login">Inicia sesión</RouterLink> para unirte a este viaje
            </p>
          </template>

          <template v-else-if="yaUnido">
            <div class="aviso-unido">Ya eres pasajero de este viaje</div>
            <button type="button" class="btn-abandonar" @click="handleAbandonar">Abandonar viaje</button>
          </template>

          <button v-else-if="viaje.cuposDisponibles === 0 || viaje.estado === 'lleno'" type="button" class="btn-unirse" disabled>Sin cupos disponibles</button>
          <div v-else-if="viaje.estado === 'finalizado'" class="aviso-info">Este viaje ya finalizó</div>
          <button v-else type="button" class="btn-unirse" @click="handleUnirse">Unirme a este viaje</button>
        </div>

        <p v-if="mensaje" class="mensaje-ok" role="status">{{ mensaje }}</p>
        <p v-if="mensajeError" class="mensaje-err" role="alert">{{ mensajeError }}</p>
      </section>

      <!-- Panel lateral -->
      <aside class="panel-lateral">
        <section v-if="conductor" aria-labelledby="conductor-titulo">
          <h2 id="conductor-titulo" class="panel-titulo">Conductor</h2>
          <TarjetaUsuario :usuario="conductor" />
        </section>

        <section v-if="viaje.descripcionVehiculo" class="panel-vehiculo" aria-labelledby="vehiculo-titulo">
          <h2 id="vehiculo-titulo" class="panel-titulo">Vehículo</h2>
          <div class="vehiculo-info">
            <svg class="vehiculo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
            </svg>
            <p>{{ viaje.descripcionVehiculo }}</p>
          </div>
        </section>

        <section v-if="esConductorDelViaje" aria-labelledby="pasajeros-titulo">
          <h2 id="pasajeros-titulo" class="panel-titulo">Pasajeros ({{ pasajeros.length }})</h2>
          <div v-if="pasajeros.length === 0" class="vehiculo-info">
            <p>Aún no hay pasajeros unidos.</p>
          </div>
          <div v-else class="contenedor-pasajeros">
            <div class="lista-pasajeros">
              <TarjetaUsuario v-for="p in pasajeros" :key="p.id" :usuario="p as any" />
            </div>
          </div>
        </section>
      </aside>
    </div>

    <p v-else class="cargando" role="status">Cargando viaje…</p>

    <!-- Modal Confirmación Eliminar -->
    <div v-if="mostrarModalConfirmacion" class="modal-overlay" @click.self="cancelarEliminar">
      <div class="modal-content">
        <h3>Eliminar viaje</h3>
        <p>¿Estás seguro de que deseas eliminar este viaje? Esta acción no se puede deshacer y notificará a los pasajeros unidos.</p>
        <div class="modal-actions">
          <button type="button" class="btn-cancelar" @click="cancelarEliminar">Cancelar</button>
          <button type="button" class="btn-confirmar-eliminar" @click="confirmarEliminarViaje">Sí, eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Hora -->
    <div v-if="mostrarModalEditarHora" class="modal-overlay" @click.self="cancelarEditarHora">
      <div class="modal-content">
        <h3>Editar hora de salida</h3>
        <p>Selecciona el nuevo horario de salida para tu viaje.</p>
        
        <div style="margin-bottom: 1.5rem;">
          <input type="time" v-model="nuevaHora" class="input-hora-grande" />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancelar" @click="cancelarEditarHora">Cancelar</button>
          <button type="button" class="btn-guardar" @click="confirmarEditarHora">Guardar hora</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.detalle-view { width: 100%; }

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-volver:hover { background: var(--color-background-soft); }

.detalle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 768px) {
  .detalle-grid { grid-template-columns: 2fr 1fr; align-items: start; }
}

.panel-viaje, .panel-lateral {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-titulo {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ride-green);
}

/* Info lista */
.info-lista {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}
.info-item:last-child { border-bottom: none; }

.info-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.7;
  white-space: nowrap;
}

.info-icon { width: 0.95rem; height: 0.95rem; flex-shrink: 0; }
.info-val { font-size: 0.9rem; font-weight: 500; text-align: right; }

/* Badges */
.badge {
  padding: 0.2rem 0.65rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
.badge--disponible { background: #dcfce7; color: #166534; }
.badge--lleno { background: #f3f4f6; color: #374151; }
.badge--en-curso { background: #fef9c3; color: #854d0e; }
.badge--finalizado { background: #fee2e2; color: #991b1b; }

/* Acciones */
.acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.btn-unirse {
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: 8px;
  background: var(--ride-green);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
  box-shadow: 0 2px 10px rgba(11, 110, 79, 0.25);
}
.btn-unirse:hover:not(:disabled) { background: var(--ride-green-hover); transform: translateY(-1px); }
.btn-unirse:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.btn-abandonar {
  padding: 0.65rem 1.25rem;
  border: 1.5px solid #dc2626;
  border-radius: 8px;
  background: transparent;
  color: #dc2626;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-abandonar:hover { background: #dc2626; color: #fff; }

.btn-secundario {
  padding: 0.65rem 1.25rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-secundario:hover { background: var(--color-background-soft); }

.input-hora-grande {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
  font-size: 1.1rem;
  width: 100%;
}
.input-hora-grande:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.btn-guardar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--ride-green);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.aviso-info {
  padding: 0.65rem 1rem;
  background: var(--ride-green-light);
  color: var(--ride-green);
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
}

.aviso-unido {
  padding: 0.5rem 0.9rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.aviso-login { font-size: 0.9rem; color: var(--color-text); }
.aviso-login a { color: var(--ride-green); font-weight: 700; }

.mensaje-ok {
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
  font-size: 0.9rem;
}
.mensaje-err {
  padding: 0.65rem 1rem;
  border-left: 4px solid #dc2626;
  background: #fef2f2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Vehículo */
.vehiculo-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
}
.vehiculo-icon { width: 1.5rem; height: 1.5rem; flex-shrink: 0; opacity: 0.6; margin-top: 0.1rem; }
.vehiculo-info p { margin: 0; font-size: 0.9rem; }

.contenedor-pasajeros {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
  padding: 0.75rem;
}

.lista-pasajeros {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 135px; /* Altura suficiente para mostrar solo una tarjeta a simple vista */
  overflow-y: auto;
  padding-right: 0.5rem; /* espacio para el scrollbar */
}
.lista-pasajeros::-webkit-scrollbar {
  width: 6px;
}
.lista-pasajeros::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.cargando { text-align: center; padding: 3rem; opacity: 0.5; }

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  padding: 1.5rem;
  border-radius: var(--ride-radius-lg);
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: var(--color-heading);
  font-size: 1.25rem;
}

.modal-content p {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancelar {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  border-radius: var(--ride-radius);
  cursor: pointer;
  font-weight: 600;
}

.btn-confirmar-eliminar {
  padding: 0.5rem 1rem;
  border: none;
  background: #dc2626;
  color: #fff;
  border-radius: var(--ride-radius);
  cursor: pointer;
  font-weight: 600;
}

.btn-confirmar-eliminar:hover {
  background: #b91c1c;
}
</style>
