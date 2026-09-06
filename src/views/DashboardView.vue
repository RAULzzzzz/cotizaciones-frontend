<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>Sistema de Gestión de Cotizaciones</v-app-bar-title>
      <v-spacer />
      <span class="mr-4">{{ auth.user?.nombre }}</span>
      <v-btn icon="mdi-logout" @click="handleLogout" />
    </v-app-bar>

    <v-main>
      <v-container>
        <v-card class="pa-6">
          <v-card-title>Bienvenido, {{ auth.user?.nombre }}</v-card-title>
          <v-card-text> Has iniciado sesión correctamente como {{ auth.user?.email }}. </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
