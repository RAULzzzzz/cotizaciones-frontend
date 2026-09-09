<script setup lang="ts">
import { computed } from 'vue'
import EstadoBadge from './EstadoBadge.vue'
import ChipCompra from './ChipCompra.vue'
import {
  ESTADOS,
  TRANSICIONES,
  dinero,
  fecha,
  type Cotizacion,
  type EstadoCotizacion,
} from '@/data/cotizaciones'

const props = defineProps<{ cotizacion: Cotizacion }>()
const emit = defineEmits<{ volver: []; cambiarEstado: [EstadoCotizacion] }>()

const siguientes = computed(() => TRANSICIONES[props.cotizacion.estado] ?? [])

const datos = computed(() => [
  { label: 'Cliente', valor: props.cotizacion.nombreComercial },
  { label: 'Atención', valor: props.cotizacion.atencionA || '—' },
  { label: 'Vigencia', valor: fecha(props.cotizacion.vigenciaHasta) },
  { label: 'Moneda', valor: props.cotizacion.moneda },
])
</script>

<template>
  <div class="detalle">
    <header class="detalle__head">
      <button class="icon-btn" title="Volver" @click="emit('volver')">
        <i class="mdi mdi-arrow-left" />
      </button>
      <div class="detalle__ident">
        <div class="detalle__linea">
          <h2>{{ cotizacion.folio }}</h2>
          <EstadoBadge :estado="cotizacion.estado" />
          <span class="detalle__version">Versión {{ cotizacion.version }}</span>
        </div>
        <p>{{ cotizacion.nombreComercial }} · {{ cotizacion.nombreAsesor }}</p>
      </div>
      <button class="btn btn--primary">
        <i class="mdi mdi-printer" /> Imprimir / PDF
      </button>
      <button class="btn">
        <i class="mdi mdi-pencil" /> Editar
      </button>
    </header>

    <div class="detalle__body">
      <div class="detalle__col">
        <section class="card card--datos">
          <div v-for="d in datos" :key="d.label">
            <div class="etiqueta">{{ d.label }}</div>
            <div class="valor">{{ d.valor }}</div>
          </div>
        </section>

        <section class="card card--partidas">
          <div class="card__titulo">Productos cotizados</div>
          <div
            v-for="(p, i) in cotizacion.partidas"
            :key="p.id"
            class="partida"
            :style="{ animationDelay: `${Math.min(i, 10) * 0.04}s` }"
          >
            <span class="partida__num">{{ p.numeroPartida }}</span>
            <div class="partida__info">
              <div class="partida__linea">
                <strong>{{ p.descripcion }}</strong>
                <ChipCompra :requiere-compra="p.requiereCompra" :estado-compra="p.estadoCompra" />
              </div>
              <div class="partida__meta">
                {{ p.cantidad }} {{ p.unidad }}<template v-if="p.sku"> · {{ p.sku }}</template>
              </div>
              <div v-if="p.especificacionesTecnicas" class="partida__specs">
                {{ p.especificacionesTecnicas }}
              </div>
              <div v-if="p.estadoCompra === 'Cancelada'" class="partida__alerta">
                ⚠ Compra cancelada — esta partida no será surtida
              </div>
            </div>
            <div class="partida__precio">{{ dinero(p.precioUnitarioVenta, cotizacion.moneda) }}</div>
            <strong class="partida__importe">{{ dinero(p.importe, cotizacion.moneda) }}</strong>
          </div>
        </section>
      </div>

      <div class="detalle__col detalle__col--lateral">
        <section class="totales">
          <div class="totales__fila">
            <span>Subtotal</span><span>{{ dinero(cotizacion.subtotal, cotizacion.moneda) }}</span>
          </div>
          <div class="totales__fila">
            <span>IVA</span><span>{{ dinero(cotizacion.impuestos, cotizacion.moneda) }}</span>
          </div>
          <div class="totales__total">
            <span>Total</span>
            <strong>{{ dinero(cotizacion.total, cotizacion.moneda) }}</strong>
          </div>
          <div class="totales__utilidad">
            <span>Utilidad estimada</span>
            <strong>{{ dinero(cotizacion.utilidadEstimada, cotizacion.moneda) }}</strong>
          </div>
        </section>

        <section v-if="siguientes.length" class="card card--acciones">
          <div class="card__titulo card__titulo--plano">Siguiente acción</div>
          <button
            v-for="e in siguientes"
            :key="e"
            class="accion"
            :style="{ background: ESTADOS[e].bg, color: ESTADOS[e].color, borderColor: ESTADOS[e].bg }"
            @click="emit('cambiarEstado', e)"
          >
            <span>{{ ESTADOS[e].label ?? e }}</span>
            <i class="mdi mdi-chevron-right" />
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detalle {
  display: flex;
  flex-direction: column;
  animation: detalleIn 0.25s ease-out;
}

@keyframes detalleIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.detalle__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 28px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-wrap: wrap;
}

.detalle__ident {
  flex: 1;
  min-width: 0;
}

.detalle__linea {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.detalle__linea h2 {
  margin: 0;
  color: var(--navy);
  font-size: 20px;
}

.detalle__version {
  color: var(--muted);
  font-size: 11px;
}

.detalle__ident p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.icon-btn {
  width: 36px;
  height: 36px;
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

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--navy);
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.btn--primary {
  border: none;
  background: var(--blue);
  color: #fff;
}

.btn--primary:hover {
  background: var(--blue-hover);
}

.detalle__body {
  padding: 20px 28px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  align-items: start;
}

.detalle__col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.card--datos {
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.etiqueta {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.valor {
  font-size: 13px;
  color: var(--text);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.card--partidas {
  overflow: hidden;
}

.card__titulo {
  padding: 15px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
}

.card__titulo--plano {
  padding: 0 0 10px;
  border-bottom: none;
  font-size: 12px;
}

.partida {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 90px 120px;
  gap: 14px;
  align-items: center;
  animation: partidaDrop 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.partida:last-child {
  border-bottom: none;
}

@keyframes partidaDrop {
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

.partida__num {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--blue-light);
  color: var(--blue);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
}

.partida__linea {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.partida__linea strong {
  font-size: 13px;
  color: var(--text);
}

.partida__meta {
  font-size: 11px;
  color: var(--muted);
  margin-top: 3px;
}

.partida__specs {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
  font-style: italic;
}

.partida__alerta {
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--danger-bg);
  border: 1px solid var(--danger-bd);
  font-size: 10px;
  font-weight: 800;
  color: var(--danger-solid);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.partida__precio {
  font-size: 12px;
  color: var(--muted);
  text-align: right;
}

.partida__importe {
  font-size: 13px;
  color: var(--navy);
  text-align: right;
}

.totales {
  padding: 18px;
  border-radius: 12px;
  background: var(--blue);
  color: #fff;
}

.totales__fila {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 8px;
}

.totales__total {
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  padding-top: 12px;
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  font-size: 12px;
}

.totales__total strong {
  font-size: 23px;
}

.totales__utilidad {
  margin-top: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.09);
  padding: 9px 10px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.totales__utilidad strong {
  color: #86efac;
}

.card--acciones {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.accion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 11px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

@media (max-width: 900px) {
  .detalle__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .card--datos {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
