<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import CampoForm from './CampoForm.vue'
import PasoIndicador from './PasoIndicador.vue'
import ResumenTotales from './ResumenTotales.vue'
import SelectorNotas from './SelectorNotas.vue'
import TarjetaPartida from './TarjetaPartida.vue'
import {
  CONDICIONES_PREDEFINIDAS,
  MAX_PARTIDAS,
  METODOS_PAGO_PREDEFINIDOS,
  NOTAS_PREDEFINIDAS,
  TIPOS_CLIENTE,
  formatTel,
  formularioVacio,
  partidaVacia,
  toTitleCase,
} from '@/data/cotizaciones'
import { CLIENTES, type ClienteRegistrado } from '@/data/clientes'

const emit = defineEmits<{ volver: []; guardado: [] }>()

const formulario = reactive(formularioVacio())
const errores = reactive<Record<string, string>>({})
const paso = ref(0)
const maxAlcanzado = ref(0)
const guardando = ref(false)
const guardado = ref(false)

// Búsqueda de cliente registrado
const ligarCliente = ref(false)
const clienteBusqueda = ref('')
const clienteSeleccionado = ref<ClienteRegistrado | null>(null)

const hoy = new Date().toISOString().slice(0, 10)

const sugeridos = computed(() => {
  const q = clienteBusqueda.value.trim().toLowerCase()
  if (!ligarCliente.value || !q || clienteSeleccionado.value) return []
  return CLIENTES.filter(
    (c) =>
      String(c.idCliente).includes(q) ||
      c.nombreComercial.toLowerCase().includes(q) ||
      c.rfc.toLowerCase().includes(q) ||
      c.correoContacto.toLowerCase().includes(q) ||
      c.telefonoContacto.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
  ).slice(0, 6)
})

// Cuando la cotización queda ligada a un cliente, su identidad no se edita a mano.
const identidadBloqueada = computed(() => Boolean(clienteSeleccionado.value))

// Va en el script y no en el template porque lleva comillas dobles dentro.
const placeholderBuscador = computed(() =>
  ligarCliente.value
    ? 'Buscar por código de cliente, nombre, RFC, correo o teléfono'
    : 'Activa "Buscar cliente" para habilitar la búsqueda',
)

function alternarLigarCliente() {
  if (!ligarCliente.value) {
    clienteBusqueda.value = ''
    desvincularCliente()
  }
}

function limpiarErrores() {
  for (const k of Object.keys(errores)) delete errores[k]
}

function seleccionarCliente(c: ClienteRegistrado) {
  clienteSeleccionado.value = c
  clienteBusqueda.value = ''
  formulario.idCliente = c.idCliente
  formulario.tipoCliente = c.tipoCliente
  formulario.nombreComercial = c.nombreComercial
  formulario.atencionA = c.atencionA
  formulario.rfc = c.rfc
  formulario.correoContacto = c.correoContacto
  formulario.telefonoContacto = c.telefonoContacto
  delete errores.clienteRegistrado
}

function desvincularCliente() {
  clienteSeleccionado.value = null
  formulario.idCliente = null
}

function agregarPartida() {
  if (formulario.partidas.length >= MAX_PARTIDAS) return
  formulario.partidas.push(partidaVacia())
}

function quitarPartida(i: number) {
  formulario.partidas.splice(i, 1)
}

/* ── Validación por paso ── */

