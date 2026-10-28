<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { API_URL } from '@/config'
import { useViajesStore } from '@/stores/viajes'
import type { UsuarioPublico, Viaje } from '@/types'
import TarjetaViaje from '@/components/TarjetaViaje.vue'
import EncabezadoRide from '@/components/EncabezadoRide.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'

const route = useRoute()
const store = useViajesStore()
const conductor = ref<UsuarioPublico | null>(null)
const cargando = ref(true)
const error = ref('')

const conductorId = computed(() => Number(route.params['id']))

const viajesConductor = computed(() =>
  store.viajes.filter(
    (v: Viaje) => v.idConductor === conductorId.value && v.estado !== 'finalizado',
  ),
)

async function cargar() {
  cargando.value = true
  error.value = ''
  conductor.value = null
  try {
    if (store.viajes.length === 0) await store.cargarViajes()
    const res = await fetch(`${API_URL}/usuarios/${conductorId.value}`)
    if (!res.ok) {
      error.value = 'No se encontró este perfil de conductor.'
      return
    }
    conductor.value = await res.json()
  } catch {
    error.value = 'No se pudo cargar el perfil. Revisa que la API esté en línea.'
  } finally {
    cargando.value = false
  }
}

watch(conductorId, () => {
  void cargar()
})

onMounted(() => {
  void cargar()
})
</script>

<template>
  <main class="perfil page-content">
    <EncabezadoRide titulo="Perfil del conductor" subtitulo="Comunidad institucional UJAP" />

    <p v-if="cargando" class="estado" role="status">Cargando perfil…</p>
    <p v-else-if="error" class="estado error" role="alert">{{ error }}</p>

    <template v-else-if="conductor">
      <section class="card" aria-labelledby="perfil-nombre">
        <div class="avatar" aria-hidden="true">{{ conductor.nombre.charAt(0).toUpperCase() }}</div>
        <div>
          <h2 id="perfil-nombre">{{ conductor.nombre }}</h2>
          <p class="meta">{{ conductor.correo }}</p>
          <p v-if="conductor.telefono" class="meta">Tel. {{ conductor.telefono }}</p>
          <span v-if="conductor.esConductor" class="badge">Conductor verificado</span>
        </div>
      </section>

      <section v-if="conductor.esConductor" class="vehiculo" aria-labelledby="vehiculo-titulo">
        <h3 id="vehiculo-titulo">Vehículo</h3>
        <ul>
          <li><strong>Marca:</strong> {{ conductor.marcaVehiculo || '—' }}</li>
          <li><strong>Modelo:</strong> {{ conductor.modeloVehiculo || '—' }}</li>
          <li><strong>Color:</strong> {{ conductor.colorVehiculo || '—' }}</li>
          <li><strong>Placa:</strong> {{ conductor.placa || '—' }}</li>
          <li><strong>Puestos:</strong> {{ conductor.puestosVehiculo ?? '—' }}</li>
        </ul>
      </section>

      <section aria-labelledby="rutas-titulo">
        <h3 id="rutas-titulo">Rutas activas ({{ viajesConductor.length }})</h3>
        <div v-if="viajesConductor.length" class="lista">
          <TarjetaViaje
            v-for="v in viajesConductor"
            :key="v.id"
            :viaje="v"
            :solo-ver="true"
            @unirse="(id) => $router.push(`/viajes/${id}`)"
          />
        </div>
        <EstadoVacio
          v-else
          titulo="Sin rutas activas"
          mensaje="Este conductor no tiene viajes publicados en este momento."
        />
      </section>
    </template>

    <p class="volver">
      <RouterLink to="/viajes">← Volver a viajes</RouterLink>
    </p>
  </main>
</template>

<style scoped>
.perfil { width: 100%; }
.estado { padding: 1rem; color: var(--color-text); }
.estado.error { color: #b91c1c; }
.card {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background);
  margin-bottom: 1.25rem;
}
.avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.card h2 { margin: 0; font-size: 1.25rem; color: var(--color-heading); }
.meta { margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--color-text); }
.badge {
  display: inline-block;
  margin-top: 0.45rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 750;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.vehiculo {
  padding: 1rem 1.15rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  margin-bottom: 1.25rem;
  background: var(--color-background-soft);
}
.vehiculo h3, section h3 { margin: 0 0 0.65rem; color: var(--color-heading); }
.vehiculo ul { margin: 0; padding-left: 1.1rem; color: var(--color-text); }
.lista { display: grid; gap: 1rem; }
.volver { margin-top: 1.5rem; }
.volver a { color: var(--ride-green-fg); font-weight: 700; }
</style>
