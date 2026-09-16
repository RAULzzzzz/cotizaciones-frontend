<script setup lang="ts">
import { ref } from 'vue'
import AppTopBar from '@/components/AppTopBar.vue'
import ListaCotizaciones from '@/components/cotizaciones/ListaCotizaciones.vue'
import DetalleCotizacion from '@/components/cotizaciones/DetalleCotizacion.vue'
import FormularioCotizacion from '@/components/cotizaciones/FormularioCotizacion.vue'
import type { Cotizacion } from '@/data/cotizaciones'

// El workspace alterna entre lista, detalle y formulario sin cambiar de ruta,
// igual que en el proyecto anterior. Todo es estático por ahora: los cambios se
// aplican solo en memoria hasta que exista el backend.
const vista = ref<'lista' | 'detalle' | 'formulario'>('lista')
const seleccionada = ref<Cotizacion | null>(null)

function abrir(c: Cotizacion) {
  seleccionada.value = c
  vista.value = 'detalle'
}

function volver() {
  seleccionada.value = null
  vista.value = 'lista'
}

// Borrado suave: la cotización no desaparece de los datos, solo se filtra de la
// lista (ver ListaCotizaciones). Así el registro no se pierde.
function eliminar() {
  if (seleccionada.value) seleccionada.value.estado = 'Eliminada'
  volver()
}

function nueva() {
  seleccionada.value = null
  vista.value = 'formulario'
}
</script>

<template>
  <div class="page">
    <AppTopBar />
    <main class="page__main">
      <FormularioCotizacion
        v-if="vista === 'formulario'"
        @volver="volver"
        @guardado="volver"
      />
      <DetalleCotizacion
        v-else-if="vista === 'detalle' && seleccionada"
        :cotizacion="seleccionada"
        @volver="volver"
        @eliminar="eliminar"
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
