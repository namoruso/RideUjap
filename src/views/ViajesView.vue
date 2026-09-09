<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import { useAuthStore } from '@/stores/auth'
import FiltroViajes from '@/components/FiltroViajes.vue'
import TarjetaViaje from '@/components/TarjetaViaje.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'
import type { FiltroViajes as FiltroType } from '@/types'

const store = useViajesStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const filtroActivo = ref<FiltroType>({
  origen: typeof route.query['origen'] === 'string' ? route.query['origen'] : '',
  destino: typeof route.query['destino'] === 'string' ? route.query['destino'] : '',
  hora: typeof route.query['hora'] === 'string' ? route.query['hora'] : '',
  zona: typeof route.query['zona'] === 'string' ? route.query['zona'] : undefined,
})

const viajesVisibles = computed(() => store.viajesFiltrados(filtroActivo.value))
const resetFiltros = ref(0)

function handleFiltrar(criterios: FiltroType) {
  filtroActivo.value = criterios
}

function verTodas() {
  filtroActivo.value = { origen: '', destino: '', hora: '', zona: undefined }
  resetFiltros.value += 1
}

function handleUnirse(id: number) {
  router.push(`/viajes/${id}`)
}

onMounted(() => store.cargarViajes())
</script>

<template>
  <main class="viajes page-content">
    <header class="hero">
      <div class="hero-copy">
        <div class="pill">Campus San Diego · Valencia</div>
        <h1>Viajes disponibles</h1>
        <p>
          Encuentra u ofrece asientos en rutas universitarias con estudiantes, profesores y personal
          verificado de la UJAP.
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
        Publicar mi ruta
      </RouterLink>
    </header>

    <p v-if="store.usandoDemo" class="aviso-demo" role="status">
      Estás viendo rutas de ejemplo. Cuando el servidor esté arriba, se cargan las reales.
    </p>

    <FiltroViajes :key="resetFiltros" :inicial="filtroActivo" @filtrar="handleFiltrar" />

    <section class="lista-sec" aria-label="Lista de viajes">
      <div class="lista-head">
        <div class="lista-title">
          <h2>Rutas disponibles</h2>
          <span class="badge-count">{{ viajesVisibles.length }} activas</span>
        </div>
      </div>

      <div v-if="store.cargando" class="estado-carga" role="status">Buscando asientos…</div>

      <template v-else>
        <div v-if="viajesVisibles.length > 0" class="grid">
          <TarjetaViaje
            v-for="viaje in viajesVisibles"
            :key="viaje.id"
            :viaje="viaje"
            @unirse="handleUnirse"
          />
        </div>

        <EstadoVacio
          v-else
          titulo="Nada con esos filtros"
          mensaje="Cambia la zona o la hora, o publica tú el asiento que te hace falta."
        >
          <template #accion>
            <button type="button" class="btn-reintentar" @click="verTodas">Ver todas</button>
          </template>
        </EstadoVacio>
      </template>
    </section>

    <aside class="trust-banner" aria-label="Comunidad segura">
      <div class="trust-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <div>
        <h3>
          Comunidad universitaria segura
          <span class="tag">Oficial UJAP</span>
        </h3>
        <p>
          Conductores y pasajeros con correo
          <code>@ujap.edu.ve</code>. No es un servicio comercial de taxi ni transporte externo.
        </p>
      </div>
    </aside>
  </main>
</template>

<style scoped>
.viajes {
  width: 100%;
  max-width: 72rem;
}
.hero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}
@media (min-width: 768px) {
  .hero {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}
.pill {
  display: inline-flex;
  margin-bottom: 0.45rem;
  padding: 0.3rem 0.65rem;
  border-radius: 0.5rem;
  background: var(--ride-green-light);
  border: 1px solid var(--ride-green-border);
  color: var(--ride-green-fg);
  font-size: 0.72rem;
  font-weight: 750;
}
.hero h1 {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--color-heading);
}
.hero p {
  margin: 0.45rem 0 0;
  max-width: 36rem;
  font-size: 0.95rem;
  color: var(--color-text);
  line-height: 1.5;
}
.btn-publicar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.7rem 1.1rem;
  border-radius: 0.85rem;
  background: var(--ride-green);
  color: #fff;
  font-weight: 750;
  font-size: 0.88rem;
  text-decoration: none;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 25%, transparent);
  white-space: nowrap;
}
.btn-publicar svg {
  width: 1rem;
  height: 1rem;
}
.btn-publicar:hover {
  background: var(--ride-green-hover);
  opacity: 1;
}
.aviso-demo {
  margin: 0 0 1rem;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  font-size: 0.85rem;
  font-weight: 600;
}
.lista-sec {
  margin-top: 1.75rem;
}
.lista-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}
.lista-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.lista-title h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 850;
  color: var(--color-heading);
}
.badge-count {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-size: 0.72rem;
  font-weight: 800;
}
.grid {
  display: grid;
  gap: 1.1rem;
  grid-template-columns: 1fr;
}
@media (min-width: 800px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
.estado-carga {
  padding: 2rem;
  text-align: center;
  color: var(--color-text);
}
.btn-reintentar {
  margin-top: 0.75rem;
  padding: 0.55rem 1rem;
  border: 1px solid var(--ride-green);
  border-radius: 0.65rem;
  background: transparent;
  color: var(--ride-green-fg);
  font-weight: 700;
  cursor: pointer;
}
.trust-banner {
  margin-top: 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.35rem 1.25rem;
  border-radius: 1.15rem;
  background: linear-gradient(120deg, #064e3b, var(--ride-green) 55%, #0f172a);
  color: #ecfdf5;
  position: relative;
  overflow: hidden;
}
@media (min-width: 720px) {
  .trust-banner {
    flex-direction: row;
    align-items: center;
  }
}
.trust-icon {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #6ee7b7;
}
.trust-icon svg {
  width: 1.4rem;
  height: 1.4rem;
}
.trust-banner h3 {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-size: 1rem;
  font-weight: 850;
  color: #fff;
}
.tag {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #a7f3d0;
}
.trust-banner p {
  margin: 0.4rem 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(209, 250, 229, 0.9);
  max-width: 40rem;
}
.trust-banner code {
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  color: #6ee7b7;
}
</style>
