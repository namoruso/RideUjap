import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { clerkActivo } from '@/plugins/clerk'
import LandingView from '../views/LandingView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/inicio',
      name: 'inicio',
      component: HomeView,
      meta: { requiereAuth: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/OnboardingView.vue'),
      meta: { requiereAuth: true, esOnboarding: true },
    },
    {
      path: '/viajes',
      name: 'viajes',
      component: () => import('../views/ViajesView.vue'),
    },
    {
      path: '/viajes/:id',
      name: 'detalle-viaje',
      component: () => import('../views/DetalleViajeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { soloInvitado: true },
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/RegistroView.vue'),
      meta: { soloInvitado: true },
    },
    {
      path: '/recuperar',
      name: 'recuperar',
      component: () => import('../views/RecuperarContrasenaView.vue'),
      meta: { soloInvitado: true },
    },
    {
      path: '/sso-callback',
      name: 'sso-callback',
      component: () => import('../views/SsoCallbackView.vue'),
    },
    {
      path: '/publicar',
      name: 'publicar-viaje',
      component: () => import('../views/PublicarViajeView.vue'),
      meta: { requiereAuth: true, requiereConductor: true },
    },
    {
      path: '/mis-viajes',
      name: 'mis-viajes',
      component: () => import('../views/MisViajesView.vue'),
      meta: { requiereAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Clerk puede redirigir antes de que Pinia tenga token: alinear primero.
  if (clerkActivo() && (!auth.token || !auth.usuario)) {
    await auth.bootstrapDesdeClerk()
  }

  if (to.meta['requiereAuth'] && !auth.estaAutenticado) {
    if (auth.sincronizandoClerk) {
      return { name: 'login', query: { redirect: to.fullPath, sync: '1' } }
    }
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta['soloInvitado'] && auth.estaAutenticado) {
    return { path: auth.rutaTrasAuth() }
  }

  if (auth.estaAutenticado && auth.necesitaOnboarding && !to.meta['esOnboarding']) {
    if (to.name === 'sso-callback') return
    return { name: 'onboarding' }
  }

  if (auth.estaAutenticado && !auth.necesitaOnboarding && to.meta['esOnboarding']) {
    return { name: 'inicio' }
  }

  if (to.meta['requiereConductor'] && auth.estaAutenticado && !auth.puedePublicar) {
    return auth.necesitaOnboarding
      ? { name: 'onboarding' }
      : { name: 'inicio', query: { aviso: 'conductor' } }
  }
})

export default router
