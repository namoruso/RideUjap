<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/vue'
import { useAuthStore } from '@/stores/auth'
import { clerkActivo } from '@/plugins/clerk'

const router = useRouter()
const auth = useAuthStore()

if (clerkActivo()) {
  const { isSignedIn } = useAuth()
  watch(
    [isSignedIn, () => auth.estaAutenticado],
    async ([signedIn, rideOk]) => {
      if (signedIn && rideOk) {
        await router.replace(auth.rutaTrasAuth())
      }
    },
    { immediate: true },
  )
}
</script>

<template>
  <main class="sso-page page-content">
    <p>
      {{
        auth.sincronizandoClerk || !auth.estaAutenticado
          ? 'Completando inicio de sesión…'
          : 'Entrando a RideUJAP…'
      }}
    </p>
    <AuthenticateWithRedirectCallback />
    <p v-if="auth.error" class="error" role="alert">{{ auth.error }}</p>
  </main>
</template>

<style scoped>
.sso-page {
  min-height: 50vh;
  display: grid;
  place-items: center;
  gap: 0.75rem;
  color: var(--color-text);
  opacity: 0.85;
}
.error {
  max-width: 28rem;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #b91c1c;
  font-size: 0.875rem;
  opacity: 1;
}
</style>
