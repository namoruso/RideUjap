import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UsuarioPublico, DatosLogin, DatosRegistro } from '@/types'

const LS_TOKEN = 'ride_token'
const LS_USUARIO = 'ride_usuario'

const API_URL = String(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').trim()

type ClerkBrowser = {
  loaded?: boolean
  load?: () => Promise<void>
  session?: { getToken: (opts?: { skipCache?: boolean }) => Promise<string | null> } | null
  user?: { fullName?: string | null } | null
}

function clerkBrowser(): ClerkBrowser | undefined {
  return (window as unknown as { Clerk?: ClerkBrowser }).Clerk
}

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const token = ref<string | null>(localStorage.getItem(LS_TOKEN))
  const usuario = ref<UsuarioPublico | null>(
    (() => {
      try {
        const raw = localStorage.getItem(LS_USUARIO)
        return raw ? (JSON.parse(raw) as UsuarioPublico) : null
      } catch {
        return null
      }
    })(),
  )
  const cargando = ref(false)
  const error = ref<string | null>(null)
  /** True while aligning Clerk session → Pinia (avoids blank bounce after SignIn). */
  const sincronizandoClerk = ref(false)
  let bootstrapPromise: Promise<boolean> | null = null
  let syncPromise: Promise<boolean> | null = null

  // ── Getters ─────────────────────────────────────────────────────────────────
  const estaAutenticado = computed(() => !!token.value)
  const necesitaOnboarding = computed(
    () => estaAutenticado.value && usuario.value?.onboardingCompleto !== true,
  )
  const puedePublicar = computed(
    () =>
      !!usuario.value?.esConductor &&
      !!usuario.value?.onboardingCompleto &&
      !!usuario.value?.placa,
  )

  function rutaTrasAuth(): string {
    return necesitaOnboarding.value ? '/onboarding' : '/inicio'
  }

  function actualizarUsuario(u: UsuarioPublico) {
    if (!token.value) return
    guardarSesion(u, token.value)
  }

  // ── Helpers internos ────────────────────────────────────────────────────────
  function guardarSesion(u: UsuarioPublico, t: string) {
    usuario.value = u
    token.value = t
    localStorage.setItem(LS_TOKEN, t)
    localStorage.setItem(LS_USUARIO, JSON.stringify(u))
  }

  function limpiarSesion() {
    usuario.value = null
    token.value = null
    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_USUARIO)
  }

  /** Los session JWT de Clerk caducan ~60s: refrescar antes de cada request protegido. */
  async function refrescarTokenSiClerk(): Promise<string | null> {
    const clerk = clerkBrowser()
    if (clerk?.session?.getToken) {
      try {
        const fresco = await clerk.session.getToken({ skipCache: true })
        if (fresco) {
          token.value = fresco
          localStorage.setItem(LS_TOKEN, fresco)
          return fresco
        }
      } catch (e) {
        console.warn('[auth] No se pudo refrescar token Clerk', e)
      }
    }
    return token.value
  }

  async function authHeaders(): Promise<Record<string, string>> {
    const t = await refrescarTokenSiClerk()
    if (t) return { Authorization: `Bearer ${t}` }
    return {}
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────

  async function iniciarSesion(datos: DatosLogin): Promise<boolean> {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error ?? 'Error al iniciar sesión'
        return false
      }
      guardarSesion(data.usuario, data.token)
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    } finally {
      cargando.value = false
    }
  }

  async function registrarse(datos: DatosRegistro): Promise<boolean> {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error ?? 'Error al registrarse'
        return false
      }
      guardarSesion(data.usuario, data.token)
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    } finally {
      cargando.value = false
    }
  }

  function cerrarSesion() {
    limpiarSesion()
    error.value = null
    // Limpia las uniones del usuario al cerrar sesión (importación diferida para evitar ciclo)
    import('@/stores/viajes').then(({ useViajesStore }) => {
      useViajesStore().limpiarUniones()
    })
  }

  async function solicitarRecuperacion(correo: string): Promise<boolean> {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error ?? 'Error al enviar el código'
        return false
      }
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    } finally {
      cargando.value = false
    }
  }

  async function verificarCodigo(correo: string, codigo: string): Promise<string | null> {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/auth/verificar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo }),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error ?? 'Código inválido'
        return null
      }
      return data.tokenTemporal as string
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return null
    } finally {
      cargando.value = false
    }
  }

  async function restablecerContrasena(tokenTemporal: string, nuevaContrasena: string): Promise<boolean> {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/auth/restablecer-contrasena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenTemporal, nuevaContrasena }),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error ?? 'Error al restablecer la contraseña'
        return false
      }
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    } finally {
      cargando.value = false
    }
  }

  /** Tras SignIn de Clerk: sincroniza Usuario en Postgres y guarda el session token. */
  async function sincronizarClerk(
    sessionToken: string,
    extra?: { nombre?: string; telefono?: string },
  ): Promise<boolean> {
    if (syncPromise) return syncPromise

    syncPromise = (async () => {
      sincronizandoClerk.value = true
      cargando.value = true
      error.value = null
      try {
        const res = await fetch(`${API_URL}/auth/clerk/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(extra ?? {}),
        })
        const data = await res.json()
        if (!res.ok) {
          error.value = data.error ?? 'No se pudo sincronizar la sesión Clerk'
          limpiarSesion()
          return false
        }
        guardarSesion(data.usuario, sessionToken)
        return true
      } catch {
        error.value = 'No se pudo conectar con el servidor'
        limpiarSesion()
        return false
      } finally {
        cargando.value = false
        sincronizandoClerk.value = false
      }
    })()

    try {
      return await syncPromise
    } finally {
      syncPromise = null
    }
  }

  /**
   * Alinea Pinia con la sesión Clerk antes de guards/navegación.
   * Evita: Clerk redirige → /onboarding sin token Pinia → bounce a login → pantalla vacía.
   */
  async function bootstrapDesdeClerk(): Promise<boolean> {
    if (token.value && usuario.value) return true
    if (bootstrapPromise) return bootstrapPromise

    bootstrapPromise = (async () => {
      const clerk = clerkBrowser()
      if (!clerk) return false
      try {
        if (clerk.loaded === false && clerk.load) await clerk.load()
        if (!clerk.session?.getToken) return false
        const fresco = await clerk.session.getToken({ skipCache: true })
        if (!fresco) return false
        return await sincronizarClerk(fresco, {
          nombre: clerk.user?.fullName ?? undefined,
        })
      } catch (e) {
        console.warn('[auth] bootstrapDesdeClerk', e)
        return false
      } finally {
        bootstrapPromise = null
      }
    })()

    return bootstrapPromise
  }

  async function guardarRol(rol: 'viajero' | 'conductor'): Promise<boolean> {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/usuarios/me/rol`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ rol }),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error ?? 'No se pudo guardar el rol'
        return false
      }
      actualizarUsuario(data)
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    } finally {
      cargando.value = false
    }
  }

  async function guardarVehiculo(datos: {
    marcaVehiculo: string
    modeloVehiculo: string
    colorVehiculo: string
    placa: string
    puestosVehiculo: number
  }): Promise<boolean> {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/usuarios/me/vehiculo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify(datos),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error ?? 'No se pudo guardar el vehículo'
        return false
      }
      actualizarUsuario(data)
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    } finally {
      cargando.value = false
    }
  }

  return {
    token,
    usuario,
    cargando,
    error,
    sincronizandoClerk,
    estaAutenticado,
    necesitaOnboarding,
    puedePublicar,
    rutaTrasAuth,
    authHeaders,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    solicitarRecuperacion,
    verificarCodigo,
    restablecerContrasena,
    sincronizarClerk,
    bootstrapDesdeClerk,
    guardarRol,
    guardarVehiculo,
  }
})
