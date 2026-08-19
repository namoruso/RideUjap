<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    visible.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true
        observer?.disconnect()
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )

  if (root.value) observer.observe(root.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="reveal" :class="{ 'is-in': visible }">
    <slot />
  </div>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.6s var(--ride-ease, cubic-bezier(0.22, 1, 0.36, 1)),
    transform 0.6s var(--ride-ease, cubic-bezier(0.22, 1, 0.36, 1));
}

.reveal.is-in {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
