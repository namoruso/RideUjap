<script setup lang="ts">
import type { Usuario } from '@/types'

defineProps<{ usuario: Usuario }>()

const emit = defineEmits<{
  contactar: [id: number]
}>()
</script>

<template>
  <article class="tarjeta-usuario">
    <div>
      <p class="nombre">{{ usuario.nombre }}</p>
      <p class="detalle">{{ usuario.correo }}</p>
      <p class="detalle">{{ usuario.telefono }}</p>
      <p class="rol">{{ usuario.esConductor ? 'Conductor' : 'Pasajero' }}</p>
    </div>

    <button type="button" class="btn-contactar" @click="emit('contactar', usuario.id)">
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
  border: 1px solid var(--color-border, #d8d8d8);
  border-radius: 8px;
  background: #fff;
}

.nombre {
  margin: 0 0 0.25rem;
  font-weight: 700;
  font-size: 1.05rem;
}

.detalle,
.rol {
  margin: 0.15rem 0;
  font-size: 0.875rem;
  color: #555;
}

.rol {
  font-weight: 600;
  color: #0b6e4f;
}

.btn-contactar {
  padding: 0.5rem 0.9rem;
  border: 1px solid #0b6e4f;
  border-radius: 6px;
  background: transparent;
  color: #0b6e4f;
  font-weight: 600;
  cursor: pointer;
}

.btn-contactar:hover {
  background: #0b6e4f;
  color: #fff;
}
</style>
