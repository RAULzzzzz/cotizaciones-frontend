<script setup lang="ts">
import { ref } from 'vue'
import AppTopBar from '@/components/AppTopBar.vue'
import ListaCotizaciones from '@/components/cotizaciones/ListaCotizaciones.vue'
import DetalleCotizacion from '@/components/cotizaciones/DetalleCotizacion.vue'
import type { Cotizacion, EstadoCotizacion } from '@/data/cotizaciones'

// El workspace alterna entre lista y detalle sin cambiar de ruta, igual que en
// el proyecto anterior. Todo es estático por ahora: los cambios de estado se
// aplican solo en memoria hasta que exista el backend.
const vista = ref<'lista' | 'detalle'>('lista')
const seleccionada = ref<Cotizacion | null>(null)

function abrir(c: Cotizacion) {
  seleccionada.value = c
  vista.value = 'detalle'
}

function volver() {
  seleccionada.value = null
  vista.value = 'lista'
}

function cambiarEstado(estado: EstadoCotizacion) {
  if (seleccionada.value) seleccionada.value.estado = estado
}

function nueva() {
  // TODO: formulario de alta (wizard de partidas) — pendiente.
}
</script>

<template>
  <div class="page">
    <AppTopBar />
    <main class="page__main">
      <DetalleCotizacion
        v-if="vista === 'detalle' && seleccionada"
        :cotizacion="seleccionada"
        @volver="volver"
        @cambiar-estado="cambiarEstado"
      />
      <ListaCotizaciones v-else @abrir="abrir" @nueva="nueva" />
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
