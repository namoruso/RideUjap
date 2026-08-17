<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

// Los 3 pasos en la misma vista: 'correo' → 'codigo' → 'exito'
const paso = ref<'correo' | 'codigo' | 'exito'>('correo')

const correoGuardado = ref('')
const tokenTemporal = ref('')
const errorLocal = ref('')

const formCorreo = reactive({ correo: '' })
const formCodigo = reactive({ codigo: '', nuevaContrasena: '', confirmar: '' })

// Paso 1: Solicitar código
async function handleSolicitarCodigo() {
  errorLocal.value = ''
  const ok = await auth.solicitarRecuperacion(formCorreo.correo)
  if (ok) {
    correoGuardado.value = formCorreo.correo
    paso.value = 'codigo'
  }
}

// Paso 2: Verificar código y restablecer contraseña
async function handleVerificarYRestablecer() {
  errorLocal.value = ''

  if (formCodigo.codigo.length !== 6) {
    errorLocal.value = 'El código debe tener 6 dígitos'
    return
  }
  if (formCodigo.nuevaContrasena.length < 8 || !/[a-zA-Z]/.test(formCodigo.nuevaContrasena) || !/[0-9]/.test(formCodigo.nuevaContrasena)) {
    errorLocal.value = 'La contraseña debe tener mínimo 8 caracteres, al menos una letra y un número'
    return
  }
  if (formCodigo.nuevaContrasena !== formCodigo.confirmar) {
    errorLocal.value = 'Las contraseñas no coinciden'
    return
  }

  // Verificar el código primero
  const token = await auth.verificarCodigo(correoGuardado.value, formCodigo.codigo)
  if (!token) return // el error ya está en auth.error

  tokenTemporal.value = token

  // Restablecer la contraseña con el token temporal
  const ok = await auth.restablecerContrasena(tokenTemporal.value, formCodigo.nuevaContrasena)
  if (ok) {
    paso.value = 'exito'
  }
}
</script>

<template>
  <main class="auth-page page-content">
    <div class="auth-card">

      <!-- PASO 1: Ingresar correo -->
      <template v-if="paso === 'correo'">
        <div class="auth-logo">
          <div class="marca">
            <img src="/Logo-UJAP2.jpg" alt="Logo UJAP" class="marca-logo" />
            <span>RideUJAP</span>
          </div>
          <h1>Recuperar contraseña</h1>
          <p class="subtitulo">Ingresa tu correo y te enviaremos un código de verificación</p>
        </div>

        <form class="auth-form" novalidate @submit.prevent="handleSolicitarCodigo">
          <div class="campo">
            <label for="rec-correo">Correo institucional</label>
            <input
              id="rec-correo"
              v-model="formCorreo.correo"
              type="email"
              placeholder="usuario@ujap.edu.ve"
              required
            />
          </div>

          <p v-if="auth.error" class="error-msg" role="alert">{{ auth.error }}</p>

          <button type="submit" class="btn-principal" :disabled="auth.cargando">
            {{ auth.cargando ? 'Enviando código…' : 'Enviar código' }}
          </button>
        </form>

        <div class="auth-links">
          <RouterLink to="/login">← Volver al inicio de sesión</RouterLink>
        </div>
      </template>

      <!-- PASO 2: Ingresar código + nueva contraseña -->
      <template v-else-if="paso === 'codigo'">
        <div class="auth-logo">
          <div class="marca">
            <img src="/Logo-UJAP2.jpg" alt="Logo UJAP" class="marca-logo" />
            <span>RideUJAP</span>
          </div>
          <h1>Ingresa el código</h1>
          <p class="subtitulo">
            Enviamos un código de 6 dígitos a
            <strong>{{ correoGuardado }}</strong>
          </p>
        </div>

        <form class="auth-form" novalidate @submit.prevent="handleVerificarYRestablecer">
          <div class="campo">
            <label for="rec-codigo">Código de verificación</label>
            <input
              id="rec-codigo"
              v-model="formCodigo.codigo"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="123456"
              required
              class="input-codigo"
            />
          </div>

          <div class="campo">
            <label for="rec-nueva">Nueva contraseña</label>
            <input
              id="rec-nueva"
              v-model="formCodigo.nuevaContrasena"
              type="password"
              placeholder="Mínimo 8 caracteres, letra y número"
              required
              autocomplete="new-password"
            />
          </div>

          <div class="campo">
            <label for="rec-confirmar">Confirmar nueva contraseña</label>
            <input
              id="rec-confirmar"
              v-model="formCodigo.confirmar"
              type="password"
              placeholder="Repite la contraseña"
              required
              autocomplete="new-password"
            />
          </div>

          <div v-if="errorLocal || auth.error" class="error-container">
            <p class="error-msg" role="alert">{{ errorLocal || auth.error }}</p>
          </div>

          <button type="submit" class="btn-principal" :disabled="auth.cargando">
            {{ auth.cargando ? 'Verificando…' : 'Restablecer contraseña' }}
          </button>
        </form>

        <div class="auth-links">
          <button type="button" class="btn-texto" @click="paso = 'correo'">
            ← Cambiar correo
          </button>
        </div>
      </template>

      <!-- PASO 3: Éxito -->
      <template v-else>
        <div class="exito">
          <div class="exito-icon" aria-hidden="true">✅</div>
          <h1>¡Contraseña restablecida!</h1>
          <p>Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <RouterLink to="/login" class="btn-principal btn-link">Ir al inicio de sesión</RouterLink>
        </div>
      </template>

    </div>
  </main>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2.5rem 1rem;
  min-height: 60vh;
}

.auth-card {
  width: 100%;
  max-width: 24rem;
  padding: 2.5rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.auth-logo {
  margin-bottom: 2rem;
  text-align: center;
}

.marca {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ride-green);
  margin-bottom: 0.75rem;
  padding: 0.4rem 0.75rem;
  background: var(--ride-green-light, #e0f2ec);
  border-radius: 6px;
}

.marca-logo {
  height: 1.25rem;
  width: auto;
  border-radius: 2px;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  color: var(--color-heading);
}

.subtitulo {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.campo label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

.campo input {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  transition: all var(--ride-transition);
}

.campo input:focus {
  outline: none;
  border-color: var(--ride-green);
  background: var(--color-background);
  box-shadow: 0 0 0 4px var(--ride-green-light);
}

.input-codigo {
  font-size: 1.5rem !important;
  letter-spacing: 0.5rem;
  text-align: center;
  font-weight: 700;
  padding: 0.75rem !important;
}

.error-container {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 4px;
}

.error-msg {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.btn-principal {
  display: block;
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background: var(--ride-green);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--ride-transition);
  margin-top: 0.5rem;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(11, 110, 79, 0.2);
}

.btn-principal:hover:not(:disabled) {
  background: var(--ride-green-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(11, 110, 79, 0.3);
}

.btn-principal:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(11, 110, 79, 0.2);
}

.btn-principal:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-link {
  display: block;
  margin-top: 1rem;
}

.auth-links {
  margin-top: 1.75rem;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.auth-links a {
  color: var(--ride-green);
  font-weight: 700;
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.btn-texto {
  background: none;
  border: none;
  color: var(--ride-green);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
}

.exito {
  text-align: center;
  padding: 1rem 0;
}

.exito-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.exito h1 {
  margin: 0 0 0.75rem;
  font-size: 1.4rem;
}

.exito p {
  font-size: 0.9rem;
  opacity: 0.75;
  margin-bottom: 1.5rem;
}
</style>
