<script setup lang="ts">
withDefaults(
  defineProps<{
    modo: 'login' | 'registro'
    /** Si true, el panel derecho monta Clerk (título propio de RideUJAP) */
    conClerk?: boolean
  }>(),
  { conClerk: false },
)
</script>

<template>
  <main class="auth-shell" :data-modo="modo">
    <div class="auth-frame">
      <aside class="auth-brand" aria-label="RideUJAP">
        <div class="brand-orb brand-orb--a" aria-hidden="true" />
        <div class="brand-orb brand-orb--b" aria-hidden="true" />

        <div class="brand-top">
          <div class="brand-pill">
            <span class="brand-pill-dot" aria-hidden="true" />
            <span>RideUJAP · Carpooling UJAP</span>
          </div>

          <h1 class="brand-title">
            <template v-if="modo === 'login'">
              Entra a tu red<br />
              de viajes
            </template>
            <template v-else>
              Únete a la red<br />
              universitaria
            </template>
          </h1>
          <p class="brand-copy">
            {{
              modo === 'login'
                ? 'Reserva asientos o comparte tu ruta hacia el campus San Diego con compañeros y docentes.'
                : 'Crea tu cuenta con correo institucional y empieza a viajar o publicar cupos en RideUJAP.'
            }}
          </p>

          <ul class="trust-list">
            <li>
              <span class="trust-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span>Acceso seguro con <strong>@ujap.edu.ve</strong></span>
            </li>
            <li>
              <span class="trust-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span>Verificación y código de abordaje</span>
            </li>
            <li>
              <span class="trust-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span>Rutas campus San Diego · Carabobo</span>
            </li>
            <li>
              <span class="trust-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span>Red cerrada para la comunidad UJAP</span>
            </li>
          </ul>
        </div>

        <div class="brand-foot">
          <div class="brand-foot-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <p class="brand-foot-title">Comunidad Universitaria</p>
            <p class="brand-foot-sub">Movilidad sustentable, compartida y segura</p>
          </div>
        </div>
      </aside>

      <section class="auth-panel" :class="{ 'auth-panel--clerk': conClerk }">
        <header class="panel-head">
          <h2 class="panel-title">
            {{ modo === 'login' ? 'Entrar' : 'Crear cuenta' }}
          </h2>
          <p class="panel-sub">
            para continuar a <strong>RideUJAP</strong>
          </p>
        </header>

        <div class="panel-body">
          <slot />
        </div>

        <p v-if="conClerk" class="panel-footnote">
          Google está permitido si el correo de esa cuenta es <strong>@ujap.edu.ve</strong>. Cualquier
          otro dominio se rechaza al sincronizar con RideUJAP.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.auth-shell {
  min-height: calc(100vh - 4.5rem);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem 2.5rem;
  background-color: var(--color-background-soft);
  background-image: radial-gradient(
    color-mix(in srgb, var(--color-text) 18%, transparent) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}

.auth-frame {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1fr;
  min-height: 640px;
  border: 1px solid var(--color-border);
  border-radius: 1.5rem;
  overflow: hidden;
  background: var(--color-background);
  box-shadow:
    0 25px 50px -12px color-mix(in srgb, var(--color-heading) 14%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-background) 40%, transparent) inset;
}

@media (min-width: 960px) {
  .auth-frame {
    grid-template-columns: 5fr 7fr;
  }
}

.auth-brand {
  position: relative;
  isolation: isolate;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  color: #ecfdf5;
  background: linear-gradient(160deg, #064e3b 0%, var(--ride-green) 48%, #065f46 100%);
  overflow: hidden;
}

@media (min-width: 960px) {
  .auth-brand {
    padding: 2.5rem 2.25rem;
  }
}

.brand-orb {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  z-index: -1;
  filter: blur(40px);
}
.brand-orb--a {
  top: -4rem;
  right: -4rem;
  width: 15rem;
  height: 15rem;
  background: rgba(16, 185, 129, 0.18);
}
.brand-orb--b {
  bottom: -5rem;
  left: -5rem;
  width: 16rem;
  height: 16rem;
  background: rgba(52, 211, 153, 0.14);
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  font-size: 0.72rem;
  font-weight: 650;
  color: #d1fae5;
}
.brand-pill-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: #34d399;
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.brand-title {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #fff;
}

.brand-copy {
  margin: 1rem 0 0;
  max-width: 30ch;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(209, 250, 229, 0.9);
}

.trust-list {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.trust-list li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(236, 253, 245, 0.95);
}

.trust-check {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}
.trust-check svg {
  width: 0.85rem;
  height: 0.85rem;
}

.brand-foot {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1.75rem;
  border-top: 1px solid rgba(5, 150, 105, 0.45);
}
.brand-foot-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #6ee7b7;
}
.brand-foot-icon svg {
  width: 1.2rem;
  height: 1.2rem;
}
.brand-foot-title {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
}
.brand-foot-sub {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: rgba(167, 243, 208, 0.85);
}

.auth-panel {
  padding: 2rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-background);
}

@media (min-width: 640px) {
  .auth-panel {
    padding: 2.75rem 3rem;
  }
}

@media (min-width: 960px) {
  .auth-panel {
    padding: 3rem 3.5rem;
  }
}

.panel-head {
  text-align: center;
  margin-bottom: 1.6rem;
}

.panel-title {
  margin: 0;
  font-size: clamp(1.5rem, 2.5vw, 1.85rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-heading);
}

.panel-sub {
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
}

.panel-sub strong {
  color: var(--color-heading);
  font-weight: 750;
}

.panel-body {
  width: 100%;
}

.panel-footnote {
  margin: 1.1rem auto 0;
  max-width: 26rem;
  text-align: center;
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--color-text);
}

.panel-footnote strong {
  color: var(--color-heading);
  font-weight: 650;
}
</style>
