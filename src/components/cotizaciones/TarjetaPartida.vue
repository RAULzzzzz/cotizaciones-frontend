<script setup lang="ts">
import { ref } from 'vue'
import CampoForm from './CampoForm.vue'
import {
  UNIDADES,
  capitalizar,
  dinero,
  partidaTieneContenido,
  toTitleCase,
  type PartidaForm,
} from '@/data/cotizaciones'

const props = defineProps<{
  partida: PartidaForm
  indice: number
  total: number
  errores: Record<string, string>
}>()

const emit = defineEmits<{ quitar: [] }>()

const expandida = ref(false)
const confirmarEliminar = ref(false)
const inputImagen = ref<HTMLInputElement | null>(null)
const slotDestino = ref<1 | 2>(1)

const err = (campo: string) => props.errores[`partidas.${props.indice}.${campo}`]

function pedirEliminar() {
  if (partidaTieneContenido(props.partida)) confirmarEliminar.value = true
  else emit('quitar')
}

function eliminarConfirmado() {
  confirmarEliminar.value = false
  emit('quitar')
}

// Solo se aceptan dos decimales y máximo 10 caracteres, igual que el original.
function precio(campo: 'precioUnitarioCompra' | 'precioUnitarioVenta', valor: string) {
  if (/^\d*\.?\d{0,2}$/.test(valor) && valor.length <= 10) props.partida[campo] = valor
}

function descuento(valor: string) {
  const raw = valor.replace(/[^0-9]/g, '')
  props.partida.porcentajeDescuento = raw === '' ? 0 : Math.min(100, parseInt(raw, 10))
}

function abrirSelector(slot: 1 | 2) {
  slotDestino.value = slot
  inputImagen.value?.click()
}

function archivoElegido(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const url = URL.createObjectURL(file)
  if (slotDestino.value === 1) props.partida.imagenPreview = url
  else props.partida.imagenPreview2 = url
}

function quitarImagen(slot: 1 | 2) {
  if (slot === 1) props.partida.imagenPreview = null
  else props.partida.imagenPreview2 = null
}
</script>

