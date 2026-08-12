<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/">RideUJAP</RouterLink>
      <nav>
        <RouterLink to="/">Viajes</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
.app-shell {
  width: 100%;
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border, #d8d8d8);
}

.brand {
  font-weight: 800;
  color: #0b6e4f;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 0.75rem;
}

nav a {
  text-decoration: none;
  color: inherit;
  padding: 0.25rem 0.35rem;
}

nav a.router-link-exact-active {
  color: #0b6e4f;
  font-weight: 700;
}
</style>
