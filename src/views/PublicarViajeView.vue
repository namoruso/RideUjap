<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useViajesStore } from '@/stores/viajes'
import FormularioPublicarViaje from '@/components/FormularioPublicarViaje.vue'
import type { NuevoViaje } from '@/types'

const store = useViajesStore()
const auth = useAuthStore()
const router = useRouter()

async function handlePublicar(nuevoViaje: NuevoViaje) {
  await store.publicarViaje(nuevoViaje)
  router.push('/viajes')
}
</script>

<template>
  <main class="publicar page-content">
    <header class="hero">
      <div class="pill">
        Campus San Diego · Valencia, Carabobo
        <span class="sep">/</span>
        Conductor verificado UJAP
      </div>
      <h1>Publicar un viaje</h1>
      <p>
        Comparte tu recorrido hacia o desde el campus. Ayuda a compañeros y docentes con movilidad
        segura — sin cobro comercial.
      </p>
    </header>

    <div class="layout">
      <div class="main-col">
        <FormularioPublicarViaje @publicar="handlePublicar" />
      </div>

      <aside class="side" aria-label="Consejos para conductores">
        <div class="side-card side-card--preview">
          <div class="side-card-head">
            <span>Vista previa</span>
            <span class="live">En tiempo real</span>
          </div>
          <p class="preview-copy">
            Al publicar, tu ruta aparece en
            <strong>Viajes</strong> con origen, destino, hora y cupos para que otros reserven.
          </p>
          <p v-if="auth.usuario" class="preview-user">
            Conductor: <strong>{{ auth.usuario.nombre }}</strong>
          </p>
        </div>

        <div class="side-card side-card--dark">
          <h3>Beneficios del conductor UJAP</h3>
          <ul>
            <li>Comunidad 100% con correo <code>@ujap.edu.ve</code></li>
            <li>Control de horarios, cupos y punto de encuentro</li>
            <li>Mapa con vía estimada al fijar origen y destino</li>
          </ul>
        </div>

        <div class="side-card">
          <h3>Recomendaciones</h3>
          <ul class="tips">
            <li>Llega 5 minutos antes al punto de encuentro.</li>
            <li>Describe bien el vehículo (color y placa).</li>
            <li>Si hay un contratiempo, avisa a tus pasajeros a tiempo.</li>
          </ul>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.publicar {
  width: 100%;
  max-width: 72rem;
}
.hero {
  margin-bottom: 1.75rem;
}
.pill {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.55rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: var(--ride-green-light);
  border: 1px solid var(--ride-green-border);
  color: var(--ride-green-fg);
  font-size: 0.72rem;
  font-weight: 700;
}
.sep {
  opacity: 0.5;
  font-weight: 500;
}
.hero h1 {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--color-heading);
}
.hero p {
  margin: 0.55rem 0 0;
  max-width: 42rem;
  font-size: 1rem;
  color: var(--color-text);
  line-height: 1.55;
}
.layout {
  display: grid;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: minmax(0, 1.7fr) minmax(16rem, 1fr);
    align-items: start;
  }
}
.side {
  display: grid;
  gap: 1rem;
}
.side-card {
  padding: 1.15rem 1.1rem;
  border-radius: 1.1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
}
.side-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.live {
  text-transform: none;
  letter-spacing: 0;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  border: 1px solid var(--ride-green-border);
  font-size: 0.65rem;
}
.preview-copy,
.preview-user {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text);
  line-height: 1.45;
}
.preview-user {
  margin-top: 0.65rem;
}
.side-card--dark {
  background: linear-gradient(160deg, #064e3b, var(--ride-green));
  border: none;
  color: #ecfdf5;
}
.side-card--dark h3 {
  margin: 0 0 0.65rem;
  font-size: 0.9rem;
  font-weight: 800;
  color: #fff;
}
.side-card--dark ul {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.45rem;
  font-size: 0.82rem;
  line-height: 1.4;
}
.side-card--dark code {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  color: #a7f3d0;
}
.side-card h3 {
  margin: 0 0 0.65rem;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-heading);
}
.tips {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: var(--color-text);
  line-height: 1.4;
}
</style>
