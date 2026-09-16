<script setup lang="ts">
import { computed, ref } from 'vue'

const logoOk = ref(true)
const logoSrc = `${import.meta.env.BASE_URL}logo.png`

// El sistema es por cuenta de empresa: en la topbar se identifica la empresa
// registrada, no la persona que inició sesión. Placeholder hasta que exista el
// perfil de empresa en el backend (vendrá de la sesión, como auth.user).
const empresa = 'Taller Mecánico El Roble'

const iniciales = computed(() =>
  empresa
    .split(' ')
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <header class="topbar">
    <img v-if="logoOk" :src="logoSrc" alt="" class="topbar__logo" @error="logoOk = false" />

    <nav class="topbar__nav">
      <RouterLink :to="{ name: 'cotizaciones' }">Cotizaciones</RouterLink>
      <RouterLink :to="{ name: 'clientes' }">Clientes</RouterLink>
    </nav>

    <div class="topbar__user">
      <span>{{ empresa }}</span>
      <!-- Espacio para el logo de la empresa o la foto del usuario. Sin imagen
           aún, se ve como una insignia con iniciales. -->
      <div class="topbar__avatar" :title="empresa">{{ iniciales }}</div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 28px;
  height: 60px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar__logo {
  height: 26px;
  display: block;
}

.topbar__nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.topbar__nav a {
  padding: 7px 13px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--muted);
  text-decoration: none;
}

.topbar__nav a:hover {
  background: var(--bg-soft);
  color: var(--navy);
}

.topbar__nav a.router-link-active {
  background: var(--blue-light);
  color: var(--blue);
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-soft);
}

.topbar__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--blue-light);
  color: var(--blue);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
}
</style>
