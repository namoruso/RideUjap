<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconoRide from '@/components/IconoRide.vue'
import IlustracionHero from '@/components/IlustracionHero.vue'
import Reveal from '@/components/Reveal.vue'

const auth = useAuthStore()
const router = useRouter()

const ctaPrincipal = computed(() =>
  auth.estaAutenticado
    ? { to: '/inicio', label: 'Ir a mi panel' }
    : { to: '/registro', label: 'Crear cuenta UJAP' },
)

const busqueda = reactive({
  origen: '',
  destino: 'Campus UJAP',
})

function buscarRuta() {
  router.push({
    path: '/viajes',
    query: {
      origen: busqueda.origen || undefined,
      destino: busqueda.destino || undefined,
    },
  })
}

function buscarRutaDesde(origen: string) {
  busqueda.origen = origen
  busqueda.destino = 'Campus UJAP'
  buscarRuta()
}

const pasos = [
  {
    n: '1',
    nombre: 'mail' as const,
    titulo: 'Entra con correo UJAP',
    texto: 'Red cerrada: solo comunidad universitaria.',
  },
  {
    n: '2',
    nombre: 'ruta' as const,
    titulo: 'Publica o busca',
    texto: 'Origen, destino, hora y cupos.',
  },
  {
    n: '3',
    nombre: 'asiento' as const,
    titulo: 'Reserva el asiento',
    texto: 'Un toque. Luego coordinan el punto.',
  },
  {
    n: '4',
    nombre: 'encuentro' as const,
    titulo: 'Viajan juntos',
    texto: 'Aporte para gasolina, no tarifa de taxi.',
  },
]

const beneficios = [
  {
    nombre: 'escudo' as const,
    titulo: 'Comunidad de confianza',
    texto: 'Compañeros de campus, no desconocidos.',
  },
  { nombre: 'ahorro' as const, titulo: 'Ahorro real', texto: 'Menos que un traslado privado.' },
  {
    nombre: 'campus' as const,
    titulo: 'Menos filas en la UJAP',
    texto: 'Menos autos buscando puesto a las 7:00.',
  },
  {
    nombre: 'hoja' as const,
    titulo: 'Menos un carro vacío',
    texto: 'Mismo trayecto, menor huella.',
  },
]
</script>

