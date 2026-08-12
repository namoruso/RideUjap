<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EncabezadoRide from '@/components/EncabezadoRide.vue'
import TarjetaUsuario from '@/components/TarjetaUsuario.vue'
import TarjetaViaje from '@/components/TarjetaViaje.vue'
import { conductorEjemplo, viajesEjemplo } from '@/data/ejemplos'

const mensaje = ref('')

onMounted(() => {
  console.log('El componente ya está en pantalla')
  // Aquí es típico pedir datos a una API (próxima unidad)
})

function handleUnirse(id: number) {
  mensaje.value = `Te uniste al viaje #${id}`
  console.log('unirse → viaje id:', id)
}

function handleContactar(id: number) {
  mensaje.value = `Contactando al usuario #${id}`
  console.log('contactar → usuario id:', id)
}
</script>

<template>
  <main class="home">
    <EncabezadoRide
      titulo="Viajes disponibles"
      subtitulo="Comparte trayectos entre el campus UJAP y la ciudad"
    />

    <section class="seccion" aria-labelledby="conductor-titulo">
      <h2 id="conductor-titulo">Conductor destacado</h2>
      <TarjetaUsuario :usuario="conductorEjemplo" @contactar="handleContactar" />
    </section>

    <section class="seccion" aria-labelledby="viajes-titulo">
      <h2 id="viajes-titulo">Lista de viajes</h2>
      <div class="lista-viajes">
        <TarjetaViaje
          v-for="viaje in viajesEjemplo"
          :key="viaje.id"
          :viaje="viaje"
          @unirse="handleUnirse"
        />
      </div>
    </section>

    <p v-if="mensaje" class="mensaje" role="status">{{ mensaje }}</p>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: 40rem;
}

.seccion {
  margin-top: 1.75rem;
}

.seccion h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.lista-viajes {
  display: grid;
  gap: 0.75rem;
}

.mensaje {
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: #e8f5ef;
  color: #0b6e4f;
  font-weight: 600;
}
</style>
