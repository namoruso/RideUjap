<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useClerk, useSignIn, useSignUp } from '@clerk/vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const clerk = useClerk()
const { isLoaded: signUpLoaded, signUp } = useSignUp()
const { isLoaded: signInLoaded, signIn } = useSignIn()

const paso = ref<'formulario' | 'codigo'>('formulario')
const cargando = ref(false)
const error = ref('')
const mostrarPwd = ref(false)
const mostrarConfirm = ref(false)

const form = reactive({
  nombre: '',
  correo: '',
  contrasena: '',
  confirmar: '',
  codigo: '',
})

const listo = computed(() => signUpLoaded.value && signInLoaded.value && Boolean(signUp.value))

const contrasenasOk = computed(
  () => form.contrasena.length > 0 && form.contrasena === form.confirmar,
)

function mensajeClerk(err: unknown): string {
  const e = err as { errors?: Array<{ longMessage?: string; message?: string; code?: string }> }
  const raw = e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || ''
  const lower = raw.toLowerCase()

  if (lower.includes('15 characters') || lower.includes('character')) {
    return (
      'Clerk exige una contraseña más larga (ahora mismo ~15 caracteres). ' +
      'Bájalo a 8 en Dashboard → User & authentication → Password → Update password requirements. ' +
      'Mundo123 debería valer con el mínimo NIST (8).'
    )
  }
  if (lower.includes('password')) {
    return raw || 'La contraseña no cumple los requisitos de Clerk'
  }
  return raw || 'No se pudo completar el registro'
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
      // Tras OAuth, el router hace bootstrap + ClerkSessionSync lleva a onboarding/inicio.
      redirectUrlComplete: `${origin}/sso-callback`,
    })
  } catch (e) {
    error.value = mensajeClerk(e)
    cargando.value = false
  }
}

