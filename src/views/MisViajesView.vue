<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import { useAuthStore } from '@/stores/auth'
import EstadoVacio from '@/components/EstadoVacio.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import type { UsuarioPublico, Viaje } from '@/types'
import { blobLugaresViaje, lugarCoincide } from '@/utils/lugares'

type TabMisViajes = 'activos' | 'completados' | 'cancelados'

const store = useViajesStore()
const auth = useAuthStore()
const router = useRouter()

const tab = ref<TabMisViajes>('activos')
const busqueda = ref('')
const eliminandoId = ref<number | null>(null)
const pasajerosPorViaje = reactive<Record<number, UsuarioPublico[]>>({})
const cargandoPasajeros = ref(false)

const modalEliminar = ref(false)
const viajeAEliminar = ref<number | null>(null)
const modalAviso = ref(false)
const avisoTitulo = ref('')
const avisoMensaje = ref('')

const misViajes = computed(() =>
  auth.usuario ? store.viajesDelUsuario(auth.usuario.id) : [],
)

function hoyIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function esActivo(v: Viaje): boolean {
  if (v.estado === 'cancelado') return false
  if (v.estado === 'completado') return false
  return v.fecha >= hoyIso()
}

function esCompletado(v: Viaje): boolean {
  if (v.estado === 'cancelado') return false
  if (v.estado === 'completado') return true
  return v.fecha < hoyIso()
}

function esCancelado(v: Viaje): boolean {
  return v.estado === 'cancelado'
}

const contadores = computed(() => ({
  activos: misViajes.value.filter(esActivo).length,
  completados: misViajes.value.filter(esCompletado).length,
  cancelados: misViajes.value.filter(esCancelado).length,
}))

const viajesTab = computed(() => {
  const base =
    tab.value === 'activos'
      ? misViajes.value.filter(esActivo)
      : tab.value === 'completados'
        ? misViajes.value.filter(esCompletado)
        : misViajes.value.filter(esCancelado)

  const q = busqueda.value.trim()
  if (!q) return base
  return base.filter(
    (v) =>
      lugarCoincide(blobLugaresViaje(v), q) ||
      lugarCoincide(v.descripcionVehiculo, q) ||
      String(v.id).includes(q),
  )
})

const metricas = computed(() => {
  const activos = misViajes.value.filter(esActivo)
  const cuposLibres = activos.reduce((s, v) => s + v.cuposDisponibles, 0)
  const cuposOcupados = activos.reduce((s, v) => s + (v.cuposTotal - v.cuposDisponibles), 0)
  const cuposTotal = activos.reduce((s, v) => s + v.cuposTotal, 0)
  const deHoy = activos.filter((v) => v.fecha === hoyIso()).length
  return {
    activos: activos.length,
    deHoy,
    pasajeros: cuposOcupados,
    cuposLibres,
    cuposTotal,
  }
})

function formatHora(h: string) {
  const [hh, mm] = h.split(':')
  const hora = parseInt(hh ?? '0', 10)
  const ampm = hora >= 12 ? 'PM' : 'AM'
  const hora12 = hora % 12 || 12
  return `${hora12}:${mm ?? '00'} ${ampm}`
}

