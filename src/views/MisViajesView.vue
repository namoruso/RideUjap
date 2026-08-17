<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import { useAuthStore } from '@/stores/auth'
import EncabezadoRide from '@/components/EncabezadoRide.vue'
import TarjetaViaje from '@/components/TarjetaViaje.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'

const store = useViajesStore()
const auth = useAuthStore()
const router = useRouter()

const misViajes = computed(() =>
  auth.usuario ? store.viajesDelUsuario(auth.usuario.id) : [],
)

// En mis viajes el botón "Ver detalle" navega al detalle — no "Unirme"
function handleVerDetalle(id: number) {
  router.push(`/viajes/${id}`)
}

onMounted(async () => {
  if (store.viajes.length === 0) await store.cargarViajes()
})
</script>

<template>
  <main class="mis-viajes-view page-content">
    <EncabezadoRide
      titulo="Mis viajes"
      :subtitulo="auth.usuario ? `Viajes publicados por ${auth.usuario.nombre}` : 'Mis viajes'"
    />

    <section class="seccion-viajes" aria-label="Mis viajes publicados">
      <div v-if="misViajes.length > 0" class="lista-viajes">
        <TarjetaViaje
          v-for="viaje in misViajes"
          :key="viaje.id"
          :viaje="viaje"
          :solo-ver="true"
          @unirse="handleVerDetalle"
        />
      </div>

      <EstadoVacio v-else mensaje="Aún no has publicado ningún viaje" />

      <div class="acciones">
        <RouterLink to="/publicar" class="btn-publicar">+ Publicar nuevo viaje</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.mis-viajes-view {
  width: 100%;
}

.seccion-viajes {
  margin-top: 1.5rem;
}

.lista-viajes {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ride-gap);
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .lista-viajes {
    grid-template-columns: 1fr 1fr;
  }
}

.acciones {
  margin-top: 1.5rem;
}

.btn-publicar {
  display: inline-block;
  padding: 0.65rem 1.25rem;
  border-radius: var(--ride-radius);
  background: var(--ride-green);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  transition: background var(--ride-transition);
}

.btn-publicar:hover {
  background: var(--ride-green-hover);
  opacity: 1;
}
</style>
