<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import EncabezadoRide from '@/components/EncabezadoRide.vue'
import FiltroViajes from '@/components/FiltroViajes.vue'
import TarjetaViaje from '@/components/TarjetaViaje.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'
import type { FiltroViajes as FiltroType } from '@/types'

const store = useViajesStore()
const router = useRouter()
const route = useRoute()

const filtroActivo = ref<FiltroType>({
  origen: typeof route.query['origen'] === 'string' ? route.query['origen'] : '',
  destino: typeof route.query['destino'] === 'string' ? route.query['destino'] : '',
  hora: typeof route.query['hora'] === 'string' ? route.query['hora'] : '',
})

const viajesVisibles = computed(() => store.viajesFiltrados(filtroActivo.value))

const resetFiltros = ref(0)

function handleFiltrar(criterios: FiltroType) {
  filtroActivo.value = criterios
}

function verTodas() {
  filtroActivo.value = { origen: '', destino: '', hora: '' }
  resetFiltros.value += 1
}

function handleUnirse(id: number) {
  router.push(`/viajes/${id}`)
}

onMounted(() => store.cargarViajes())
</script>

<template>
  <main class="viajes-view page-content">
    <EncabezadoRide
      titulo="Viajes"
      subtitulo="Elige zona y hora. Las rutas son de gente de la UJAP."
    />

    <p v-if="store.usandoDemo" class="aviso-demo" role="status">
      Estás viendo rutas de ejemplo. Cuando el servidor esté arriba, se cargan las reales.
    </p>

    <FiltroViajes :key="resetFiltros" :inicial="filtroActivo" @filtrar="handleFiltrar" />

    <section class="seccion-viajes" aria-label="Lista de viajes">
      <div v-if="store.cargando" class="estado-carga" role="status">Buscando asientos…</div>

      <template v-else>
        <div class="toolbar">
          <p class="conteo" aria-live="polite">
            <strong>{{ viajesVisibles.length }}</strong>
            {{ viajesVisibles.length === 1 ? 'ruta' : 'rutas' }}
          </p>
          <RouterLink to="/publicar" class="link-publicar">Publicar la mía</RouterLink>
        </div>

        <div v-if="viajesVisibles.length > 0" class="lista-viajes">
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
  </main>
</template>

<style scoped>
.viajes-view {
  width: 100%;
  max-width: 72rem;
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

.seccion-viajes {
  margin-top: 1.25rem;
}

.toolbar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.conteo {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.75;
}

.conteo strong {
  color: var(--color-heading);
  font-weight: 800;
}

.link-publicar {
  font-size: 0.85rem;
  font-weight: 700;
}

.lista-viajes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@media (min-width: 720px) {
  .lista-viajes {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1100px) {
  .lista-viajes {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.estado-carga {
  padding: 2rem 1rem;
  text-align: center;
  border-radius: 1rem;
  background: var(--color-background-soft);
  opacity: 0.8;
}

.btn-reintentar {
  padding: 0.5rem 1.1rem;
  border: none;
  border-radius: 999px;
  background: var(--ride-green);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
</style>