<template>
  <main class="landing">
    <section class="hero" aria-labelledby="hero-titulo">
      <div class="inner hero-grid">
        <div class="hero-copy">
          <p class="eyebrow ride-fade-up">Red cerrada · UJAP</p>
          <h1 id="hero-titulo" class="ride-fade-up ride-delay-1">
            Al campus con compañeros, no con desconocidos
          </h1>
          <p class="lead ride-fade-up ride-delay-2">
            Quien ya va en carro publica la ruta. Quien necesita asiento se sube. Misma universidad,
            mismo pico de las 7:00.
          </p>
          <div class="hero-ctas ride-fade-up ride-delay-3">
            <RouterLink :to="ctaPrincipal.to" class="btn btn-primary">{{
              ctaPrincipal.label
            }}</RouterLink>
            <a href="#como-funciona" class="btn btn-ghost">Cómo funciona</a>
          </div>
          <ul class="trust-row ride-fade-up ride-delay-4">
            <li>
              <IconoRide nombre="escudo" />
              Solo @ujap.edu.ve
            </li>
            <li>
              <IconoRide nombre="ahorro" />
              Aporte a gasolina
            </li>
            <li>
              <IconoRide nombre="campus" />
              Menos un puesto
            </li>
          </ul>
        </div>

        <div class="hero-visual ride-fade-up ride-delay-2">
          <div class="hero-frame">
            <IlustracionHero />
          </div>
          <aside class="live-card" aria-label="Ejemplo de viaje">
            <p class="live-ruta">San Diego <span>→</span> Campus</p>
            <p class="live-meta">Hoy · 7:15 a.m. · 2 cupos</p>
          </aside>
          <form class="buscador" @submit.prevent="buscarRuta">
            <p class="buscador-titulo">Encuentra un asiento</p>
            <div class="buscador-grid">
              <label>
                <span>Origen</span>
                <input v-model="busqueda.origen" type="text" placeholder="San Diego, Naguanagua…" />
              </label>
              <label>
                <span>Destino</span>
                <input v-model="busqueda.destino" type="text" placeholder="Campus UJAP" />
              </label>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Buscar rutas</button>
          </form>
        </div>
      </div>
    </section>

    <section class="band" aria-label="Rutas frecuentes">
      <div class="inner band-row">
        <p class="band-label">Rutas típicas</p>
        <div class="chips">
          <button
            v-for="ruta in ['San Diego', 'Naguanagua', 'Valencia centro', 'Prebo']"
            :key="ruta"
            type="button"
            class="chip"
            @click="buscarRutaDesde(ruta)"
          >
            {{ ruta }}
            <span aria-hidden="true">→</span>
            Campus
          </button>
        </div>
      </div>
    </section>

    <section id="como-funciona" class="block" aria-labelledby="como-titulo">
      <div class="inner">
        <Reveal>
          <header class="section-head">
            <p class="eyebrow">Cómo funciona</p>
            <h2 id="como-titulo">Cuatro pasos. Sin grupo de WhatsApp eterno.</h2>
          </header>
          <ol class="pasos">
            <li v-for="paso in pasos" :key="paso.n" class="paso" :style="{ '--i': paso.n }">
              <span class="paso-icon" aria-hidden="true">
                <IconoRide :nombre="paso.nombre" />
              </span>
              <span class="paso-n">Paso {{ paso.n }}</span>
              <h3>{{ paso.titulo }}</h3>
              <p>{{ paso.texto }}</p>
            </li>
          </ol>
        </Reveal>
      </div>
    </section>

    <section class="block block--soft" aria-labelledby="roles-titulo">
      <div class="inner">
        <Reveal>
          <header class="section-head">
            <p class="eyebrow">Elige rol</p>
            <h2 id="roles-titulo">¿Vas al volante o necesitas asiento?</h2>
          </header>
          <div class="roles">
            <article class="role-card">
              <span class="paso-icon" aria-hidden="true"><IconoRide nombre="volante" /></span>
              <h3>Conductor</h3>
              <p>Publica hora y cupos. El aporte cubre gasolina, no es un negocio.</p>
              <RouterLink to="/publicar" class="role-link">Publicar ruta →</RouterLink>
            </article>
            <article class="role-card">
              <span class="paso-icon" aria-hidden="true"><IconoRide nombre="pasajero" /></span>
              <h3>Pasajero</h3>
              <p>Filtra por zona y hora de clase. Te subes a un carro que ya iba.</p>
              <RouterLink to="/viajes" class="role-link">Buscar asiento →</RouterLink>
            </article>
          </div>
        </Reveal>
      </div>
    </section>

    <section class="block" aria-labelledby="por-que-titulo">
      <div class="inner">
        <Reveal>
          <header class="section-head">
            <p class="eyebrow">Por qué existe</p>
            <h2 id="por-que-titulo">Menos gasto. Menos fila. Más confianza.</h2>
          </header>
          <div class="beneficios">
            <article v-for="item in beneficios" :key="item.titulo" class="beneficio">
              <span class="paso-icon" aria-hidden="true"><IconoRide :nombre="item.nombre" /></span>
              <h3>{{ item.titulo }}</h3>
              <p>{{ item.texto }}</p>
            </article>
          </div>
        </Reveal>
      </div>
    </section>

    <section class="cierre" aria-labelledby="cierre-titulo">
      <div class="inner">
        <Reveal>
          <div class="cierre-box">
            <h2 id="cierre-titulo">El pico de las 7:00 puede ir más liviano</h2>
            <p>Si ya vas en carro, lleva a alguien de la UJAP. Si no, súbete con quien sí va.</p>
            <div class="hero-ctas">
              <RouterLink :to="ctaPrincipal.to" class="btn btn-primary">{{
                ctaPrincipal.label
              }}</RouterLink>
              <RouterLink to="/viajes" class="btn btn-ghost">Ver viajes</RouterLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing {
  width: 100%;
  overflow-x: clip;
}

.inner {
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.25rem;
}

@media (min-width: 768px) {
  .inner {
    padding: 0 2rem;
  }
}

.eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ride-green-fg);
}

h1,
h2 {
  margin: 0;
  color: var(--color-heading);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.12;
}

h1 {
  font-size: clamp(1.85rem, 4.2vw, 3rem);
  max-width: 14ch;
}

h2 {
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  max-width: 22ch;
}

h3 {
  margin: 0.45rem 0 0.25rem;
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--color-heading);
}

.section-head {
  margin-bottom: 1.75rem;
}

.hero {
  padding: 2.25rem 0 3.25rem;
  background: var(--ride-green-light);
}

.hero-grid {
  display: grid;
  gap: 2rem;
  align-items: end;
}

@media (min-width: 960px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 32rem);
    gap: 3.5rem;
    min-height: 0;
    align-items: center;
  }
}

.lead {
  margin: 1rem 0 0;
  max-width: 34rem;
  font-size: 1.05rem;
  line-height: 1.55;
  color: var(--color-text);
  opacity: 0.82;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.85rem;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  transition:
    background 0.2s var(--ride-ease),
    color 0.2s var(--ride-ease),
    border-color 0.2s var(--ride-ease),
    transform 0.2s var(--ride-ease);
}

