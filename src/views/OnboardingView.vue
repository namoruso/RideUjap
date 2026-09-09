<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

type Paso = 'rol' | 'vehiculo'
const paso = ref<Paso>('rol')
const enviando = ref(false)
const errorLocal = ref('')

const vehiculo = reactive({
  marcaVehiculo: '',
  modeloVehiculo: '',
  colorVehiculo: '',
  placa: '',
  puestosVehiculo: 3,
})

async function elegirViajero() {
  errorLocal.value = ''
  enviando.value = true
  try {
    const ok = await auth.guardarRol('viajero')
    if (ok) await router.replace('/inicio')
    else errorLocal.value = auth.error || 'No se pudo guardar el rol'
  } finally {
    enviando.value = false
  }
}

async function elegirConductor() {
  errorLocal.value = ''
  enviando.value = true
  try {
    const ok = await auth.guardarRol('conductor')
    if (ok) paso.value = 'vehiculo'
    else errorLocal.value = auth.error || 'No se pudo guardar el rol'
  } finally {
    enviando.value = false
  }
}

async function guardarVehiculo() {
  errorLocal.value = ''
  if (
    !vehiculo.marcaVehiculo.trim() ||
    !vehiculo.modeloVehiculo.trim() ||
    !vehiculo.colorVehiculo.trim() ||
    !vehiculo.placa.trim()
  ) {
    errorLocal.value = 'Completa marca, modelo, color y placa'
    return
  }
  enviando.value = true
  try {
    const ok = await auth.guardarVehiculo({ ...vehiculo })
    if (ok) await router.replace('/inicio')
    else errorLocal.value = auth.error || 'No se pudo guardar el vehículo'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <main class="onboard">
    <div class="glow glow--a" aria-hidden="true" />
    <div class="glow glow--b" aria-hidden="true" />

    <section v-if="paso === 'rol'" class="stage" aria-labelledby="onboarding-title">
      <div class="pill">
        <span class="pill-dot" aria-hidden="true" />
        <span>RideUJAP · Comunidad Universitaria</span>
      </div>

      <h1 id="onboarding-title" class="title">
        ¿Cómo vas a usar <span class="title-accent">RideUJAP</span>?
      </h1>
      <p class="lead">
        Elige tu rol inicial para comenzar. Podrás ofrecer cupos o reservar asientos en cualquier
        momento desde tu panel de usuario.
      </p>

      <div class="roles">
        <article class="role-card">
          <span class="role-tag">★ Más popular</span>
          <div class="role-top">
            <div class="role-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span class="role-kicker">Perfil Pasajero</span>
          </div>
          <h2>Viajero</h2>
          <p class="role-copy">
            Busco asientos cómodos, accesibles y directos hacia o desde el campus San Diego de la
            UJAP.
          </p>
          <ul class="role-list">
            <li>Ahorra tiempo y gastos de transporte público</li>
            <li>Rutas verificadas con estudiantes y profesores</li>
            <li>Reserva tu cupo en tiempo real sin complicaciones</li>
          </ul>
          <button type="button" class="cta cta--muted" :disabled="enviando" @click="elegirViajero">
            <span>{{ enviando ? 'Guardando…' : 'Comenzar como Viajero' }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </article>

        <article class="role-card role-card--driver">
          <div class="role-top">
            <div class="role-icon role-icon--solid" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM5 11l2-6h10l2 6M5 11h14v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5z"
                />
              </svg>
            </div>
            <span class="role-kicker role-kicker--brand">Perfil Propietario</span>
          </div>
          <h2>Conductor</h2>
          <p class="role-copy">
            Publico mis rutas habituales hacia la universidad y ofrezco puestos libres en mi
            vehículo.
          </p>
          <ul class="role-list">
            <li>Comparte el trayecto con compañeros de la UJAP</li>
            <li>Control total de tus horarios, cupos y puntos de encuentro</li>
            <li>Publica rutas hacia o desde el campus cuando te convenga</li>
          </ul>
          <button
            type="button"
            class="cta cta--solid"
            :disabled="enviando"
            @click="elegirConductor"
          >
            <span>{{ enviando ? 'Guardando…' : 'Comenzar como Conductor' }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </article>
      </div>

      <aside class="trust">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>
          Comunidad UJAP · solo correo
          <code>@ujap.edu.ve</code>
        </span>
      </aside>
    </section>

    <section v-else class="vehicle-wrap" aria-labelledby="vehicle-title">
      <div class="vehicle-card">
        <header class="vehicle-head">
          <div class="pill">
            <span class="pill-dot" aria-hidden="true" />
            <span>Perfil de conductor</span>
          </div>
          <h1 id="vehicle-title">Datos de tu vehículo</h1>
          <p class="lead">
            Necesarios para que los pasajeros te reconozcan al publicar rutas hacia el campus.
          </p>
        </header>

        <form class="form" novalidate @submit.prevent="guardarVehiculo">
          <div class="grid">
            <div class="campo">
              <label for="ob-marca">Marca</label>
              <input id="ob-marca" v-model="vehiculo.marcaVehiculo" type="text" placeholder="Toyota" required />
            </div>
            <div class="campo">
              <label for="ob-modelo">Modelo</label>
              <input id="ob-modelo" v-model="vehiculo.modeloVehiculo" type="text" placeholder="Corolla" required />
            </div>
            <div class="campo">
              <label for="ob-color">Color</label>
              <input id="ob-color" v-model="vehiculo.colorVehiculo" type="text" placeholder="Gris" required />
            </div>
            <div class="campo">
              <label for="ob-placa">Placa</label>
              <input id="ob-placa" v-model="vehiculo.placa" type="text" placeholder="AB123CD" required />
            </div>
            <div class="campo campo--full">
              <label for="ob-puestos">¿Cuántos puestos ofreces habitualmente?</label>
              <input
                id="ob-puestos"
                v-model.number="vehiculo.puestosVehiculo"
                type="number"
                min="1"
                max="8"
                required
              />
            </div>
          </div>

          <div class="acciones">
            <button type="button" class="btn-ghost" :disabled="enviando" @click="paso = 'rol'">
              Volver
            </button>
            <button type="submit" class="btn-primary" :disabled="enviando">
              {{ enviando ? 'Guardando…' : 'Guardar y ir al panel' }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <p v-if="errorLocal || auth.error" class="error" role="alert">{{ errorLocal || auth.error }}</p>
  </main>
</template>

<style scoped>
.onboard {
  position: relative;
  isolation: isolate;
  min-height: calc(100vh - 4.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem 3rem;
  background:
    radial-gradient(color-mix(in srgb, var(--ride-green) 12%, transparent) 1px, transparent 1px),
    radial-gradient(color-mix(in srgb, var(--color-heading) 8%, transparent) 1px, transparent 1px),
    var(--color-background-soft);
  background-size: 32px 32px, 32px 32px, auto;
  background-position: 0 0, 16px 16px, 0 0;
  overflow: hidden;
}

.glow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  z-index: -1;
  filter: blur(48px);
}
.glow--a {
  top: 18%;
  left: 50%;
  width: 34rem;
  height: 34rem;
  transform: translate(-50%, -40%);
  background: radial-gradient(circle, color-mix(in srgb, var(--ride-green) 22%, transparent), transparent 70%);
}
.glow--b {
  bottom: 4rem;
  right: 6%;
  width: 18rem;
  height: 18rem;
  background: radial-gradient(circle, color-mix(in srgb, var(--ride-green-fg) 14%, transparent), transparent 70%);
  opacity: 0.7;
}

.stage {
  width: min(56rem, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.15rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--ride-green-border);
  background: color-mix(in srgb, var(--color-background) 88%, var(--ride-green-light));
  box-shadow: 0 1px 2px color-mix(in srgb, var(--ride-green) 12%, transparent);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ride-green-fg, var(--ride-green));
  backdrop-filter: blur(8px);
}
.pill-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--ride-green-fg, var(--ride-green));
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

.title {
  margin: 0;
  max-width: 18ch;
  font-size: clamp(1.85rem, 4.5vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--color-heading);
}
.title-accent {
  color: var(--ride-green-fg, var(--ride-green));
}
.lead {
  margin: 0.9rem auto 0;
  max-width: 38rem;
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  line-height: 1.6;
  color: var(--color-text);
}

.roles {
  margin-top: 2.5rem;
  width: 100%;
  display: grid;
  gap: 1.35rem;
  text-align: left;
}
@media (min-width: 768px) {
  .roles {
    grid-template-columns: 1fr 1fr;
    gap: 1.75rem;
  }
}

.role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.85rem 1.6rem 1.5rem;
  border-radius: 1.15rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-heading) 6%, transparent);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}
