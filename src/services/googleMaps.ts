/**
 * Acceso centralizado a Google Maps (carga única + geocoding, Places y GPS).
 * Los componentes no tocan `google.maps` directamente para buscar/ubicar lugares.
 */
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { GOOGLE_MAPS_API_KEY } from '@/config'

export type PuntoMapa = { lat: number; lng: number; label?: string }

export type Sugerencia = {
  id: string
  principal: string
  secundario: string
  texto: string
  prediccion: google.maps.places.PlacePrediction
}

/** Estado de Carabobo: sesgo de búsqueda y centro por defecto. */
export const CENTRO_CARABOBO = { lat: 10.183, lng: -68.0 }
export const BOUNDS_CARABOBO = { north: 10.45, south: 9.85, east: -67.7, west: -68.45 }

export const mapsConfigurado = Boolean(GOOGLE_MAPS_API_KEY)

let cargaPromise: Promise<void> | null = null

/** Carga las librerías una sola vez; reintenta si falló. */
export function cargarGoogleMaps(): Promise<void> {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(
      new Error('Falta VITE_GOOGLE_MAPS_API_KEY (Maps JavaScript, Geocoding, Places y Directions).'),
    )
  }
  if (!cargaPromise) {
    setOptions({ key: GOOGLE_MAPS_API_KEY, v: 'weekly', language: 'es', region: 'VE' })
    cargaPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('geocoding'),
      importLibrary('places'),
      importLibrary('routes'),
    ]).then(() => undefined)
    cargaPromise.catch(() => {
      cargaPromise = null
    })
  }
  return cargaPromise
}

let geocoder: google.maps.Geocoder | null = null
function getGeocoder(): google.maps.Geocoder {
  return (geocoder ??= new google.maps.Geocoder())
}

export function estaEnCarabobo(p: { lat: number; lng: number }): boolean {
  return (
    p.lat >= BOUNDS_CARABOBO.south &&
    p.lat <= BOUNDS_CARABOBO.north &&
    p.lng >= BOUNDS_CARABOBO.west &&
    p.lng <= BOUNDS_CARABOBO.east
  )
}

export async function direccionDeCoordenadas(lat: number, lng: number): Promise<string | null> {
  await cargarGoogleMaps()
  try {
    const { results } = await getGeocoder().geocode({ location: { lat, lng }, language: 'es' })
    return results[0]?.formatted_address ?? null
  } catch {
    return null
  }
}

/** Geocodifica texto libre (fallback cuando no se elige una sugerencia). */
export async function geocodificarTexto(texto: string): Promise<PuntoMapa | null> {
  const q = texto.trim()
  if (!q) return null
  await cargarGoogleMaps()
  try {
    const { results } = await getGeocoder().geocode({
      address: q,
      componentRestrictions: { country: 've' },
      bounds: BOUNDS_CARABOBO,
      language: 'es',
    })
    const best = results[0]
    if (!best?.geometry?.location) return null
    return {
      lat: best.geometry.location.lat(),
      lng: best.geometry.location.lng(),
      label: best.formatted_address || q,
    }
  } catch {
    return null
  }
}

export class UbicacionError extends Error {}

/** GPS del dispositivo + dirección legible. */
export async function ubicacionActual(): Promise<PuntoMapa> {
  if (!navigator.geolocation) throw new UbicacionError('Tu navegador no permite geolocalización.')
  const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 30000,
    }),
  ).catch((e: GeolocationPositionError) => {
    throw new UbicacionError(
      e.code === e.PERMISSION_DENIED
        ? 'Permiso de ubicación denegado. Actívalo en el navegador o escribe el lugar.'
        : 'No pudimos obtener tu ubicación. Escribe el lugar o márcalo en el mapa.',
    )
  })
  const { latitude: lat, longitude: lng } = pos.coords
  const label = (await direccionDeCoordenadas(lat, lng)) ?? 'Mi ubicación actual'
  return { lat, lng, label }
}

// ── Autocomplete (Places API New) ────────────────────────────────────────────
let sessionToken: google.maps.places.AutocompleteSessionToken | null = null

export async function buscarSugerencias(texto: string): Promise<Sugerencia[]> {
  const input = texto.trim()
  if (input.length < 3) return []
  await cargarGoogleMaps()
  sessionToken ??= new google.maps.places.AutocompleteSessionToken()
  const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
    {
      input,
      sessionToken,
      includedRegionCodes: ['ve'],
      language: 'es',
      region: 've',
      locationBias: BOUNDS_CARABOBO,
    },
  )
  return suggestions.flatMap((s) => {
    const p = s.placePrediction
    if (!p) return []
    return [
      {
        id: p.placeId,
        principal: p.mainText?.text ?? p.text.text,
        secundario: p.secondaryText?.text ?? '',
        texto: p.text.text,
        prediccion: p,
      },
    ]
  })
}

/** Resuelve coordenadas de una sugerencia y cierra la sesión de facturación. */
export async function resolverSugerencia(s: Sugerencia): Promise<PuntoMapa | null> {
  const place = s.prediccion.toPlace()
  try {
    await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] })
  } finally {
    sessionToken = null
  }
  if (!place.location) return null
  return {
    lat: place.location.lat(),
    lng: place.location.lng(),
    label: s.texto || place.formattedAddress || place.displayName || undefined,
  }
}
