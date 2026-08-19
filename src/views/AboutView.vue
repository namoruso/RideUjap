<script setup lang="ts">
// No se necesita lógica reactiva en esta vista informativa
</script>

<template>
  <main class="about-view page-content">
    <header class="about-header">
      <p class="marca">RideUJAP</p>
      <h1>Acerca del proyecto</h1>
      <p class="subtitulo">
        La historia del producto está en la
        <RouterLink to="/">página de inicio</RouterLink>. Aquí queda el contexto académico y el
        stack.
      </p>
    </header>

    <div class="about-grid">
      <section class="card" aria-labelledby="que-es">
        <h2 id="que-es">¿Qué es RideUJAP?</h2>
        <p>
          RideUJAP es una plataforma tipo Waze/BlaBlaCar pensada para los estudiantes y docentes de
          la Universidad José Antonio Páez. Permite publicar viajes compartidos hacia el campus en
          San Diego, Carabobo, y unirse a ellos según origen, destino, hora y cupos disponibles.
        </p>
      </section>

      <section class="card" aria-labelledby="objetivo">
        <h2 id="objetivo">Objetivo</h2>
        <p>
          Reducir el gasto de transporte de la comunidad universitaria facilitando la coordinación
          de viajes entre compañeros que comparten rutas hacia el campus UJAP y sus alrededores.
        </p>
      </section>

      <section class="card" aria-labelledby="stack">
        <h2 id="stack">Stack tecnológico</h2>
        <ul class="stack-lista">
          <li><strong>Frontend:</strong> Vue 3 + TypeScript + Vite</li>
          <li><strong>Estado:</strong> Pinia</li>
          <li><strong>Enrutamiento:</strong> Vue Router</li>
          <li><strong>Estilos:</strong> CSS puro — Grid + Flexbox, mobile-first + Dark Mode</li>
          <li><strong>Backend:</strong> Node.js + Express + TypeScript</li>
          <li>
            <strong>Base de datos:</strong> SQLite (persistencia real en archivo
            <code>rideujap.db</code>)
          </li>
          <li><strong>ORM:</strong> Prisma — modelos Usuario, Viaje, PasajeroViaje</li>
          <li><strong>Autenticación:</strong> JWT firmados con <code>jsonwebtoken</code></li>
          <li><strong>Seguridad:</strong> Contraseñas hasheadas con <code>bcryptjs</code></li>
        </ul>
      </section>

      <section class="card" aria-labelledby="materia">
        <h2 id="materia">Contexto académico</h2>
        <p>
          Proyecto semestral de la materia <strong>Tópicos Especiales en Programación Web</strong>
          (código ETW09303), Ingeniería en Computación, UJAP.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.about-view {
  width: 100%;
  max-width: 56rem;
}

.about-header {
  margin-bottom: 2rem;
}

.marca {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ride-green);
}

h1 {
  margin: 0;
  font-size: 1.7rem;
  line-height: 1.2;
}

.subtitulo {
  margin: 0.4rem 0 0;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.95rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ride-gap-lg);
}

@media (min-width: 600px) {
  .about-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