function formatFecha(f: string) {
  const [y, m, d] = f.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

function etiquetaEstado(v: Viaje) {
  if (v.estado === 'lleno' || v.cuposDisponibles === 0) return 'Lleno'
  if (v.estado === 'disponible') {
    return `Disponible (${v.cuposDisponibles} cupo${v.cuposDisponibles === 1 ? '' : 's'} libre${v.cuposDisponibles === 1 ? '' : 's'})`
  }
  return v.estado
}

function pctOcupacion(v: Viaje) {
  if (!v.cuposTotal) return 0
  return Math.round(((v.cuposTotal - v.cuposDisponibles) / v.cuposTotal) * 100)
}

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

async function cargarPasajerosActivos() {
  if (!auth.usuario) return
  const ids = misViajes.value.filter(esActivo).map((v) => v.id)
  if (ids.length === 0) return
  cargandoPasajeros.value = true
  try {
    await Promise.all(
      ids.map(async (id) => {
        pasajerosPorViaje[id] = await store.obtenerPasajeros(id)
      }),
    )
  } finally {
    cargandoPasajeros.value = false
  }
}

function mostrarAviso(titulo: string, mensaje: string) {
  avisoTitulo.value = titulo
  avisoMensaje.value = mensaje
  modalAviso.value = true
}

function pedirCancelarViaje(id: number) {
  viajeAEliminar.value = id
  modalEliminar.value = true
}

function cerrarModalEliminar() {
  if (eliminandoId.value !== null) return
  modalEliminar.value = false
  viajeAEliminar.value = null
}

async function confirmarCancelarViaje() {
  const id = viajeAEliminar.value
  if (id == null) return
  eliminandoId.value = id
  try {
    const r = await store.eliminarViaje(id)
    if (!r.ok) {
      modalEliminar.value = false
      viajeAEliminar.value = null
      mostrarAviso('No se pudo cancelar', r.mensaje)
    } else {
      delete pasajerosPorViaje[id]
      modalEliminar.value = false
      viajeAEliminar.value = null
    }
  } finally {
    eliminandoId.value = null
  }
}

function irDetalle(id: number) {
  router.push(`/viajes/${id}`)
}

onMounted(async () => {
  if (store.viajes.length === 0) await store.cargarViajes()
  await cargarPasajerosActivos()
})

watch(
  () => misViajes.value.map((v) => v.id).join(','),
  () => {
    void cargarPasajerosActivos()
  },
)
</script>

<template>
  <main class="mis-viajes page-content">
    <nav class="crumb" aria-label="Ruta">
      <RouterLink to="/inicio">Inicio</RouterLink>
      <span>/</span>
      <span class="crumb-muted">Mis viajes</span>
      <span>/</span>
      <span class="crumb-on">Gestión de rutas</span>
    </nav>

    <header class="hero">
      <div class="hero-copy">
        <h1>Mis viajes</h1>
        <p>
          Administra las rutas que publicaste como conductor, consulta quién se unió y revisa el
          estado de tus trayectos hacia o desde el campus UJAP.
        </p>
      </div>
      <RouterLink
        v-if="auth.puedePublicar"
        to="/publicar"
        class="btn-publicar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Publicar nuevo viaje
      </RouterLink>
    </header>

    <section class="metrics" aria-label="Resumen de actividad">
      <article class="metric">
        <div class="metric-icon metric-icon--green" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <span class="metric-label">Viajes activos</span>
          <div class="metric-row">
            <span class="metric-value">{{ metricas.activos }}</span>
            <span v-if="metricas.deHoy" class="metric-hint metric-hint--ok"
              >{{ metricas.deHoy }} hoy</span
            >
          </div>
        </div>
      </article>

      <article class="metric">
        <div class="metric-icon metric-icon--blue" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div>
          <span class="metric-label">Pasajeros en activos</span>
          <div class="metric-row">
            <span class="metric-value">{{ metricas.pasajeros }}</span>
            <span class="metric-hint"
              >de {{ metricas.cuposTotal || 0 }} cupos</span
            >
          </div>
        </div>
      </article>

      <article class="metric">
        <div class="metric-icon metric-icon--amber" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <span class="metric-label">Cupos libres</span>
          <div class="metric-row">
            <span class="metric-value">{{ metricas.cuposLibres }}</span>
            <span class="metric-hint">en rutas próximas</span>
          </div>
        </div>
      </article>

      <article class="metric">
        <div class="metric-icon metric-icon--slate" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <span class="metric-label">Completados</span>
          <div class="metric-row">
            <span class="metric-value">{{ contadores.completados }}</span>
            <span class="metric-hint">historial</span>
          </div>
        </div>
      </article>
    </section>

    <div class="toolbar">
      <div class="tabs" role="tablist" aria-label="Estado de viajes">
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ 'is-on': tab === 'activos' }"
          :aria-selected="tab === 'activos'"
          @click="tab = 'activos'"
        >
          Próximos / Activos
          <span class="tab-count">{{ contadores.activos }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ 'is-on': tab === 'completados' }"
          :aria-selected="tab === 'completados'"
          @click="tab = 'completados'"
        >
          Completados
          <span class="tab-count">{{ contadores.completados }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ 'is-on': tab === 'cancelados' }"
          :aria-selected="tab === 'cancelados'"
          @click="tab = 'cancelados'"
        >
          Cancelados
          <span class="tab-count">{{ contadores.cancelados }}</span>
        </button>
      </div>

      <label class="search">
        <span class="sr-only">Filtrar mis viajes</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input v-model="busqueda" type="search" placeholder="Filtrar por destino, zona o fecha…" />
        <button
          v-if="busqueda"
          type="button"
          class="search-clear"
          @click="busqueda = ''"
        >
          Quitar
        </button>
      </label>
    </div>

    <section class="lista" aria-label="Lista de mis viajes">
      <EstadoVacio
        v-if="misViajes.length === 0"
        titulo="Todavía no publicas una ruta"
        mensaje="Cuando vayas en carro al campus, publica origen, hora y cupos. Alguien de la UJAP puede ocupar el asiento vacío."
      />

      <EstadoVacio
        v-else-if="viajesTab.length === 0"
        titulo="Nada en esta vista"
        :mensaje="
          busqueda
            ? 'Ningún viaje coincide con el filtro. Quítalo o prueba otra zona.'
            : 'No hay viajes en esta pestaña todavía.'
        "
      />

      <template v-else>
        <article
          v-for="viaje in viajesTab"
          :key="viaje.id"
          class="card"
          :class="{ 'card--muted': tab !== 'activos' }"
        >
          <div class="card-top">
            <div>
              <div class="badges">
                <span v-if="esActivo(viaje)" class="badge badge--live">
                  <span class="dot" aria-hidden="true" />
                  Ruta activa publicada
                </span>
                <span v-else-if="esCompletado(viaje)" class="badge">Completado</span>
                <span v-else class="badge badge--warn">Cancelado</span>
                <span class="id-viaje">ID #{{ viaje.id }}</span>
              </div>
              <h2 class="ruta">
                <span>{{ viaje.origen }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span>{{ viaje.destino }}</span>
              </h2>
            </div>
            <span class="status-pill">{{ etiquetaEstado(viaje) }}</span>
          </div>

          <div class="card-body">
            <div class="col">
              <span class="col-label">Horario de salida</span>
              <p class="col-strong">{{ formatFecha(viaje.fecha) }}</p>
              <p class="col-soft">{{ formatHora(viaje.hora) }}</p>
            </div>
            <div class="col">
              <span class="col-label">Punto de encuentro</span>
              <p class="col-strong">{{ viaje.puntoEncuentro || 'Por coordinar' }}</p>
            </div>
            <div class="col">
              <span class="col-label">Vehículo</span>
              <p class="col-strong">{{ viaje.descripcionVehiculo || '—' }}</p>
            </div>
            <div class="ocupacion">
              <div class="ocupacion-row">
                <span>Cupos ocupados</span>
                <strong>{{ viaje.cuposTotal - viaje.cuposDisponibles }} / {{ viaje.cuposTotal }}</strong>
              </div>
              <div class="bar" aria-hidden="true">
                <div class="bar-fill" :style="{ width: `${pctOcupacion(viaje)}%` }" />
              </div>
              <p class="ocupacion-hint">{{ viaje.cuposDisponibles }} libres</p>
            </div>
          </div>

          <div v-if="esActivo(viaje)" class="pasajeros">
            <div class="pasajeros-head">
              <h3>
                Pasajeros unidos
                <template v-if="pasajerosPorViaje[viaje.id]">
                  ({{ pasajerosPorViaje[viaje.id]?.length ?? 0 }})
                </template>
              </h3>
              <span class="pasajeros-hint"
                >Quedan {{ viaje.cuposDisponibles }} puesto{{ viaje.cuposDisponibles === 1 ? '' : 's' }}</span
              >
            </div>

            <p v-if="cargandoPasajeros && !pasajerosPorViaje[viaje.id]" class="pasajeros-empty">
              Cargando pasajeros…
            </p>
            <p
              v-else-if="!(pasajerosPorViaje[viaje.id]?.length)"
              class="pasajeros-empty"
            >
              Aún no hay estudiantes unidos a esta ruta.
            </p>
            <ul v-else class="pasajeros-lista">
              <li v-for="p in pasajerosPorViaje[viaje.id]" :key="p.id">
                <div class="avatar">{{ iniciales(p.nombre) }}</div>
                <div>
                  <p class="p-nombre">{{ p.nombre }}</p>
                  <p class="p-meta">{{ p.correo }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="card-foot">
            <p class="foot-note">Comunidad institucional · sin cobros en RideUJAP</p>
            <div class="foot-actions">
              <button
                v-if="esActivo(viaje)"
                type="button"
                class="btn-ghost btn-danger"
                :disabled="eliminandoId === viaje.id"
                @click="pedirCancelarViaje(viaje.id)"
              >
                {{ eliminandoId === viaje.id ? 'Eliminando…' : 'Cancelar viaje' }}
              </button>
              <button type="button" class="btn-ghost" @click="irDetalle(viaje.id)">
                {{ esActivo(viaje) ? 'Gestionar viaje' : 'Ver detalle' }}
              </button>
              <button
                v-if="esActivo(viaje)"
                type="button"
                class="btn-primary"
                @click="irDetalle(viaje.id)"
              >
                Ver abordaje
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <RouterLink
                v-else-if="auth.puedePublicar && esCompletado(viaje)"
                to="/publicar"
                class="btn-primary btn-link"
              >
                Republicar ruta
              </RouterLink>
            </div>
          </div>
        </article>
      </template>

      <div v-if="misViajes.length === 0 && auth.puedePublicar" class="acciones-empty">
        <RouterLink to="/publicar" class="btn-publicar">+ Publicar nuevo viaje</RouterLink>
      </div>
    </section>

    <aside class="protocolo" aria-label="Normas de seguridad">
      <div class="protocolo-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <div class="protocolo-copy">
        <h2>
          Abordaje seguro en campus
          <span class="pill-req">Recomendado</span>
        </h2>
        <p>
          Confirma identidad con el correo institucional y el punto de encuentro publicado. RideUJAP
          no procesa pagos: el viaje es colaboración entre compañeros UJAP.
        </p>
      </div>
      <RouterLink to="/viajes" class="protocolo-btn">Ver viajes disponibles</RouterLink>
    </aside>

    <ModalDialog
      :open="modalEliminar"
      titulo="Cancelar viaje"
      mensaje="¿Eliminar esta ruta publicada? La acción no se puede deshacer y se avisará a los pasajeros unidos."
      variante-confirmar="danger"
      texto-confirmar="Sí, cancelar viaje"
      texto-cancelar="Mantener viaje"
      :cargando="eliminandoId !== null"
      @cancelar="cerrarModalEliminar"
      @confirmar="confirmarCancelarViaje"
    />

    <ModalDialog
      :open="modalAviso"
      :titulo="avisoTitulo"
      :mensaje="avisoMensaje"
      :mostrar-cancelar="false"
      texto-confirmar="Entendido"
      @cancelar="modalAviso = false"
      @confirmar="modalAviso = false"
    />
  </main>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.mis-viajes {
  width: 100%;
}

.crumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.75;
}
.crumb a {
  color: inherit;
  text-decoration: none;
}
.crumb a:hover {
  color: var(--ride-green-fg);
}
.crumb-on {
  color: var(--ride-green-fg);
  font-weight: 650;
  opacity: 1;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.35rem;
  border-bottom: 1px solid var(--color-border);
}
@media (min-width: 768px) {
  .hero {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}
.hero h1 {
  margin: 0;
  font-size: clamp(1.65rem, 3vw, 2rem);
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--color-heading);
}
.hero p {
  margin: 0.45rem 0 0;
  max-width: 38rem;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--color-text);
}

