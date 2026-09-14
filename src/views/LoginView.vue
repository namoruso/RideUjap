<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { clerkActivo } from '@/plugins/clerk'
import AuthShell from '@/components/AuthShell.vue'
import ClerkSignInPanel from '@/components/ClerkSignInPanel.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const usaClerk = clerkActivo()

const form = reactive({ correo: '', contrasena: '' })

onMounted(() => {
  const q = route.query['error']
  if (typeof q === 'string' && q.trim()) {
    auth.error = q
  }
})

async function handleSubmit() {
  const ok = await auth.iniciarSesion({ correo: form.correo, contrasena: form.contrasena })
  if (ok) {
    await router.push((route.query['redirect'] as string) || auth.rutaTrasAuth())
  }
}
</script>

<template>
  <AuthShell modo="login" :con-clerk="usaClerk">
    <ClerkSignInPanel v-if="usaClerk" />

    <template v-else>
      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="campo">
          <div class="campo-head">
            <label for="login-correo">Correo electrónico</label>
          </div>
          <input
            id="login-correo"
            v-model="form.correo"
            type="email"
            placeholder="usuario@ujap.edu.ve"
            required
            autocomplete="email"
          />
        </div>

        <div class="campo">
          <div class="campo-head">
            <label for="login-contrasena">Contraseña</label>
            <RouterLink to="/recuperar" class="olvide-link">¿Has olvidado tu contraseña?</RouterLink>
          </div>
          <input
            id="login-contrasena"
            v-model="form.contrasena"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="auth.error" class="error-box" role="alert">{{ auth.error }}</div>

        <button type="submit" class="btn-principal" :disabled="auth.cargando">
          <span>{{ auth.cargando ? 'Entrando…' : 'Continuar' }}</span>
          <svg
            v-if="!auth.cargando"
            class="btn-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </form>

      <p class="switch">
        ¿No tienes cuenta?
        <RouterLink to="/registro">Regístrate</RouterLink>
      </p>
    </template>
  </AuthShell>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: min(24rem, 100%);
  margin-inline: auto;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.campo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.campo label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-heading);
}
.campo input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.9rem;
  font-weight: 500;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.campo input:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.olvide-link,
.switch a {
  color: var(--ride-green-fg, var(--ride-green));
  font-weight: 700;
  text-decoration: none;
  font-size: 0.75rem;
}
.olvide-link:hover,
.switch a:hover {
  text-decoration: underline;
}
.error-box {
  background: color-mix(in srgb, #ef4444 12%, var(--color-background));
  border-left: 4px solid #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: color-mix(in srgb, #b91c1c 65%, var(--color-heading));
  font-size: 0.875rem;
}
.btn-principal {
  margin-top: 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--ride-green);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 25%, transparent);
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}
.btn-principal:hover:not(:disabled) {
  background: var(--ride-green-hover);
}
.btn-principal:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.btn-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform 0.15s ease;
}
.btn-principal:hover:not(:disabled) .btn-arrow {
  transform: translateX(2px);
}
.switch {
  margin: 1.2rem 0 0;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text);
}
</style>
