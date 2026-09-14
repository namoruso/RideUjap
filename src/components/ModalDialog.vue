<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    titulo: string
    mensaje: string
    /** cancel | danger | primary */
    varianteConfirmar?: 'danger' | 'primary'
    textoCancelar?: string
    textoConfirmar?: string
    /** If false, only shows the confirm/dismiss button (alert style). */
    mostrarCancelar?: boolean
    cargando?: boolean
  }>(),
  {
    varianteConfirmar: 'primary',
    textoCancelar: 'Cancelar',
    textoConfirmar: 'Confirmar',
    mostrarCancelar: true,
    cargando: false,
  },
)

const emit = defineEmits<{
  cancelar: []
  confirmar: []
}>()

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') emit('cancelar')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

watch(
  () => props.open,
  (abierto) => {
    document.body.style.overflow = abierto ? 'hidden' : ''
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      role="presentation"
      @click.self="emit('cancelar')"
    >
      <div
        class="modal-panel"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="'modal-titulo'"
        :aria-describedby="'modal-desc'"
      >
        <h3 id="modal-titulo">{{ titulo }}</h3>
        <p id="modal-desc">{{ mensaje }}</p>
        <slot />
        <div class="modal-actions">
          <button
            v-if="mostrarCancelar"
            type="button"
            class="btn-sec"
            :disabled="cargando"
            @click="emit('cancelar')"
          >
            {{ textoCancelar }}
          </button>
          <button
            type="button"
            class="btn-pri"
            :class="{
              'btn-pri--danger': varianteConfirmar === 'danger',
              'btn-pri--primary': varianteConfirmar === 'primary',
            }"
            :disabled="cargando"
            @click="emit('confirmar')"
          >
            {{ cargando ? 'Espera…' : textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: color-mix(in srgb, #020617 55%, transparent);
  backdrop-filter: blur(4px);
}

.modal-panel {
  width: min(100%, 26rem);
  padding: 1.35rem 1.4rem 1.25rem;
  border-radius: 1.15rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  box-shadow:
    0 20px 50px color-mix(in srgb, #000 35%, transparent),
    0 0 0 1px color-mix(in srgb, var(--ride-green) 8%, transparent);
  color: var(--color-text);
}

.modal-panel h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-heading);
}

.modal-panel p {
  margin: 0.65rem 0 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text);
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
  margin-top: 1.35rem;
}

.btn-sec,
.btn-pri {
  min-height: 2.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.8rem;
  font-size: 0.82rem;
  font-weight: 750;
  font-family: inherit;
  cursor: pointer;
}

.btn-sec {
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-heading);
}

.btn-sec:hover:not(:disabled) {
  background: var(--color-background-mute);
}

.btn-pri {
  border: none;
  color: #fff;
}

.btn-pri--primary {
  background: var(--ride-green);
}

.btn-pri--primary:hover:not(:disabled) {
  background: var(--ride-green-hover);
}

.btn-pri--danger {
  background: #dc2626;
}

.btn-pri--danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-sec:disabled,
.btn-pri:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
