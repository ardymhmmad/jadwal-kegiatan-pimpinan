<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-gov-blue flex items-center justify-center p-4">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

    <div class="relative w-full max-w-md animate-slide-up">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-800 to-primary-700 px-8 py-8 text-center">
          <!-- Logo -->
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden">
            <img v-if="instansi?.logo_url" :src="instansi.logo_url"
              class="w-full h-full object-contain p-1" alt="Logo Instansi" />
            <svg v-else class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <!-- Nama instansi dinamis -->
          <p v-if="instansi?.nama_pemda" class="text-primary-200 text-xs mb-1">{{ instansi.nama_pemda }}</p>
          <h1 class="font-display text-xl font-bold text-white leading-tight">
            {{ instansi?.nama || 'Sistem Informasi' }}
          </h1>
          <p class="font-display text-base font-semibold text-primary-200 mt-1">
            {{ instansi?.unit || 'Jadwal Kegiatan Pimpinan' }}
          </p>
          <p class="text-primary-300 text-xs mt-1">Panel Administrator</p>
        </div>

        <!-- Form -->
        <div class="px-8 py-8">
          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </span>
                <input v-model="form.email" type="email" required
                  placeholder="admin@instansi.go.id"
                  class="input-field pl-10" :disabled="isLoading" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                  required placeholder="••••••••"
                  class="input-field pl-10 pr-10" :disabled="isLoading" />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error -->
            <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errorMsg }}
            </div>

            <button type="submit" class="btn-primary w-full justify-center py-2.5 text-base" :disabled="isLoading">
              <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ isLoading ? 'Masuk...' : 'Masuk' }}
            </button>
          </form>
        </div>
      </div>

      <p class="text-center text-primary-300 text-xs mt-4">
        Sistem Informasi Jadwal Kegiatan Pimpinan &copy; {{ new Date().getFullYear() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { useInstansiStore } from '@/stores/instansi'

const router  = useRouter()
const route   = useRoute()
const auth    = useAuthStore()
const instansiStore = useInstansiStore()

const instansi     = ref(null)
const form         = ref({ email: '', password: '' })
const isLoading    = ref(false)
const errorMsg     = ref('')
const showPassword = ref(false)

async function handleLogin() {
  isLoading.value = true
  errorMsg.value  = ''
  try {
    await auth.login(form.value.email, form.value.password)
    const redirect = route.query.redirect || '/admin'
    router.push(redirect)
  } catch {
    errorMsg.value = 'Email atau password salah. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await instansiStore.fetch()
  instansi.value = instansiStore.data
})
</script>
