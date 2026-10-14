<script setup lang="ts">
// Vista informativa: contexto académico, propósito y stack real del repo.
</script>

<template>
  <main class="about-view page-content">
    <!-- Breadcrumb + hero -->
    <header class="about-hero">
      <nav class="breadcrumb" aria-label="Migas de pan">
        <RouterLink to="/">Inicio</RouterLink>
        <span class="sep" aria-hidden="true">/</span>
        <span class="current">Acerca de</span>
        <span class="sep" aria-hidden="true">/</span>
        <span class="muted">Proyecto académico &amp; stack</span>
      </nav>

      <div class="hero-row">
        <div class="hero-copy">
          <p class="eyebrow">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            RideUJAP · movilidad universitaria sostenible
          </p>
          <h1>
            Acerca del proyecto
            <span class="accent">RideUJAP</span>
          </h1>
          <p class="lead">
            Conoce el propósito, la arquitectura de software y el contexto académico detrás de la
            plataforma de carpooling para la Universidad José Antonio Páez (UJAP).
          </p>
        </div>

        <RouterLink to="/viajes" class="btn-outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Explorar viajes disponibles
        </RouterLink>
      </div>
    </header>

    <!-- Contexto académico -->
    <section class="academia" aria-labelledby="academia-titulo">
      <div class="academia-glow academia-glow--a" aria-hidden="true" />
      <div class="academia-glow academia-glow--b" aria-hidden="true" />

      <div class="academia-grid">
        <div class="academia-copy">
          <p class="academia-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Contexto institucional &amp; académico
          </p>
          <h2 id="academia-titulo">Proyecto de Tópicos Especiales en Programación Web</h2>
          <p>
            Plataforma desarrollada como solución de software integral orientada a resolver el reto
            logístico de transporte en la comunidad de la
            <strong>Universidad José Antonio Páez</strong>, aplicando metodologías de ingeniería
            ágil y estándares de seguridad para una red cerrada institucional.
          </p>
        </div>

        <dl class="academia-meta">
          <div>
            <dt>Asignatura</dt>
            <dd>Tópicos Esp. Programación Web</dd>
          </div>
          <div>
            <dt>Código</dt>
            <dd><code>ETW09303</code></dd>
          </div>
          <div>
            <dt>Escuela &amp; facultad</dt>
            <dd>Ingeniería en Computación</dd>
          </div>
          <div>
            <dt>Campus</dt>
            <dd>San Diego, Carabobo</dd>
          </div>
          <div class="meta-last">
            <dt>Período</dt>
            <dd>Año 2026 · UJAP</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Propósito / impacto / métricas -->
    <section class="proposito-grid" aria-label="Propósito e impacto">
      <article class="card">
        <div class="card-icon card-icon--green" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
        <h3>¿Qué es RideUJAP?</h3>
        <p>
          Plataforma colaborativa tipo <strong>Waze / BlaBlaCar</strong> pensada exclusivamente para
          estudiantes, profesores y personal de la UJAP. Permite publicar y reservar viajes
          compartidos con rutas hacia el campus San Diego de forma transparente y organizada.
        </p>
        <p class="card-foot foot--green">Solo comunidad @ujap.edu.ve</p>
      </article>

      <article class="card">
        <div class="card-icon card-icon--amber" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3>Objetivo e impacto</h3>
        <p>
          Reducir el gasto diario de transporte y descongestionar los accesos en la Av. Don Julio
          Centeno. Fomentamos movilidad solidaria basada en apoyo mutuo y división equitativa del
          combustible — sin cobros ni comisiones dentro de la app.
        </p>
        <p class="card-foot foot--amber">Cero fines comerciales de lucro</p>
      </article>

      <article class="card">
        <div class="card-icon card-icon--blue" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3>Alcance campus</h3>
        <div class="metrics">
          <div class="metric">
            <span class="metric-val">100%</span>
            <span class="metric-label">Verificación UJAP</span>
          </div>
          <div class="metric">
            <span class="metric-val">4</span>
            <span class="metric-label">Zonas frecuentes</span>
          </div>
          <div class="metric">
            <span class="metric-val metric-val--accent">JWT</span>
            <span class="metric-label">Sesión segura</span>
          </div>
          <div class="metric">
            <span class="metric-val">0%</span>
            <span class="metric-label">Comisiones</span>
          </div>
        </div>
        <p class="card-foot foot--blue">San Diego · Naguanagua · Prebo · El Trigal</p>
      </article>
    </section>

    <!-- Stack tecnológico -->
    <section class="stack-sec" aria-labelledby="stack-titulo">
      <div class="stack-head">
        <div>
          <h2 id="stack-titulo">Arquitectura y stack tecnológico</h2>
          <p>Componentes de ingeniería implementados en el ecosistema RideUJAP.</p>
        </div>
        <span class="stack-badge" aria-hidden="true">
          <span class="pulse" />
          Stack del repositorio
        </span>
      </div>

      <div class="stack-grid">
        <article class="stack-card">
          <header class="stack-card-head">
            <div class="stack-title">
              <span class="stack-icon stack-icon--green" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <h3>Frontend client</h3>
            </div>
            <span class="chip">SPA / mobile-first</span>
          </header>
          <ul>
            <li>
              <span>Framework</span>
              <code class="tag-green">Vue 3 + Vite</code>
            </li>
            <li>
              <span>Lenguaje</span>
              <code class="tag-blue">TypeScript</code>
            </li>
            <li>
              <span>Estado</span>
              <code class="tag-amber">Pinia</code>
            </li>
            <li>
              <span>Enrutador</span>
              <code class="tag-slate">Vue Router</code>
            </li>
            <li class="li-block">
              <span>Diseño &amp; estilos</span>
              <p>CSS puro + Grid &amp; Flexbox, responsive y Dark / Light Mode.</p>
            </li>
          </ul>
          <p class="stack-foot">Renderizado reactivo · Vite HMR</p>
        </article>

        <article class="stack-card">
          <header class="stack-card-head">
            <div class="stack-title">
              <span class="stack-icon stack-icon--teal" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              </span>
              <h3>Backend API</h3>
            </div>
            <span class="chip">REST service</span>
          </header>
          <ul>
            <li>
              <span>Runtime</span>
              <code class="tag-green">Node.js + Express</code>
            </li>
            <li>
              <span>Tipado</span>
              <code class="tag-blue">TypeScript</code>
            </li>
            <li>
              <span>Autenticación</span>
              <code class="tag-purple">JWT + Clerk (opc.)</code>
            </li>
            <li>
              <span>Passwords</span>
              <code class="tag-rose">bcryptjs</code>
            </li>
            <li class="li-block">
              <span>Validación institucional</span>
              <p>
                Dominio autorizado <code>@ujap.edu.ve</code>, verificación de correo y sync Clerk en
                el backend.
              </p>
            </li>
          </ul>
          <p class="stack-foot">API modular · Docker Compose</p>
        </article>

        <article class="stack-card">
          <header class="stack-card-head">
            <div class="stack-title">
              <span class="stack-icon stack-icon--indigo" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </span>
              <h3>Persistencia &amp; mapas</h3>
            </div>
            <span class="chip">ACID relacional</span>
          </header>
          <ul>
            <li>
              <span>Base de datos</span>
              <code class="tag-slate">PostgreSQL 16</code>
            </li>
            <li>
              <span>ORM</span>
              <code class="tag-indigo">Prisma</code>
            </li>
            <li class="li-block">
              <span>Modelos principales</span>
              <div class="model-tags">
                <code>Usuario</code>
                <code>Viaje</code>
                <code>PasajeroViaje</code>
              </div>
            </li>
            <li class="li-block">
              <span>Georreferencia</span>
              <p>
                Google Maps JS (origen / destino / trayecto) con coordenadas en Carabobo y puntos de
                encuentro.
              </p>
            </li>
          </ul>
          <p class="stack-foot">Postgres en Docker · puerto host 5433</p>
        </article>
      </div>
    </section>

    <!-- Seguridad -->
    <aside class="seguridad" aria-label="Garantía de seguridad">
      <div class="seguridad-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <div class="seguridad-copy">
        <h3>
          Red cerrada &amp; identidad institucional
          <span class="tag">Obligatorio</span>
        </h3>
        <p>
          Solo cuentas con correo <code>@ujap.edu.ve</code>. Contraseñas hasheadas, sesiones JWT (y
          Clerk opcional con verificación de email). En el punto de encuentro, el conductor
          identifica el vehículo por placa / descripción publicada — no es un servicio comercial de
          taxi.
        </p>
      </div>
      <RouterLink to="/viajes" class="btn-seguridad">Ver rutas disponibles</RouterLink>
    </aside>
  </main>