<template>
  <div class="tarjeta">
    <input
      ref="inputImagen"
      type="file"
      accept="image/*"
      class="oculto"
      @change="archivoElegido"
    />

    <header class="tarjeta__head">
      <span class="tarjeta__num">{{ indice + 1 }}</span>
      <span class="tarjeta__nombre">{{ partida.descripcion || `Partida ${indice + 1}` }}</span>
      <span v-if="Number(partida.precioUnitarioVenta) > 0" class="tarjeta__importe">
        {{ dinero(Number(partida.cantidad || 0) * Number(partida.precioUnitarioVenta || 0)) }}
      </span>
      <button v-if="total > 1" type="button" class="tarjeta__borrar" @click="pedirEliminar">
        <i class="mdi mdi-trash-can-outline" />
      </button>
    </header>

    <div class="tarjeta__cuerpo">
      <div class="imagenes">
        <div v-for="slot in [1, 2] as const" :key="slot" class="slot">
          <template v-if="slot === 1 ? partida.imagenPreview : partida.imagenPreview2">
            <img :src="(slot === 1 ? partida.imagenPreview : partida.imagenPreview2) as string" alt="" />
            <button type="button" class="slot__quitar" @click="quitarImagen(slot)">
              <i class="mdi mdi-close" />
            </button>
          </template>
          <button v-else type="button" class="slot__vacio" @click="abrirSelector(slot)">
            <i class="mdi mdi-image-plus" />
            <span>Imagen {{ slot }}</span>
          </button>
        </div>
      </div>

      <div class="campos">
        <div class="grid grid--sku">
          <CampoForm label="SKU (código)">
            <div class="con-contador">
              <input
                v-model="partida.sku"
                class="ui-input ui-input--sm"
                placeholder="Opcional"
                maxlength="30"
                @input="partida.sku = partida.sku.toUpperCase()"
              />
              <span class="contador" :class="{ 'is-cerca': partida.sku.length >= 27 }">
                {{ partida.sku.length }}/30
              </span>
            </div>
          </CampoForm>

          <CampoForm label="Producto o servicio *" :error="err('descripcion')">
            <div class="con-contador">
              <input
                v-model="partida.descripcion"
                class="ui-input ui-input--sm"
                :class="{ 'is-error': err('descripcion') }"
                placeholder="Ej. Cambio de balatas delanteras"
                maxlength="100"
                @input="partida.descripcion = toTitleCase(partida.descripcion)"
              />
              <span class="contador" :class="{ 'is-cerca': partida.descripcion.length >= 90 }">
                {{ partida.descripcion.length }}/100
              </span>
            </div>
          </CampoForm>
        </div>

        <div class="grid grid--precios">
          <CampoForm label="Cantidad *" :error="err('cantidad')">
            <input
              v-model="partida.cantidad"
              type="number"
              min="1"
              step="1"
              class="ui-input ui-input--sm"
              :class="{ 'is-error': err('cantidad') }"
            />
          </CampoForm>

          <CampoForm label="Unidad *" :error="err('unidad')">
            <select
              v-model="partida.unidad"
              class="ui-select ui-select--sm"
              :class="{ 'is-error': err('unidad') }"
            >
              <option v-for="u in UNIDADES" :key="u.value" :value="u.value">{{ u.label }}</option>
            </select>
          </CampoForm>

          <CampoForm label="Costo compra / u. *" :error="err('precioUnitarioCompra')">
            <input
              :value="partida.precioUnitarioCompra"
              type="text"
              inputmode="decimal"
              maxlength="10"
              class="ui-input ui-input--sm"
              :class="{ 'is-error': err('precioUnitarioCompra') }"
              @input="precio('precioUnitarioCompra', ($event.target as HTMLInputElement).value)"
            />
          </CampoForm>

          <CampoForm label="Precio cliente / u. *" :error="err('precioUnitarioVenta')">
            <input
              :value="partida.precioUnitarioVenta"
              type="text"
              inputmode="decimal"
              maxlength="10"
              class="ui-input ui-input--sm"
              :class="{ 'is-error': err('precioUnitarioVenta') }"
              @input="precio('precioUnitarioVenta', ($event.target as HTMLInputElement).value)"
            />
          </CampoForm>
        </div>
      </div>
    </div>

    <div class="tarjeta__pie">
      <button type="button" class="expandir" @click="expandida = !expandida">
        <i class="mdi" :class="expandida ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        {{
          expandida
            ? 'Ocultar detalles adicionales'
            : 'Más detalles (especificaciones, tipo, descuento…)'
        }}
      </button>

      <div v-if="expandida" class="detalles">
        <div class="grid grid--detalles">
          <CampoForm label="Color (opc.)">
            <input
              v-model="partida.color"
              class="ui-input ui-input--sm"
              placeholder="Ej. Rojo, Negro"
              maxlength="20"
              @input="partida.color = capitalizar(partida.color)"
            />
          </CampoForm>
          <CampoForm label="Marca (opc.)">
            <input
              v-model="partida.marca"
              class="ui-input ui-input--sm"
              placeholder="Ej. Bosch, Gates, ACDelco"
              maxlength="20"
              @input="partida.marca = capitalizar(partida.marca)"
            />
          </CampoForm>
          <CampoForm label="Tipo">
            <select v-model="partida.tipoPartida" class="ui-select ui-select--sm">
              <option>Producto</option>
              <option>Servicio</option>
            </select>
          </CampoForm>
          <CampoForm label="Estado">
            <select v-model="partida.estadoArticulo" class="ui-select ui-select--sm">
              <option>Nuevo</option>
              <option>Reacondicionado</option>
              <option>Usado</option>
            </select>
          </CampoForm>
          <CampoForm
            label="Dto. %"
            :error="err('porcentajeDescuento')"
            ayuda="20 = 20% de descuento"
          >
            <input
              :value="partida.porcentajeDescuento === 0 ? '' : partida.porcentajeDescuento"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="ui-input ui-input--sm"
              @input="descuento(($event.target as HTMLInputElement).value)"
            />
          </CampoForm>
        </div>

        <div class="grid grid--textos">
          <CampoForm label="Especificaciones técnicas">
            <textarea
              v-model="partida.especificacionesTecnicas"
              class="ui-textarea ui-textarea--sm"
              placeholder="Medidas, material, compatibilidad, etc."
              maxlength="500"
              @input="partida.especificacionesTecnicas = capitalizar(partida.especificacionesTecnicas)"
            />
          </CampoForm>
          <CampoForm label="Garantía / tiempo de entrega">
            <textarea
              v-model="partida.tiempoEntrega"
              class="ui-textarea ui-textarea--sm"
              placeholder="Ej. Garantía 6 meses o 10,000 km"
              maxlength="500"
              @input="partida.tiempoEntrega = capitalizar(partida.tiempoEntrega)"
            />
          </CampoForm>
          <CampoForm label="Observaciones">
            <textarea
              v-model="partida.observaciones"
              class="ui-textarea ui-textarea--sm"
              maxlength="500"
              @input="partida.observaciones = capitalizar(partida.observaciones)"
            />
          </CampoForm>
        </div>

        <label class="check-compra">
          <input v-model="partida.requiereCompra" type="checkbox" class="ui-check" />
          Requiere compra o surtido especial
        </label>
      </div>
    </div>

    <!-- Confirmación de borrado -->
    <div v-if="confirmarEliminar" class="modal" @click.self="confirmarEliminar = false">
      <div class="modal__caja">
        <div class="modal__icono"><i class="mdi mdi-trash-can-outline" /></div>
        <div class="modal__titulo">¿Seguro que quieres eliminar esta partida?</div>
        <div class="modal__texto">
          <strong>{{ partida.descripcion || `Partida ${indice + 1}` }}</strong> tiene información
          capturada. Esta acción no se puede deshacer.
        </div>
        <div class="modal__acciones">
          <button type="button" class="ui-btn" @click="confirmarEliminar = false">Cancelar</button>
          <button type="button" class="ui-btn modal__borrar" @click="eliminarConfirmado">
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.oculto {
  display: none;
}

