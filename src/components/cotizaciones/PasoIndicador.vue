<script setup lang="ts">
import { PASOS } from '@/data/cotizaciones'

defineProps<{
  paso: number
  maxAlcanzado: number
}>()

const emit = defineEmits<{ ir: [number] }>()
</script>

<template>
  <div class="pasos">
    <template v-for="(nombre, i) in PASOS" :key="nombre">
      <button
        type="button"
        class="paso"
        :class="{ 'is-accesible': i <= maxAlcanzado }"
        :disabled="i > maxAlcanzado"
        @click="emit('ir', i)"
      >
        <span
          class="paso__circulo"
          :class="{ 'is-activo': i === paso, 'is-completado': i < paso }"
        >
          {{ i < paso ? '✓' : i + 1 }}
        </span>
        <span
          class="paso__nombre"
          :class="{ 'is-activo': i === paso, 'is-completado': i < paso }"
        >
          {{ nombre }}
        </span>
      </button>
      <span v-if="i < PASOS.length - 1" class="linea" :class="{ 'is-completada': i < paso }" />
    </template>
  </div>
</template>

<style scoped>
.pasos {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.paso {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0 4px;
  font-family: inherit;
  cursor: default;
}

.paso.is-accesible {
  cursor: pointer;
}

.paso__circulo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
  border: 2px solid var(--border);
  background: var(--white);
  color: var(--muted);
  transition: all 0.2s;
}

.paso__circulo.is-activo {
  border-color: var(--blue);
  background: var(--blue);
  color: #fff;
}

.paso__circulo.is-completado {
  border-color: var(--success);
  background: var(--success);
  color: #fff;
}

.paso__nombre {
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
}

.paso__nombre.is-activo {
  font-weight: 700;
  color: var(--blue);
}

.paso__nombre.is-completado {
  color: var(--success);
}

.linea {
  width: 80px;
  height: 2px;
  background: var(--border);
  margin: 0 4px 22px;
  transition: background 0.3s;
}

.linea.is-completada {
  background: var(--success);
}

@media (max-width: 560px) {
  .linea {
    width: 32px;
  }
}
</style>
