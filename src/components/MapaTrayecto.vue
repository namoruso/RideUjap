<script setup lang="ts">
/**
 * Mapa A→B (Carabobo / UJAP).
 * - Clic para fijar puntos (editable)
 * - Geocoding / Places: escribir un lugar → marca en el mapa
 * - Directions: dibuja la vía real (no solo línea recta)
 * - Geolocalización: “usar mi ubicación”
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export type PuntoMapa = { lat: number; lng: number; label?: string }

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
const geocoding = ref(false)
const ubicando = ref(false)
const infoRuta = ref<InfoRuta>(null)
const avisoRuta = ref('')

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

/** Centro por defecto: Valencia / San Diego (Carabobo) */
const CENTRO_CARABOBO = { lat: 10.183, lng: -68.0 }
const BOUNDS_CARABOBO = {
  north: 10.45,
  south: 9.85,
  east: -67.7,
  west: -68.45,
}

let mapa: google.maps.Map | null = null
let marcadorOrigen: google.maps.Marker | null = null
let marcadorDestino: google.maps.Marker | null = null
let lineaFallback: google.maps.Polyline | null = null
let directionsService: google.maps.DirectionsService | null = null
let directionsRenderer: google.maps.DirectionsRenderer | null = null
let geocoder: google.maps.Geocoder | null = null
const autocompletes: google.maps.places.Autocomplete[] = []

const metaRuta = computed(() => {
  if (!infoRuta.value) return ''
  return `${infoRuta.value.distanciaTexto} · ${infoRuta.value.duracionTexto}`
})

async function init() {
  if (!API_KEY) {
    error.value =
      'Falta VITE_GOOGLE_MAPS_API_KEY. Activa Maps JavaScript, Geocoding, Places y Directions en Google Cloud.'
    return
  }
  if (!contenedor.value) return

  try {
    setOptions({
      key: API_KEY,
      v: 'weekly',
    })
    const { Map } = (await importLibrary('maps')) as google.maps.MapsLibrary
    await importLibrary('geocoding')
    await importLibrary('places')
    try {
      await importLibrary('routes')
    } catch {
      /* DirectionsService sigue disponible en google.maps tras maps */
    }

    geocoder = new google.maps.Geocoder()
    directionsService = new google.maps.DirectionsService()

    mapa = new Map(contenedor.value, {
      center: props.origen ?? CENTRO_CARABOBO,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      restriction: {
        latLngBounds: BOUNDS_CARABOBO,
        strictBounds: false,
      },
    })

    directionsRenderer = new google.maps.DirectionsRenderer({
      map: mapa,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#0b6e4f',
        strokeOpacity: 0.95,
        strokeWeight: 5,
      },
    })

    if (props.editable) {
      mapa.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return
        void colocarDesdeClick(e.latLng.lat(), e.latLng.lng())
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

async function colocarDesdeClick(lat: number, lng: number) {
  const label = await reverseGeocode(lat, lng)
  const punto: PuntoMapa = {
    lat,
    lng,
    label: label || (modo.value === 'origen' ? 'Origen' : 'Destino'),
  }
  if (modo.value === 'origen') emit('update:origen', punto)
  else emit('update:destino', punto)
  modo.value = modo.value === 'origen' ? 'destino' : 'origen'
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!geocoder) return null
  try {
    const { results } = await geocoder.geocode({ location: { lat, lng } })
    return results[0]?.formatted_address ?? null
  } catch {
    return null
  }
}

/** Busca un lugar por nombre y fija origen o destino. */
async function geocodeTexto(
  texto: string,
  tipo: 'origen' | 'destino',
): Promise<PuntoMapa | null> {
  const q = texto.trim()
  if (!q || !geocoder) return null
  geocoding.value = true
  avisoRuta.value = ''
  try {
    const { results } = await geocoder.geocode({
      address: `${q}, Carabobo, Venezuela`,
      componentRestrictions: { country: 've' },
      bounds: BOUNDS_CARABOBO,
    })
    const best = results[0]
    if (!best?.geometry?.location) {
      avisoRuta.value = `No encontramos “${q}” en Carabobo. Prueba otro nombre o marca en el mapa.`
      return null
    }
    const punto: PuntoMapa = {
      lat: best.geometry.location.lat(),
      lng: best.geometry.location.lng(),
      label: best.formatted_address || q,
    }
    if (tipo === 'origen') emit('update:origen', punto)
    else emit('update:destino', punto)
    return punto
  } catch (e) {
    console.warn('[MapaTrayecto] geocode', e)
    avisoRuta.value = 'No se pudo geocodificar. Revisa que Geocoding API esté activa.'
    return null
  } finally {
    geocoding.value = false
  }
}

/** Usa GPS del dispositivo. */
async function usarMiUbicacion(tipo: 'origen' | 'destino' = 'origen'): Promise<PuntoMapa | null> {
  if (!navigator.geolocation) {
    avisoRuta.value = 'Tu navegador no permite geolocalización.'
    return null
  }
  ubicando.value = true
  avisoRuta.value = ''
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
      })
    })
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude
    const label = (await reverseGeocode(lat, lng)) || 'Mi ubicación'
    const punto: PuntoMapa = { lat, lng, label }
    if (tipo === 'origen') emit('update:origen', punto)
    else emit('update:destino', punto)
    return punto
  } catch {
    avisoRuta.value = 'No pudimos obtener tu ubicación. Permite el acceso o escribe el lugar.'
    return null
  } finally {
    ubicando.value = false
  }
}