function validarPaso0() {
  limpiarErrores()
  if (ligarCliente.value && !formulario.idCliente)
    errores.clienteRegistrado =
      'Busca y selecciona un cliente de la lista, o desactiva "Ligar a cliente registrado" para capturarlo manualmente.'
  if (!formulario.nombreComercial.trim())
    errores.nombreComercial = 'El nombre de la empresa es obligatorio para continuar.'
  if (!formulario.atencionA.trim())
    errores.atencionA = 'Indica a quién va dirigida la cotización.'
  if (formulario.telefonoContacto.replace(/\D/g, '').length < 10)
    errores.telefonoContacto = 'Ingresa un teléfono válido de 10 dígitos.'
  if (!formulario.vigenciaHasta)
    errores.vigenciaHasta = 'Indica la fecha de vigencia de la cotización.'
  else if (formulario.vigenciaHasta < hoy)
    errores.vigenciaHasta = 'La fecha de vigencia no puede ser anterior a hoy.'
  if (formulario.correoContacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correoContacto))
    errores.correoContacto = 'Correo inválido, ej. ventas@empresa.com'
  return Object.keys(errores).length === 0
}

function validarPaso1() {
  limpiarErrores()
  formulario.partidas.forEach((p, i) => {
    const pre = `partidas.${i}.`
    const num = i + 1
    if (!p.descripcion.trim())
      errores[`${pre}descripcion`] = `Partida ${num}: escribe el nombre del producto o servicio.`
    if (!p.unidad.trim())
      errores[`${pre}unidad`] = `Partida ${num}: indica la unidad (PZA, CAJA, SERVICIO…).`
    if (Number(p.cantidad) <= 0)
      errores[`${pre}cantidad`] = `Partida ${num}: la cantidad debe ser mayor a cero.`
    if (Number(p.precioUnitarioCompra) <= 0)
      errores[`${pre}precioUnitarioCompra`] = `Partida ${num}: indica el costo de compra.`
    if (Number(p.precioUnitarioVenta) <= 0)
      errores[`${pre}precioUnitarioVenta`] = `Partida ${num}: indica el precio de venta al cliente.`
    else if (Number(p.precioUnitarioVenta) < Number(p.precioUnitarioCompra))
      errores[`${pre}precioUnitarioVenta`] = 'El precio de venta no puede ser menor al costo.'
  })
  return Object.keys(errores).length === 0
}

function validarPaso2() {
  limpiarErrores()
  if (Number(formulario.porcentajeIva) < 0 || Number(formulario.porcentajeIva) > 100)
    errores.porcentajeIva = 'Entre 0 y 100%.'
  if (
    formulario.porcentajeAnticipo !== '' &&
    (Number(formulario.porcentajeAnticipo) < 0 || Number(formulario.porcentajeAnticipo) > 100)
  )
    errores.porcentajeAnticipo = 'Entre 0 y 100%.'
  if (!formulario.tiempoEntrega.trim())
    errores.tiempoEntrega = 'Indica el plazo estimado de entrega.'
  if (!formulario.condicionesPago.trim())
    errores.condicionesPago = 'Selecciona o escribe al menos una condición de pago.'
  if (!formulario.metodosPago.trim()) errores.metodosPago = 'Método de pago obligatorio.'
  return Object.keys(errores).length === 0
}

function irAPaso(destino: number) {
  if (destino > maxAlcanzado.value) return
  limpiarErrores()
  paso.value = destino
}

function siguiente() {
  if (paso.value === 0 && !validarPaso0()) return
  if (paso.value === 1 && !validarPaso1()) return
  paso.value += 1
  maxAlcanzado.value = Math.max(maxAlcanzado.value, paso.value)
}

async function guardar() {
  if (guardando.value) return
  // Se validan los tres pasos: el usuario pudo saltar hacia atrás y romper algo.
  if (!validarPaso0()) {
    paso.value = 0
    return
  }
  if (!validarPaso1()) {
    paso.value = 1
    return
  }
  if (!validarPaso2()) return

  guardando.value = true
  // TODO: POST /api/cotizaciones cuando exista el backend.
  await new Promise((r) => setTimeout(r, 700))
  guardando.value = false
  guardado.value = true
  setTimeout(() => emit('guardado'), 1200)
}
</script>

