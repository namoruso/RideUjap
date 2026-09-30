import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { viajesEjemplo } from '@/data/ejemplos'
import type { Viaje, FiltroViajes, NuevoViaje } from '@/types'
import { blobLugaresViaje, lugarCoincide } from '@/utils/lugares'

const SS_KEY = 'ride_mis_uniones'

export const useViajesStore = defineStore('viajes', () => {
  const viajes = ref<Viaje[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  const usandoDemo = ref(false)

  const misUniones = ref<number[]>(
    JSON.parse(sessionStorage.getItem(SS_KEY) ?? '[]') as number[],
  )

  function guardarUniones() {
    sessionStorage.setItem(SS_KEY, JSON.stringify(misUniones.value))
  }

  const API_URL = String(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').trim()

  async function cargarViajes() {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/viajes`)
      if (!res.ok) throw new Error('Error al obtener los viajes')
      viajes.value = await res.json()
      usandoDemo.value = false
    } catch (e: unknown) {
      console.warn('API de viajes no disponible, usando rutas de ejemplo.', e)
      viajes.value = viajesEjemplo.map((v) => ({ ...v }))
      usandoDemo.value = true
      error.value = null
    } finally {
      cargando.value = false
    }
  }

  async function publicarViaje(nuevoViaje: NuevoViaje): Promise<boolean> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${API_URL}/viajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await auth.authHeaders()) },
        body: JSON.stringify(nuevoViaje),
      })
      if (!res.ok) throw new Error('Error al publicar el viaje')
      const viajeCreado: Viaje = await res.json()
      viajes.value.unshift(viajeCreado)
      return true
    } catch (e: unknown) {
      console.error(e)
      return false
    }
  }

  async function unirseAViaje(id: number): Promise<{ ok: boolean; mensaje: string }> {
    const auth = useAuthStore()
    if (misUniones.value.includes(id)) {
      return { ok: false, mensaje: 'Ya estás unido a este viaje' }
    }
    try {
      const res = await fetch(`${API_URL}/viajes/${id}/unirse`, {
        method: 'POST',
        headers: await auth.authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, mensaje: data.error ?? 'Error al unirse al viaje' }

      const idx = viajes.value.findIndex((v) => v.id === id)
      if (idx !== -1) viajes.value[idx] = data.viaje
      misUniones.value.push(id)
      guardarUniones()
      return { ok: true, mensaje: data.message ?? '¡Te uniste al viaje!' }
    } catch (e: unknown) {
      console.error(e)
      return { ok: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  async function abandonarViaje(id: number): Promise<{ ok: boolean; mensaje: string }> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${API_URL}/viajes/${id}/unirse`, {
        method: 'DELETE',
        headers: await auth.authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, mensaje: data.error ?? 'Error al abandonar el viaje' }

      await cargarViajes()
      misUniones.value = misUniones.value.filter((uid) => uid !== id)
      guardarUniones()
      return { ok: true, mensaje: data.message ?? 'Has abandonado el viaje' }
    } catch (e: unknown) {
      console.error(e)
      return { ok: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  function limpiarUniones() {
    misUniones.value = []
    sessionStorage.removeItem(SS_KEY)
  }

  async function eliminarViaje(id: number): Promise<{ ok: boolean; mensaje: string }> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${API_URL}/viajes/${id}`, {
        method: 'DELETE',
        headers: await auth.authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, mensaje: data.error ?? 'Error al eliminar el viaje' }

      viajes.value = viajes.value.filter((v) => v.id !== id)
      return { ok: true, mensaje: 'Viaje eliminado' }
    } catch (e: unknown) {
      console.error(e)
      return { ok: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  async function actualizarViaje(
    id: number,
    datos: Partial<NuevoViaje> & { estado?: string },
  ): Promise<{ ok: boolean; mensaje: string; viaje?: Viaje }> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${API_URL}/viajes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await auth.authHeaders()) },
        body: JSON.stringify(datos),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, mensaje: data.error ?? 'Error al actualizar el viaje' }

      const idx = viajes.value.findIndex((v) => v.id === id)
      if (idx !== -1) viajes.value[idx] = data as Viaje
      return { ok: true, mensaje: 'Viaje actualizado', viaje: data as Viaje }
    } catch (e: unknown) {
      console.error(e)
      return { ok: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  async function editarHoraViaje(id: number, hora: string): Promise<{ ok: boolean; mensaje: string }> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${API_URL}/viajes/${id}/hora`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await auth.authHeaders()) },
        body: JSON.stringify({ hora }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, mensaje: data.error ?? 'Error al editar la hora' }

      const idx = viajes.value.findIndex((v) => v.id === id)
      if (idx !== -1) viajes.value[idx] = data.viaje
      return { ok: true, mensaje: 'Hora actualizada' }
    } catch (e: unknown) {
      console.error(e)
      return { ok: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  async function obtenerPasajeros(id: number): Promise<any[]> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${API_URL}/viajes/${id}/pasajeros`, {
        headers: await auth.authHeaders(),
      })
      if (!res.ok) return []
      return await res.json()
    } catch (e: unknown) {
      console.error(e)
      return []
    }
  }

  const viajesFiltrados = computed(() => (filtro: FiltroViajes) => {
    return viajes.value.filter((v) => {
      const lugares = blobLugaresViaje(v)
      const zonaOk = !filtro.zona || lugarCoincide(lugares, filtro.zona)
      const origenOk = !filtro.origen || lugarCoincide(lugares, filtro.origen)
      const destinoOk = !filtro.destino || lugarCoincide(lugares, filtro.destino)
      const horaOk = !filtro.hora || v.hora.startsWith(filtro.hora)
      return zonaOk && origenOk && destinoOk && horaOk
    })
  })

  const viajesDelUsuario = computed(() => (idConductor: number) =>
    viajes.value.filter((v) => v.idConductor === idConductor),
  )

  const getViajeById = computed(() => (id: number) =>
    viajes.value.find((v) => v.id === id) ?? null,
  )

  const yaUnido = computed(() => (id: number) => misUniones.value.includes(id))

  return {
    viajes,
    cargando,
    error,
    misUniones,
    usandoDemo,
    cargarViajes,
    publicarViaje,
    unirseAViaje,
    abandonarViaje,
    limpiarUniones,
    eliminarViaje,
    actualizarViaje,
    editarHoraViaje,
    obtenerPasajeros,
    viajesFiltrados,
    viajesDelUsuario,
    getViajeById,
    yaUnido,
  }
})