.btn-publicar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1.15rem;
  border-radius: 1rem;
  background: var(--ride-green);
  color: #fff;
  font-weight: 750;
  font-size: 0.88rem;
  text-decoration: none;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--ride-green) 28%, transparent);
}
.btn-publicar svg {
  width: 1rem;
  height: 1rem;
}
.btn-publicar:hover {
  background: var(--ride-green-hover);
}

.metrics {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: 1fr;
  margin-top: 1.35rem;
}
@media (min-width: 640px) {
  .metrics {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1024px) {
  .metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}
.metric {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 1.1rem;
  background: var(--color-background);
}
.metric-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.85rem;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.metric-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}
.metric-icon--green {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  border: 1px solid var(--ride-green-border);
}
.metric-icon--blue {
  background: color-mix(in srgb, #3b82f6 12%, var(--color-background));
  color: #2563eb;
  border: 1px solid color-mix(in srgb, #3b82f6 25%, var(--color-border));
}
.metric-icon--amber {
  background: color-mix(in srgb, #d97706 12%, var(--color-background));
  color: #b45309;
  border: 1px solid color-mix(in srgb, #d97706 25%, var(--color-border));
}
.metric-icon--slate {
  background: var(--color-background-soft);
  color: var(--color-heading);
  border: 1px solid var(--color-border);
}
.metric-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.65;
}
.metric-row {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  margin-top: 0.15rem;
}
.metric-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--color-heading);
  letter-spacing: -0.03em;
}
.metric-hint {
  font-size: 0.72rem;
  color: var(--color-text);
}
.metric-hint--ok {
  color: var(--ride-green-fg);
  font-weight: 700;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 1.6rem;
  margin-bottom: 1rem;
}
@media (min-width: 900px) {
  .toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.3rem;
  border-radius: 0.9rem;
  background: var(--color-background-mute);
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: 0.7rem;
  background: transparent;
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 650;
  font-family: inherit;
  cursor: pointer;
}
.tab.is-on {
  background: var(--color-background);
  color: var(--color-heading);
  font-weight: 800;
  box-shadow: 0 1px 4px color-mix(in srgb, var(--color-heading) 8%, transparent);
}
.tab-count {
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  font-size: 0.65rem;
  font-weight: 800;
  background: color-mix(in srgb, var(--color-heading) 10%, transparent);
}
.tab.is-on .tab-count {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}

.search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 22rem;
}
.search svg {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: var(--color-text);
  opacity: 0.55;
  pointer-events: none;
}
.search input {
  width: 100%;
  min-height: 2.45rem;
  padding: 0.5rem 4.2rem 0.5rem 2.35rem;
  border: 1px solid var(--color-border);
  border-radius: 0.85rem;
  background: var(--color-background);
  color: var(--color-heading);
  font-size: 0.8rem;
  font-family: inherit;
}
.search input:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.search-clear {
  position: absolute;
  right: 0.45rem;
  border: none;
  background: none;
  color: var(--ride-green-fg);
  font-size: 0.72rem;
  font-weight: 750;
  cursor: pointer;
  font-family: inherit;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 1.35rem;
  background: var(--color-background);
  overflow: hidden;
  box-shadow: 0 4px 18px color-mix(in srgb, var(--color-heading) 4%, transparent);
}
.card--muted {
  opacity: 0.9;
}
.card-top {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(
    90deg,
    var(--color-background),
    color-mix(in srgb, var(--ride-green) 6%, var(--color-background))
  );
}
@media (min-width: 768px) {
  .card-top {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}
.badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.55rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 750;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.badge--live {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  border-color: var(--ride-green-border);
}
.badge--warn {
  background: color-mix(in srgb, #e11d48 10%, var(--color-background));
  color: #be123c;
  border-color: color-mix(in srgb, #e11d48 25%, var(--color-border));
}
.dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: var(--ride-green);
}
.id-viaje {
  font-size: 0.72rem;
  color: var(--color-text);
  opacity: 0.65;
}
.ruta {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-heading);
  line-height: 1.25;
}
.ruta svg {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--ride-green-fg);
  flex-shrink: 0;
}
.status-pill {
  align-self: flex-start;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 750;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  border: 1px solid var(--ride-green-border);
  white-space: nowrap;
}

