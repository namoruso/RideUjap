import { ref } from 'vue'
import { defineStore } from 'pinia'
import { API_URL } from '@/config'
import { useAuthStore } from '@/stores/auth'
import type { Notificacion } from '@/types'

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const items = ref<Notificacion[]>([])
  const noLeidas = ref(0)
  /** false si el servidor no tiene MongoDB configurado (la campana se oculta). */
  const disponible = ref(true)
  const hayMas = ref(false)
  const cargando = ref(false)

  let abort: AbortController | null = null
  let reintento: ReturnType<typeof setTimeout> | undefined
  let intentos = 0

  async function pedir(ruta: string, init: RequestInit = {}): Promise<Response> {
    const auth = useAuthStore()
    return fetch(`${API_URL}/notificaciones${ruta}`, {
      ...init,
      headers: { ...(await auth.authHeaders()), ...init.headers },
    })
  }

  async function cargar(mas = false) {
    if (cargando.value) return
    cargando.value = true
    try {
      const antes = mas ? items.value.at(-1)?._id : undefined
      const res = await pedir(`?limite=20${antes ? `&antes=${antes}` : ''}`)
      if (res.status === 503) {
        disponible.value = false
        return
      }
      if (!res.ok) return
      const data = (await res.json()) as { items: Notificacion[]; noLeidas: number }
      items.value = mas ? [...items.value, ...data.items] : data.items
      noLeidas.value = data.noLeidas
      hayMas.value = data.items.length === 20
    } catch (e) {
      console.warn('[notificaciones] cargar', e)
    } finally {
      cargando.value = false
    }
  }

  function recibir(n: Notificacion) {
    if (items.value.some((x) => x._id === n._id)) return
    items.value.unshift(n)
    noLeidas.value++
  }

  async function marcarLeida(id: string) {
    const n = items.value.find((x) => x._id === id)
    if (!n || n.leida) return
    n.leida = true
    noLeidas.value = Math.max(0, noLeidas.value - 1)
    await pedir(`/${id}/leida`, { method: 'PATCH' }).catch(() => undefined)
  }

  async function marcarTodas() {
    items.value.forEach((n) => (n.leida = true))
    noLeidas.value = 0
    await pedir('/leidas', { method: 'PATCH' }).catch(() => undefined)
  }

  /** Abre el stream SSE (fetch + header Authorization) y reconecta con backoff. */
  async function conectar() {
    desconectar(false)
    abort = new AbortController()
    const { signal } = abort
    try {
      const res = await pedir('/stream', { signal, headers: { Accept: 'text/event-stream' } })
      if (res.status === 503) {
        disponible.value = false
        return
      }
      if (!res.ok || !res.body) throw new Error(`stream ${res.status}`)
      intentos = 0
      const lector = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      for (;;) {
        const { value, done } = await lector.read()
        if (done) break
        buffer += value
        const bloques = buffer.split('\n\n')
        buffer = bloques.pop() ?? ''
        for (const b of bloques) {
          if (!b.includes('event: notificacion')) continue
          const data = b.split('\n').find((l) => l.startsWith('data: '))
          if (data) recibir(JSON.parse(data.slice(6)) as Notificacion)
        }
      }
    } catch (e) {
      if (signal.aborted) return
      console.warn('[notificaciones] stream', e)
    }
    if (signal.aborted) return
    intentos++
    reintento = setTimeout(() => void conectar(), Math.min(30_000, 1000 * 2 ** intentos))
  }

  function desconectar(limpiar = true) {
    clearTimeout(reintento)
    abort?.abort()
    abort = null
    if (limpiar) {
      items.value = []
      noLeidas.value = 0
      intentos = 0
    }
  }

  return { items, noLeidas, disponible, hayMas, cargando, cargar, marcarLeida, marcarTodas, conectar, desconectar }
})
