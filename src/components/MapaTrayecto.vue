<script setup lang="ts">
/**
 * Mapa A→B (Carabobo / UJAP): marcadores, vía real (Directions) y, si es editable,
 * clic o arrastre para fijar puntos. La búsqueda por texto y el GPS viven en InputLugar.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  BOUNDS_CARABOBO,
  CENTRO_CARABOBO,
  cargarGoogleMaps,
  direccionDeCoordenadas,
  mapsConfigurado,
  type PuntoMapa,
} from '@/services/googleMaps'

export type { PuntoMapa }

export type InfoRuta = {
  distanciaTexto: string
  duracionTexto: string
  distanciaMetros: number
  duracionSegundos: number
} | null

const props = withDefaults(
  defineProps<{
    origen?: PuntoMapa | null
    destino?: PuntoMapa | null
    editable?: boolean
    height?: string
  }>(),
  {
    origen: null,
    destino: null,
    editable: false,
    height: '300px',
  },
)

const emit = defineEmits<{
  'update:origen': [PuntoMapa]
  'update:destino': [PuntoMapa]
  'update:ruta': [InfoRuta]
}>()

const contenedor = ref<HTMLElement | null>(null)
const error = ref<string | null>(null)
const listo = ref(false)
const modo = ref<'origen' | 'destino'>('origen')
const infoRuta = ref<InfoRuta>(null)
const avisoRuta = ref('')

let mapa: google.maps.Map | null = null
let marcadorOrigen: google.maps.Marker | null = null
let marcadorDestino: google.maps.Marker | null = null
let lineaFallback: google.maps.Polyline | null = null
let directionsService: google.maps.DirectionsService | null = null
let directionsRenderer: google.maps.DirectionsRenderer | null = null
let destruido = false
let secuenciaRuta = 0

const metaRuta = computed(() =>
  infoRuta.value ? `${infoRuta.value.distanciaTexto} · ${infoRuta.value.duracionTexto}` : '',
)

function emitirPunto(tipo: 'origen' | 'destino', punto: PuntoMapa) {
  if (tipo === 'origen') emit('update:origen', punto)
  else emit('update:destino', punto)
}

async function init() {
  if (!mapsConfigurado) {
    error.value =
      'Falta VITE_GOOGLE_MAPS_API_KEY. Activa Maps JavaScript, Geocoding, Places y Directions en Google Cloud.'
    return
  }
  try {
    await cargarGoogleMaps()
    if (destruido || !contenedor.value) return

    directionsService = new google.maps.DirectionsService()
    mapa = new google.maps.Map(contenedor.value, {
      center: props.origen ?? props.destino ?? CENTRO_CARABOBO,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      restriction: { latLngBounds: BOUNDS_CARABOBO, strictBounds: false },
    })
    directionsRenderer = new google.maps.DirectionsRenderer({
      map: mapa,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#0b6e4f', strokeOpacity: 0.95, strokeWeight: 5 },
    })

    if (props.editable) {
      mapa.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) void fijarDesdeCoordenadas(modo.value, e.latLng.lat(), e.latLng.lng(), true)
      })
    }

    listo.value = true
    await pintar()
  } catch (e) {
    console.error(e)
    error.value =
      'No se pudo cargar Google Maps. Revisa la API key y habilita Maps JavaScript, Geocoding, Places y Directions.'
  }
}

async function fijarDesdeCoordenadas(
  tipo: 'origen' | 'destino',
  lat: number,
  lng: number,
  alternar = false,
) {
  const label = (await direccionDeCoordenadas(lat, lng)) ?? (tipo === 'origen' ? 'Origen' : 'Destino')
  emitirPunto(tipo, { lat, lng, label })
  if (alternar) modo.value = tipo === 'origen' ? 'destino' : 'origen'
}

function crearMarcador(tipo: 'origen' | 'destino', punto: PuntoMapa): google.maps.Marker {
  const marcador = new google.maps.Marker({
    map: mapa,
    position: punto,
    label: tipo === 'origen' ? 'A' : 'B',
    title: punto.label ?? (tipo === 'origen' ? 'Origen' : 'Destino'),
    draggable: props.editable,
  })
  if (props.editable) {
    marcador.addListener('dragend', () => {
      const pos = marcador.getPosition()
      if (pos) void fijarDesdeCoordenadas(tipo, pos.lat(), pos.lng())
    })
  }
  return marcador
}

async function trazarRuta() {
  const origen = props.origen
  const destino = props.destino
  if (!mapa || !origen || !destino) return
  const mia = ++secuenciaRuta

  if (!directionsService || !directionsRenderer) {
    dibujarLineaRecta(origen, destino)
    return
  }
  try {
    const result = await directionsService.route({
      origin: origen,
      destination: destino,
      travelMode: google.maps.TravelMode.DRIVING,
      region: 've',
    })
    if (mia !== secuenciaRuta) return // llegó una respuesta vieja
    directionsRenderer.setDirections(result)
    lineaFallback?.setMap(null)
    lineaFallback = null

    const leg = result.routes[0]?.legs[0]
    if (leg?.distance && leg.duration) {
      infoRuta.value = {
        distanciaTexto: leg.distance.text,
        duracionTexto: leg.duration.text,
        distanciaMetros: leg.distance.value,
        duracionSegundos: leg.duration.value,
      }
      emit('update:ruta', infoRuta.value)
      avisoRuta.value = ''
    }
  } catch (e) {
    if (mia !== secuenciaRuta) return
    console.warn('[MapaTrayecto] directions', e)
    avisoRuta.value = 'No se pudo trazar la vía (¿Directions API activa?). Mostramos línea directa.'
    dibujarLineaRecta(origen, destino)
  }
}

function dibujarLineaRecta(origen: PuntoMapa, destino: PuntoMapa) {
  if (!mapa) return
  directionsRenderer?.set('directions', null)
  lineaFallback?.setMap(null)
  lineaFallback = new google.maps.Polyline({
    map: mapa,
    path: [origen, destino],
    strokeColor: '#0b6e4f',
    strokeOpacity: 0.85,
    strokeWeight: 4,
  })
  const bounds = new google.maps.LatLngBounds()
  bounds.extend(origen)
  bounds.extend(destino)
  mapa.fitBounds(bounds, 48)
  infoRuta.value = null
  emit('update:ruta', null)
}

async function pintar() {
  if (!mapa) return
  marcadorOrigen?.setMap(null)
  marcadorDestino?.setMap(null)
  marcadorOrigen = props.origen ? crearMarcador('origen', props.origen) : null
  marcadorDestino = props.destino ? crearMarcador('destino', props.destino) : null

  if (props.origen && props.destino) {
    await trazarRuta()
    return
  }
  secuenciaRuta++
  directionsRenderer?.set('directions', null)
  lineaFallback?.setMap(null)
  lineaFallback = null
  if (infoRuta.value) {
    infoRuta.value = null
    emit('update:ruta', null)
  }
  const unico = props.origen ?? props.destino
  if (unico) {
    mapa.setCenter(unico)
    mapa.setZoom(15)
  }
}

watch(
  () => [props.origen, props.destino],
  () => void pintar(),
  { deep: true },
)

onMounted(() => {
  void init()
})

onUnmounted(() => {
  destruido = true
  marcadorOrigen?.setMap(null)
  marcadorDestino?.setMap(null)
  lineaFallback?.setMap(null)
  directionsRenderer?.setMap(null)
  mapa = null
})

defineExpose({ listo })
</script>

<template>
  <div class="mapa-trayecto">
    <div v-if="editable && !error" class="mapa-toolbar">
      <p class="mapa-hint">
        Haz clic en el mapa para fijar
        <strong>{{ modo === 'origen' ? 'origen (A)' : 'destino (B)' }}</strong>
        o arrastra los marcadores para ajustarlos.
      </p>
      <div class="mapa-actions">
        <button
          type="button"
          class="btn-map btn-map--ghost"
          :class="{ 'is-on': modo === 'origen' }"
          @click="modo = 'origen'"
        >
          Clic = A
        </button>
        <button
          type="button"
          class="btn-map btn-map--ghost"
          :class="{ 'is-on': modo === 'destino' }"
          @click="modo = 'destino'"
        >
          Clic = B
        </button>
      </div>
    </div>

    <div v-if="error" class="mapa-fallback" role="status">{{ error }}</div>
    <div ref="contenedor" class="mapa-canvas" :style="{ height }" :hidden="!!error" />

    <div v-if="listo && !error" class="mapa-footer">
      <p v-if="metaRuta" class="mapa-meta">
        Vía estimada: <strong>{{ metaRuta }}</strong>
      </p>
      <p v-if="avisoRuta" class="mapa-aviso" role="status">{{ avisoRuta }}</p>
    </div>
  </div>
</template>

<style scoped>
.mapa-trayecto {
  display: grid;
  gap: 0.55rem;
}
.mapa-toolbar {
  display: grid;
  gap: 0.5rem;
}
.mapa-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.btn-map {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 0.65rem;
  background: var(--ride-green);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-map:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.btn-map--ghost {
  background: var(--color-background-soft);
  color: var(--color-heading);
  border: 1px solid var(--color-border);
}
.btn-map--ghost.is-on {
  border-color: var(--ride-green);
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.mapa-canvas {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--ride-green-border, #c5e4d6);
  background: var(--ride-green-light);
}
.mapa-hint,
.mapa-meta {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text);
}
.mapa-aviso {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #b45309;
}
.mapa-fallback {
  padding: 1rem;
  border-radius: 12px;
  background: color-mix(in srgb, #f59e0b 14%, var(--color-background));
  border: 1px dashed #f0b27a;
  color: color-mix(in srgb, #7a4a12 70%, var(--color-heading));
  font-size: 0.9rem;
}
.mapa-footer {
  display: grid;
  gap: 0.2rem;
}
</style>
