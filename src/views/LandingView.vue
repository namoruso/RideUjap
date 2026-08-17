<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconoRide from '@/components/IconoRide.vue'
import IlustracionHero from '@/components/IlustracionHero.vue'

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
          <IlustracionHero />
          <form class="buscador" @submit.prevent="buscarRuta">
            <p class="buscador-titulo">Encuentra un asiento</p>
            <label>
              <span>Origen</span>
              <input v-model="busqueda.origen" type="text" placeholder="San Diego, Naguanagua…" />
            </label>
            <label>
              <span>Destino</span>
              <input v-model="busqueda.destino" type="text" placeholder="Campus UJAP" />
            </label>
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
            @click="
              busqueda.origen = ruta
              busqueda.destino = 'Campus UJAP'
              buscarRuta()
            "
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
        <p class="eyebrow">Cómo funciona</p>
        <h2 id="como-titulo">Cuatro pasos. Sin grupo de WhatsApp eterno.</h2>
        <ol class="pasos">
          <li v-for="paso in pasos" :key="paso.n" class="paso">
            <span class="paso-icon" aria-hidden="true">
              <IconoRide :nombre="paso.nombre" />
            </span>
            <span class="paso-n">{{ paso.n }}</span>
            <h3>{{ paso.titulo }}</h3>
            <p>{{ paso.texto }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="block block--soft" aria-labelledby="roles-titulo">
      <div class="inner">
        <p class="eyebrow">Elige rol</p>
        <h2 id="roles-titulo">¿Vas al volante o necesitas asiento?</h2>
        <div class="roles">
          <article class="role-card">
            <span class="paso-icon" aria-hidden="true"><IconoRide nombre="volante" /></span>
            <h3>Conductor</h3>
            <p>Publica hora y cupos. El aporte cubre gasolina, no es un negocio.</p>
            <RouterLink to="/publicar" class="role-link">Publicar ruta</RouterLink>
          </article>
          <article class="role-card">
            <span class="paso-icon" aria-hidden="true"><IconoRide nombre="pasajero" /></span>
            <h3>Pasajero</h3>
            <p>Filtra por zona y hora de clase. Te subes a un carro que ya iba.</p>
            <RouterLink to="/viajes" class="role-link">Buscar asiento</RouterLink>
          </article>
        </div>
      </div>
    </section>

    <section class="block" aria-labelledby="por-que-titulo">
      <div class="inner">
        <p class="eyebrow">Por qué existe</p>
        <h2 id="por-que-titulo">Menos gasto. Menos fila. Más confianza.</h2>
        <div class="beneficios">
          <article v-for="item in beneficios" :key="item.titulo" class="beneficio">
            <span class="paso-icon" aria-hidden="true"><IconoRide :nombre="item.nombre" /></span>
            <h3>{{ item.titulo }}</h3>
            <p>{{ item.texto }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="cierre" aria-labelledby="cierre-titulo">
      <div class="inner cierre-inner">
        <h2 id="cierre-titulo">El pico de las 7:00 puede ir más liviano</h2>
        <div class="hero-ctas">
          <RouterLink :to="ctaPrincipal.to" class="btn btn-primary">{{
            ctaPrincipal.label
          }}</RouterLink>
          <RouterLink to="/viajes" class="btn btn-ghost">Ver viajes</RouterLink>
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
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.25rem;
}

@media (min-width: 768px) {
  .inner {
    padding: 0 2rem;
  }
}

.eyebrow {
  margin: 0 0 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ride-green-fg);
}

h1,
h2 {
  margin: 0;
  color: var(--color-heading);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

h1 {
  font-size: clamp(1.7rem, 3.6vw, 2.55rem);
  max-width: 16ch;
}

h2 {
  font-size: clamp(1.25rem, 2.2vw, 1.7rem);
  max-width: 24ch;
  margin-bottom: 1.5rem;
}

h3 {
  margin: 0.55rem 0 0.3rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
}

.hero {
  padding: 2rem 0 2.5rem;
  background: var(--ride-green-light);
}

.hero-grid {
  display: grid;
  gap: 2rem;
  align-items: center;
}

@media (min-width: 900px) {
  .hero-grid {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 2.5rem;
    min-height: 28rem;
  }
}

.lead {
  margin: 0.9rem 0 0;
  max-width: 36rem;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--color-text);
  opacity: 0.85;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.4rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.2rem;
  border-radius: var(--ride-radius);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
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
  background: var(--color-background);
  color: var(--ride-green-fg);
  border: 1px solid var(--ride-green-border);
}

.btn-ghost:hover {
  background: var(--color-background-soft);
  opacity: 1;
}

.btn-full {
  width: 100%;
}

.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.15rem;
  margin: 1.25rem 0 0;
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
  width: 1.1rem;
  height: 1.1rem;
}

.hero-visual {
  position: relative;
}

.buscador {
  margin-top: -2.25rem;
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.7rem;
  padding: 1.1rem 1.15rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background);
}

.buscador-titulo {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-heading);
}

.buscador label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.buscador input {
  min-height: 2.5rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
}

.buscador input:focus {
  outline: 2px solid var(--ride-green);
  outline-offset: 1px;
}

.band {
  padding: 1rem 0;
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
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.55;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.chip {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--ride-green-border);
  border-radius: 999px;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.chip:hover {
  border-color: var(--ride-green);
  color: var(--ride-green-fg);
}

.chip span {
  color: var(--ride-green-fg);
  margin: 0 0.15rem;
}

#como-funciona {
  scroll-margin-top: 4.5rem;
}

.block {
  padding: 2.75rem 0;
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
  gap: 0.85rem;
}

@media (min-width: 700px) {
  .pasos,
  .beneficios {
    grid-template-columns: repeat(4, 1fr);
  }
}

.paso,
.beneficio,
.role-card {
  padding: 1.15rem 1.1rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--ride-radius-lg);
  background: var(--color-background);
}

.paso p,
.beneficio p,
.role-card p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--color-text);
  opacity: 0.8;
}

.paso-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 10px;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}

.paso-n {
  display: block;
  margin-top: 0.7rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--ride-green-fg);
}

.roles {
  display: grid;
  gap: 0.85rem;
}

@media (min-width: 700px) {
  .roles {
    grid-template-columns: 1fr 1fr;
  }
}

.role-link {
  display: inline-block;
  margin-top: 0.85rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ride-green-fg);
}

.cierre {
  padding: 2.5rem 0 3rem;
  background: var(--ride-green-light);
}

.cierre-inner {
  max-width: 36rem;
}

.cierre .hero-ctas {
  margin-top: 1.15rem;
}
</style>