.btn:hover {
  transform: translateY(-1px);
  opacity: 1;
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: var(--ride-green);
  color: #fff;
  border: 1px solid var(--ride-green);
}

.btn-primary:hover {
  background: var(--ride-green-hover);
}

.btn-ghost {
  background: var(--color-background);
  color: var(--ride-green-fg);
  border: 1px solid var(--ride-green-border);
}

.btn-ghost:hover {
  background: var(--color-background-soft);
}

.btn-full {
  width: 100%;
  border-radius: var(--ride-radius-lg);
}

.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1.1rem;
  margin: 1.4rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
}

.trust-row li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.trust-row :deep(.icono) {
  color: var(--ride-green-fg);
  width: 1.05rem;
  height: 1.05rem;
}

.hero-visual {
  display: grid;
  gap: 0.85rem;
}

.hero-frame {
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid var(--ride-green-border);
  background: var(--color-background);
  padding: 1.25rem 1rem 0.5rem;
}

.live-card {
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
}

.live-ruta {
  margin: 0;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-heading);
}

.live-ruta span {
  color: var(--ride-green-fg);
  margin: 0 0.2rem;
}

.live-meta {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  opacity: 0.7;
}

.buscador {
  display: grid;
  gap: 0.75rem;
  padding: 1.15rem 1.2rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background);
}

.buscador-titulo {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-heading);
}

.buscador-grid {
  display: grid;
  gap: 0.65rem;
}

@media (min-width: 520px) {
  .buscador-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.buscador label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.75;
}

.buscador input {
  min-height: 2.6rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.buscador input:focus {
  outline: 2px solid var(--ride-green);
  outline-offset: 1px;
}

.band {
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.band-row {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

@media (min-width: 768px) {
  .band-row {
    flex-direction: row;
    align-items: center;
  }
}

.band-label {
  margin: 0;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.5;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.chip {
  padding: 0.42rem 0.8rem;
  border: 1px solid var(--ride-green-border);
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-heading);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.2s var(--ride-ease),
    color 0.2s var(--ride-ease),
    background 0.2s var(--ride-ease),
    transform 0.2s var(--ride-ease);
}

.chip:hover {
  border-color: var(--ride-green);
  color: var(--ride-green-fg);
  background: var(--ride-green-light);
  transform: translateY(-1px);
}

.chip span {
  color: var(--ride-green-fg);
  margin: 0 0.15rem;
}

#como-funciona {
  scroll-margin-top: 4.75rem;
}

.block {
  padding: 3.5rem 0;
}

.block--soft {
  background: var(--color-background-soft);
}

.pasos,
.beneficios {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.9rem;
}

@media (min-width: 800px) {
  .pasos,
  .beneficios {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

.paso,
.beneficio,
.role-card {
  padding: 1.25rem 1.15rem 1.3rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background);
  transition:
    transform 0.25s var(--ride-ease),
    border-color 0.25s var(--ride-ease);
}

.paso:hover,
.beneficio:hover,
.role-card:hover {
  transform: translateY(-4px);
  border-color: var(--ride-green-border);
}

.paso p,
.beneficio p,
.role-card p,
.cierre-box p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--color-text);
  opacity: 0.8;
}

.paso-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 12px;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}

.paso-n {
  display: block;
  margin-top: 0.85rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ride-green-fg);
}

.roles {
  display: grid;
  gap: 1rem;
}

@media (min-width: 700px) {
  .roles {
    grid-template-columns: 1fr 1fr;
  }
}

.role-card {
  min-height: 12rem;
}

.role-link {
  display: inline-block;
  margin-top: 1rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ride-green-fg);
  transition: transform 0.2s var(--ride-ease);
}

.role-card:hover .role-link {
  transform: translateX(4px);
}

.cierre {
  padding: 1rem 0 3.5rem;
}

.cierre-box {
  padding: 2.25rem 1.5rem;
  border-radius: 1.25rem;
  background: var(--ride-green-light);
  border: 1px solid var(--ride-green-border);
  text-align: center;
}

.cierre-box h2 {
  max-width: 18ch;
  margin: 0 auto 0.65rem;
}

.cierre-box p {
  max-width: 32rem;
  margin: 0 auto;
}

.cierre-box .hero-ctas {
  justify-content: center;
  margin-top: 1.35rem;
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .chip,
  .paso,
  .beneficio,
  .role-card,
  .live-card {
    animation: none;
    transition: none;
  }

  .btn:hover,
  .chip:hover,
  .paso:hover,
  .beneficio:hover,
  .role-card:hover {
    transform: none;
  }
}
</style>
