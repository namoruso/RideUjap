<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { clerkActivo } from '@/plugins/clerk'
import AuthShell from '@/components/AuthShell.vue'
import ClerkSignUpPanel from '@/components/ClerkSignUpPanel.vue'

const auth = useAuthStore()
const router = useRouter()
const usaClerk = clerkActivo()

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

async function handleSubmit() {
  errorLocal.value = ''
  if (!form.correo.toLowerCase().endsWith('@ujap.edu.ve')) {
    errorLocal.value = 'Solo se permiten correos @ujap.edu.ve'
    return
  }
  if (form.contrasena !== form.confirmarContrasena) {
    errorLocal.value = '¿Las contraseñas coinciden? Ahora no.'
    return
  }
  if (!reqs.value.longitud || !reqs.value.mayuscula || !reqs.value.minuscula || !reqs.value.numero) {
    errorLocal.value = 'La contraseña debe tener 8+ caracteres, mayúscula, minúscula y número'
    return
  }

  const ok = await auth.registrarse({
    nombre: form.nombre,
    correo: form.correo,
    telefono: form.telefono,
    esConductor: form.esConductor,
    contrasena: form.contrasena,
  })
  if (ok) await router.push(auth.rutaTrasAuth())
}
</script>

<template>
  <AuthShell modo="registro" :con-clerk="usaClerk">
    <ClerkSignUpPanel v-if="usaClerk" />

    <template v-else>
      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="campo">
          <label for="reg-nombre">¿Cómo te llamas?</label>
          <input id="reg-nombre" v-model="form.nombre" type="text" placeholder="Andrea Pérez" required />
        </div>
        <div class="campo">
          <label for="reg-correo">¿Cuál es tu correo UJAP?</label>
          <input
            id="reg-correo"
            v-model="form.correo"
            type="email"
            placeholder="usuario@ujap.edu.ve"
            required
          />
        </div>
        <div class="campo">
          <label for="reg-telefono">¿Cuál es tu teléfono?</label>
          <input id="reg-telefono" v-model="form.telefono" type="tel" placeholder="0412-1234567" required />
        </div>
        <div class="campo">
          <label for="reg-contrasena">Elige una contraseña</label>
          <div class="input-row">
            <input
              id="reg-contrasena"
              v-model="form.contrasena"
              :type="mostrarContrasena ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              required
              autocomplete="new-password"
            />
            <button type="button" class="btn-eye" @click="mostrarContrasena = !mostrarContrasena">
              {{ mostrarContrasena ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
        </div>
        <div class="campo">
          <label for="reg-confirm">¿Confirmas la contraseña?</label>
          <input
            id="reg-confirm"
            v-model="form.confirmarContrasena"
            type="password"
            placeholder="Repite la contraseña"
            required
            autocomplete="new-password"
          />
        </div>
        <label class="check">
          <input v-model="form.esConductor" type="checkbox" />
          Soy conductor (tengo vehículo)
        </label>

        <div v-if="errorLocal || auth.error" class="error-box" role="alert">
          {{ errorLocal || auth.error }}
        </div>

        <button type="submit" class="btn-principal" :disabled="auth.cargando">
          {{ auth.cargando ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="switch">
        ¿Ya tienes cuenta?
        <RouterLink to="/login">Iniciar sesión</RouterLink>
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
.campo label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-heading);
}
.campo input,
.input-row input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.9rem;
  font-weight: 500;
}
.campo input:focus,
.input-row input:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.input-row {
  display: flex;
  gap: 0.5rem;
}
.btn-eye {
  border: 1.5px solid var(--color-border);
  background: var(--color-background);
  border-radius: 10px;
  padding: 0 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ride-green-fg, var(--ride-green));
  cursor: pointer;
  white-space: nowrap;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.9rem;
  color: var(--color-text);
}
.error-box {
  background: color-mix(in srgb, #ef4444 12%, var(--color-background));
  border-left: 4px solid #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: color-mix(in srgb, #b91c1c 65%, var(--color-heading));
  font-size: 0.875rem;
}
.btn-principal {
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--ride-green);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 25%, transparent);
}
.btn-principal:hover:not(:disabled) {
  background: var(--ride-green-hover);
}
.btn-principal:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.switch {
  margin: 1.35rem 0 0;
  text-align: center;
  font-size: 0.9rem;
}
.switch a {
  color: var(--ride-green-fg, var(--ride-green));
  font-weight: 700;
  text-decoration: none;
}
.switch a:hover {
  text-decoration: underline;
}
</style>
