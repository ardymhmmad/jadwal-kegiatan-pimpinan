import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/display' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/display',
    name: 'Display',
    component: () => import('@/views/DisplayView.vue'),
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/agenda',
    name: 'AdminAgenda',
    component: () => import('@/views/admin/AgendaView.vue'),
    meta: { requiresAuth: true }
  },
  // ── Superadmin only ──────────────────────────────────────
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/UserView.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true }
  },
  {
    path: '/admin/running-text',
    name: 'AdminRunningText',
    component: () => import('@/views/admin/RunningTextView.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true }
  },
  {
    path: '/admin/instansi',
    name: 'AdminInstansi',
    component: () => import('@/views/admin/InstansiView.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true }
  },
  {
    path: '/admin/audit-trail',
    name: 'AdminAuditTrail',
    component: () => import('@/views/admin/AuditTrailView.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true }
  },
  // ── Semua yang login ──────────────────────────────────────
  {
    path: '/admin/rekap',
    name: 'AdminRekap',
    component: () => import('@/views/admin/RekapView.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/display' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  if (auth.loading) await auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated()) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  if (to.meta.guestOnly && auth.isAuthenticated()) {
    return next({ name: 'AdminDashboard' })
  }
  if (to.meta.requiresSuperadmin && !auth.isSuperadmin()) {
    return next({ name: 'AdminDashboard' })
  }

  next()
})

export default router
