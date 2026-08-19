import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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
    // ── Públicas ───────────────────────────────────────────────────────────
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/inicio',
      name: 'inicio',
      component: HomeView,
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

    // ── Auth ───────────────────────────────────────────────────────────────
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

    // ── Protegidas (requieren autenticación) ───────────────────────────────
    {
      path: '/publicar',
      name: 'publicar-viaje',
      component: () => import('../views/PublicarViajeView.vue'),
      meta: { requiereAuth: true },
    },
    {
      path: '/mis-viajes',
      name: 'mis-viajes',
      component: () => import('../views/MisViajesView.vue'),
      meta: { requiereAuth: true },
    },
  ],
})

// ── Navigation Guard ───────────────────────────────────────────────────────────
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Si la ruta requiere auth y no está logueado → redirige a /login
  if (to.meta['requiereAuth'] && !auth.estaAutenticado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Si la ruta es solo para invitados y ya está logueado → redirige a inicio
  if (to.meta['soloInvitado'] && auth.estaAutenticado) {
    return { name: 'inicio' }
  }
})

export default router
