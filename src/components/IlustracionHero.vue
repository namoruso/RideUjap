<script setup lang="ts">
import cityDriver from '@/assets/illustrations/city-driver.svg?raw'
</script>

<template>
  <div
    class="ilustracion"
    role="img"
    aria-label="Ilustración de un conductor universitario en ruta"
    v-html="cityDriver"
  />
</template>

<style scoped>
/* unDraw “City driver” — Katerina Limpitsouni, uso libre en el producto (no revender el pack). */
.ilustracion {
  --primary-svg-color: var(--ride-green);
  width: 100%;
  line-height: 0;
}

.ilustracion :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
  max-height: 18rem;
}
</style>
