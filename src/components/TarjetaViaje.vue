<script setup lang="ts">
import type { Viaje } from '@/types'

const props = defineProps<{
  viaje: Viaje
  soloVer?: boolean
}>()

const emit = defineEmits<{
  unirse: [id: number]
}>()

function formatHora(h: string) {
  const [hh, mm] = h.split(':')
  const hora = parseInt(hh ?? '0')
  const ampm = hora >= 12 ? 'PM' : 'AM'
  const hora12 = hora % 12 || 12
  return `${hora12}:${mm} ${ampm}`
}

function formatFecha(f: string) {
  const [y, m, d] = f.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const estadoClass: Record<string, string> = {
  disponible: 'badge--disponible',
  lleno: 'badge--lleno',
  'en curso': 'badge--en-curso',
  finalizado: 'badge--finalizado',
}
</script>

<template>
  <article class="tarjeta-viaje">
    <div class="tarjeta-header">
      <div class="ruta">
        <span class="origen">{{ viaje.origen }}</span>
        <span class="flecha" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
        <span class="destino">{{ viaje.destino }}</span>
      </div>
      <span :class="['badge', estadoClass[viaje.estado] ?? 'badge--disponible']">
        {{ viaje.estado }}
      </span>
    </div>

    <div class="tarjeta-meta">
      <div class="meta-item">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{{ formatFecha(viaje.fecha) }}</span>
      </div>
      <div class="meta-item">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{{ formatHora(viaje.hora) }}</span>
      </div>
      <div class="meta-item">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>{{ viaje.cuposDisponibles }} cupo{{ viaje.cuposDisponibles !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <div v-if="viaje.conductorNombre" class="tarjeta-conductor">
      <div class="avatar">{{ viaje.conductorNombre.charAt(0).toUpperCase() }}</div>
      <span>{{ viaje.conductorNombre }}</span>
    </div>

    <button
      type="button"
      class="btn-accion"
      :class="{ 'btn-accion--ver': props.soloVer }"
      @click="emit('unirse', viaje.id)"
    >
      {{ props.soloVer ? 'Ver detalle' : 'Ver viaje' }}
    </button>
  </article>
</template>

<style scoped>
.tarjeta-viaje {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.tarjeta-viaje:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* Header: ruta + badge */
.tarjeta-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.ruta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  min-width: 0;
}

.origen, .destino {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 10rem;
}

.flecha {
  color: var(--ride-green-fg);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* Badge */
.badge {
  flex-shrink: 0;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}

.badge--disponible {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.badge--lleno {
  background: var(--color-background-mute);
  color: var(--color-text);
}
.badge--en-curso {
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
}
.badge--finalizado {
  background: var(--color-background-mute);
  color: var(--color-text);
  opacity: 0.8;
}

/* Meta */
.tarjeta-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.75;
}

.meta-icon {
  width: 0.95rem;
  height: 0.95rem;
  flex-shrink: 0;
}

/* Conductor */
.tarjeta-conductor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text);
}

.avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--ride-green-light);
  color: var(--ride-green-fg);
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Botón */
.btn-accion {
  align-self: flex-start;
  padding: 0.5rem 1.1rem;
  border: 1.5px solid var(--ride-green);
  border-radius: 8px;
  background: transparent;
  color: var(--ride-green-fg);
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.btn-accion:hover {
  background: var(--ride-green);
  color: #fff;
}

.btn-accion--ver {
  border-color: var(--color-border);
  color: var(--color-text);
  opacity: 0.8;
}

.btn-accion--ver:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}
</style>
