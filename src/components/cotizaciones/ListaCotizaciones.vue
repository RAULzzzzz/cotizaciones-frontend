<script setup lang="ts">
import { computed, ref } from 'vue'
import EstadoBadge from './EstadoBadge.vue'
import {
  COTIZACIONES,
  ESTADOS,
  dinero,
  fecha,
  type Cotizacion,
  type EstadoCotizacion,
} from '@/data/cotizaciones'

const emit = defineEmits<{ abrir: [Cotizacion]; nueva: [] }>()

const PAGE_SIZE = 5

const buscar = ref('')
const estado = ref<'' | EstadoCotizacion>('')
const pagina = ref(1)

const opcionesEstado = Object.keys(ESTADOS) as EstadoCotizacion[]

const filtradas = computed(() => {
  const q = buscar.value.trim().toLowerCase()
  return COTIZACIONES.filter((c) => {
    if (estado.value && c.estado !== estado.value) return false
    if (!q) return true
    return (
      c.folio.toLowerCase().includes(q) ||
      c.nombreComercial.toLowerCase().includes(q) ||
      c.atencionA.toLowerCase().includes(q)
    )
  })
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(filtradas.value.length / PAGE_SIZE)))

// Si un filtro deja la página actual fuera de rango, volvemos a la primera.
const paginaActual = computed(() => Math.min(pagina.value, totalPaginas.value))

const visibles = computed(() =>
  filtradas.value.slice((paginaActual.value - 1) * PAGE_SIZE, paginaActual.value * PAGE_SIZE),
)

const pendientes = computed(
  () => COTIZACIONES.filter((c) => c.estado === 'Borrador' || c.estado === 'ListaParaEnviar').length,
)
const aceptadas = computed(() => COTIZACIONES.filter((c) => c.estado === 'Aceptada').length)

const metricas = computed(() => [
  { icono: 'mdi-clock-outline', label: 'Por preparar', valor: pendientes.value, color: 'var(--warning)' },
  { icono: 'mdi-check-decagram-outline', label: 'Aceptadas', valor: aceptadas.value, color: 'var(--blue)' },
  { icono: 'mdi-file-document-multiple-outline', label: 'Total visible', valor: filtradas.value.length, color: 'var(--success)' },
])

function limpiarFiltros() {
  buscar.value = ''
  estado.value = ''
  pagina.value = 1
}
</script>

<template>
  <div class="ws">
    <div class="ws__head">
      <div class="ws__titles">
        <h2>Cotizaciones</h2>
        <p>Equipos, mercancía, consumibles y servicios para clientes externos</p>
      </div>
      <button class="btn btn--primary" @click="emit('nueva')">
        <i class="mdi mdi-file-plus-outline" /> Nueva cotización
      </button>
    </div>

    <div class="metricas">
      <div v-for="m in metricas" :key="m.label" class="metrica">
        <div class="metrica__icono" :style="{ background: `${m.color}18`, color: m.color }">
          <i class="mdi" :class="m.icono" />
        </div>
        <div>
          <div class="metrica__label">{{ m.label }}</div>
          <div class="metrica__valor" :style="{ color: m.color }">{{ m.valor }}</div>
        </div>
      </div>
    </div>

    <div class="filtros">
      <div class="filtros__buscar">
        <i class="mdi mdi-magnify" />
        <input
          v-model="buscar"
          placeholder="Buscar por folio, cliente o contacto"
          @input="pagina = 1"
        />
        <button v-if="buscar" class="filtros__limpiar" title="Limpiar búsqueda" @click="buscar = ''">
          <i class="mdi mdi-close" />
        </button>
      </div>
      <select v-model="estado" @change="pagina = 1">
        <option value="">Todos los estados</option>
        <option v-for="e in opcionesEstado" :key="e" :value="e">
          {{ ESTADOS[e].label ?? e }}
        </option>
      </select>
      <button class="filtros__refrescar" title="Restablecer filtros" @click="limpiarFiltros">
        <i class="mdi mdi-refresh" />
      </button>
    </div>

    <div class="ws__body">
      <div v-if="visibles.length === 0" class="vacio">
        <i class="mdi mdi-package-variant-closed" />
        <div class="vacio__titulo">No hay cotizaciones que coincidan</div>
        <div class="vacio__texto">Ajusta la búsqueda o el filtro de estado.</div>
      </div>

      <div v-else class="lista">
        <button
          v-for="(c, i) in visibles"
          :key="c.id"
          class="fila"
          :style="{ animationDelay: `${Math.min(i, 10) * 0.04}s` }"
          @click="emit('abrir', c)"
        >
          <div class="fila__folio">
            <strong>{{ c.folio }}</strong>
            <span>Versión {{ c.version }}</span>
          </div>
          <div class="fila__cliente">
            <strong>{{ c.nombreComercial }}</strong>
            <span>
              {{ c.tipoCliente }} · {{ c.partidas.length }}
              partida{{ c.partidas.length === 1 ? '' : 's' }}
            </span>
          </div>
          <div><EstadoBadge :estado="c.estado" /></div>
          <div class="fila__total">
            <strong>{{ dinero(c.total, c.moneda) }}</strong>
            <span>{{ fecha(c.vigenciaHasta) }}</span>
          </div>
          <i class="mdi mdi-chevron-right fila__chevron" />
        </button>
      </div>

      <div v-if="totalPaginas > 1" class="paginacion">
        <div class="paginacion__info">
          Página {{ paginaActual }} de {{ totalPaginas }} · {{ filtradas.length }}
          registro{{ filtradas.length === 1 ? '' : 's' }}
        </div>
        <div class="paginacion__botones">
          <button :disabled="paginaActual <= 1" @click="pagina = paginaActual - 1">‹</button>
          <button
            v-for="p in totalPaginas"
            :key="p"
            :class="{ 'is-active': p === paginaActual }"
            :disabled="p === paginaActual"
            @click="pagina = p"
          >
            {{ p }}
          </button>
          <button :disabled="paginaActual >= totalPaginas" @click="pagina = paginaActual + 1">
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ws {
  display: flex;
  flex-direction: column;
  padding: 24px 28px;
}