.role-card:hover {
  transform: translateY(-4px);
  border-color: var(--ride-green-border);
  box-shadow: 0 18px 40px color-mix(in srgb, var(--color-heading) 12%, transparent);
}
.role-card--driver {
  border-color: color-mix(in srgb, var(--ride-green) 45%, var(--color-border));
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--ride-green) 12%, transparent),
    0 8px 24px color-mix(in srgb, var(--ride-green) 10%, transparent);
}

.role-tag {
  position: absolute;
  top: -0.85rem;
  right: 1.35rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: var(--color-heading);
  color: var(--color-background);
  font-size: 0.72rem;
  font-weight: 700;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-heading) 20%, transparent);
}

.role-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}
.role-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  border: 1px solid var(--ride-green-border);
  background: var(--ride-green-light);
  color: var(--ride-green-fg, var(--ride-green));
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    color 0.25s ease;
}
.role-card:hover .role-icon {
  transform: scale(1.08);
  background: var(--ride-green);
  color: #fff;
}
.role-icon--solid {
  background: var(--ride-green);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 30%, transparent);
}
.role-icon svg {
  width: 1.75rem;
  height: 1.75rem;
}
.role-kicker {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
}
.role-kicker--brand {
  color: var(--ride-green-fg, var(--ride-green));
}

