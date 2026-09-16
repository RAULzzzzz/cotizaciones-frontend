<script setup lang="ts">
// Envoltura de un campo: etiqueta arriba, control en el slot y debajo el error
// (si lo hay) o el texto de ayuda. Equivale al componente `Campo` del original.
defineProps<{
  label: string
  error?: string
  ayuda?: string
}>()
</script>

<template>
  <label class="campo">
    <span class="ui-label">{{ label }}</span>
    <slot />
    <span v-if="error" class="campo__error">{{ error }}</span>
    <span v-else-if="ayuda" class="campo__ayuda">{{ ayuda }}</span>
  </label>
</template>

<style scoped>
.campo {
  min-width: 0;
  display: block;
}

.campo__error {
  display: block;
  margin-top: 5px;
  color: var(--danger-solid);
  font-size: 10px;
  font-weight: 600;
}

.campo__ayuda {
  display: block;
  margin-top: 5px;
  color: var(--muted-2);
  font-size: 10px;
}
</style>
