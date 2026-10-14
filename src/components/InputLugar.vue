<script setup lang="ts">
/**
 * Campo de lugar con autocompletado de Google Places y "usar mi ubicación actual".
 * - v-model: texto visible.
 * - `seleccionar`: el usuario eligió un lugar (sugerencia, Enter, GPS) → coordenadas confirmadas.
 * - `invalidar`: el usuario editó el texto después de confirmar → las coordenadas ya no corresponden.
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  buscarSugerencias,
  geocodificarTexto,
  mapsConfigurado,
  resolverSugerencia,
  ubicacionActual,
  UbicacionError,
  type PuntoMapa,
  type Sugerencia,
} from '@/services/googleMaps'

const props = defineProps<{
  id: string
  modelValue: string
  placeholder?: string
  invalido?: boolean
  /** true cuando el texto ya tiene coordenadas confirmadas */
  confirmado?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
  seleccionar: [PuntoMapa]
  invalidar: []
}>()

const abierto = ref(false)
const sugerencias = ref<Sugerencia[]>([])
const activo = ref(-1)
const buscando = ref(false)
const ubicando = ref(false)
const aviso = ref('')

let timer: ReturnType<typeof setTimeout> | undefined
let secuencia = 0

const listaId = computed(() => `${props.id}-lista`)
// índice 0 = "mi ubicación"; 1..n = sugerencias
const totalOpciones = computed(() => sugerencias.value.length + 1)

function onInput(e: Event) {
  const texto = (e.target as HTMLInputElement).value
  emit('update:modelValue', texto)
  if (props.confirmado) emit('invalidar')
  aviso.value = ''
  abierto.value = true
  activo.value = -1
  clearTimeout(timer)
  const mia = ++secuencia
  if (texto.trim().length < 3 || !mapsConfigurado) {
    sugerencias.value = []
    buscando.value = false
    return
  }
  buscando.value = true
  timer = setTimeout(async () => {
    try {
      const res = await buscarSugerencias(texto)
      if (mia === secuencia) sugerencias.value = res
    } catch (err) {
      console.warn('[InputLugar] autocomplete', err)
      if (mia === secuencia) sugerencias.value = []
    } finally {
      if (mia === secuencia) buscando.value = false
    }
  }, 250)
}

function confirmar(p: PuntoMapa) {
  secuencia++
  abierto.value = false
  sugerencias.value = []
  activo.value = -1
  buscando.value = false
  emit('update:modelValue', p.label ?? props.modelValue)
  emit('seleccionar', p)
}

async function elegirSugerencia(s: Sugerencia) {
  aviso.value = ''
  try {
    const p = await resolverSugerencia(s)
    if (p) confirmar(p)
    else aviso.value = 'No pudimos ubicar ese lugar. Prueba otro o márcalo en el mapa.'
  } catch {
    aviso.value = 'No pudimos ubicar ese lugar. Prueba otro o márcalo en el mapa.'
  }
}

async function usarMiUbicacion() {
  aviso.value = ''
  ubicando.value = true
  try {
    confirmar(await ubicacionActual())
  } catch (e) {
    aviso.value = e instanceof UbicacionError ? e.message : 'No pudimos obtener tu ubicación.'
    abierto.value = false
  } finally {
    ubicando.value = false
  }
}

async function buscarTexto() {
  if (!props.modelValue.trim()) return
  aviso.value = ''
  buscando.value = true
  try {
    const p = await geocodificarTexto(props.modelValue)
    if (p) confirmar(p)
    else aviso.value = `No encontramos “${props.modelValue.trim()}”. Elige una sugerencia o márcalo en el mapa.`
  } finally {
    buscando.value = false
  }
}

function elegirOpcion(i: number) {
  if (i === 0) void usarMiUbicacion()
  else {
    const s = sugerencias.value[i - 1]
    if (s) void elegirSugerencia(s)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    abierto.value = true
    activo.value = (activo.value + 1) % totalOpciones.value
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    abierto.value = true
    activo.value = (activo.value - 1 + totalOpciones.value) % totalOpciones.value
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (abierto.value && activo.value >= 0) elegirOpcion(activo.value)
    else if (sugerencias.value[0] && abierto.value) void elegirSugerencia(sugerencias.value[0])
    else void buscarTexto()
  } else if (e.key === 'Escape') {
    abierto.value = false
  }
}

