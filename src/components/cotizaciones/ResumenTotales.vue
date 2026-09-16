<script setup lang="ts">
import { computed } from 'vue'
import { calcularTotales, dinero, type CotizacionForm } from '@/data/cotizaciones'

const props = defineProps<{ formulario: CotizacionForm }>()

const t = computed(() => calcularTotales(props.formulario))

const claseUtilidad = computed(() =>
  t.value.utilidad < 0 ? 'is-negativa' : t.value.utilidad === 0 ? 'is-cero' : 'is-positiva',
)

const conProducto = computed(() => props.formulario.partidas.filter((p) => p.descripcion))
</script>

<template>
  <aside class="resumen">
    <div class="resumen__titulo">Resumen</div>

    <div class="resumen__total">
      <div class="resumen__monto">{{ dinero(t.total, formulario.moneda) }}</div>
      <div v-if="Number(formulario.porcentajeIva) > 0" class="resumen__iva">
        IVA {{ formulario.porcentajeIva }}%{{
          formulario.preciosIncluyenIva ? ' incluido' : ' sobre precio'
        }}
      </div>
    </div>

    <div class="resumen__desglose">
      <div class="fila">
        <span>{{ formulario.preciosIncluyenIva ? 'Subtotal' : 'Subtotal s/IVA' }}</span>
        <span>{{ dinero(t.subtotal, formulario.moneda) }}</span>
      </div>
      <div class="fila">
        <span>Descuentos</span><span>{{ dinero(t.descuento, formulario.moneda) }}</span>
      </div>
      <div class="fila">
        <span>IVA</span><span>{{ dinero(t.impuestos, formulario.moneda) }}</span>
      </div>
      <div class="fila">
        <span>{{ formulario.preciosIncluyenIva ? 'Costo compra' : 'Costo compra s/IVA' }}</span>
        <span>{{ dinero(t.compra, formulario.moneda) }}</span>
      </div>
    </div>

    <div class="utilidad">
      <div class="utilidad__cabecera">
        <span>Utilidad estimada s/IVA</span>
        <span v-if="t.subtotal > 0" class="utilidad__margen" :class="claseUtilidad">
          Margen {{ t.margenPct >= 0 ? '+' : '' }}{{ t.margenPct.toFixed(2) }}%
        </span>
      </div>
      <div class="utilidad__monto" :class="claseUtilidad">
        {{ dinero(t.utilidad, formulario.moneda) }}
      </div>
    </div>

    <div v-if="conProducto.length" class="productos">
      <div class="productos__titulo">Productos</div>
      <div v-for="(p, i) in conProducto" :key="i" class="productos__fila">
        <span class="productos__nombre">{{ p.descripcion }}</span>
        <span class="productos__cant">×{{ p.cantidad }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.resumen {
  background: var(--blue);
  border-radius: 14px;
  padding: 20px;
  color: #fff;
  position: sticky;
  top: 20px;
}

.resumen__titulo {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.resumen__total {
  margin-bottom: 16px;
}

.resumen__monto {
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

.resumen__iva {
  margin-top: 5px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
}

.resumen__desglose {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fila {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.fila span:last-child {
  font-weight: 600;
}

.utilidad {
  margin-top: 14px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.09);
  padding: 10px 11px;
}

.utilidad__cabecera {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 3px;
}

.utilidad__margen {
  font-weight: 700;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 1px 5px;
  flex-shrink: 0;
}

.utilidad__monto {
  font-size: 15px;
  font-weight: 800;
}

.is-positiva {
  color: #86efac;
}

.is-negativa {
  color: #fca5a5;
}

.is-cero {
  color: rgba(255, 255, 255, 0.55);
}

.productos {
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 12px;
}

.productos__titulo {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 4px;
}

.productos__fila {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}

.productos__nombre {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.productos__cant {
  font-weight: 700;
  flex-shrink: 0;
}
</style>