</template>

<style scoped>
.about-view {
  width: 100%;
  max-width: 72rem;
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
}

/* ── Hero ── */
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 1rem;
}
.breadcrumb a {
  color: inherit;
  text-decoration: none;
}
.breadcrumb a:hover {
  color: var(--ride-green-fg);
  opacity: 1;
}
.sep {
  opacity: 0.45;
}
.current {
  color: var(--ride-green-fg);
  font-weight: 750;
  opacity: 1;
}
.muted {
  opacity: 0.65;
}

.hero-row {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}
@media (min-width: 900px) {
  .hero-row {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.65rem;
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  background: var(--ride-green-light);
  border: 1px solid var(--ride-green-border);
  color: var(--ride-green-fg);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.eyebrow svg {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(1.65rem, 3.5vw, 2.35rem);
  font-weight: 850;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-heading);
}
.accent {
  color: var(--ride-green-fg);
  text-decoration: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--ride-green-border);
  text-underline-offset: 0.35rem;
}
.lead {
  margin: 0.75rem 0 0;
  max-width: 40rem;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--color-text);
  opacity: 0.82;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
  padding: 0.65rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.btn-outline svg {
  width: 1rem;
  height: 1rem;
  color: var(--ride-green-fg);
}
.btn-outline:hover {
  background: var(--color-background-soft);
  opacity: 1;
}

