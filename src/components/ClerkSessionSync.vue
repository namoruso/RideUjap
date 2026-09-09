<script setup lang="ts">
/**
 * Mantiene Pinia alineado con la sesión Clerk (OAuth / refresh / SSO callback).
 * Navega a onboarding/inicio solo cuando el sync con el API ya terminó.
 */
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, useClerk } from '@clerk/vue'
import { useAuthStore } from '@/stores/auth'
import { clerkActivo } from '@/plugins/clerk'

const activo = clerkActivo()

if (activo) {
  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const { isSignedIn, getToken, signOut } = useAuth()
  const clerk = useClerk()
  let enCurso = false

  watch(
    isSignedIn,
    async (signedIn) => {
      if (!signedIn) return
      if (auth.token && auth.usuario) {
        // Ya hay sesión RideUJAP: si estás en login/registro, entra a la app.
        if (route.meta['soloInvitado']) {
          await router.replace(
            (route.query['redirect'] as string) || auth.rutaTrasAuth(),
          )
        }
        return
      }
      if (enCurso || auth.sincronizandoClerk) return
      enCurso = true
      try {
        const tokenFn = getToken.value
        const token = tokenFn ? await tokenFn({ skipCache: true }) : null
        if (!token) return
        const ok = await auth.sincronizarClerk(token, {
          nombre: clerk.value?.user?.fullName ?? undefined,
        })
        if (ok) {
          await router.replace(
            (route.query['redirect'] as string) || auth.rutaTrasAuth(),
          )
          return
        }

        const mensaje =
          auth.error || 'No se pudo sincronizar la sesión con el servidor RideUJAP'
        await signOut.value?.()
        await router.replace({
          name: 'login',
          query: { error: mensaje },
        })
      } finally {
        enCurso = false
      }
    },
    { immediate: true },
  )
}
</script>

<template></template>
