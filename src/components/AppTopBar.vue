<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const logoOk = ref(true)
const logoSrc = `${import.meta.env.BASE_URL}logo.png`

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="topbar">
    <img v-if="logoOk" :src="logoSrc" alt="" class="topbar__logo" @error="logoOk = false" />

    <nav class="topbar__nav">
      <RouterLink :to="{ name: 'dashboard' }">Inicio</RouterLink>
      <RouterLink :to="{ name: 'cotizaciones' }">Cotizaciones</RouterLink>
    </nav>

    <div class="topbar__user">
      <span>{{ auth.user?.nombre }}</span>
      <button title="Cerrar sesión" @click="logout">
        <i class="mdi mdi-logout" />
      </button>
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

.topbar__user button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 16px;
}

.topbar__user button:hover {
  color: var(--danger-solid);
  border-color: var(--danger-bd);
}
</style>
