<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ClerkSessionSync from '@/components/ClerkSessionSync.vue'
import { clerkActivo } from '@/plugins/clerk'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const usaClerk = clerkActivo()

const esInicio = computed(() => route.name === 'landing')
const esViajes = computed(() => route.path.startsWith('/viajes'))
const esPanel = computed(() => route.name === 'inicio')
const esPublicar = computed(() => route.name === 'publicar-viaje')
const esMisViajes = computed(() => route.name === 'mis-viajes')
const esAbout = computed(() => route.name === 'about')

// ── Dark mode ─────────────────────────────────────────────────────────────────
const darkMode = ref(false)

function aplicarTema(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  localStorage.setItem('ride_dark', dark ? '1' : '0')
}

function toggleDark() {
  darkMode.value = !darkMode.value
  aplicarTema(darkMode.value)
}

onMounted(() => {
  const guardado = localStorage.getItem('ride_dark')
  if (guardado !== null) {
    darkMode.value = guardado === '1'
  } else {
    darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  aplicarTema(darkMode.value)
})

const menuAbierto = ref(false)

function cerrarMenu() {
  menuAbierto.value = false
}

function cerrarSesion() {
  auth.cerrarSesion()
  cerrarMenu()
  router.push('/')
}
</script>

<template>
  <div class="app-shell">
    <ClerkSessionSync v-if="usaClerk" />
    <header class="topbar">
      <RouterLink class="brand" to="/" aria-label="RideUJAP, ir al inicio" @click="cerrarMenu">
        <img src="/Logo-UJAP2.jpg" alt="" class="brand-logo" />
        <span class="brand-copy">
          <span class="brand-name">RideUJAP</span>
          <span class="brand-tag">Inicio · carpooling UJAP</span>
        </span>
      </RouterLink>

      <nav class="nav-desktop" aria-label="Navegación principal">
        <RouterLink to="/" :class="{ 'is-active': esInicio }">Inicio</RouterLink>
        <RouterLink to="/viajes" :class="{ 'is-active': esViajes }">Viajes</RouterLink>
        <template v-if="auth.estaAutenticado">
          <RouterLink to="/inicio" :class="{ 'is-active': esPanel }">Mi panel</RouterLink>
          <RouterLink
            v-if="auth.puedePublicar"
            to="/publicar"
            :class="{ 'is-active': esPublicar }"
          >
            Publicar
          </RouterLink>
          <RouterLink to="/mis-viajes" :class="{ 'is-active': esMisViajes }">Mis viajes</RouterLink>
        </template>
        <RouterLink to="/about" :class="{ 'is-active': esAbout }">Acerca de</RouterLink>
      </nav>

      <!-- Controles derechos -->
      <div class="controles">
        <!-- Dark mode toggle -->
        <button
          type="button"
          class="btn-icon"
          :aria-label="darkMode ? 'Activar modo claro' : 'Activar modo oscuro'"
          :title="darkMode ? 'Modo claro' : 'Modo oscuro'"
          @click="toggleDark"
        >
          <!-- Sol (modo claro visible) -->
          <svg
            v-if="darkMode"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <!-- Luna (modo oscuro visible) -->
          <svg
            v-else
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <!-- Zona usuario (desktop) -->
        <div class="zona-usuario nav-desktop">
          <template v-if="auth.estaAutenticado">
            <div class="usuario-chip">
              <div class="avatar-chip">{{ auth.usuario?.nombre?.charAt(0)?.toUpperCase() }}</div>
              <span class="nombre-usuario">{{ auth.usuario?.nombre }}</span>
            </div>
            <button type="button" class="btn-cerrar-sesion" @click="cerrarSesion">Salir</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="link-auth">Iniciar sesión</RouterLink>
            <RouterLink to="/registro" class="btn-registrarse">Registrarse</RouterLink>
          </template>
        </div>

        <!-- Botón hamburguesa (solo móvil) -->
        <button
          type="button"
          class="btn-icon btn-hamburguesa"
          :aria-label="menuAbierto ? 'Cerrar menú' : 'Abrir menú'"
          @click="menuAbierto = !menuAbierto"
        >
          <svg
            v-if="!menuAbierto"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Menú móvil desplegable -->
    <nav v-if="menuAbierto" class="nav-movil" aria-label="Menú móvil">
      <RouterLink to="/" :class="{ 'is-active': esInicio }" @click="cerrarMenu">Inicio</RouterLink>
      <RouterLink to="/viajes" :class="{ 'is-active': esViajes }" @click="cerrarMenu">Viajes</RouterLink>
      <template v-if="auth.estaAutenticado">
        <RouterLink to="/inicio" :class="{ 'is-active': esPanel }" @click="cerrarMenu">
          Mi panel
        </RouterLink>
        <RouterLink
          v-if="auth.puedePublicar"
          to="/publicar"
          :class="{ 'is-active': esPublicar }"
          @click="cerrarMenu"
        >
          Publicar viaje
        </RouterLink>
        <RouterLink to="/mis-viajes" :class="{ 'is-active': esMisViajes }" @click="cerrarMenu">
          Mis viajes
        </RouterLink>
      </template>
      <RouterLink to="/about" :class="{ 'is-active': esAbout }" @click="cerrarMenu">Acerca de</RouterLink>

      <div class="nav-movil-footer">
        <template v-if="auth.estaAutenticado">
          <span class="nombre-movil">{{ auth.usuario?.nombre }}</span>
          <button type="button" class="btn-cerrar-sesion" @click="cerrarSesion">
            Cerrar sesión
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-registrarse btn-full" @click="cerrarMenu"
            >Iniciar sesión</RouterLink
          >
          <RouterLink to="/registro" class="btn-registrarse btn-full" @click="cerrarMenu"
            >Registrarse</RouterLink
          >
        </template>
      </div>
    </nav>

    <RouterView />

    <footer class="pie">
      <p>RideUJAP · comunidad UJAP · no es un servicio de taxi</p>
      <p class="pie-meta">© 2026 · ETW09303 · Ingeniería en Computación</p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  min-height: 100vh;
  width: 100%;
}

