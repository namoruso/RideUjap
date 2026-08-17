<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const ctaPrincipal = computed(() =>
  auth.estaAutenticado
    ? { to: '/inicio', label: 'Ir a mi panel' }
    : { to: '/registro', label: 'Crear cuenta UJAP' },
)

const pasos = [
  {
    n: '01',
    titulo: 'Entra con tu correo UJAP',
    texto: 'La red es cerrada: estudiantes, profesores y personal. No es un taxi de desconocidos.',
  },
  {
    n: '02',
    titulo: 'Publica o busca una ruta',
    texto:
      'El conductor indica origen, destino, hora y asientos. El pasajero filtra por zona y horario de clase.',
  },
  {
    n: '03',
    titulo: 'Reserva el asiento',
    texto:
      'Pides el cupo. En esta versión se confirma al instante; más adelante el conductor aceptará la solicitud.',
  },
  {
    n: '04',
    titulo: 'Se ven y viajan juntos',
    texto: 'Acuerdan el punto de encuentro. El aporte cubre gasolina, no un viaje de lujo.',
  },
]

const beneficios = [
  {
    titulo: 'Comunidad de confianza',
    texto:
      'Viajas con gente de tu misma universidad: misma facultad, mismo campus, mismas horas pico.',
  },
  {
    titulo: 'Ahorro real',
    texto: 'El pasajero paga menos que un taxi. El conductor no carga solo el tanque ni el peaje.',
  },
  {
    titulo: 'Menos filas en el campus',
    texto: 'Menos autos en la entrada de la UJAP son menos vueltas buscando puesto a las 7:00.',
  },
  {
    titulo: 'Menos humo, más charla',
    texto: 'Se reduce la huella del trayecto y se cruzan carreras que en el pasillo no se hablan.',
  },
]

const rutas = [
  { origen: 'San Diego', destino: 'Campus UJAP' },
  { origen: 'Naguanagua', destino: 'Campus UJAP' },
  { origen: 'Valencia centro', destino: 'Campus UJAP' },
  { origen: 'Campus UJAP', destino: 'Prebo' },
]
</script>

<template>
  <main class="landing">
    <section class="hero" aria-labelledby="hero-titulo">
      <div class="inner">
        <p class="eyebrow ride-fade-up">Red cerrada · Universidad José Antonio Páez</p>
        <h1 id="hero-titulo" class="ride-fade-up ride-delay-1">
          Llega al campus con compañeros, no con desconocidos
        </h1>
        <p class="lead ride-fade-up ride-delay-2">
          RideUJAP conecta a quien va en carro y a quien necesita asiento, en las mismas rutas hacia
          y desde la universidad. Menos gasto, menos impuntualidad, menos un auto vacío ocupando un
          puesto.
        </p>
        <div class="hero-ctas ride-fade-up ride-delay-3">
          <RouterLink :to="ctaPrincipal.to" class="btn btn-primary">{{
            ctaPrincipal.label
          }}</RouterLink>
          <RouterLink to="/viajes" class="btn btn-ghost">Ver viajes publicados</RouterLink>
        </div>
        <p class="trust ride-fade-up ride-delay-4">
          Registro con correo institucional <strong>@ujap.edu.ve</strong>. La verificación de carnet
          llega más adelante; la comunidad ya es solo UJAP.
        </p>
      </div>
    </section>

    <section class="band" aria-label="Rutas frecuentes">
      <div class="inner band-row">
        <p class="band-label">Rutas que ya se coordinan a mano</p>
        <ul class="chips">
          <li v-for="ruta in rutas" :key="ruta.origen + ruta.destino" class="chip">
            {{ ruta.origen }}
            <span class="chip-arrow" aria-hidden="true">→</span>
            {{ ruta.destino }}
          </li>
        </ul>
      </div>
    </section>

    <section id="como-funciona" class="block" aria-labelledby="como-titulo">
      <div class="inner">
        <p class="eyebrow">Cómo funciona</p>
        <h2 id="como-titulo">Cuatro pasos. Sin app de taxi, sin grupo de WhatsApp eterno.</h2>
        <ol class="pasos">
          <li v-for="paso in pasos" :key="paso.n" class="paso">
            <span class="paso-n" aria-hidden="true">{{ paso.n }}</span>
            <div>
              <h3>{{ paso.titulo }}</h3>
              <p>{{ paso.texto }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="block block--soft" aria-labelledby="roles-titulo">
      <div class="inner">
        <p class="eyebrow">Dos formas de usarlo</p>
        <h2 id="roles-titulo">Tú decides el rol del día</h2>
        <div class="roles">
          <article class="role-card">
            <h3>Conductor</h3>
            <p>
              Publicas origen, destino, hora de salida y cupos. El aporte sugerido solo ayuda a
              gasolina y mantenimiento — no es un negocio de transporte.
            </p>
            <RouterLink to="/publicar" class="role-link">Publicar un viaje</RouterLink>
          </article>
          <article class="role-card">
            <h3>Pasajero</h3>
            <p>
              Filtras por zona y hora de clase. Eliges un asiento en un carro que ya iba para el
              campus. Más barato que un traslado privado, más predecible que el transporte público.
            </p>
            <RouterLink to="/viajes" class="role-link">Buscar un asiento</RouterLink>
          </article>
        </div>
      </div>
    </section>

    <section class="block" aria-labelledby="por-que-titulo">
      <div class="inner">
        <p class="eyebrow">Por qué existe</p>
        <h2 id="por-que-titulo">El problema no es “llegar”. Es llegar bien.</h2>
        <div class="beneficios">
          <article v-for="item in beneficios" :key="item.titulo" class="beneficio">
            <h3>{{ item.titulo }}</h3>
            <p>{{ item.texto }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="cierre" aria-labelledby="cierre-titulo">
      <div class="inner cierre-inner">
        <h2 id="cierre-titulo">El próximo pico de las 7:00 puede ir más liviano</h2>
        <p>Si ya vas en carro, lleva a alguien de la UJAP. Si no, súbete con quien sí va.</p>
        <div class="hero-ctas">
          <RouterLink :to="ctaPrincipal.to" class="btn btn-primary">{{
            ctaPrincipal.label
          }}</RouterLink>
          <RouterLink to="/#como-funciona" class="btn btn-ghost">Repasar cómo funciona</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing {
  width: 100%;
}

.inner {
  width: 100%;
  max-width: 68rem;
  margin: 0 auto;
  padding: 0 1.25rem;
}

@media (min-width: 768px) {
  .inner {
    padding: 0 2rem;
  }
}

.eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ride-green);
}