<template>
  <form class="form" novalidate @submit.prevent>
    <header class="form__head">
      <button type="button" class="icon-btn" @click="emit('volver')">
        <i class="mdi mdi-arrow-left" />
      </button>
      <div>
        <h2>Nueva cotización</h2>
        <p>Refacciones, mano de obra y servicios de taller</p>
      </div>
    </header>

    <PasoIndicador :paso="paso" :max-alcanzado="maxAlcanzado" @ir="irAPaso" />

    <div class="form__layout">
      <div class="form__col">
        <!-- ── PASO 0: CLIENTE ── -->
        <section v-if="paso === 0" class="panel">
          <div class="panel__titulo">
            <i class="mdi mdi-office-building-outline" />
            <span>¿A quién va dirigida la cotización?</span>
          </div>

          <div class="ligar">
            <div class="ligar__cabecera">
              <div>
                <div class="ligar__label">Ligar a cliente registrado</div>
                <div class="ligar__ayuda">
                  {{
                    ligarCliente
                      ? 'Busca y selecciona un cliente existente para vincularlo a esta cotización.'
                      : 'Activa esta opción para buscar y vincular un cliente existente del sistema.'
                  }}
                </div>
              </div>
              <label class="ligar__check">
                <input
                  v-model="ligarCliente"
                  type="checkbox"
                  class="ui-check"
                  @change="alternarLigarCliente"
                />
                Buscar cliente
              </label>
            </div>

            <div v-if="errores.clienteRegistrado" class="ligar__error">
              {{ errores.clienteRegistrado }}
            </div>

            <div class="buscador" :class="{ 'is-off': !ligarCliente }">
              <i class="mdi mdi-magnify" />
              <input
                v-model="clienteBusqueda"
                class="ui-input"
                :disabled="!ligarCliente"
                :placeholder="placeholderBuscador"
              />
              <div v-if="sugeridos.length" class="sugerencias">
                <button
                  v-for="c in sugeridos"
                  :key="c.idCliente"
                  type="button"
                  class="sugerencia"
                  @click="seleccionarCliente(c)"
                >
                  <span class="sugerencia__info">
                    <strong>{{ c.nombreComercial }}</strong>
                    <span>
                      Código {{ c.idCliente }} · {{ c.tipoCliente }} · {{ c.rfc }} ·
                      {{ c.correoContacto }}
                    </span>
                  </span>
                  <i class="mdi mdi-chevron-right" />
                </button>
              </div>
            </div>

            <div v-if="clienteSeleccionado" class="ligado">
              <div class="ligado__info">
                <div class="ligado__id">Ligado a cliente #{{ clienteSeleccionado.idCliente }}</div>
                <div class="ligado__nombre">{{ clienteSeleccionado.nombreComercial }}</div>
              </div>
              <button type="button" class="ligado__quitar" @click="desvincularCliente">
                Quitar liga
              </button>
            </div>
          </div>

          <div class="grid grid--tipo">
            <CampoForm label="Tipo de cliente">
              <select
                v-model="formulario.tipoCliente"
                class="ui-select"
                :disabled="identidadBloqueada"
              >
                <option v-for="t in TIPOS_CLIENTE" :key="t">{{ t }}</option>
              </select>
            </CampoForm>

            <CampoForm label="Nombre de la empresa / cliente *" :error="errores.nombreComercial">
              <div class="con-contador">
                <input
                  v-model="formulario.nombreComercial"
                  class="ui-input"
                  :class="{ 'is-error': errores.nombreComercial }"
                  :disabled="identidadBloqueada"
                  placeholder="Ej. Colegio San Nicolás S.C."
                  maxlength="45"
                  @input="formulario.nombreComercial = toTitleCase(formulario.nombreComercial)"
                />
                <span
                  class="contador"
                  :class="{ 'is-cerca': formulario.nombreComercial.length >= 40 }"
                >
                  {{ formulario.nombreComercial.length }}/45
                </span>
              </div>
            </CampoForm>
          </div>

          <div class="grid grid--2">
            <CampoForm
              label="Atención a *"
              :error="errores.atencionA"
              ayuda="Nombre de quien recibirá o autorizará la cotización."
            >
              <div class="con-contador">
                <input
                  v-model="formulario.atencionA"
                  class="ui-input"
                  :class="{ 'is-error': errores.atencionA }"
                  :disabled="identidadBloqueada"
                  placeholder="Ej. Lic. Ana Martínez"
                  maxlength="45"
                  @input="formulario.atencionA = toTitleCase(formulario.atencionA)"
                />
                <span class="contador" :class="{ 'is-cerca': formulario.atencionA.length >= 40 }">
                  {{ formulario.atencionA.length }}/45
                </span>
              </div>
            </CampoForm>

            <CampoForm label="RFC (opcional)">
              <input
                v-model="formulario.rfc"
                class="ui-input rfc"
                placeholder="Ej. XAXX010101000"
                maxlength="13"
                @input="formulario.rfc = formulario.rfc.toUpperCase().replace(/[^A-Z0-9&]/g, '')"
              />
            </CampoForm>
          </div>

          <div class="grid grid--2">
            <CampoForm label="Correo electrónico (opcional)" :error="errores.correoContacto">
              <input
                v-model="formulario.correoContacto"
                type="email"
                class="ui-input"
                :class="{ 'is-error': errores.correoContacto }"
                placeholder="contacto@empresa.com"
                maxlength="40"
              />
            </CampoForm>

            <CampoForm label="Teléfono *" :error="errores.telefonoContacto">
              <div class="con-contador">
                <input
                  :value="formulario.telefonoContacto"
                  class="ui-input"
                  :class="{ 'is-error': errores.telefonoContacto }"
                  placeholder="773 185 1363"
                  inputmode="numeric"
                  maxlength="12"
                  @input="
                    formulario.telefonoContacto = formatTel(
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />
                <span
                  class="contador"
                  :class="{
                    'is-ok': formulario.telefonoContacto.replace(/\D/g, '').length === 10,
                  }"
                >
                  {{ formulario.telefonoContacto.replace(/\D/g, '').length }}/10
                </span>
              </div>
            </CampoForm>
          </div>

          <CampoForm label="Cotización válida hasta *" :error="errores.vigenciaHasta">
            <input
              v-model="formulario.vigenciaHasta"
              type="date"
              :min="hoy"
              class="ui-input fecha"
              :class="{ 'is-error': errores.vigenciaHasta }"
            />
          </CampoForm>
        </section>

        <!-- ── PASO 1: PRODUCTOS ── -->
        <section v-else-if="paso === 1" class="productos">
          <label class="iva">
            <input v-model="formulario.preciosIncluyenIva" type="checkbox" class="ui-check" />
            Los precios capturados ya incluyen IVA
          </label>

          <TarjetaPartida
            v-for="(p, i) in formulario.partidas"
            :key="i"
            :partida="p"
            :indice="i"
            :total="formulario.partidas.length"
            :errores="errores"
            @quitar="quitarPartida(i)"
          />

          <div v-if="formulario.partidas.length >= MAX_PARTIDAS" class="tope">
            Llegaste al máximo de {{ MAX_PARTIDAS }} partidas por cotización. Si necesitas más,
            divide el pedido en otra cotización.
          </div>
          <button v-else type="button" class="agregar-partida" @click="agregarPartida">
            <i class="mdi mdi-plus" /> Agregar otra partida
          </button>
        </section>

        <!-- ── PASO 2: CONDICIONES ── -->
        <section v-else class="panel">
          <div class="panel__titulo"><span>Condiciones comerciales</span></div>

          <div class="grid grid--3">
            <CampoForm label="Moneda">
              <select v-model="formulario.moneda" class="ui-select">
                <option>MXN</option>
                <option>USD</option>
              </select>
            </CampoForm>

            <CampoForm label="IVA general %" :error="errores.porcentajeIva">
              <input
                v-model.number="formulario.porcentajeIva"
                type="number"
                min="0"
                max="100"
                class="ui-input"
                :class="{ 'is-error': errores.porcentajeIva }"
              />
            </CampoForm>

            <CampoForm
              label="Anticipo requerido %"
              :error="errores.porcentajeAnticipo"
              ayuda="Déjalo vacío si no se requiere anticipo."
            >
              <input
                v-model="formulario.porcentajeAnticipo"
                type="number"
                min="0"
                max="100"
                class="ui-input"
                :class="{ 'is-error': errores.porcentajeAnticipo }"
              />
            </CampoForm>
          </div>

          <CampoForm label="Plazo estimado de entrega *" :error="errores.tiempoEntrega">
            <div class="con-contador">
              <input
                v-model="formulario.tiempoEntrega"
                class="ui-input"
                :class="{ 'is-error': errores.tiempoEntrega }"
                placeholder="Ej. 3 a 5 días hábiles"
                maxlength="100"
                @input="formulario.tiempoEntrega = toTitleCase(formulario.tiempoEntrega)"
              />
              <span class="contador" :class="{ 'is-cerca': formulario.tiempoEntrega.length >= 90 }">
                {{ formulario.tiempoEntrega.length }}/100
              </span>
            </div>
          </CampoForm>

          <div class="grid grid--2">
            <CampoForm
              label="Condiciones de pago *"
              :error="errores.condicionesPago"
              :ayuda="
                errores.condicionesPago
                  ? undefined
                  : 'Arrastra para reordenar · Selecciona o escribe las condiciones aplicables.'
              "
            >
              <SelectorNotas
                v-model="formulario.condicionesPago"
                :predefinidas="CONDICIONES_PREDEFINIDAS"
                :max-items="3"
              />
            </CampoForm>

            <CampoForm
              label="Notas adicionales"
              ayuda="Arrastra para reordenar · Aparecen al pie de la cotización impresa."
            >
              <SelectorNotas
                v-model="formulario.notasComerciales"
                :predefinidas="NOTAS_PREDEFINIDAS"
                :max-items="5"
              />
            </CampoForm>

            <CampoForm
              label="Métodos de pago *"
              :error="errores.metodosPago"
              :ayuda="
                errores.metodosPago
                  ? undefined
                  : 'Arrastra para reordenar · Selecciona los bancos que apliquen.'
              "
            >
              <SelectorNotas
                v-model="formulario.metodosPago"
                :predefinidas="METODOS_PAGO_PREDEFINIDOS"
                placeholder="Banco — CLABE: … — Titular: …"
              />
            </CampoForm>
          </div>
        </section>

        <!-- Navegación -->
        <div class="nav">
          <button v-if="paso > 0" type="button" class="ui-btn" @click="irAPaso(paso - 1)">
            <i class="mdi mdi-arrow-left" /> Anterior
          </button>
          <span v-else />

          <button v-if="paso < 2" type="button" class="ui-btn ui-btn--primary" @click="siguiente">
            Siguiente <i class="mdi mdi-arrow-right" />
          </button>
          <button
            v-else
            type="button"
            class="ui-btn ui-btn--primary guardar"
            :disabled="guardando"
            @click="guardar"
          >
            <span v-if="guardando" class="spinner" />
            <template v-else><i class="mdi mdi-check" /> Guardar cotización</template>
          </button>
        </div>
      </div>

      <ResumenTotales :formulario="formulario" />
    </div>

    <!-- Confirmación de guardado -->
    <div v-if="guardado" class="exito">
      <div class="exito__caja">
        <div class="exito__circulo"><i class="mdi mdi-check" /></div>
        <div class="exito__titulo">Cotización creada con éxito</div>
        <div class="exito__nota">(demo — todavía no se guarda en base de datos)</div>
      </div>
    </div>
  </form>
