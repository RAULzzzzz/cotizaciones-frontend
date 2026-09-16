import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import CotizacionesView from '@/views/CotizacionesView.vue'
import ClientesView from '@/views/ClientesView.vue'

// Cotizaciones es la página de entrada: es lo primero que un usuario logeado
// quiere ver, así que "/" y el login redirigen ahí directamente.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/cotizaciones' },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/cotizaciones',
      name: 'cotizaciones',
      component: CotizacionesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientesView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    return { name: 'login' }
  }
  if (to.name === 'login' && auth.token) {
    return { name: 'cotizaciones' }
  }
})

export default router