.card-body {
  display: grid;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .card-body {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1100px) {
  .card-body {
    grid-template-columns: 1.1fr 1.1fr 1fr 0.95fr;
  }
}
.col-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.55;
  margin-bottom: 0.35rem;
}
.col-strong {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 750;
  color: var(--color-heading);
}
.col-soft {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: var(--color-text);
}
.ocupacion {
  padding: 0.75rem;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
}
.ocupacion-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text);
}
.ocupacion-row strong {
  color: var(--color-heading);
}
.bar {
  margin-top: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-heading) 12%, transparent);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--ride-green);
}
.ocupacion-hint {
  margin: 0.45rem 0 0;
  font-size: 0.72rem;
  color: var(--color-text);
}

.pasajeros {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-background-soft) 70%, transparent);
}
.pasajeros-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.pasajeros-head h3 {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-heading);
}
.pasajeros-hint {
  font-size: 0.72rem;
  color: var(--color-text);
  opacity: 0.7;
}
.pasajeros-empty {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text);
}
.pasajeros-lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.pasajeros-lista li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.85rem;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
}
.avatar {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
  font-weight: 800;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  flex-shrink: 0;
}
.p-nombre {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 750;
  color: var(--color-heading);
}
.p-meta {
  margin: 0.1rem 0 0;
  font-size: 0.72rem;
  color: var(--color-text);
  opacity: 0.75;
}

