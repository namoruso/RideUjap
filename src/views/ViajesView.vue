<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import EncabezadoRide from '@/components/EncabezadoRide.vue'
import FiltroViajes from '@/components/FiltroViajes.vue'
import TarjetaViaje from '@/components/TarjetaViaje.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'
import type { FiltroViajes as FiltroType } from '@/types'

const store = useViajesStore()
const router = useRouter()

const filtroActivo = ref<FiltroType>({ origen: '', destino: '', hora: '' })

const viajesVisibles = computed(() => store.viajesFiltrados(filtroActivo.value))

function handleFiltrar(criterios: FiltroType) {
  filtroActivo.value = criterios
}

function handleUnirse(id: number) {
  router.push(`/viajes/${id}`)
}

onMounted(() => store.cargarViajes())
</script>

<template>
  <main class="viajes-view page-content">
    <EncabezadoRide
      titulo="Viajes disponibles"
      subtitulo="Encuentra un viaje compartido hacia el campus o la ciudad"
    />

    <FiltroViajes @filtrar="handleFiltrar" />

    <section class="seccion-viajes" aria-label="Lista de viajes">
      <div v-if="store.cargando" class="estado-carga" role="status">
        <span>Cargando viajes…</span>
      </div>

      <div v-else-if="store.error" class="estado-error" role="alert">
        <p>{{ store.error }}</p>
        <button type="button" class="btn-reintentar" @click="store.cargarViajes()">
          Reintentar
        </button>
      </div>

      <template v-else>
        <p class="conteo" aria-live="polite">
          {{ viajesVisibles.length }}
          {{ viajesVisibles.length === 1 ? 'viaje encontrado' : 'viajes encontrados' }}
        </p>

        <div v-if="viajesVisibles.length > 0" class="lista-viajes">
          <TarjetaViaje
            v-for="viaje in viajesVisibles"
            :key="viaje.id"
            :viaje="viaje"
            @unirse="handleUnirse"
          />
        </div>

        <EstadoVacio v-else mensaje="No hay viajes que coincidan con tu búsqueda" />
      </template>
    </section>
  </main>
</template>

<style scoped>
.viajes-view {
  width: 100%;
}

.seccion-viajes {
  margin-top: 1.5rem;
}

.conteo {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 0.75rem;
}

.lista-viajes {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ride-gap);
}

@media (min-width: 768px) {
  .lista-viajes {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .lista-viajes {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.estado-carga,
.estado-error {
  padding: 2rem;
  text-align: center;
  border-radius: var(--ride-radius-lg);
  background: var(--color-background-soft);
}

.estado-error p {
  color: #c0392b;
  margin-bottom: 1rem;
}

.btn-reintentar {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: var(--ride-radius);
  background: var(--ride-green);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>