</template>

<style scoped>
.form {
  padding: 24px 28px;
}

.form__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.form__head h2 {
  margin: 0;
  font-size: 20px;
  color: var(--navy);
}

.form__head p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 12px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--navy);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 17px;
  flex-shrink: 0;
}

.form__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 18px;
  align-items: start;
}

.form__col {
  min-width: 0;
}

.panel {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: pasoFade 0.32s ease-out both;
}

@keyframes pasoFade {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel__titulo {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--navy);
  font-size: 15px;
  font-weight: 700;
}

.panel__titulo .mdi {
  font-size: 18px;
}

/* Ligar cliente */
.ligar {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

.ligar__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.ligar__label {
  font-size: 12px;
  font-weight: 800;
  color: var(--navy);
}

.ligar__ayuda {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}

.ligar__check {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
}

.ligar__error {
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--danger-solid);
}

.buscador {
  position: relative;
}

.buscador.is-off {
  opacity: 0.45;
}

.buscador > .mdi {
  position: absolute;
  left: 12px;
  top: 11px;
  color: var(--muted-2);
  pointer-events: none;
  font-size: 16px;
}

.buscador .ui-input {
  padding-left: 36px;
}

.sugerencias {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 9px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.13);
  overflow: hidden;
}

.sugerencia {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--border);
  background: var(--white);
  padding: 11px 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-family: inherit;
}