.card-foot {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
}
@media (min-width: 768px) {
  .card-foot {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.foot-note {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.75;
}
.foot-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.btn-ghost,
.btn-primary,
.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  border-radius: 0.8rem;
  font-size: 0.75rem;
  font-weight: 750;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
}
.btn-ghost {
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
}
.btn-ghost:hover {
  background: var(--color-background-soft);
}
.btn-danger {
  color: #be123c;
  border-color: transparent;
}
.btn-danger:hover {
  background: color-mix(in srgb, #e11d48 8%, var(--color-background));
  border-color: color-mix(in srgb, #e11d48 25%, var(--color-border));
}
.btn-primary {
  border: none;
  background: var(--ride-green);
  color: #fff;
}
.btn-primary:hover {
  background: var(--ride-green-hover);
}
.btn-primary svg {
  width: 0.85rem;
  height: 0.85rem;
}

.acciones-empty {
  margin-top: 0.5rem;
}

.protocolo {
  margin-top: 2rem;
  padding: 1.35rem 1.4rem;
  border-radius: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: linear-gradient(120deg, #064e3b, #0f172a);
  color: #e2e8f0;
}
@media (min-width: 900px) {
  .protocolo {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.protocolo-icon {
  width: 2.85rem;
  height: 2.85rem;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  background: rgb(255 255 255 / 0.1);
  border: 1px solid rgb(255 255 255 / 0.18);
  color: #6ee7b7;
  flex-shrink: 0;
}
.protocolo-icon svg {
  width: 1.35rem;
  height: 1.35rem;
}
.protocolo-copy {
  flex: 1;
  max-width: 40rem;
}
.protocolo-copy h2 {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
}
.pill-req {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgb(16 185 129 / 0.2);
  color: #6ee7b7;
  border: 1px solid rgb(52 211 153 / 0.35);
}
.protocolo-copy p {
  margin: 0.4rem 0 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: #cbd5e1;
}
.protocolo-btn {
  flex-shrink: 0;
  padding: 0.65rem 1.05rem;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 800;
  text-decoration: none;
}
.protocolo-btn:hover {
  background: #f1f5f9;
}
</style>
