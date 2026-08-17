<script setup lang="ts">
defineProps<{
  mensaje?: string
}>()
</script>

<template>
  <div class="estado-vacio" role="status" aria-live="polite">
    <span class="icono" aria-hidden="true">🚗</span>
    <p>{{ mensaje ?? 'No hay viajes disponibles' }}</p>
  </div>
</template>

<style scoped>
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text);
  opacity: 0.65;
}

.icono {
  font-size: 2.5rem;
}
</style>