/* ── Academia ── */
.academia {
  position: relative;
  overflow: hidden;
  border-radius: 1.15rem;
  padding: 1.5rem;
  background: linear-gradient(120deg, #064e3b, var(--ride-green) 55%, #0f766e);
  color: #ecfdf5;
  box-shadow: 0 14px 32px color-mix(in srgb, var(--ride-green) 28%, transparent);
}
@media (min-width: 640px) {
  .academia {
    padding: 1.85rem 2rem;
  }
}
.academia-glow {
  position: absolute;
  width: 16rem;
  height: 16rem;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(48px);
}
.academia-glow--a {
  top: -6rem;
  right: -5rem;
  background: rgba(16, 185, 129, 0.18);
}
.academia-glow--b {
  bottom: -6rem;
  left: -5rem;
  background: rgba(45, 212, 191, 0.14);
}
.academia-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.35rem;
}
@media (min-width: 900px) {
  .academia-grid {
    grid-template-columns: 1.6fr 1fr;
    align-items: center;
    gap: 1.75rem;
  }
}
.academia-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
  padding: 0.3rem 0.65rem;
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #a7f3d0;
  font-size: 0.7rem;
  font-weight: 700;
}
.academia-pill svg {
  width: 1rem;
  height: 1rem;
  color: #fbbf24;
}
.academia-copy h2 {
  margin: 0 0 0.65rem;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 800;
  line-height: 1.2;
  color: #fff;
}
.academia-copy p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: rgba(209, 250, 229, 0.92);
}
.academia-copy strong {
  color: #fff;
  font-weight: 750;
}

.academia-meta {
  margin: 0;
  padding: 1rem 1.1rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 0;
}
.academia-meta > div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.78rem;
}
.academia-meta .meta-last {
  border-bottom: none;
  padding-bottom: 0.15rem;
}
.academia-meta dt {
  color: #a7f3d0;
  font-weight: 600;
}
.academia-meta dd {
  margin: 0;
  color: #fff;
  font-weight: 750;
  text-align: right;
}
.academia-meta code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  background: rgba(2, 44, 34, 0.45);
  color: #fbbf24;
  font-weight: 800;
}

/* ── Propósito cards ── */
.proposito-grid {
  display: grid;
  gap: 1.15rem;
}
@media (min-width: 768px) {
  .proposito-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  display: flex;
  flex-direction: column;
  padding: 1.35rem;
  border-radius: 1.1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-border) 60%, transparent);
  transition: box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 10px 24px color-mix(in srgb, var(--ride-green) 10%, transparent);
}
.card-icon {
  width: 2.75rem;
  height: 2.75rem;
  display: grid;
  place-items: center;
  border-radius: 0.85rem;
  margin-bottom: 0.85rem;
}
.card-icon svg {
  width: 1.35rem;
  height: 1.35rem;
}
.card-icon--green {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  border: 1px solid var(--ride-green-border);
}
.card-icon--amber {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.card-icon--blue {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
html.dark .card-icon--amber {
  background: #3b2a12;
  color: #fbbf24;
  border-color: #78350f;
}
html.dark .card-icon--blue {
  background: #1e293b;
  color: #93c5fd;
  border-color: #1e3a8a;
}

.card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-heading);
}
.card > p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--color-text);
  opacity: 0.85;
  flex: 1;
}
.card-foot {
  margin: 1rem 0 0;
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
  font-weight: 750;
}
.foot--green {
  color: var(--ride-green-fg);
}
.foot--amber {
  color: #b45309;
}
.foot--blue {
  color: #1d4ed8;
}
html.dark .foot--amber {
  color: #fbbf24;
}
html.dark .foot--blue {
  color: #93c5fd;
}

