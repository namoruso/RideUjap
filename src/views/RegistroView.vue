<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  nombre: '',
  correo: '',
  telefono: '',
  esConductor: false,
  contrasena: '',
  confirmarContrasena: '',
})

const errorLocal = ref('')
const mostrarContrasena = ref(false)
const mostrarConfirmacion = ref(false)

const reqs = computed(() => {
  const p = form.contrasena
  return {
    longitud: p.length >= 8,
    mayuscula: /[A-Z]/.test(p),
    minuscula: /[a-z]/.test(p),
    numero: /[0-9]/.test(p),
    especial: /[!@#$%^&*(),.?":{}|<>]/.test(p),
  }
})

const fortalezaContrasena = computed(() => {
  const pwd = form.contrasena
  let score = 0
  if (!pwd) return { score: 0, text: '', class: '' }
  
  if (reqs.value.longitud) score++
  if (reqs.value.mayuscula && reqs.value.minuscula) score++
  if (reqs.value.numero) score++
  if (reqs.value.especial) score++
  
  if (score <= 1) return { score, text: 'Débil', class: 'debil', percent: 25 }
  if (score <= 3) return { score, text: 'Media', class: 'media', percent: 60 }
  return { score, text: 'Fuerte', class: 'fuerte', percent: 100 }
})

const CONTRASENAS_COMUNES = ['12345678', 'password', 'qwertyuiop', '123456789', 'admin123', 'ujap2025']

function validarContrasena(pwd: string, correo?: string, nombre?: string): boolean | string {
  if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  if (!/[A-Z]/.test(pwd)) return 'La contraseña debe tener al menos una letra mayúscula'
  if (!/[a-z]/.test(pwd)) return 'La contraseña debe tener al menos una letra minúscula'
  if (!/[0-9]/.test(pwd)) return 'La contraseña debe tener al menos un número'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'La contraseña debe tener al menos un carácter especial'
  
  if (correo && pwd.toLowerCase().includes((correo.split('@')[0] ?? '').toLowerCase())) {
    return 'La contraseña no puede contener partes de tu correo'
  }
  if (nombre && pwd.toLowerCase().includes((nombre.split(' ')[0] ?? '').toLowerCase())) {
    return 'La contraseña no puede contener tu nombre'
  }

  if (CONTRASENAS_COMUNES.includes(pwd.toLowerCase())) {
    return 'La contraseña es demasiado común. Elige otra más segura.'
  }

  return true
}

async function handleSubmit() {
  errorLocal.value = ''
  
  const validacionPwd = validarContrasena(form.contrasena, form.correo, form.nombre)
  if (validacionPwd !== true) {
    errorLocal.value = validacionPwd as string
    return
  }
  if (form.contrasena !== form.confirmarContrasena) {
    errorLocal.value = 'Las contraseñas no coinciden'
    return
  }

  const ok = await auth.registrarse({
    nombre: form.nombre,
    correo: form.correo,
    telefono: form.telefono,
    esConductor: form.esConductor,
    contrasena: form.contrasena,
  })

  if (ok) router.push('/')
}
</script>

<template>
  <main class="auth-page page-content">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="marca">
          <img src="/Logo-UJAP2.jpg" alt="Logo UJAP" class="marca-logo" />
          <span>RideUJAP</span>
        </div>
        <h1>Crear cuenta</h1>
        <p class="subtitulo">Únete a la comunidad de viajes compartidos UJAP</p>
      </div>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="campo">
          <label for="reg-nombre">Nombre completo</label>
          <input id="reg-nombre" v-model="form.nombre" type="text" placeholder="Ej. Andrea Pérez" required />
        </div>

        <div class="campo">
          <label for="reg-correo">Correo institucional</label>
          <input id="reg-correo" v-model="form.correo" type="email" placeholder="usuario@ujap.edu.ve" required />
        </div>

        <div class="campo">
          <label for="reg-telefono">Teléfono</label>
          <input id="reg-telefono" v-model="form.telefono" type="tel" placeholder="0412-1234567" required />
        </div>

        <div class="campo">
          <label for="reg-contrasena">Contraseña</label>
          <div class="input-grupo">
            <input
              id="reg-contrasena"
              v-model="form.contrasena"
              :type="mostrarContrasena ? 'text' : 'password'"
              placeholder="Escribe una contraseña segura"
              required
              autocomplete="new-password"
            />
            <button type="button" class="btn-toggle" @click="mostrarContrasena = !mostrarContrasena" aria-label="Mostrar/ocultar contraseña">
              <svg v-if="!mostrarContrasena" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-eye"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>
          
          <!-- Validaciones visuales en vivo -->
          <div class="password-feedback" v-if="form.contrasena">
            <div class="fortaleza-container">
              <div class="fortaleza-bg">
                <div 
                  class="fortaleza-barra" 
                  :class="fortalezaContrasena.class"
                  :style="{ width: fortalezaContrasena.percent + '%' }"
                ></div>
              </div>
              <span class="fortaleza-texto" :class="fortalezaContrasena.class">{{ fortalezaContrasena.text }}</span>
            </div>
            
            <ul class="req-list">
              <li :class="{ 'cumplido': reqs.longitud }">
                <span class="req-icon">{{ reqs.longitud ? '✓' : '•' }}</span> 8 caracteres
              </li>
              <li :class="{ 'cumplido': reqs.mayuscula }">
                <span class="req-icon">{{ reqs.mayuscula ? '✓' : '•' }}</span> Mayúscula
              </li>
              <li :class="{ 'cumplido': reqs.minuscula }">
                <span class="req-icon">{{ reqs.minuscula ? '✓' : '•' }}</span> Minúscula
              </li>
              <li :class="{ 'cumplido': reqs.numero }">
                <span class="req-icon">{{ reqs.numero ? '✓' : '•' }}</span> Número
              </li>
              <li :class="{ 'cumplido': reqs.especial }">
                <span class="req-icon">{{ reqs.especial ? '✓' : '•' }}</span> Carácter especial
              </li>
            </ul>
          </div>
        </div>

        <div class="campo">
          <label for="reg-confirmar">Confirmar contraseña</label>
          <div class="input-grupo">
            <input
              id="reg-confirmar"
              v-model="form.confirmarContrasena"
              :type="mostrarConfirmacion ? 'text' : 'password'"
              placeholder="Repite la contraseña"
              required
              autocomplete="new-password"
            />
            <button type="button" class="btn-toggle" @click="mostrarConfirmacion = !mostrarConfirmacion" aria-label="Mostrar/ocultar contraseña">
              <svg v-if="!mostrarConfirmacion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-eye"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>
        </div>

        <div class="campo-check">
          <label class="label-check">
            <input id="reg-conductor" v-model="form.esConductor" type="checkbox" />
            <span>Soy conductor (tengo vehículo)</span>
          </label>
        </div>

        <div v-if="errorLocal || auth.error" class="error-container">
          <p class="error-msg" role="alert">{{ errorLocal || auth.error }}</p>
        </div>

        <button type="submit" class="btn-principal" :disabled="auth.cargando">
          {{ auth.cargando ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </form>

      <div class="auth-links">
        <span>¿Ya tienes cuenta?</span>
        <RouterLink to="/login">Iniciar sesión</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2.5rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 28rem; /* Más alargado y típico de formulario single-column */
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

.campo input[type='text'],
.campo input[type='email'],
.campo input[type='tel'],
.campo input[type='password'] {
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

.input-grupo {
  display: flex;
  position: relative;
  width: 100%;
}

.input-grupo input {
  padding-right: 3rem !important; /* espacio para el boton */
}

.btn-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background 0.2s;
}

.btn-toggle:hover {
  background: var(--color-background-soft);
  color: var(--color-heading);
}

.icon-eye {
  width: 1.1rem;
  height: 1.1rem;
}

/* --- Feedback de Contraseña --- */
.password-feedback {
  margin-top: 0.25rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
}

.fortaleza-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.fortaleza-bg {
  flex: 1;
  height: 0.4rem;
  background: #e0e0e0;
  border-radius: 1rem;
  overflow: hidden;
}

.fortaleza-barra {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
}

.fortaleza-texto {
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 3.5rem;
  text-align: right;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.debil { color: #e74c3c; }
.fortaleza-barra.debil { background-color: #e74c3c; }
.media { color: #f39c12; }
.fortaleza-barra.media { background-color: #f39c12; }
.fuerte { color: #27ae60; }
.fortaleza-barra.fuerte { background-color: #27ae60; }

.req-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  column-gap: 1rem;
  row-gap: 0.35rem;
}

.req-list li {
  font-size: 0.75rem;
  color: #777;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.2s ease;
}

.req-list li.cumplido {
  color: #27ae60;
  font-weight: 600;
}

.req-icon {
  font-size: 0.8rem;
  font-weight: bold;
}

/* --- Fin feedback --- */

.campo-check {
  margin-top: 0.25rem;
}

.label-check {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background 0.2s;
}

.label-check:hover {
  background: #f8f8f8;
}

.label-check input[type='checkbox'] {
  width: 1.15rem;
  height: 1.15rem;
  accent-color: var(--ride-green);
  cursor: pointer;
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
</style>
