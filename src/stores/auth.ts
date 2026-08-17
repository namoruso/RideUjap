import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UsuarioPublico, DatosLogin, DatosRegistro } from '@/types'

const LS_TOKEN = 'ride_token'
const LS_USUARIO = 'ride_usuario'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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

  // ── Getters ─────────────────────────────────────────────────────────────────
  const estaAutenticado = computed(() => !!token.value)

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

  function authHeaders(): Record<string, string> {
    if (token.value) return { Authorization: `Bearer ${token.value}` }
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

  return {
    token,
    usuario,
    cargando,
    error,
    estaAutenticado,
    authHeaders,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    solicitarRecuperacion,
    verificarCodigo,
    restablecerContrasena,
  }
})
