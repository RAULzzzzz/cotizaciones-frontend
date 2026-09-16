<script setup lang="ts">
import { reactive, ref } from 'vue'
import CampoForm from '../cotizaciones/CampoForm.vue'
import { TIPOS_CLIENTE, formatTel, toTitleCase } from '@/data/cotizaciones'
import { clienteVacio, registrarCliente } from '@/data/clientes'

const emit = defineEmits<{ volver: []; guardado: [] }>()

const formulario = reactive(clienteVacio())
const errores = reactive<Record<string, string>>({})
const guardando = ref(false)
const guardado = ref(false)

function limpiarErrores() {
  Object.keys(errores).forEach((k) => delete errores[k])
}

function validar() {
  limpiarErrores()
  if (!formulario.nombreComercial.trim()) {
    errores.nombreComercial = 'Escribe el nombre del cliente.'
  }
  const digitos = formulario.telefonoContacto.replace(/\D/g, '')
  if (digitos.length !== 10) {
    errores.telefonoContacto = 'El teléfono debe tener 10 dígitos.'
  }
  if (formulario.correoContacto && !/^\S+@\S+\.\S+$/.test(formulario.correoContacto)) {
    errores.correoContacto = 'El correo no tiene un formato válido.'
  }
  return Object.keys(errores).length === 0
}

async function guardar() {
  if (guardando.value || !validar()) return
  guardando.value = true
  // TODO: POST /api/clientes cuando exista el backend.
  await new Promise((r) => setTimeout(r, 500))
  registrarCliente({ ...formulario })
  guardando.value = false
  guardado.value = true
  setTimeout(() => emit('guardado'), 1000)
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="guardar">
    <header class="form__head">
      <button type="button" class="icon-btn" @click="emit('volver')">
        <i class="mdi mdi-arrow-left" />
      </button>
      <div>
        <h2>Nuevo cliente</h2>
        <p>Se agrega al directorio y queda disponible al cotizar</p>
      </div>
    </header>

    <section class="panel">
      <div class="grid grid--tipo">
        <CampoForm label="Tipo de cliente">
          <select v-model="formulario.tipoCliente" class="ui-select">
            <option v-for="t in TIPOS_CLIENTE" :key="t">{{ t }}</option>
          </select>
        </CampoForm>

        <CampoForm label="Nombre de la empresa / cliente *" :error="errores.nombreComercial">
          <input
            v-model="formulario.nombreComercial"
            class="ui-input"
            :class="{ 'is-error': errores.nombreComercial }"
            placeholder="Ej. Transportes del Bajío"
            maxlength="45"
            @input="formulario.nombreComercial = toTitleCase(formulario.nombreComercial)"
          />
        </CampoForm>
      </div>

      <div class="grid grid--2">
        <CampoForm
          label="Atención a"
          ayuda="Nombre de quien atiende o autoriza en el taller."
        >
          <input
            v-model="formulario.atencionA"
            class="ui-input"
            placeholder="Ej. Julio Navarro"
            maxlength="45"
            @input="formulario.atencionA = toTitleCase(formulario.atencionA)"
          />
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
            placeholder="contacto@cliente.com"
            maxlength="40"
          />
        </CampoForm>

        <CampoForm label="Teléfono *" :error="errores.telefonoContacto">
          <input
            :value="formulario.telefonoContacto"
            class="ui-input"
            :class="{ 'is-error': errores.telefonoContacto }"
            placeholder="773 185 1363"
            inputmode="numeric"
            maxlength="12"
            @input="
              formulario.telefonoContacto = formatTel(($event.target as HTMLInputElement).value)
            "
          />
        </CampoForm>
      </div>
    </section>

    <div class="nav">
      <button type="button" class="ui-btn" @click="emit('volver')">Cancelar</button>
      <button type="submit" class="ui-btn ui-btn--primary guardar" :disabled="guardando">
        <span v-if="guardando" class="spinner" />
        {{ guardando ? 'Guardando…' : 'Registrar cliente' }}
      </button>
    </div>

    <!-- Confirmación de guardado -->
    <div v-if="guardado" class="exito">
      <div class="exito__caja">
        <div class="exito__circulo"><i class="mdi mdi-check" /></div>
        <div class="exito__titulo">Cliente registrado con éxito</div>
        <div class="exito__nota">(demo — todavía no se guarda en base de datos)</div>
      </div>
    </div>
  </form>
</template>

<style scoped>
.form {
  padding: 24px 28px;
  max-width: 720px;
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

.panel {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

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

.rfc {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.guardar {
  min-width: 178px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  font-weight: 700;
  color: var(--navy);
  font-size: 15px;
}

.exito__nota {
  margin-top: 6px;
  font-size: 11px;
  color: var(--muted);
}

@media (max-width: 640px) {
  .grid--tipo,
  .grid--2 {
    grid-template-columns: 1fr;
  }
}
</style>
