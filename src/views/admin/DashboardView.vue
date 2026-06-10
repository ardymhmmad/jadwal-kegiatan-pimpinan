<template>
  <AdminLayout>
    <div class="p-8">
      <!-- Page header -->
      <div class="mb-8">
        <h1 class="text-2xl font-display font-bold text-slate-900">Dashboard</h1>
        <p class="text-slate-500 text-sm mt-1">Ringkasan agenda kegiatan pimpinan</p>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="card flex items-center gap-4 animate-slide-up">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-slate-500">Agenda Hari Ini</p>
            <p class="text-3xl font-display font-bold text-slate-900 leading-none mt-1">
              {{ agendaStore.loading ? '—' : agendaStore.todayCount }}
            </p>
          </div>
        </div>

        <div class="card flex items-center gap-4 animate-slide-up" style="animation-delay:0.1s">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-slate-500">Agenda Minggu Ini</p>
            <p class="text-3xl font-display font-bold text-slate-900 leading-none mt-1">
              {{ agendaStore.loading ? '—' : agendaStore.weekCount }}
            </p>
          </div>
        </div>

        <div class="card flex items-center gap-4 animate-slide-up" style="animation-delay:0.2s">
          <div class="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-slate-500">Agenda Bulan Ini</p>
            <p class="text-3xl font-display font-bold text-slate-900 leading-none mt-1">
              {{ agendaStore.loading ? '—' : agendaStore.monthCount }}
            </p>
          </div>
        </div>
      </div>

      <!-- Today agenda preview -->
      <div class="card">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-base font-display font-semibold text-slate-900">Agenda Hari Ini</h2>
            <p class="text-xs text-slate-400 mt-0.5">{{ todayLabel }}</p>
          </div>
          <RouterLink to="/admin/agenda" class="btn-secondary text-xs py-1.5 px-3">
            Lihat Semua
          </RouterLink>
        </div>

        <div v-if="agendaStore.loading" class="text-center py-8 text-slate-400 text-sm">Memuat...</div>
        <div v-else-if="agendaStore.todayAgenda.length === 0"
          class="text-center py-10 text-slate-400">
          <svg class="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
          </svg>
          <p class="text-sm">Tidak ada agenda hari ini</p>
        </div>
        <div v-else class="divide-y divide-slate-50">
          <div v-for="item in agendaStore.todayAgenda" :key="item.id"
            class="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
            <div class="w-16 text-xs font-mono font-semibold text-primary-700 shrink-0 pt-0.5">
              {{ item.waktu ? item.waktu.slice(0,5) : 'Tent.' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-slate-800 truncate">{{ item.kegiatan }}</p>
                <span v-if="item.prioritas" class="badge-priority shrink-0">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  Prioritas
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">📍 {{ item.tempat }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { useAgendaStore } from '@/stores/agenda'

const agendaStore = useAgendaStore()

const todayLabel = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})

onMounted(() => agendaStore.fetchAll())
</script>