.sugerencia:last-child {
  border-bottom: none;
}

.sugerencia:hover {
  background: var(--bg);
}

.sugerencia__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sugerencia__info strong {
  color: var(--navy);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sugerencia__info span {
  color: var(--muted);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sugerencia .mdi {
  color: var(--muted-2);
  flex-shrink: 0;
}

.ligado {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 11px;
  background: var(--blue-light);
  border: 1px solid var(--blue-mid);
  border-radius: 8px;
}

.ligado__id {
  font-size: 11px;
  font-weight: 800;
  color: var(--blue);
}

.ligado__nombre {
  color: var(--navy);
  font-size: 12px;
  font-weight: 700;
}

.ligado__quitar {
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--muted);
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 750;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
}

/* Grids */
.grid {
  display: grid;
  gap: 14px;
}

.grid--tipo {
  grid-template-columns: 180px 1fr;
}

.grid--2 {
  grid-template-columns: 1fr 1fr;
}

.grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

.con-contador {
  position: relative;
}

.con-contador .ui-input {
  padding-right: 48px;
}

.contador {
  position: absolute;
  right: 8px;
  bottom: 10px;
  font-size: 10px;
  pointer-events: none;
  color: var(--muted-2);
}

.contador.is-cerca {
  color: var(--danger-solid);
}

.contador.is-ok {
  color: var(--success);
}

.rfc {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fecha {
  max-width: 220px;
}

/* Paso productos */
.productos {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: pasoFade 0.32s ease-out both;
}

.iva {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
}

.agregar-partida {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 2px dashed var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--blue);
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
}

.agregar-partida:hover {
  border-color: var(--blue-mid);
}

.tope {
  text-align: center;
  padding: 14px;
  border: 1.5px dashed var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
}

/* Navegación */
.nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.guardar {
  min-width: 178px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Éxito */
.exito {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(15, 23, 42, 0.46);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.exito__caja {
  width: min(400px, 100%);
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
  padding: 40px 28px;
  text-align: center;
}

.exito__circulo {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--success-bg);
  border: 2px solid var(--success);
  color: var(--success);
  display: grid;
  place-items: center;
  font-size: 28px;
  animation: pop 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes pop {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.exito__titulo {
  font-size: 15px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 4px;
}

.exito__nota {
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 1000px) {
  .form__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 700px) {
  .grid--tipo,
  .grid--2,
  .grid--3 {
    grid-template-columns: 1fr;
  }
}
</style>
