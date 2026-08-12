<script setup lang="ts">
import type { Viaje } from '@/types'

defineProps<{ viaje: Viaje }>()

const emit = defineEmits<{
  unirse: [id: number]
}>()
</script>

<template>
  <article class="tarjeta-viaje">
    <div class="ruta">
      <p class="origen-destino">{{ viaje.origen }} → {{ viaje.destino }}</p>
      <p class="meta">
        <span>{{ viaje.hora }}</span>
        <span>{{ viaje.cuposDisponibles }} cupos</span>
        <span class="estado">{{ viaje.estado }}</span>
      </p>
    </div>

    <button type="button" class="btn-unirse" @click="emit('unirse', viaje.id)">Unirme</button>
  </article>
</template>

<style scoped>
.tarjeta-viaje {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border, #d8d8d8);
  border-radius: 8px;
  background: var(--color-background-soft, #f8f8f8);
}

.ruta {
  flex: 1 1 12rem;
  min-width: 0;
}

.origen-destino {
  margin: 0 0 0.35rem;
  font-weight: 600;
  line-height: 1.35;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text, #444);
  opacity: 0.85;
}

.estado {
  text-transform: capitalize;
}

.btn-unirse {
  flex: 0 0 auto;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 6px;
  background: #0b6e4f;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.btn-unirse:hover {
  background: #095c42;
}
</style>
