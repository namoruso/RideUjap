<template>
  <svg
    class="ilustracion"
    viewBox="0 0 480 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Ilustración de un viaje compartido al campus"
  >
    <rect width="480" height="360" rx="24" fill="var(--ride-green-light)" />
    <path d="M0 250h480" stroke="var(--ride-green-border)" stroke-width="2" />
    <path
      d="M40 270h80M150 270h40M220 270h90M340 270h90"
      stroke="var(--color-border)"
      stroke-width="6"
      stroke-linecap="round"
    />

    <!-- Campus pin -->
    <circle
      cx="400"
      cy="88"
      r="28"
      fill="var(--color-background)"
      stroke="var(--ride-green)"
      stroke-width="3"
    />
    <path
      d="M400 72c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14z"
      fill="var(--ride-green)"
    />
    <circle cx="400" cy="86" r="4" fill="var(--color-background)" />

    <!-- Route -->
    <path
      d="M90 210 C 160 210, 220 140, 310 120 S 370 100, 392 100"
      stroke="var(--ride-green)"
      stroke-width="3"
      stroke-dasharray="8 8"
      fill="none"
    />

    <!-- Car body -->
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
        opacity="0.85"
      />
      <rect
        x="116"
        y="12"
        width="36"
        height="20"
        rx="4"
        fill="var(--color-background)"
        opacity="0.85"
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
  </svg>
</template>

<style scoped>
.ilustracion {
  width: 100%;
  height: auto;
  display: block;
}
</style>
