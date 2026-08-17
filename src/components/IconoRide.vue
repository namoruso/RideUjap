<script setup lang="ts">
defineProps<{
  nombre:
    | 'mail'
    | 'ruta'
    | 'asiento'
    | 'encuentro'
    | 'escudo'
    | 'ahorro'
    | 'campus'
    | 'hoja'
    | 'volante'
    | 'pasajero'
}>()
</script>

<template>
  <svg
    class="icono"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="nombre === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </template>
    <template v-else-if="nombre === 'ruta'">
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 7.5c4 0 4 9 8 9" />
    </template>
    <template v-else-if="nombre === 'asiento'">
      <path d="M4 10h3v7H4zM17 10h3v7h-3z" />
      <path d="M7 13h10" />
      <path d="M6 20h12" />
    </template>
    <template v-else-if="nombre === 'encuentro'">
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </template>
    <template v-else-if="nombre === 'escudo'">
      <path d="M12 3 5 6v6c0 4.5 3.1 7.4 7 8.5 3.9-1.1 7-4 7-8.5V6l-7-3z" />
      <path d="m9 12 2 2 4-4" />
    </template>
    <template v-else-if="nombre === 'ahorro'">
      <circle cx="12" cy="12" r="8" />
      <path
        d="M12 7v10M9.5 9.5c.6-1 1.6-1.5 2.5-1.5 1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2h-2c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2c.9 0 1.9-.5 2.5-1.5"
      />
    </template>
    <template v-else-if="nombre === 'campus'">
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v8h14v-8" />
      <path d="M10 18v-5h4v5" />
    </template>
    <template v-else-if="nombre === 'hoja'">
      <path d="M5 19c8-1 13-8 14-14-6 1-13 6-14 14z" />
      <path d="M9 15c2-3 5-5 8-6" />
    </template>
    <template v-else-if="nombre === 'volante'">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v6M6.2 16.5 10 13M17.8 16.5 14 13" />
    </template>
    <template v-else>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.8-3.4" />
      <path d="M16.5 4.2a3.2 3.2 0 0 1 0 5.6" />
    </template>
  </svg>
</template>

<style scoped>
.icono {
  width: 1.35rem;
  height: 1.35rem;
  display: block;
}
</style>
