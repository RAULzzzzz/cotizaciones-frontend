<script setup lang="ts">
import AppTopBar from '@/components/AppTopBar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const accesos = [
  {
    to: 'cotizaciones',
    icono: 'mdi-file-document-outline',
    titulo: 'Cotizaciones',
    texto: 'Equipos, mercancía, consumibles y servicios para clientes externos',
  },
]
</script>

<template>
  <div class="page">
    <AppTopBar />
    <main class="page__main">
      <div class="head">
        <h2>Bienvenido, {{ auth.user?.nombre }}</h2>
        <p>Has iniciado sesión como {{ auth.user?.email }}</p>
      </div>

      <div class="accesos">
        <RouterLink v-for="a in accesos" :key="a.to" :to="{ name: a.to }" class="acceso">
          <div class="acceso__icono"><i class="mdi" :class="a.icono" /></div>
          <div>
            <div class="acceso__titulo">{{ a.titulo }}</div>
            <div class="acceso__texto">{{ a.texto }}</div>
          </div>
          <i class="mdi mdi-chevron-right acceso__chevron" />
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  font-family: var(--font);
  color: var(--text);
}

.page__main {
  flex: 1;
  padding: 24px 28px;
}

.head {
  margin-bottom: 20px;
}

.head h2 {
  margin: 0;
  font-size: 20px;
  color: var(--navy);
}

.head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--muted);
}

.accesos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.acceso {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 20px;
  gap: 14px;
  align-items: center;
  padding: 18px 20px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 11px;
  text-decoration: none;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.acceso:hover {
  transform: scale(1.006);
  border-color: var(--blue-mid);
}

.acceso__icono {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--blue-light);
  color: var(--blue);
  font-size: 20px;
}

.acceso__titulo {
  font-size: 14px;
  font-weight: 700;
  color: var(--navy);
}

.acceso__texto {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.acceso__chevron {
  color: var(--muted-2);
  font-size: 18px;
}
</style>
