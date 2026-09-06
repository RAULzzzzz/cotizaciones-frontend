<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      errorMessage.value = err.response.data.error
    } else {
      errorMessage.value = 'No se pudo conectar con el servidor'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <v-card width="400" elevation="8" class="pa-4">
        <v-card-title class="text-h5 text-center mb-2"> Iniciar sesión </v-card-title>
        <v-card-subtitle class="text-center mb-4">
          Sistema de Gestión de Cotizaciones
        </v-card-subtitle>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="email"
              label="Correo electrónico"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              autocomplete="username"
              required
            />

            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              autocomplete="current-password"
              required
            />

            <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Ingresar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-main>
  </v-app>
</template>