async function crearCuenta() {
  error.value = ''
  if (!signUp.value) return

  const correo = form.correo.trim().toLowerCase()
  if (!correo.endsWith('@ujap.edu.ve')) {
    error.value = 'Usa tu correo institucional @ujap.edu.ve'
    return
  }
  if (form.contrasena.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  if (!contrasenasOk.value) {
    error.value = 'Las contraseñas no coinciden. Revísalas con “Ver”.'
    return
  }

  cargando.value = true
  try {
    const [firstName, ...rest] = form.nombre.trim().split(/\s+/)
    await signUp.value.create({
      emailAddress: correo,
      password: form.contrasena,
      firstName: firstName || undefined,
      lastName: rest.length ? rest.join(' ') : undefined,
    })
    await signUp.value.prepareEmailAddressVerification({ strategy: 'email_code' })
    paso.value = 'codigo'
  } catch (e) {
    error.value = mensajeClerk(e)
  } finally {
    cargando.value = false
  }
}

async function verificarCodigo() {
  error.value = ''
  if (!signUp.value || !clerk.value) return
  if (!form.codigo.trim()) {
    error.value = 'Ingresa el código que enviamos a tu correo'
    return
  }

  cargando.value = true
  try {
    const result = await signUp.value.attemptEmailAddressVerification({
      code: form.codigo.trim(),
    })
    if (result.status === 'complete' && result.createdSessionId) {
      // ClerkSessionSync + router bootstrap sincronizan y redirigen.
      await clerk.value.setActive({ session: result.createdSessionId })
      return
    }
    error.value = 'Verificación incompleta. Revisa el código e inténtalo de nuevo.'
  } catch (e) {
    error.value = mensajeClerk(e)
  } finally {
    cargando.value = false
  }
}

async function reenviarCodigo() {
  error.value = ''
  if (!signUp.value) return
  cargando.value = true
  try {
    await signUp.value.prepareEmailAddressVerification({ strategy: 'email_code' })
    error.value = ''
  } catch (e) {
    error.value = mensajeClerk(e)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="signup">
    <div v-if="!listo" class="skeleton" aria-busy="true">Cargando registro…</div>

    <template v-else>
      <!-- Paso 1: formulario -->
      <form
        v-if="paso === 'formulario'"
        class="form"
        novalidate
        @submit.prevent="crearCuenta"
      >
        <button
          type="button"
          class="btn-google"
          :disabled="cargando"
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
          Ideal si tu <strong>@ujap.edu.ve</strong> está vinculado a Google. Gmail personal se rechaza
          al sincronizar.
        </p>

        <div class="divider" role="separator"><span>o</span></div>

        <div class="campo">
          <label for="su-nombre">¿Cómo te llamas?</label>
          <input id="su-nombre" v-model="form.nombre" type="text" autocomplete="name" placeholder="Andrea Pérez" />
        </div>

        <div class="campo">
          <label for="su-correo">Correo institucional</label>
          <input
            id="su-correo"
            v-model="form.correo"
            type="email"
            autocomplete="email"
            placeholder="usuario@ujap.edu.ve"
            required
          />
        </div>

        <div class="campo">
          <label for="su-pwd">Contraseña</label>
          <div class="pwd-wrap">
            <input
              id="su-pwd"
              v-model="form.contrasena"
              :type="mostrarPwd ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Mínimo 8 caracteres (según Clerk)"
              required
            />
            <button
              type="button"
              class="btn-eye"
              :aria-label="mostrarPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="mostrarPwd = !mostrarPwd"
            >
              <!-- ojo abierto / cerrado -->
              <svg v-if="!mostrarPwd" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <div class="campo">
          <label for="su-confirm">Confirmar contraseña</label>
          <div class="pwd-wrap">
            <input
              id="su-confirm"
              v-model="form.confirmar"
              :type="mostrarConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Repite la contraseña"
              required
              :aria-invalid="form.confirmar.length > 0 && !contrasenasOk"
            />
            <button
              type="button"
              class="btn-eye"
              :aria-label="mostrarConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'"
              @click="mostrarConfirm = !mostrarConfirm"
            >
              <svg v-if="!mostrarConfirm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <p v-if="form.confirmar && !contrasenasOk" class="match-warn">Las contraseñas no coinciden</p>
          <p v-else-if="contrasenasOk" class="match-ok">Las contraseñas coinciden</p>
        </div>

        <p v-if="error || auth.error" class="error" role="alert">{{ error || auth.error }}</p>

        <button type="submit" class="btn-primary" :disabled="cargando || auth.sincronizandoClerk">
          {{ cargando ? 'Enviando código…' : auth.sincronizandoClerk ? 'Validando…' : 'Continuar' }}
        </button>

        <p class="switch">
          ¿Ya tienes una cuenta?
          <RouterLink to="/login">Iniciar sesión</RouterLink>
        </p>
      </form>

      <!-- Paso 2: código email -->
      <form v-else class="form" novalidate @submit.prevent="verificarCodigo">
        <header class="head">
          <h2>Verifica tu correo</h2>
          <p>
            Enviamos un código a <strong>{{ form.correo }}</strong>
          </p>
        </header>

        <div class="campo">
          <label for="su-code">Código de verificación</label>
          <input
            id="su-code"
            v-model="form.codigo"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="123456"
            required
          />
        </div>

        <p v-if="error || auth.error" class="error" role="alert">{{ error || auth.error }}</p>

        <button type="submit" class="btn-primary" :disabled="cargando || auth.sincronizandoClerk">
          {{ cargando || auth.sincronizandoClerk ? 'Validando…' : 'Crear cuenta' }}
        </button>

        <button type="button" class="btn-link" :disabled="cargando" @click="reenviarCodigo">
          Reenviar código
        </button>
        <button type="button" class="btn-link" @click="paso = 'formulario'">Volver</button>
      </form>
    </template>
  </div>
</template>

<style scoped>
.signup {
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
.head {
  text-align: center;
  margin-bottom: 0.35rem;
}
.head h2 {
  margin: 0;
  font-size: 1.35rem;
  color: var(--color-heading);
}
.head p {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.85;
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
  opacity: 0.55;
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
  opacity: 0.65;
  cursor: pointer;
  padding: 0;
}
.btn-eye:hover {
  opacity: 1;
  color: var(--ride-green-fg, var(--ride-green));
  background: var(--ride-green-light);
}
.match-warn {
  margin: 0;
  font-size: 0.78rem;
  color: #b91c1c;
}
.match-ok {
  margin: 0;
  font-size: 0.78rem;
  color: var(--ride-green-fg, var(--ride-green));
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
.btn-link {
  border: none;
  background: none;
  color: var(--ride-green-fg, var(--ride-green));
  font-weight: 650;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem;
}
.switch {
  margin: 0.5rem 0 0;
  text-align: center;
  font-size: 0.9rem;
}
.switch a {
  color: var(--ride-green-fg, var(--ride-green));
  font-weight: 700;
  text-decoration: none;
}
</style>
