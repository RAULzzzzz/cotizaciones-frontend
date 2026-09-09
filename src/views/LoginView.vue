<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const REMEMBER_KEY = 'rememberedEmail'

const auth = useAuthStore()
const router = useRouter()

const rememberedEmail = localStorage.getItem(REMEMBER_KEY) ?? ''

const form = reactive({
  email: rememberedEmail,
  password: '',
})
const errs = reactive({
  email: '',
  password: '',
})
const loading = ref(false)
const showPassword = ref(false)
const logoOk = ref(true)
// Servido desde FRONTEND/public/logo.png. Enlace dinámico para que Vite no intente
// resolverlo en build (permite que el archivo aún no exista sin romper la app).
const logoSrc = `${import.meta.env.BASE_URL}logo.png`
const remember = ref(Boolean(rememberedEmail))
const currentYear = new Date().getFullYear()

function clearError(field: 'email' | 'password') {
  errs[field] = ''
}

function handleForgotPassword() {
  // TODO: enlazar con la pantalla de recuperación de contraseña cuando exista.
}

async function handleSubmit() {
  errs.email = form.email.trim() ? '' : 'Correo obligatorio'
  errs.password = form.password.trim() ? '' : 'Contraseña obligatoria'
  if (errs.email || errs.password) return

  loading.value = true
  try {
    await auth.login(form.email.trim(), form.password)

    if (remember.value) localStorage.setItem(REMEMBER_KEY, form.email.trim())
    else localStorage.removeItem(REMEMBER_KEY)

    router.push({ name: 'dashboard' })
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const apiError = err.response?.data?.error as string | undefined

      if (!err.response) {
        errs.password = 'No se pudo conectar con el servidor.'
      } else if (status === 400 && apiError?.toLowerCase().includes('email')) {
        errs.email = apiError
      } else if (status === 429) {
        errs.password = 'Demasiados intentos. Por seguridad, espera un momento e inténtalo de nuevo.'
      } else if (status === 401) {
        errs.password = 'Usuario o contraseña incorrectos.'
      } else if (status && status >= 500) {
        errs.password = 'Error en el servidor. Contacta al soporte.'
      } else {
        errs.password = apiError ?? 'Ocurrió un error inesperado.'
      }
    } else {
      errs.password = 'Ocurrió un error inesperado.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login" data-theme="light">
    <div class="login__main">
      <div class="login__card">
        <div v-if="logoOk" class="login__brand">
          <img
            :src="logoSrc"
            alt="Sistema de Gestión de Cotizaciones"
            @error="logoOk = false"
          />
        </div>
        <h1 class="login__title">Bienvenido</h1>
        <p class="login__subtitle">Inicia sesión con tus credenciales</p>

        <form @submit.prevent="handleSubmit">
          <div class="field" :class="{ 'field--error': errs.email }">
            <div class="field__control">
              <input
                v-model="form.email"
                type="email"
                placeholder="Usuario o correo electrónico"
                autocomplete="username"
                :disabled="loading"
                @input="clearError('email')"
              />
            </div>
            <span v-if="errs.email" class="field__error">{{ errs.email }}</span>
          </div>

          <div class="field" :class="{ 'field--error': errs.password }">
            <div class="field__control">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Contraseña"
                autocomplete="current-password"
                :disabled="loading"
                class="field__input--with-action"
                @input="clearError('password')"
              />
              <button
                type="button"
                class="field__toggle"
                tabindex="-1"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="showPassword"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <svg
                  v-else
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <span v-if="errs.password" class="field__error">{{ errs.password }}</span>
          </div>

          <label class="remember">
            <input v-model="remember" type="checkbox" :disabled="loading" />
            <span>Recordarme</span>
          </label>

          <button type="submit" class="submit" :disabled="loading">
            <span v-if="loading" class="spinner" />
            <span v-else>Iniciar sesión</span>
          </button>
        </form>

        <div class="divider" />
        <p class="help">
          ¿Olvidaste tu contraseña?
          <button type="button" class="help__link" @click="handleForgotPassword">
            Recuperar acceso
          </button>
        </p>
      </div>
    </div>

    <footer class="login__footer">
      © {{ currentYear }} Sistema de Gestión de Cotizaciones
    </footer>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  font-family: var(--font);
  color: var(--text);
}

.login__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login__card {
  width: 100%;
  max-width: 350px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 44px 36px 34px;
}

.login__brand {
  margin-bottom: 40px;
}

.login__brand img {
  height: 38px;
  display: block;
}

.login__title {
  font-size: 19px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 4px;
}

.login__subtitle {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 26px;
}

.field {
  margin-bottom: 16px;
}

.field__control {
  position: relative;
}

.field input {
  width: 100%;
  padding: 12px 13px;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 13.5px;
  font-family: inherit;
  color: var(--text);
  background: var(--bg);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field input::placeholder {
  color: var(--muted-2);
}

.field__input--with-action {
  padding-right: 40px;
}

.field input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(27, 78, 216, 0.1);
}

.field--error input {
  border-color: #ef4444;
}

.field--error input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

.field__error {
  display: block;
  font-size: 11px;
  color: #ef4444;
  margin-top: 5px;
}

.field__toggle {
  position: absolute;
  right: 11px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--muted);
  opacity: 0.55;
}

.field__toggle:hover {
  opacity: 0.85;
}

.remember {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 16px 0 22px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.remember input {
  width: 14px;
  height: 14px;
  accent-color: var(--blue);
  cursor: pointer;
}

.submit {
  width: 100%;
  padding: 11px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.submit:hover:not(:disabled) {
  background: var(--blue-hover);
}

.submit:disabled {
  background: var(--muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  border-top: 1px solid var(--border);
  margin: 26px 0 18px;
}

.help {
  text-align: center;
  font-size: 12.5px;
  color: var(--muted);
}

.help__link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--blue);
  font-weight: 600;
  cursor: pointer;
}

.help__link:hover {
  text-decoration: underline;
}

.login__footer {
  padding: 18px 20px;
  text-align: center;
  font-size: 11px;
  color: var(--muted-2);
}
</style>
