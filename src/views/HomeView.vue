<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import EncabezadoRide from '@/components/EncabezadoRide.vue'
import TarjetaViaje from '@/components/TarjetaViaje.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'

const store = useViajesStore()
const router = useRouter()

const viajesRecientes = computed(() => store.viajes.slice(0, 3))

onMounted(() => {
  store.cargarViajes()
})

function handleUnirse(id: number) {
  router.push(`/viajes/${id}`)
}
</script>

<template>
  <main class="home-view page-content">
    <EncabezadoRide
      titulo="Tu panel"
      subtitulo="Aquí ves lo que se mueve hoy. Publica un asiento o súbete a una ruta que ya iba al campus."
    />

    <section class="seccion" aria-labelledby="viajes-titulo">
      <div class="seccion-cabecera">
        <h2 id="viajes-titulo">Salidas próximas</h2>
        <RouterLink to="/viajes" class="enlace-ver-todos">Ver todas las rutas →</RouterLink>
      </div>

      <div v-if="store.cargando" class="estado-carga" role="status">Cargando salidas…</div>

      <EstadoVacio
        v-else-if="viajesRecientes.length === 0"
        titulo="Todavía no hay salidas cargadas"
        mensaje="Cuando el listado esté disponible, aparecen aquí las próximas rutas al campus. Mientras tanto puedes explorar o publicar."
      >
        <template #accion>
          <RouterLink to="/viajes" class="enlace-ver-todos">Ir a viajes</RouterLink>
        </template>
      </EstadoVacio>

      <div v-else class="lista-viajes">
        <TarjetaViaje
          v-for="viaje in viajesRecientes"
          :key="viaje.id"
          :viaje="viaje"
          @unirse="handleUnirse"
        />
      </div>
    </section>

    <div class="ctas">
      <RouterLink to="/viajes" class="cta cta--secundario">Buscar un asiento</RouterLink>
      <RouterLink to="/publicar" class="cta cta--principal">Publicar mi ruta</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: 48rem;
}

.seccion {
  margin-top: 1.75rem;
}

.seccion h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.seccion-cabecera {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.seccion-cabecera h2 {
  margin: 0;
}

.enlace-ver-todos {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ride-green);
}

.lista-viajes {
  display: grid;
  gap: var(--ride-gap);
}

.estado-carga {
  padding: 1.5rem;
  text-align: center;
  opacity: 0.7;
}

.ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ride-gap);
  margin-top: 2rem;
}

.cta {
  flex: 1 1 auto;
  padding: 0.7rem 1.25rem;
  border-radius: var(--ride-radius);
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition:
    background var(--ride-transition),
    color var(--ride-transition);
}

.cta--principal {
  background: var(--ride-green);
  color: #fff;
  border: none;
}

.cta--principal:hover {
  background: var(--ride-green-hover);
  opacity: 1;
}

.cta--secundario {
  background: transparent;
  color: var(--ride-green);
  border: 1px solid var(--ride-green);
}

.cta--secundario:hover {
  background: var(--ride-green-light);
  opacity: 1;
}

.mensaje {
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: var(--ride-radius);
  background: var(--ride-green-light);
  color: var(--ride-green);
  font-weight: 600;
}
</style>