h1,
h2 {
  margin: 0;
  color: var(--color-heading);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

h1 {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  max-width: 18ch;
}

h2 {
  font-size: clamp(1.35rem, 2.5vw, 1.85rem);
  max-width: 28ch;
  margin-bottom: 1.5rem;
}

h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-heading);
}

.lead,
.paso p,
.beneficio p,
.role-card p,
.cierre p {
  margin: 0;
  color: var(--color-text);
  opacity: 0.82;
  line-height: 1.6;
}

.hero {
  padding: 2.5rem 0 3rem;
  background: var(--ride-green-light);
}

.lead {
  margin-top: 1rem;
  max-width: 42rem;
  font-size: 1.05rem;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.7rem 1.25rem;
  border-radius: var(--ride-radius);
  font-weight: 700;
  text-decoration: none;
  transition:
    background var(--ride-transition),
    color var(--ride-transition),
    border-color var(--ride-transition);
}

.btn-primary {
  background: var(--ride-green);
  color: #fff;
  border: 1px solid var(--ride-green);
}

.btn-primary:hover {
  background: var(--ride-green-hover);
  opacity: 1;
}

.btn-ghost {
  background: transparent;
  color: var(--ride-green);
  border: 1px solid var(--ride-green);
}

.btn-ghost:hover {
  background: var(--color-background);
  opacity: 1;
}

.trust {
  margin: 1.25rem 0 0;
  font-size: 0.875rem;
  opacity: 0.75;
  max-width: 36rem;
}

.band {
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.band-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .band-row {
    flex-direction: row;
    align-items: center;
    gap: 1.25rem;
  }
}

.band-label {
  margin: 0;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text);
  opacity: 0.6;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.chip {
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--ride-green-border);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--color-background);
}

.chip-arrow {
  color: var(--ride-green);
  margin: 0 0.2rem;
}

#como-funciona {
  scroll-margin-top: 4.5rem;
}

.block {
  padding: 3rem 0;
}

.block--soft {
  background: var(--color-background-soft);
}

.pasos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .pasos {
    grid-template-columns: 1fr 1fr;
  }
}

.paso {
  display: flex;
  gap: 0.9rem;
  padding: 1.1rem 1.15rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background);
}

.paso-n {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--ride-green);
  flex-shrink: 0;
}

.roles,
.beneficios {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .roles,
  .beneficios {
    grid-template-columns: 1fr 1fr;
  }
}

.role-card,
.beneficio {
  padding: 1.25rem 1.3rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background);
}

.role-link {
  display: inline-block;
  margin-top: 0.9rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.cierre {
  padding: 3rem 0 4rem;
  background: var(--ride-green-light);
}

.cierre-inner {
  max-width: 40rem;
}

.cierre h2 {
  margin-bottom: 0.75rem;
}

.cierre .hero-ctas {
  margin-top: 1.5rem;
}
</style>
