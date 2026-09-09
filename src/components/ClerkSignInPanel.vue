<script setup lang="ts">
/**
 * Sign-in propio (no <SignIn> de Clerk).
 * El componente prebuilt oculta el password tras borrar autofill (InstantPasswordRow).
 */
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useClerk, useSignIn } from '@clerk/vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const clerk = useClerk()
const { isLoaded, signIn } = useSignIn()

const cargando = ref(false)
const error = ref('')
const mostrarPwd = ref(false)

const form = reactive({
  correo: '',
  contrasena: '',
})

const listo = computed(() => isLoaded.value && Boolean(signIn.value))

function mensajeClerk(err: unknown): string {
  const e = err as { errors?: Array<{ longMessage?: string; message?: string }> }
  return e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || 'No se pudo iniciar sesión'
}

async function continuarConGoogle() {
  error.value = ''
  if (!signIn.value) return
  cargando.value = true
  try {
    const origin = window.location.origin
    await signIn.value.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: `${origin}/sso-callback`,
      redirectUrlComplete: `${origin}/sso-callback`,
    })
  } catch (e) {
    error.value = mensajeClerk(e)
    cargando.value = false
  }
}

async function entrar() {
  error.value = ''
  auth.error = null
  if (!signIn.value || !clerk.value) return

  const correo = form.correo.trim().toLowerCase()
  if (!correo) {
    error.value = 'Ingresa tu correo'
    return
  }
  if (!form.contrasena) {
    error.value = 'Ingresa tu contraseña'
    return
  }

  cargando.value = true
  try {
    const result = await signIn.value.create({
      identifier: correo,
      password: form.contrasena,
    })

    if (result.status === 'complete' && result.createdSessionId) {
      // ClerkSessionSync sincroniza con el API y redirige.
      await clerk.value.setActive({ session: result.createdSessionId })
      return
    }

    if (result.status === 'needs_first_factor') {
      const passwordFactor = result.supportedFirstFactors?.find(
        (f) => f.strategy === 'password',
      )
      if (passwordFactor) {
        const attempt = await signIn.value.attemptFirstFactor({
          strategy: 'password',
          password: form.contrasena,
        })
        if (attempt.status === 'complete' && attempt.createdSessionId) {
          await clerk.value.setActive({ session: attempt.createdSessionId })
          return
        }
      }
    }

    error.value =
      'No se pudo completar el inicio de sesión. Si tu cuenta usa otro método, prueba Google o recupera la contraseña.'
  } catch (e) {
    error.value = mensajeClerk(e)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="signin">
    <div v-if="!listo" class="skeleton" aria-busy="true">Cargando…</div>

    <form v-else class="form" novalidate @submit.prevent="entrar">
      <button
        type="button"
        class="btn-google"
        :disabled="cargando || auth.sincronizandoClerk"
        @click="continuarConGoogle"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21 21-9.3 21-21c0-1.4-.1-2.3-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.6 7.3 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.3 26.7 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 40.5 16.2 45 24 45z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.8 39.2 45 33 45 24c0-1.4-.1-2.3-.4-3.5z"
          />
        </svg>
        Continuar con Google
      </button>
      <p class="hint-google">
        Válido exclusivamente con cuenta institucional <strong>@ujap.edu.ve</strong>
      </p>

      <div class="divider" role="separator"><span>o</span></div>

      <div class="campo">
        <label for="si-correo">Correo electrónico</label>
        <input
          id="si-correo"
          v-model="form.correo"
          type="email"
          autocomplete="username"
          placeholder="usuario@ujap.edu.ve"
          required
        />
      </div>

      <div class="campo">
        <div class="campo-head">
          <label for="si-pwd">Contraseña</label>
          <RouterLink to="/recuperar" class="olvide">¿Has olvidado tu contraseña?</RouterLink>
        </div>
        <div class="pwd-wrap">
          <input
            id="si-pwd"
            v-model="form.contrasena"
            :type="mostrarPwd ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            class="btn-eye"
            :aria-label="mostrarPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="mostrarPwd = !mostrarPwd"
          >
            <svg
              v-if="!mostrarPwd"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
      </div>

      <p v-if="error || auth.error" class="error" role="alert">{{ error || auth.error }}</p>

      <button
        type="submit"
        class="btn-primary"
        :disabled="cargando || auth.sincronizandoClerk"
      >
        <span>
          {{
            auth.sincronizandoClerk
              ? 'Validando…'
              : cargando
                ? 'Entrando…'
                : 'Continuar'
          }}
        </span>
        <svg
          v-if="!cargando && !auth.sincronizandoClerk"
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

      <p class="switch">
        ¿No tienes cuenta?
        <RouterLink to="/registro">Regístrate</RouterLink>
      </p>

      <p class="clerk-note">
        Secured by <strong>clerk</strong>
        <span class="dev-badge">Development mode</span>
      </p>
    </form>
  </div>
</template>

<style scoped>
.signin {
  width: min(26rem, 100%);
  margin-inline: auto;
}
.skeleton {
  text-align: center;
  color: var(--color-text);
  opacity: 0.7;
  padding: 2rem 0;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.btn-google {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  font-weight: 650;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--color-heading);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-heading) 6%, transparent);
}
.btn-google:hover:not(:disabled) {
  border-color: var(--color-border-hover);
  background: var(--color-background-soft);
}
.hint-google {
  margin: -0.15rem 0 0;
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--color-text);
  text-align: center;
}
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text);
  font-size: 0.8rem;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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
.olvide {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ride-green-fg, var(--ride-green));
  text-decoration: none;
}
.olvide:hover {
  text-decoration: underline;
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
}
.campo input:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.pwd-wrap {
  position: relative;
}
.pwd-wrap input {
  padding-right: 2.75rem;
}
.btn-eye {
  position: absolute;
  top: 50%;
  right: 0.45rem;
  transform: translateY(-50%);
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--color-text);
  opacity: 0.8;
  cursor: pointer;
  padding: 0;
}
.btn-eye:hover {
  opacity: 1;
  color: var(--ride-green-fg, var(--ride-green));
  background: var(--ride-green-light);
}
.error {
  margin: 0;
  background: color-mix(in srgb, #ef4444 12%, var(--color-background));
  border-left: 4px solid #ef4444;
  padding: 0.7rem 0.9rem;
  border-radius: 6px;
  color: color-mix(in srgb, #b91c1c 65%, var(--color-heading));
  font-size: 0.875rem;
}
.btn-primary {
  margin-top: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--ride-green);
  color: #fff;
  font-weight: 750;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 25%, transparent);
}
.btn-primary:hover:not(:disabled) {
  background: var(--ride-green-hover);
}
.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.btn-arrow {
  width: 1rem;
  height: 1rem;
}
.switch {
  margin: 0.5rem 0 0;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text);
}
.switch a {
  color: var(--ride-green-fg, var(--ride-green));
  font-weight: 700;
  text-decoration: none;
}
.clerk-note {
  margin: 0.75rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--color-text);
}
.clerk-note strong {
  color: var(--color-heading);
}
.dev-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #b45309;
  background: color-mix(in srgb, #f59e0b 16%, var(--color-background));
  border: 1px solid color-mix(in srgb, #f59e0b 35%, var(--color-border));
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
}
</style>