.ws__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.ws__titles {
  flex: 1;
}

.ws__titles h2 {
  margin: 0;
  font-size: 20px;
  color: var(--navy);
}

.ws__titles p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--navy);
}

.btn--primary {
  border: none;
  background: var(--blue);
  color: #fff;
}

.btn--primary:hover {
  background: var(--blue-hover);
}

.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metrica {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 15px 17px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.metrica__icono {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.metrica__label {
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.metrica__valor {
  font-size: 21px;
  font-weight: 750;
  margin-top: 3px;
}

.filtros {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px;
  display: flex;
  gap: 9px;
  margin-bottom: 14px;
}

.filtros__buscar {
  flex: 1;
  position: relative;
}

.filtros__buscar > .mdi-magnify {
  position: absolute;
  left: 11px;
  top: 10px;
  color: var(--muted-2);
  font-size: 16px;
}

.filtros input,
.filtros select {
  width: 100%;
  padding: 11px 12px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--white);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
}

.filtros input {
  padding-left: 34px;
  padding-right: 34px;
}

.filtros input:focus,
.filtros select:focus {
  border-color: var(--blue);
}

.filtros select {
  width: 190px;
  flex-shrink: 0;
}

.filtros__limpiar,
.filtros__refrescar {
  border: none;
  background: transparent;
  color: var(--muted-2);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.filtros__limpiar {
  position: absolute;
  right: 7px;
  top: 7px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
}

.filtros__refrescar {
  width: 39px;
  flex-shrink: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--navy);
  font-size: 16px;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.fila {
  width: 100%;
  text-align: left;
  display: grid;
  grid-template-columns: minmax(115px, 150px) minmax(190px, 1fr) minmax(105px, 130px) minmax(110px, 150px) 24px;
  gap: 16px;
  align-items: center;
  padding: 19px 20px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--white);
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  animation: filaDrop 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.fila:hover {
  transform: scale(1.006);
}

@keyframes filaDrop {
  0% {
    opacity: 0;
    transform: translateY(-14px) scale(0.98);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fila__folio strong {
  display: block;
  color: var(--navy);
  font-size: 14px;
}

.fila__folio span {
  color: var(--muted);
  font-size: 11px;
}

.fila__cliente {
  min-width: 0;
}

.fila__cliente strong {
  display: block;
  color: var(--text);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fila__cliente span {
  color: var(--muted);
  font-size: 12px;
}

.fila__total {
  text-align: right;
}

.fila__total strong {
  display: block;
  color: var(--navy);
  font-size: 15px;
}

.fila__total span {
  color: var(--muted);
  font-size: 11px;
}

.fila__chevron {
  color: var(--muted-2);
  font-size: 17px;
}

.vacio {
  padding: 60px 20px;
  text-align: center;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.vacio > .mdi {
  font-size: 34px;
  color: var(--muted-2);
}

.vacio__titulo {
  color: var(--navy);
  font-weight: 700;
  margin-top: 12px;
}

.vacio__texto {
  color: var(--muted);
  font-size: 12px;
  margin-top: 5px;
}

.paginacion {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.paginacion__info {
  font-size: 11px;
  color: var(--muted);
  font-weight: 700;
}

.paginacion__botones {
  display: flex;
  gap: 6px;
}

.paginacion__botones button {
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--navy);
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.paginacion__botones button.is-active {
  border-color: var(--blue);
  background: var(--blue);
  color: #fff;
  cursor: default;
}

.paginacion__botones button:disabled:not(.is-active) {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