.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  margin-top: 0.35rem;
}
.metric {
  padding: 0.7rem;
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}
.metric-val {
  display: block;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--color-heading);
  line-height: 1.1;
}
.metric-val--accent {
  color: var(--ride-green-fg);
}
.metric-label {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.68rem;
  font-weight: 600;
  opacity: 0.65;
}

/* ── Stack ── */
.stack-sec {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}
.stack-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}
.stack-head h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 850;
  color: var(--color-heading);
}
.stack-head p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  opacity: 0.7;
}
.stack-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 0.45rem;
  background: var(--color-background-mute);
  color: var(--color-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.7rem;
  font-weight: 650;
}
.pulse {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
  animation: pulse 1.6s ease infinite;
}
@keyframes pulse {
  70% {
    box-shadow: 0 0 0 6px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

.stack-grid {
  display: grid;
  gap: 1.15rem;
}
@media (min-width: 900px) {
  .stack-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stack-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border-radius: 1.1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
}
.stack-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-bottom: 0.9rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-border);
}
.stack-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}
.stack-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-heading);
}
.stack-icon {
  display: grid;
  place-items: center;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 0.65rem;
  flex-shrink: 0;
}
.stack-icon svg {
  width: 1.1rem;
  height: 1.1rem;
}
.stack-icon--green {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.stack-icon--teal {
  background: #f0fdfa;
  color: #0f766e;
}
.stack-icon--indigo {
  background: #eef2ff;
  color: #4338ca;
}
html.dark .stack-icon--teal {
  background: #134e4a;
  color: #5eead4;
}
html.dark .stack-icon--indigo {
  background: #1e1b4b;
  color: #a5b4fc;
}

.chip {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.62rem;
  font-weight: 650;
  padding: 0.2rem 0.45rem;
  border-radius: 0.35rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  white-space: nowrap;
}

.stack-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}
.stack-card li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}
.stack-card li.li-block {
  flex-direction: column;
  gap: 0.35rem;
}
.stack-card li.li-block p {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.45;
  opacity: 0.7;
}
.stack-card li:last-child {
  border-bottom: none;
}

.stack-card code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.68rem;
  font-weight: 750;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  white-space: nowrap;
}
.tag-green {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.tag-blue {
  background: #eff6ff;
  color: #1d4ed8;
}
.tag-amber {
  background: #fffbeb;
  color: #b45309;
}
.tag-slate {
  background: var(--color-background-soft);
  color: var(--color-heading);
}
.tag-purple {
  background: #f5f3ff;
  color: #6d28d9;
}
.tag-rose {
  background: #fff1f2;
  color: #be123c;
}
.tag-indigo {
  background: #eef2ff;
  color: #4338ca;
}
html.dark .tag-blue,
html.dark .tag-amber,
html.dark .tag-purple,
html.dark .tag-rose,
html.dark .tag-indigo {
  background: var(--color-background-soft);
  color: var(--ride-green-fg);
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.model-tags code {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-heading);
}

.stack-foot {
  margin: 0.5rem 0 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.65rem;
  opacity: 0.5;
}

/* ── Seguridad ── */
.seguridad {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.35rem 1.25rem;
  border-radius: 1.15rem;
  background: linear-gradient(120deg, #022c22, #0f172a 50%, #064e3b);
  color: #ecfdf5;
  border: 1px solid color-mix(in srgb, var(--ride-green) 35%, transparent);
}
@media (min-width: 768px) {
  .seguridad {
    flex-direction: row;
    align-items: center;
  }
}
.seguridad-icon {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 0.85rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #6ee7b7;
}
.seguridad-icon svg {
  width: 1.4rem;
  height: 1.4rem;
}
.seguridad-copy {
  flex: 1;
  min-width: 0;
}
.seguridad-copy h3 {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-size: 1rem;
  font-weight: 850;
  color: #fff;
}
.tag {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #a7f3d0;
}
.seguridad-copy p {
  margin: 0.45rem 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(203, 213, 225, 0.92);
  max-width: 42rem;
}
.seguridad-copy code {
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  color: #6ee7b7;
}
.btn-seguridad {
  flex-shrink: 0;
  display: inline-flex;
  justify-content: center;
  padding: 0.7rem 1.1rem;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 800;
  text-decoration: none;
  text-align: center;
  transition: background 0.15s ease;
}
.btn-seguridad:hover {
  background: #f1f5f9;
  opacity: 1;
}
</style>
