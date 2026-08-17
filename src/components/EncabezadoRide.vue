<script setup lang="ts">
defineProps<{
  titulo: string
  subtitulo?: string
  mostrarMarca?: boolean
}>()
</script>

<template>
  <header class="encabezado-ride">
    <p v-if="mostrarMarca" class="marca">RideUJAP</p>
    <h1>{{ titulo }}</h1>
    <p v-if="subtitulo" class="subtitulo">{{ subtitulo }}</p>
  </header>
</template>

<style scoped>
.encabezado-ride {
  margin-bottom: 1.5rem;
}

.marca {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ride-green-fg);
}

h1 {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.2;
  color: var(--color-heading);
}

.subtitulo {
  margin: 0.4rem 0 0;
  color: var(--color-text);
  opacity: 0.75;
  font-size: 0.95rem;
}
</style>
