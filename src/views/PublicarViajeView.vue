<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useViajesStore } from '@/stores/viajes'
import EncabezadoRide from '@/components/EncabezadoRide.vue'
import FormularioPublicarViaje from '@/components/FormularioPublicarViaje.vue'
import type { NuevoViaje } from '@/types'

const store = useViajesStore()
const router = useRouter()

async function handlePublicar(nuevoViaje: NuevoViaje) {
  await store.publicarViaje(nuevoViaje)
  router.push('/viajes')
}
</script>

<template>
  <main class="publicar-view page-content">
    <EncabezadoRide
      titulo="Publicar un viaje"
      subtitulo="Comparte tu recorrido y ayuda a otros compañeros de la UJAP"
    />

    <section class="seccion-formulario" aria-labelledby="form-titulo">
      <h2 id="form-titulo" class="subtitulo-seccion">Datos del viaje</h2>
      <FormularioPublicarViaje @publicar="handlePublicar" />
    </section>
  </main>
</template>

<style scoped>
.publicar-view {
  width: 100%;
  max-width: 48rem;
}

.seccion-formulario {
  margin-top: 1.75rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background-soft);
}

.subtitulo-seccion {
  margin: 0 0 1.25rem;
  font-size: 1rem;
  font-weight: 700;
}
</style>
