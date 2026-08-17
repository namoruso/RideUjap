<script setup lang="ts">
import type { Usuario } from '@/types'

const props = defineProps<{ usuario: Usuario }>()

/** Convierte un número local venezolano a formato internacional E.164 para WhatsApp */
function formatWhatsApp(tel: string): string {
  // Elimina guiones, espacios
  const limpio = tel.replace(/[\s-]/g, '')
  // 04XX → 584XX
  if (limpio.startsWith('0')) return '58' + limpio.slice(1)
  return limpio
}

function abrirWhatsApp() {
  const numero = formatWhatsApp(props.usuario.telefono)
  const texto = encodeURIComponent(
    `Hola ${props.usuario.nombre}, vi tu viaje en RideUJAP y me gustaría unirme. ¿Aún hay cupos disponibles?`,
  )
  window.open(`https://wa.me/${numero}?text=${texto}`, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <article class="tarjeta-usuario">
    <div class="info">
      <p class="nombre">{{ usuario.nombre }}</p>
      <p class="detalle">{{ usuario.correo }}</p>
      <div class="detalle tel">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        {{ usuario.telefono }}
      </div>
      <div class="rol">
        <svg v-if="usuario.esConductor" class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="m5 11 1.5-6h11l1.5 6"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
        </svg>
        <svg v-else class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        {{ usuario.esConductor ? 'Conductor' : 'Pasajero' }}
      </div>
    </div>

    <button type="button" class="btn-contactar" @click="abrirWhatsApp">
      <svg class="icon-wa" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.565 4.14 1.547 5.873L.057 23.428a.5.5 0 0 0 .609.61l5.657-1.48A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.01-1.374l-.36-.215-3.713.971.995-3.62-.234-.374A9.785 9.785 0 0 1 2.182 12C2.182 6.569 6.569 2.182 12 2.182S21.818 6.569 21.818 12 17.431 21.818 12 21.818z"/>
      </svg>
      Contactar
    </button>
  </article>
</template>

<style scoped>
.tarjeta-usuario {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nombre {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-heading);
}

.detalle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.8;
}

.tel {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.rol {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ride-green);
  letter-spacing: 0.03em;
}

.info-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.btn-contactar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 8px;
  background: #25d366;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.btn-contactar:hover {
  background: #1da851;
  transform: translateY(-1px);
}

.icon-wa {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}
</style>
