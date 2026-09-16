<script setup lang="ts">
import { computed, ref } from 'vue'
import { CLIENTES, type ClienteRegistrado } from '@/data/clientes'

const emit = defineEmits<{ nuevo: [] }>()

const PAGE_SIZE = 6

const buscar = ref('')
const pagina = ref(1)
const confirmarEliminar = ref<ClienteRegistrado | null>(null)

const filtrados = computed(() => {
  const q = buscar.value.trim().toLowerCase()
  if (!q) return CLIENTES
  return CLIENTES.filter(
    (c) =>
      c.nombreComercial.toLowerCase().includes(q) ||
      c.rfc.toLowerCase().includes(q) ||
      c.atencionA.toLowerCase().includes(q) ||
      c.correoContacto.toLowerCase().includes(q),
  )
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(filtrados.value.length / PAGE_SIZE)))
const paginaActual = computed(() => Math.min(pagina.value, totalPaginas.value))
const visibles = computed(() =>
  filtrados.value.slice((paginaActual.value - 1) * PAGE_SIZE, paginaActual.value * PAGE_SIZE),
)

function eliminarConfirmado() {
  if (!confirmarEliminar.value) return
  const i = CLIENTES.findIndex((c) => c.idCliente === confirmarEliminar.value!.idCliente)
  if (i !== -1) CLIENTES.splice(i, 1)
  confirmarEliminar.value = null
  if (paginaActual.value > totalPaginas.value) pagina.value = totalPaginas.value
}
</script>

<template>
  <div class="ws">
    <div class="ws__head">
      <div class="ws__titles">
        <h2>Clientes</h2>
        <p>Directorio de clientes registrados en el taller</p>
      </div>
      <button class="btn btn--primary" @click="emit('nuevo')">
        <i class="mdi mdi-account-plus-outline" /> Nuevo cliente
      </button>
    </div>

    <div class="filtros">
      <div class="filtros__buscar">
        <i class="mdi mdi-magnify" />
        <input
          v-model="buscar"
          placeholder="Buscar por nombre, RFC, correo o contacto"
          @input="pagina = 1"
        />
        <button v-if="buscar" class="filtros__limpiar" title="Limpiar búsqueda" @click="buscar = ''">
          <i class="mdi mdi-close" />
        </button>
      </div>
    </div>

    <div class="ws__body">
      <div v-if="visibles.length === 0" class="vacio">
        <i class="mdi mdi-account-search-outline" />
        <div class="vacio__titulo">No hay clientes que coincidan</div>
        <div class="vacio__texto">Ajusta la búsqueda o registra un cliente nuevo.</div>
      </div>

      <div v-else class="lista">
        <div
          v-for="(c, i) in visibles"
          :key="c.idCliente"
          class="fila"
          :style="{ animationDelay: `${Math.min(i, 10) * 0.04}s` }"
        >
          <div class="fila__id">
            <strong>#{{ c.idCliente }}</strong>
            <span>{{ c.tipoCliente }}</span>
          </div>
          <div class="fila__nombre">
            <strong>{{ c.nombreComercial }}</strong>
            <span>{{ c.atencionA || 'Sin contacto asignado' }}</span>
          </div>
          <div class="fila__datos">
            <span>{{ c.correoContacto || 'Sin correo' }}</span>
            <span>{{ c.telefonoContacto || 'Sin teléfono' }}</span>
          </div>
          <div class="fila__rfc">{{ c.rfc || '—' }}</div>
          <button
            type="button"
            class="fila__borrar"
            title="Eliminar cliente"
            @click="confirmarEliminar = c"
          >
            <i class="mdi mdi-trash-can-outline" />
          </button>
        </div>
      </div>

      <div v-if="totalPaginas > 1" class="paginacion">
        <div class="paginacion__info">
          Página {{ paginaActual }} de {{ totalPaginas }} · {{ filtrados.length }}
          registro{{ filtrados.length === 1 ? '' : 's' }}
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

    <!-- Confirmación de borrado -->
    <div v-if="confirmarEliminar" class="modal" @click.self="confirmarEliminar = null">
      <div class="modal__caja">
        <div class="modal__icono"><i class="mdi mdi-trash-can-outline" /></div>
        <div class="modal__titulo">¿Eliminar este cliente?</div>
        <div class="modal__texto">
          <strong>{{ confirmarEliminar.nombreComercial }}</strong> se quitará del directorio. Esta
          acción no se puede deshacer.
        </div>
        <div class="modal__acciones">
          <button type="button" class="ui-btn" @click="confirmarEliminar = null">Cancelar</button>
          <button type="button" class="ui-btn modal__borrar" @click="eliminarConfirmado">
            Sí, eliminar
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

.filtros input {
  width: 100%;
  padding: 11px 34px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--white);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
}

.filtros input:focus {
  border-color: var(--blue);
}

.filtros__limpiar {
  position: absolute;
  right: 7px;
  top: 7px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--muted-2);
  cursor: pointer;
  display: grid;
  place-items: center;
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
  grid-template-columns: 90px minmax(190px, 1fr) minmax(150px, 1fr) 120px 36px;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--white);
  font-family: inherit;
  animation: filaDrop 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
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

.fila__id {
  display: flex;
  flex-direction: column;
}

.fila__id strong {
  color: var(--navy);
  font-size: 13px;
}

.fila__id span {
  color: var(--muted);
  font-size: 11px;
}

.fila__nombre {
  min-width: 0;
}

.fila__nombre strong {
  display: block;
  color: var(--text);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fila__nombre span {
  color: var(--muted);
  font-size: 12px;
}

.fila__datos {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 12px;
  color: var(--muted);
}

.fila__datos span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fila__rfc {
  font-size: 12px;
  color: var(--muted);
  font-family: ui-monospace, monospace;
}

.fila__borrar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 15px;
}

.fila__borrar:hover {
  color: var(--danger-solid);
  border-color: var(--danger-bd);
  background: var(--danger-bg);
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

.modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal__caja {
  background: var(--white);
  border-radius: 14px;
  width: 100%;
  max-width: 380px;
  padding: 28px 28px 22px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.modal__icono {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: var(--danger-bg);
  border: 1px solid var(--danger-bd);
  display: grid;
  place-items: center;
  color: var(--danger-solid);
  font-size: 22px;
}

.modal__titulo {
  font-size: 15px;
  font-weight: 700;
  color: var(--navy);
  text-align: center;
  margin-bottom: 8px;
}

.modal__texto {
  font-size: 13px;
  color: var(--muted);
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal__texto strong {
  color: var(--navy);
}

.modal__acciones {
  display: flex;
  gap: 10px;
}

.modal__acciones .ui-btn {
  flex: 1;
  padding: 9px;
}

.modal__borrar {
  border: none;
  background: var(--danger-solid);
  color: #fff;
}

@media (max-width: 800px) {
  .fila {
    grid-template-columns: minmax(0, 1fr) 36px;
  }

  .fila__id,
  .fila__rfc {
    display: none;
  }
}
</style>
