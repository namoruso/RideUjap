<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FiltroViajes } from '@/types'

const props = defineProps<{
  inicial?: FiltroViajes
}>()

const emit = defineEmits<{
  filtrar: [criterios: FiltroViajes]
}>()

const origen = ref(props.inicial?.origen ?? '')
const destino = ref(props.inicial?.destino ?? '')
const hora = ref(props.inicial?.hora ?? '')
const zona = ref(props.inicial?.zona ?? '')

const zonas = [
  'Todas',
  'San Diego',
  'Naguanagua',
  'Valencia centro',
  'Prebo',
  'El Trigal',
  'Campus UJAP',
  'Los Guayos',
]

function emitirFiltro() {
  emit('filtrar', {
    origen: origen.value,
    destino: destino.value,
    hora: hora.value,
    zona: zona.value || undefined,
  })
}

function limpiar() {
  origen.value = ''
  destino.value = ''
  hora.value = ''
  zona.value = ''
  emitirFiltro()
}

/** Zone chip matches that place anywhere on the route (origen, destino or encuentro). */
function aplicarZona(nombre: string) {
  if (nombre === 'Todas') {
    limpiar()
    return
  }
  zona.value = nombre
  // Clear text fields so the chip is the single source of truth (can re-type to refine).
  origen.value = ''
  destino.value = ''
  emitirFiltro()
}

function zonaActiva(nombre: string) {
  if (nombre === 'Todas') {
    return !zona.value && !origen.value && !destino.value
  }
  return zona.value === nombre
}

function onCampoTexto() {
  // Typing overrides the chip so origen/destino become the active criteria.
  if (origen.value || destino.value) zona.value = ''
  emitirFiltro()
}

watch(hora, emitirFiltro, { immediate: true })
</script>

<template>
  <section class="filtro" aria-labelledby="filter-heading">
    <h2 id="filter-heading" class="sr-only">Filtro de búsqueda de viajes</h2>

    <div class="zonas-block">
      <span class="zonas-label">Filtrar rápidamente por zona</span>
      <div class="zonas">
        <button
          v-for="z in zonas"
          :key="z"
          type="button"
          class="zona"
          :class="{
            'is-on': zonaActiva(z),
            'is-campus': z === 'Campus UJAP',
          }"
          @click="aplicarZona(z)"
        >
          {{ z === 'Todas' ? 'Todas las zonas' : z }}
        </button>
      </div>
    </div>

    <form class="campos" @submit.prevent="emitirFiltro">
      <label class="campo campo--wide">
        <span>Punto de origen</span>
        <input
          v-model="origen"
          type="text"
          placeholder="Ej. Naguanagua, Prebo, San Diego…"
          @input="onCampoTexto"
        />
      </label>
      <label class="campo campo--wide">
        <span>Destino</span>
        <div class="destino-wrap">
          <input
            v-model="destino"
            type="text"
            placeholder="Campus UJAP o destino…"
            @input="onCampoTexto"
          />
          <span class="ujap-tag">UJAP</span>
        </div>
      </label>
      <label class="campo">
        <span>Hora mínima</span>
        <input v-model="hora" type="time" />
      </label>
      <button type="submit" class="btn-buscar">Buscar</button>
    </form>

    <div class="filtro-foot">
      <p class="trust-line">Solo comunidad con correo institucional · Actualización al cargar</p>
      <button type="button" class="btn-limpiar" @click="limpiar">Quitar todos los filtros</button>
    </div>
  </section>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.filtro {
  padding: 1.25rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 1.15rem;
  background: var(--color-background);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-heading) 5%, transparent);
}
.zonas-block {
  margin-bottom: 1.1rem;
}
.zonas-label {
  display: block;
  margin-bottom: 0.55rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.65;
}
.zonas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.zona {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.65rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.75rem;
  font-weight: 650;
  cursor: pointer;
  font-family: inherit;
}
.zona.is-on {
  background: var(--ride-green);
  border-color: var(--ride-green);
  color: #fff;
}
.zona.is-campus:not(.is-on) {
  background: var(--ride-green-light);
  border-color: var(--ride-green-border);
  color: var(--ride-green-fg);
}
.campos {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .campos {
    grid-template-columns: 1.2fr 1.2fr 7.5rem auto;
    align-items: end;
  }
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.campo span {
  font-size: 0.72rem;
  font-weight: 750;
  color: var(--color-heading);
}
.campo input {
  min-height: 2.6rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.9rem;
  font-family: inherit;
}
.campo input:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.destino-wrap {
  position: relative;
}
.destino-wrap input {
  width: 100%;
  padding-right: 3.2rem;
}
.ujap-tag {
  position: absolute;
  right: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  border-radius: 0.35rem;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.btn-buscar {
  min-height: 2.6rem;
  padding: 0 1.1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--color-heading);
  color: var(--color-background);
  font-weight: 750;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn-buscar:hover {
  background: var(--ride-green);
  color: #fff;
}
.filtro-foot {
  margin-top: 0.9rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}
.trust-line {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text);
}
.btn-limpiar {
  border: none;
  background: none;
  color: var(--ride-green-fg);
  font-weight: 750;
  font-size: 0.78rem;
  cursor: pointer;
}
.btn-limpiar:hover {
  text-decoration: underline;
}
</style>
