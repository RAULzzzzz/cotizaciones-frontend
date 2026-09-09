<script setup lang="ts">
import { computed } from 'vue'
import { CHIP_ESTADO_COMPRA, type EstadoCompra } from '@/data/cotizaciones'

const props = defineProps<{
  requiereCompra: boolean
  estadoCompra: EstadoCompra
}>()

// Tres casos: la partida no requiere compra, la requiere pero aún no se define,
// o ya tiene un estado de compra concreto.
const estilo = computed(() => (props.estadoCompra ? CHIP_ESTADO_COMPRA[props.estadoCompra] : null))
</script>

<template>
  <span v-if="!requiereCompra" class="chip chip--neutro">Sin compra</span>
  <span v-else-if="!estilo" class="chip chip--pendiente">Por definir</span>
  <span v-else class="chip" :style="{ background: estilo.bg, color: estilo.color }">
    {{ estilo.label }}
  </span>
</template>

<style scoped>
.chip {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}

.chip--neutro {
  background: var(--bg-soft);
  color: var(--muted);
}

.chip--pendiente {
  border: 1px dashed var(--border-soft);
  color: var(--muted);
}
</style>