/* ── Topbar ── */
.topbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-background) 86%, transparent);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 100;
}

@media (min-width: 768px) {
  .topbar {
    padding: 0.7rem 2rem;
  }
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--ride-green-fg);
  text-decoration: none;
  flex-shrink: 0;
  min-width: 0;
}
.brand:hover {
  opacity: 1;
}
.brand-logo {
  height: 32px;
  width: auto;
  border-radius: 6px;
  flex-shrink: 0;
}
.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  min-width: 0;
}
.brand-name {
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}
.brand-tag {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-text);
  opacity: 0.65;
}
@media (max-width: 400px) {
  .brand-tag {
    display: none;
  }
}

/* Nav desktop */
.nav-desktop {
  display: none;
  flex-wrap: wrap;
  gap: 0.15rem;
  margin-left: 1rem;
}
@media (min-width: 768px) {
  .nav-desktop {
    display: flex;
  }
}

.nav-desktop a {
  text-decoration: none;
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.nav-desktop a:hover {
  background: var(--color-background-soft);
  opacity: 1;
}
.nav-desktop a.is-active {
  color: var(--ride-green-fg);
  font-weight: 700;
  background: var(--ride-green-light);
}

/* Controles (dark mode + hamburguesa) */
.controles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

/* Zona usuario */
.zona-usuario {
  align-items: center;
  gap: 0.5rem;
}

.usuario-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.avatar-chip {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--ride-green);
  color: #fff;
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nombre-usuario {
  font-size: 0.875rem;
  font-weight: 600;
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Botón icono genérico (dark mode / hamburguesa) */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-icon:hover {
  background: var(--color-background-soft);
}

/* Hamburguesa solo en móvil */
.btn-hamburguesa {
  display: flex;
}
@media (min-width: 768px) {
  .btn-hamburguesa {
    display: none;
  }
}

/* Auth buttons */
.link-auth {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ride-green-fg);
  text-decoration: none;
  padding: 0.3rem 0.5rem;
}
.btn-registrarse {
  padding: 0.35rem 0.85rem;
  border: none;
  border-radius: 8px;
  background: var(--ride-green);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s ease;
  cursor: pointer;
  font-family: inherit;
}
.btn-registrarse:hover {
  background: var(--ride-green-hover);
  opacity: 1;
}

.btn-cerrar-sesion {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}
.btn-cerrar-sesion:hover {
  background: #fee2e2;
  border-color: #dc2626;
  color: #dc2626;
}

/* ── Menú móvil ── */
.nav-movil {
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0;
  animation: slideDown 0.15s ease;
}
@media (min-width: 768px) {
  .nav-movil {
    display: none;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-movil a {
  display: block;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s ease;
}
.nav-movil a:hover {
  background: var(--color-background-soft);
}
.nav-movil a.is-active {
  color: var(--ride-green-fg);
  font-weight: 700;
}

.nav-movil-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
}

.nombre-movil {
  font-size: 0.9rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.25rem;
}

.btn-full {
  text-align: center;
  padding: 0.65rem;
}

/* ── Footer ── */
.pie {
  margin-top: 3rem;
  padding: 1.25rem 1rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.55;
}

.pie-meta {
  margin-top: 0.25rem;
}
</style>
