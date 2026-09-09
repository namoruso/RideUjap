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

const ultimoCupo = props.viaje.cuposDisponibles === 1 && props.viaje.estado === 'disponible'
</script>

<template>
  <article class="tarjeta" :class="{ 'tarjeta--urgente': ultimoCupo }">
    <div class="tarjeta-top">
      <div class="ruta-block">
        <div class="ruta">
          <span class="lugar">{{ viaje.origen }}</span>
          <svg class="flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span class="lugar">{{ viaje.destino }}</span>
        </div>
        <p v-if="viaje.puntoEncuentro" class="encuentro">
          Encuentro: {{ viaje.puntoEncuentro }}
        </p>
      </div>
      <div class="status">
        <span class="cupos" :class="{ 'cupos--urgente': ultimoCupo }">
          <span class="cupos-dot" aria-hidden="true" />
          {{
            ultimoCupo
              ? '¡Último cupo!'
              : `${viaje.cuposDisponibles} cupo${viaje.cuposDisponibles === 1 ? '' : 's'}`
          }}
        </span>
        <span class="estado">{{ viaje.estado }}</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta">
        <span class="meta-label">Fecha</span>
        <span class="meta-value">{{ formatFecha(viaje.fecha) }}</span>
      </div>
      <div class="meta">
        <span class="meta-label">Salida</span>
        <span class="meta-value meta-value--hora">{{ formatHora(viaje.hora) }}</span>
      </div>
      <div class="meta">
        <span class="meta-label">Vehículo</span>
        <span class="meta-value">{{ viaje.descripcionVehiculo || '—' }}</span>
      </div>
    </div>

    <div class="tarjeta-mid">
      <div v-if="viaje.conductorNombre" class="conductor">
        <div class="avatar">{{ viaje.conductorNombre.charAt(0).toUpperCase() }}</div>
        <div>
          <p class="nombre">{{ viaje.conductorNombre }}</p>
          <p class="rol">Conductor UJAP</p>
        </div>
      </div>
    </div>

    <div class="tarjeta-foot">
      <span class="nota">Comunidad institucional · no es taxi</span>
      <button type="button" class="btn" :class="{ 'btn--urgente': ultimoCupo }" @click="emit('unirse', viaje.id)">
        {{ props.soloVer ? 'Ver detalle' : 'Ver viaje y reservar' }}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.tarjeta {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 1.15rem;
  background: var(--color-background);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-heading) 4%, transparent);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}
.tarjeta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--ride-green) 10%, transparent);
  border-color: var(--ride-green-border);
}
.tarjeta--urgente {
  border-color: color-mix(in srgb, #f59e0b 55%, var(--color-border));
}
.tarjeta-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}
.ruta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 850;
  color: var(--color-heading);
}
.lugar {
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.flecha {
  width: 1rem;
  height: 1rem;
  color: var(--ride-green-fg);
  flex-shrink: 0;
}
.encuentro {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: var(--color-text);
}
.status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
}
.cupos {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--ride-green-light);
  border: 1px solid var(--ride-green-border);
  color: var(--ride-green-fg);
  font-size: 0.72rem;
  font-weight: 800;
}
.cupos--urgente {
  background: color-mix(in srgb, #f59e0b 16%, var(--color-background));
  border-color: color-mix(in srgb, #f59e0b 40%, var(--color-border));
  color: #b45309;
}
.cupos-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: currentColor;
}
.estado {
  font-size: 0.65rem;
  font-weight: 650;
  text-transform: capitalize;
  color: var(--color-text);
  opacity: 0.75;
}
.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45rem;
  padding: 0.7rem 0.65rem;
  border-radius: 0.85rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}
.meta-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.6;
}
.meta-value {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.78rem;
  font-weight: 750;
  color: var(--color-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta-value--hora {
  color: var(--ride-green-fg);
}
.conductor {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.avatar {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--ride-green);
  color: #fff;
  font-weight: 800;
  font-size: 0.85rem;
  box-shadow: 0 0 0 3px var(--ride-green-light);
}
.nombre {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--color-heading);
}
.rol {
  margin: 0.1rem 0 0;
  font-size: 0.7rem;
  color: var(--color-text);
}
.tarjeta-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}
.nota {
  font-size: 0.72rem;
  color: var(--color-text);
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--ride-green);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}
.btn svg {
  width: 0.85rem;
  height: 0.85rem;
}
.btn:hover {
  background: var(--ride-green-hover);
}
.btn--urgente {
  background: #d97706;
}
.btn--urgente:hover {
  background: #b45309;
}
</style>
