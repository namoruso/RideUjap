<script setup lang="ts">
defineProps<{
  titulo?: string
  mensaje?: string
}>()
</script>

<template>
  <div class="estado-vacio" role="status" aria-live="polite">
    <p v-if="titulo" class="titulo">{{ titulo }}</p>
    <p>{{ mensaje ?? 'Aún no hay rutas a esta hora. Publica la tuya o prueba otro filtro.' }}</p>
    <div v-if="$slots.accion" class="accion">
      <slot name="accion" />
    </div>
  </div>
</template>

<style scoped>
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1.25rem;
  text-align: center;
  color: var(--color-text);
  border: 1px dashed var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background-soft);
}

.titulo {
  margin: 0;
  font-weight: 700;
  color: var(--color-heading);
}

.estado-vacio p {
  margin: 0;
  max-width: 28rem;
  opacity: 0.8;
}

.accion {
  margin-top: 0.75rem;
}
</style>
