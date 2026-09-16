<script setup lang="ts">
import { computed, ref } from 'vue'
import { capitalizar } from '@/data/cotizaciones'

// El valor se guarda como un string con una nota por línea, igual que el original:
// así se manda tal cual al backend cuando exista.
const props = withDefaults(
  defineProps<{
    modelValue: string
    predefinidas?: string[]
    maxItems?: number
    placeholder?: string
  }>(),
  { predefinidas: () => [], maxItems: undefined, placeholder: 'Escribe la nota personalizada...' },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const custom = ref('')
const agregando = ref(false)
const arrastrando = ref<number | null>(null)

const notas = computed(() => (props.modelValue ? props.modelValue.split('\n').filter(Boolean) : []))
const lleno = computed(() => props.maxItems != null && notas.value.length >= props.maxItems)
const disponibles = computed(() => props.predefinidas.filter((n) => !notas.value.includes(n)))

function sync(lista: string[]) {
  emit('update:modelValue', lista.join('\n'))
}

function agregar(texto: string) {
  const limpio = texto.trim()
  if (!limpio || notas.value.includes(limpio) || lleno.value) return
  sync([...notas.value, limpio])
}

function quitar(i: number) {
  sync(notas.value.filter((_, idx) => idx !== i))
}

function confirmarCustom() {
  const t = custom.value.trim()
  if (t) agregar(t)
  cancelarCustom()
}

function cancelarCustom() {
  custom.value = ''
  agregando.value = false
}

function soltarEn(destino: number) {
  const origen = arrastrando.value
  arrastrando.value = null
  if (origen === null || origen === destino) return
  const lista = [...notas.value]
  const [mov] = lista.splice(origen, 1)
  lista.splice(destino, 0, mov)
  sync(lista)
}
</script>

<template>
  <div class="selector">
    <span v-if="maxItems != null" class="selector__contador" :class="{ 'is-lleno': lleno }">
      {{ notas.length }}/{{ maxItems }}{{ lleno ? ' — límite alcanzado' : '' }}
    </span>

    <div v-if="disponibles.length && !lleno" class="chips">
      <button v-for="n in disponibles" :key="n" type="button" class="chip" @click="agregar(n)">
        + {{ n }}
      </button>
    </div>

    <div v-if="notas.length" class="seleccionadas">
      <div
        v-for="(n, i) in notas"
        :key="n"
        class="nota"
        draggable="true"
        @dragstart="arrastrando = i"
        @dragover.prevent
        @drop="soltarEn(i)"
        @dragend="arrastrando = null"
      >
        <span class="nota__asa">⠿</span>
        <span class="nota__texto">{{ n }}</span>
        <button type="button" class="nota__quitar" @click="quitar(i)">×</button>
      </div>
    </div>

    <div v-if="!lleno && agregando" class="custom">
      <div class="custom__wrap">
        <textarea
          v-model="custom"
          class="ui-textarea ui-textarea--sm"
          :placeholder="placeholder"
          maxlength="100"
          @input="custom = capitalizar(custom)"
        />
        <span class="contador" :class="{ 'is-cerca': custom.length >= 90 }">
          {{ custom.length }}/100
        </span>
      </div>
      <div class="custom__acciones">
        <button type="button" class="mini mini--primary" @click="confirmarCustom">Agregar</button>
        <button type="button" class="mini" @click="cancelarCustom">Cancelar</button>
      </div>
    </div>
    <button v-else-if="!lleno" type="button" class="agregar" @click="agregando = true">
      + Nota personalizada
    </button>
  </div>
</template>

<style scoped>
.selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selector__contador {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
}

.selector__contador.is-lleno {
  color: var(--danger-solid);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px dashed var(--border);
  background: var(--bg);
  color: var(--muted);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  max-width: 320px;
  line-height: 1.4;
}

.chip:hover {
  border-color: var(--blue-mid);
  color: var(--navy);
}

.seleccionadas {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nota {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 10px;
  background: var(--blue-light);
  border: 1px solid var(--blue-mid);
  border-radius: 8px;
  cursor: grab;
}

.nota__asa {
  color: var(--blue);
  font-size: 13px;
  flex-shrink: 0;
  margin-top: 1px;
}

.nota__texto {
  flex: 1;
  font-size: 12px;
  color: var(--navy);
  line-height: 1.5;
}

.nota__quitar {
  border: none;
  background: none;
  color: var(--muted-2);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
  padding: 0;
}

.custom__wrap {
  position: relative;
}

.custom__wrap textarea {
  min-height: 60px;
  font-size: 12px;
  padding-bottom: 18px;
}

.contador {
  position: absolute;
  right: 6px;
  bottom: 8px;
  font-size: 9px;
  pointer-events: none;
  color: var(--muted-2);
}

.contador.is-cerca {
  color: var(--danger-solid);
}

.custom__acciones {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.mini {
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--muted);
  font-family: inherit;
  cursor: pointer;
}

.mini--primary {
  border: none;
  background: var(--blue);
  color: #fff;
  font-weight: 700;
}

.agregar {
  align-self: flex-start;
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 7px;
  border: 1px dashed var(--blue-mid);
  background: var(--white);
  color: var(--blue);
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}
</style>