.tarjeta {
  border: 1.5px solid var(--border);
  border-radius: 12px;
  background: var(--white);
  overflow: hidden;
}

.tarjeta__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.tarjeta__num {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--blue-light);
  color: var(--blue);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.tarjeta__nombre {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tarjeta__importe {
  font-size: 12px;
  font-weight: 700;
  color: var(--success);
}

.tarjeta__borrar {
  border: 0;
  background: transparent;
  color: var(--danger-solid);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  font-size: 15px;
}

.tarjeta__cuerpo {
  padding: 16px;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: start;
}

.imagenes {
  display: flex;
  gap: 10px;
}

.slot {
  position: relative;
  width: 95px;
  height: 95px;
  flex-shrink: 0;
}

.slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 9px;
  border: 1px solid var(--border);
  display: block;
}

.slot__quitar {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: rgba(15, 23, 42, 0.65);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 13px;
}

.slot__vacio {
  width: 100%;
  height: 100%;
  border: 2px dashed var(--border);
  border-radius: 9px;
  background: var(--bg);
  color: var(--muted-2);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10px;
  font-family: inherit;
  font-weight: 600;
}

.slot__vacio .mdi {
  font-size: 20px;
}

.slot__vacio:hover {
  border-color: var(--blue-mid);
  color: var(--blue);
}

.campos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.grid {
  display: grid;
  gap: 10px;
}

.grid--sku {
  grid-template-columns: 170px 1fr;
}

.grid--precios {
  grid-template-columns: 80px 120px 1fr 1fr;
}

.grid--detalles {
  grid-template-columns: 160px 160px 120px 120px 100px;
}

.grid--textos {
  grid-template-columns: repeat(3, 1fr);
}

.con-contador {
  position: relative;
}

.con-contador .ui-input {
  padding-right: 46px;
}

.contador {
  position: absolute;
  right: 8px;
  bottom: 9px;
  font-size: 10px;
  pointer-events: none;
  color: var(--muted-2);
}

.contador.is-cerca {
  color: var(--danger-solid);
}

.tarjeta__pie {
  border-top: 1px solid var(--border);
}

.expandir {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
}

.detalles {
  padding: 4px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.check-compra {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
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

@media (max-width: 1100px) {
  .tarjeta__cuerpo {
    grid-template-columns: 1fr;
  }

  .grid--precios {
    grid-template-columns: 1fr 1fr;
  }

  .grid--detalles,
  .grid--textos {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .grid--sku,
  .grid--precios,
  .grid--detalles,
  .grid--textos {
    grid-template-columns: 1fr;
  }
}
</style>
