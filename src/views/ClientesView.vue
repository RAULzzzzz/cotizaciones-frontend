<script setup lang="ts">
import { ref } from 'vue'
import AppTopBar from '@/components/AppTopBar.vue'
import ListaClientes from '@/components/clientes/ListaClientes.vue'
import FormularioCliente from '@/components/clientes/FormularioCliente.vue'

// Mismo patrón que CotizacionesView: alterna lista/formulario sin cambiar de ruta.
// Todo es estático por ahora — ver src/data/clientes.ts.
const vista = ref<'lista' | 'formulario'>('lista')

function nuevo() {
  vista.value = 'formulario'
}

function volver() {
  vista.value = 'lista'
}
</script>

<template>
  <div class="page">
    <AppTopBar />
    <main class="page__main">
      <FormularioCliente v-if="vista === 'formulario'" @volver="volver" @guardado="volver" />
      <ListaClientes v-else @nuevo="nuevo" />
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
  min-height: 0;
}
</style>
