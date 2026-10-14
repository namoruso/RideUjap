<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificacionesStore } from '@/stores/notificaciones'
import type { Notificacion } from '@/types'

const store = useNotificacionesStore()
const router = useRouter()
const abierto = ref(false)
const raiz = ref<HTMLElement | null>(null)

onMounted(async () => {
  await store.cargar()
  if (store.disponible) void store.conectar()
  document.addEventListener('pointerdown', cerrarFuera)
})

onBeforeUnmount(() => {
  store.desconectar()
  document.removeEventListener('pointerdown', cerrarFuera)
})

function cerrarFuera(e: Event) {
  if (raiz.value && !raiz.value.contains(e.target as Node)) abierto.value = false
}

async function abrir(n: Notificacion) {
  void store.marcarLeida(n._id)
  abierto.value = false
  if (n.payload.idViaje && n.tipo !== 'viaje_cancelado') {
    await router.push(`/viajes/${n.payload.idViaje}`)
  }
}

function hace(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'ahora'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return `hace ${Math.floor(s / 86400)} d`
}
</script>

<template>
  <div v-if="store.disponible" ref="raiz" class="campana">
    <button
      type="button"
      class="btn-campana"
      :aria-label="`Notificaciones${store.noLeidas ? `, ${store.noLeidas} sin leer` : ''}`"
      :aria-expanded="abierto"
      @click="abierto = !abierto"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      <span v-if="store.noLeidas" class="badge">{{ store.noLeidas > 9 ? '9+' : store.noLeidas }}</span>
    </button>

    <div v-if="abierto" class="panel" role="dialog" aria-label="Notificaciones">
      <header class="panel-head">
        <strong>Notificaciones</strong>
        <button v-if="store.noLeidas" type="button" class="link" @click="store.marcarTodas()">
          Marcar todas como leídas
        </button>
      </header>
      <p v-if="!store.items.length" class="vacio">Aún no tienes notificaciones.</p>
      <ul v-else class="lista">
        <li v-for="n in store.items" :key="n._id">
          <button type="button" class="item" :class="{ 'item--nueva': !n.leida }" @click="abrir(n)">
            <span class="item-titulo">{{ n.titulo }}</span>
            <span class="item-msg">{{ n.mensaje }}</span>
            <span class="item-hora">{{ hace(n.creadoEn) }}</span>
          </button>
        </li>
      </ul>
      <button v-if="store.hayMas" type="button" class="link mas" @click="store.cargar(true)">
        Ver más
      </button>
    </div>
  </div>
</template>

<style scoped>
.campana {
  position: relative;
}
.btn-campana {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-heading);
  cursor: pointer;
}
.badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.05rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1.05rem;
  text-align: center;
}
.panel {
  position: absolute;
  z-index: 60;
  right: 0;
  top: calc(100% + 0.5rem);
  width: min(22rem, calc(100vw - 2rem));
  max-height: 26rem;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background);
  box-shadow: 0 16px 36px color-mix(in srgb, var(--color-heading) 16%, transparent);
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.85rem;
  color: var(--color-heading);
}
.link {
  border: none;
  background: none;
  color: var(--ride-green-fg);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.mas {
  display: block;
  width: 100%;
  padding: 0.7rem;
}
.vacio {
  margin: 0;
  padding: 1.2rem 1rem;
  font-size: 0.85rem;
  color: var(--color-text);
}
.lista {
  margin: 0;
  padding: 0;
  list-style: none;
}
.item {
  display: grid;
  gap: 0.15rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}
.item:hover {
  background: var(--color-background-soft);
}
.item--nueva {
  background: var(--ride-green-light);
}
.item-titulo {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--color-heading);
}
.item-msg {
  font-size: 0.8rem;
  color: var(--color-text);
}
.item-hora {
  font-size: 0.7rem;
  color: var(--color-text);
  opacity: 0.7;
}
</style>
