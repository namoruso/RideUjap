<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ correo: '', contrasena: '' })

async function handleSubmit() {
  const ok = await auth.iniciarSesion({ correo: form.correo, contrasena: form.contrasena })
  if (ok) {
    const redirect = (route.query['redirect'] as string) || '/inicio'
    router.push(redirect)
  }
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
        <h1>Iniciar sesión</h1>
        <p class="subtitulo">Entra con tu correo UJAP para reservar o publicar un asiento</p>
      </div>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="campo">
          <label for="login-correo">Correo institucional</label>
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
          <label for="login-contrasena">Contraseña</label>
          <input
            id="login-contrasena"
            v-model="form.contrasena"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
          <div class="olvide-link-container">
            <RouterLink to="/recuperar" class="link-secundario"
              >¿Olvidaste tu contraseña?</RouterLink
            >
          </div>
        </div>

        <div v-if="auth.error" class="error-container">
          <p class="error-msg" role="alert">{{ auth.error }}</p>
        </div>

        <button type="submit" class="btn-principal" :disabled="auth.cargando">
          {{ auth.cargando ? 'Iniciando sesión…' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="auth-links">
        <span>¿No tienes cuenta?</span>
        <RouterLink to="/registro">Crear cuenta</RouterLink>
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
  min-height: 60vh;
}

.auth-card {
  width: 100%;
  max-width: 24rem; /* Más angosto para que el formulario corto se vea más estilizado */
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

.olvide-link-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.2rem;
}

.link-secundario {
  font-size: 0.8rem;
  color: var(--ride-green);
  font-weight: 600;
  text-decoration: none;
}

.link-secundario:hover {
  text-decoration: underline;
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
  color: var(--color-text);
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
