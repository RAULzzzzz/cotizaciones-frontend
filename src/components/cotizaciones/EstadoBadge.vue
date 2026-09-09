<script setup lang="ts">
import { computed } from 'vue'
import { ESTADOS, type EstadoCotizacion } from '@/data/cotizaciones'

const props = defineProps<{ estado: EstadoCotizacion }>()

const estilo = computed(() => ESTADOS[props.estado] ?? ESTADOS.Borrador)
</script>

<template>
  <span class="badge" :style="{ background: estilo.bg, color: estilo.color }">
    {{ estilo.label ?? estado }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