/** Autocomplete de Google Places sobre un <input>. */
function attachAutocomplete(
  input: HTMLInputElement,
  tipo: 'origen' | 'destino',
): (() => void) | void {
  if (!listo.value || !window.google?.maps?.places) return
  const ac = new google.maps.places.Autocomplete(input, {
    fields: ['geometry', 'formatted_address', 'name'],
    componentRestrictions: { country: 've' },
    bounds: new google.maps.LatLngBounds(
      { lat: BOUNDS_CARABOBO.south, lng: BOUNDS_CARABOBO.west },
      { lat: BOUNDS_CARABOBO.north, lng: BOUNDS_CARABOBO.east },
    ),
    strictBounds: false,
  })
  autocompletes.push(ac)
  const listener = ac.addListener('place_changed', () => {
    const place = ac.getPlace()
    const loc = place.geometry?.location
    if (!loc) return
    const punto: PuntoMapa = {
      lat: loc.lat(),
      lng: loc.lng(),
      label: place.formatted_address || place.name || input.value,
    }
    if (tipo === 'origen') emit('update:origen', punto)
    else emit('update:destino', punto)
  })
  return () => {
    google.maps.event.removeListener(listener)
  }
}

async function trazarRuta() {
  if (!mapa || !props.origen || !props.destino) {
    infoRuta.value = null
    emit('update:ruta', null)
    directionsRenderer?.set('directions', null)
    return
  }

  if (!directionsService || !directionsRenderer) {
    dibujarLineaRecta()
    return
  }

  try {
    const result = await directionsService.route({
      origin: props.origen,
      destination: props.destino,
      travelMode: google.maps.TravelMode.DRIVING,
      region: 've',
    })
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
    console.warn('[MapaTrayecto] directions', e)
    avisoRuta.value =
      'No se pudo trazar la vía (¿Directions API activa?). Mostramos línea directa.'
    dibujarLineaRecta()
  }
}

function dibujarLineaRecta() {
  if (!mapa || !props.origen || !props.destino) return
  directionsRenderer?.set('directions', null)
  lineaFallback?.setMap(null)
  lineaFallback = new google.maps.Polyline({
    map: mapa,
    path: [props.origen, props.destino],
    strokeColor: '#0b6e4f',
    strokeOpacity: 0.85,
    strokeWeight: 4,
  })
  const bounds = new google.maps.LatLngBounds()
  bounds.extend(props.origen)
  bounds.extend(props.destino)
  mapa.fitBounds(bounds, 48)
  infoRuta.value = null
  emit('update:ruta', null)
}

async function pintar() {
  if (!mapa) return

  marcadorOrigen?.setMap(null)
  marcadorDestino?.setMap(null)

  if (props.origen) {
    marcadorOrigen = new google.maps.Marker({
      map: mapa,
      position: props.origen,
      label: 'A',
      title: props.origen.label ?? 'Origen',
    })
  }
  if (props.destino) {
    marcadorDestino = new google.maps.Marker({
      map: mapa,
      position: props.destino,
      label: 'B',
      title: props.destino.label ?? 'Destino',
    })
  }

  if (props.origen && props.destino) {
    await trazarRuta()
  } else {
    directionsRenderer?.set('directions', null)
    lineaFallback?.setMap(null)
    infoRuta.value = null
    emit('update:ruta', null)
    if (props.origen) {
      mapa.setCenter(props.origen)
      mapa.setZoom(14)
    } else if (props.destino) {
      mapa.setCenter(props.destino)
      mapa.setZoom(14)
    }
  }
}

watch(() => [props.origen, props.destino], () => void pintar(), { deep: true })

onMounted(() => {
  void init()
})

onUnmounted(() => {
  for (const ac of autocompletes) {
    google.maps.event.clearInstanceListeners(ac)
  }
  marcadorOrigen?.setMap(null)
  marcadorDestino?.setMap(null)
  lineaFallback?.setMap(null)
  directionsRenderer?.setMap(null)
  mapa = null
})

defineExpose({
  geocodeTexto,
  usarMiUbicacion,
  attachAutocomplete,
  listo,
})
</script>

<template>
  <div class="mapa-trayecto">
    <div v-if="editable && !error" class="mapa-toolbar">
      <p class="mapa-hint">
        Escribe un lugar (autocomplete), usa tu GPS, o haz clic:
        <strong>{{ modo === 'origen' ? 'origen (A)' : 'destino (B)' }}</strong>
      </p>
      <div class="mapa-actions">
        <button
          type="button"
          class="btn-map"
          :disabled="ubicando || !listo"
          @click="usarMiUbicacion('origen')"
        >
          {{ ubicando ? 'Ubicando…' : 'Mi ubicación → A' }}
        </button>
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
      <p v-else-if="geocoding" class="mapa-meta">Buscando lugar…</p>
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