function onBlur() {
  // las opciones usan @mousedown.prevent, así que el blur solo ocurre al salir de verdad
  abierto.value = false
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="input-lugar">
    <div class="campo-wrap">
      <input
        :id="id"
        :value="modelValue"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="abierto"
        :aria-controls="listaId"
        :aria-activedescendant="activo >= 0 ? `${id}-op-${activo}` : undefined"
        :aria-invalid="invalido || undefined"
        :placeholder="placeholder"
        :class="{ 'input-error': invalido, 'input-ok': confirmado }"
        @input="onInput"
        @focus="abierto = true"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <span v-if="confirmado" class="check" title="Ubicación confirmada" aria-hidden="true">✓</span>
      <span v-else-if="buscando || ubicando" class="spin" aria-hidden="true" />
    </div>

    <ul v-if="abierto" :id="listaId" class="lista" role="listbox">
      <li
        :id="`${id}-op-0`"
        class="op op--gps"
        :class="{ 'op--on': activo === 0 }"
        role="option"
        :aria-selected="activo === 0"
        @mousedown.prevent="usarMiUbicacion"
      >
        <span class="op-ico" aria-hidden="true">◎</span>
        <span>{{ ubicando ? 'Ubicando…' : 'Usar mi ubicación actual' }}</span>
      </li>
      <li
        v-for="(s, i) in sugerencias"
        :id="`${id}-op-${i + 1}`"
        :key="s.id"
        class="op"
        :class="{ 'op--on': activo === i + 1 }"
        role="option"
        :aria-selected="activo === i + 1"
        @mousedown.prevent="elegirSugerencia(s)"
      >
        <span class="op-ico" aria-hidden="true">⌖</span>
        <span class="op-txt">
          <strong>{{ s.principal }}</strong>
          <small v-if="s.secundario">{{ s.secundario }}</small>
        </span>
      </li>
      <li v-if="modelValue.trim().length >= 3 && !buscando && !sugerencias.length" class="op op--vacio">
        Sin sugerencias. Pulsa Enter para buscar o marca el punto en el mapa.
      </li>
    </ul>

    <p v-if="aviso" class="aviso" role="status">{{ aviso }}</p>
  </div>
</template>

<style scoped>
.input-lugar {
  position: relative;
  width: 100%;
}
.campo-wrap {
  position: relative;
}
.campo-wrap input {
  width: 100%;
  padding-right: 2.2rem;
}
.input-ok {
  border-color: var(--ride-green) !important;
}
.check {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ride-green-fg);
  font-weight: 800;
}
.spin {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  width: 0.9rem;
  height: 0.9rem;
  margin-top: -0.45rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--ride-green);
  border-radius: 50%;
  animation: giro 0.7s linear infinite;
}
@keyframes giro {
  to {
    transform: rotate(360deg);
  }
}
.lista {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  top: calc(100% + 0.25rem);
  margin: 0;
  padding: 0.3rem;
  list-style: none;
  max-height: 18rem;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--color-heading) 14%, transparent);
}
.op {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.5rem 0.6rem;
  border-radius: 0.55rem;
  font-size: 0.85rem;
  color: var(--color-heading);
  cursor: pointer;
}
.op:hover,
.op--on {
  background: var(--ride-green-light);
}
.op--gps {
  color: var(--ride-green-fg);
  font-weight: 700;
  align-items: center;
}
.op--vacio {
  cursor: default;
  font-size: 0.78rem;
  color: var(--color-text);
}
.op--vacio:hover {
  background: none;
}
.op-ico {
  color: var(--ride-green-fg);
  line-height: 1.3;
}
.op-txt {
  display: grid;
  min-width: 0;
}
.op-txt small {
  color: var(--color-text);
  font-size: 0.75rem;
}
.aviso {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: #b45309;
}
</style>
