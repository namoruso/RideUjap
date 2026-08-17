<template>
  <svg
    class="ilustracion"
    viewBox="0 0 480 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Ilustración de un viaje compartido al campus"
  >
    <defs>
      <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--ride-green-light)" />
        <stop offset="100%" stop-color="var(--color-background-soft)" />
      </linearGradient>
    </defs>
    <rect width="480" height="360" rx="24" fill="url(#cielo)" />

    <!-- Hills -->
    <path
      d="M0 210 C 80 170, 140 190, 220 175 S 340 150, 480 190 V 360 H 0 Z"
      fill="var(--ride-green-light)"
    />
    <path d="M0 250h480" stroke="var(--ride-green-border)" stroke-width="2" />
    <path
      class="marcas"
      d="M40 278h70M140 278h36M200 278h80M310 278h90"
      stroke="var(--color-border)"
      stroke-width="5"
      stroke-linecap="round"
    />

    <!-- Campus pin -->
    <g class="pin">
      <circle
        cx="400"
        cy="88"
        r="30"
        fill="var(--color-background)"
        stroke="var(--ride-green-border)"
        stroke-width="2"
      />
      <path
        d="M400 70c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z"
        fill="var(--ride-green)"
      />
      <circle cx="400" cy="86" r="4.5" fill="var(--color-background)" />
    </g>

    <path
      class="ruta"
      d="M90 210 C 160 210, 220 140, 310 120 S 370 100, 392 100"
      stroke="var(--ride-green-fg)"
      stroke-width="3"
      stroke-dasharray="8 10"
      fill="none"
    />

    <g class="carro">
      <g transform="translate(70 168)">
        <rect x="18" y="28" width="168" height="48" rx="16" fill="var(--ride-green)" />
        <path d="M48 28 68 8h70l22 20" fill="var(--ride-green-hover)" />
        <rect
          x="72"
          y="12"
          width="36"
          height="20"
          rx="4"
          fill="var(--color-background)"
          opacity="0.9"
        />
        <rect
          x="116"
          y="12"
          width="36"
          height="20"
          rx="4"
          fill="var(--color-background)"
          opacity="0.9"
        />
        <circle
          cx="58"
          cy="78"
          r="14"
          fill="var(--color-background-mute)"
          stroke="var(--color-heading)"
          stroke-width="3"
        />
        <circle
          cx="150"
          cy="78"
          r="14"
          fill="var(--color-background-mute)"
          stroke="var(--color-heading)"
          stroke-width="3"
        />
        <circle cx="90" cy="38" r="7" fill="#f4d6b0" />
        <circle cx="128" cy="38" r="7" fill="#e8c4a8" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.ilustracion {
  width: 100%;
  height: auto;
  display: block;
}

.ruta {
  animation: ride-dash 14s linear infinite;
}

.carro {
  animation: ride-bob 3.4s var(--ride-ease) infinite;
  transform-origin: center;
}

.pin {
  animation: ride-pulse 2.8s ease-in-out infinite;
  transform-origin: 400px 88px;
}

@media (prefers-reduced-motion: reduce) {
  .ruta,
  .carro,
  .pin {
    animation: none;
  }
}
</style>
