<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FiltroViajes } from '@/types'

const emit = defineEmits<{
  filtrar: [criterios: FiltroViajes]
}>()

const origen = ref('')
const destino = ref('')
const hora = ref('')

function emitirFiltro() {
  emit('filtrar', { origen: origen.value, destino: destino.value, hora: hora.value })
}

function limpiar() {
  origen.value = ''
  destino.value = ''
  hora.value = ''
  emitirFiltro()
}

watch([origen, destino, hora], emitirFiltro)
</script>

<template>
  <section class="filtro-viajes" aria-label="Filtrar viajes">
    <div class="filtro-campos">
      <label class="filtro-campo">
        <span>Origen</span>
        <input
          v-model="origen"
          type="text"
          placeholder="Ej. Campus UJAP"
          aria-label="Filtrar por origen"
        />
      </label>

      <label class="filtro-campo">
        <span>Destino</span>
        <input
          v-model="destino"
          type="text"
          placeholder="Ej. Terminal San Diego"
          aria-label="Filtrar por destino"
        />
      </label>

      <label class="filtro-campo">
        <span>Hora (desde)</span>
        <input
          v-model="hora"
          type="time"
          aria-label="Filtrar por hora"
        />
      </label>
    </div>

    <button type="button" class="btn-limpiar" @click="limpiar">Limpiar filtros</button>
  </section>
</template>

<style scoped>
.filtro-viajes {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--ride-gap);
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background-soft);
  margin-bottom: 1.25rem;
}

.filtro-campos {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ride-gap);
  flex: 1 1 0;
}

@media (min-width: 480px) {
  .filtro-campos {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 768px) {
  .filtro-campos {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.filtro-campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.filtro-campo input {
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.9rem;
  transition: border-color var(--ride-transition);
}

.filtro-campo input:focus {
  outline: none;
  border-color: var(--ride-green);
}

.btn-limpiar {
  flex: 0 0 auto;
  padding: 0.45rem 1rem;
  border: 1px solid var(--ride-green);
  border-radius: var(--ride-radius);
  background: transparent;
  color: var(--ride-green);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--ride-transition), color var(--ride-transition);
}

.btn-limpiar:hover {
  background: var(--ride-green);
  color: #fff;
}
</style>
