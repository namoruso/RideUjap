<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FiltroViajes } from '@/types'
import IconoRide from '@/components/IconoRide.vue'

const props = defineProps<{
  inicial?: FiltroViajes
}>()

const emit = defineEmits<{
  filtrar: [criterios: FiltroViajes]
}>()

const origen = ref(props.inicial?.origen ?? '')
const destino = ref(props.inicial?.destino ?? '')
const hora = ref(props.inicial?.hora ?? '')

const zonas = ['San Diego', 'Naguanagua', 'Valencia centro', 'Prebo', 'Campus UJAP']

function emitirFiltro() {
  emit('filtrar', { origen: origen.value, destino: destino.value, hora: hora.value })
}

function limpiar() {
  origen.value = ''
  destino.value = ''
  hora.value = ''
  emitirFiltro()
}

function aplicarZona(zona: string) {
  origen.value = zona
  if (!destino.value) destino.value = 'Campus UJAP'
  emitirFiltro()
}

watch([origen, destino, hora], emitirFiltro, { immediate: true })
</script>

<template>
  <section class="filtro-viajes" aria-label="Filtrar viajes">
    <p class="filtro-titulo">¿De dónde sales?</p>
    <div class="zonas">
      <button
        v-for="zona in zonas"
        :key="zona"
        type="button"
        class="zona"
        :class="{ 'is-on': origen === zona }"
        @click="aplicarZona(zona)"
      >
        {{ zona }}
      </button>
    </div>

    <div class="filtro-campos">
      <label class="filtro-campo">
        <span><IconoRide nombre="encuentro" /> Origen</span>
        <input v-model="origen" type="text" placeholder="San Diego, Naguanagua…" />
      </label>
      <label class="filtro-campo">
        <span><IconoRide nombre="campus" /> Destino</span>
        <input v-model="destino" type="text" placeholder="Campus UJAP" />
      </label>
      <label class="filtro-campo">
        <span><IconoRide nombre="ruta" /> Hora desde</span>
        <input v-model="hora" type="time" />
      </label>
    </div>

    <button type="button" class="btn-limpiar" @click="limpiar">Quitar filtros</button>
  </section>
</template>

<style scoped>
.filtro-viajes {
  display: grid;
  gap: 0.85rem;
  padding: 1.15rem 1.2rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background);
}

.filtro-titulo {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.55;
}

.zonas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.zona {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--ride-green-border);
  border-radius: 999px;
  background: transparent;
  color: var(--color-heading);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.zona.is-on,
.zona:hover {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  border-color: var(--ride-green);
}

.filtro-campos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}

@media (min-width: 720px) {
  .filtro-campos {
    grid-template-columns: 1fr 1fr 8.5rem;
  }
}

.filtro-campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
}

.filtro-campo span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-text);
  opacity: 0.75;
}

.filtro-campo :deep(.icono) {
  width: 0.95rem;
  height: 0.95rem;
  color: var(--ride-green-fg);
}

.filtro-campo input {
  min-height: 2.55rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
}

.filtro-campo input:focus {
  outline: 2px solid var(--ride-green);
  outline-offset: 1px;
}

.btn-limpiar {
  justify-self: start;
  padding: 0.45rem 0.9rem;
  border: none;
  background: none;
  color: var(--ride-green-fg);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
}

.btn-limpiar:hover {
  text-decoration: underline;
}
</style>