.role-card h2 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-heading);
  transition: color 0.2s ease;
}
.role-card:hover h2 {
  color: var(--ride-green-fg, var(--ride-green));
}
.role-copy {
  margin: 0.55rem 0 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--color-text);
}
.role-list {
  list-style: none;
  margin: 1.15rem 0 0;
  padding: 1.15rem 0 0;
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 0.7rem;
}
.role-list li {
  position: relative;
  padding-left: 1.7rem;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--color-text);
}
.role-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0.05rem;
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1;
  background: var(--ride-green-light);
  color: var(--ride-green-fg, var(--ride-green));
}

.cta {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  padding: 0.8rem 1.15rem;
  border-radius: 0.85rem;
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.cta:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.cta svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}
.role-card:hover .cta svg {
  transform: translateX(3px);
}
.cta--muted {
  background: var(--color-background-mute);
  color: var(--color-heading);
  border: 1px solid var(--color-border);
}
.role-card:hover .cta--muted {
  background: var(--ride-green);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 25%, transparent);
}
.cta--solid {
  background: var(--ride-green);
  color: #fff;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 28%, transparent);
}
.cta--solid:hover:not(:disabled) {
  background: var(--ride-green-hover);
  transform: scale(1.01);
}

.trust {
  margin-top: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  max-width: 100%;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  font-size: 0.82rem;
  color: var(--color-text);
}
.trust svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--ride-green-fg, var(--ride-green));
}
.trust code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.35rem;
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-weight: 650;
}

.vehicle-wrap {
  width: min(36rem, 100%);
}
.vehicle-card {
  padding: 1.75rem 1.35rem;
  border-radius: 1.25rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  box-shadow: 0 18px 40px color-mix(in srgb, var(--color-heading) 10%, transparent);
}
@media (min-width: 640px) {
  .vehicle-card {
    padding: 2.25rem 2rem;
  }
}
.vehicle-head {
  text-align: center;
  margin-bottom: 1.5rem;
}
.vehicle-head h1 {
  margin: 0;
  font-size: clamp(1.45rem, 3vw, 1.9rem);
  font-weight: 850;
  color: var(--color-heading);
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: 1fr;
}
@media (min-width: 520px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
  .campo--full {
    grid-column: 1 / -1;
  }
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.campo label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-heading);
}
.campo input {
  padding: 0.7rem 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.95rem;
}
.campo input::placeholder {
  color: color-mix(in srgb, var(--color-text) 65%, transparent);
}
.campo input:focus {
  outline: none;
  border-color: var(--ride-green);
  box-shadow: 0 0 0 4px var(--ride-green-light);
}
.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: flex-end;
}
.btn-primary,
.btn-ghost {
  padding: 0.75rem 1.2rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn-primary {
  border: none;
  background: var(--ride-green);
  color: #fff;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ride-green) 25%, transparent);
}
.btn-ghost {
  border: 1.5px solid var(--color-border);
  background: transparent;
  color: var(--color-heading);
}
.error {
  margin: 1.25rem 0 0;
  width: min(40rem, 100%);
  background: color-mix(in srgb, #ef4444 12%, var(--color-background));
  border-left: 4px solid #ef4444;
  padding: 0.75rem 0.95rem;
  border-radius: 8px;
  color: color-mix(in srgb, #b91c1c 70%, var(--color-heading));
  font-size: 0.875rem;
}
</style>
