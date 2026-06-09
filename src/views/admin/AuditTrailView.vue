<template>
  <AdminLayout>
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-display font-bold text-slate-900">Audit Trail</h1>
        <p class="text-slate-500 text-sm mt-1">Riwayat seluruh aktivitas pengelolaan agenda</p>
      </div>

      <!-- Filter -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-3 items-end">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Jenis Aksi</label>
            <select v-model="filters.aksi" @change="fetchData" class="input-field w-36">
              <option value="">Semua Aksi</option>
              <option value="tambah">Tambah</option>
              <option value="edit">Edit</option>
              <option value="hapus">Hapus</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Dari Tanggal</label>
            <input v-model="filters.tanggal_dari" @change="fetchData" type="date" class="input-field w-40" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Sampai Tanggal</label>
            <input v-model="filters.tanggal_sampai" @change="fetchData" type="date" class="input-field w-40" />
          </div>
          <button v-if="filters.aksi || filters.tanggal_dari || filters.tanggal_sampai"
            @click="clearFilters" class="btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Reset
          </button>
          <div class="ml-auto text-xs text-slate-400">
            Total: <strong class="text-slate-600">{{ auditStore.total }}</strong> aktivitas
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card p-0 overflow-hidden">
        <div v-if="auditStore.loading" class="text-center py-12 text-slate-400 text-sm">
          <svg class="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Memuat data...
        </div>
        <div v-else-if="auditStore.list.length === 0" class="text-center py-12 text-slate-400">
          <svg class="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
          </svg>
          <p class="text-sm">Belum ada aktivitas tercatat</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th class="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterangan</th>
                <th class="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="item in auditStore.list" :key="item.id"
                class="hover:bg-slate-50/80 transition-colors">
                <td class="px-5 py-4 whitespace-nowrap">
                  <p class="text-xs font-medium text-slate-700">{{ formatTanggal(item.created_at) }}</p>
                  <p class="text-xs text-slate-400">{{ formatJam(item.created_at) }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="font-medium text-slate-800 text-sm">{{ item.user_nama || '—' }}</p>
                  <p class="text-xs text-slate-400">{{ item.user_email || '—' }}</p>
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-emerald-100 text-emerald-700': item.aksi === 'tambah',
                      'bg-blue-100 text-blue-700':      item.aksi === 'edit',
                      'bg-red-100 text-red-700':        item.aksi === 'hapus',
                    }">
                    {{ item.aksi.toUpperCase() }}
                  </span>
                </td>
                <td class="px-5 py-4 text-slate-600 text-sm">{{ item.keterangan || '—' }}</td>
                <td class="px-5 py-4 text-center">
                  <button @click="openDetail(item)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDetail = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 class="text-lg font-display font-semibold text-slate-900">Detail Perubahan</h2>
            <button @click="showDetail = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                :class="{
                  'bg-emerald-100 text-emerald-700': selectedItem?.aksi === 'tambah',
                  'bg-blue-100 text-blue-700':      selectedItem?.aksi === 'edit',
                  'bg-red-100 text-red-700':        selectedItem?.aksi === 'hapus',
                }">
                {{ selectedItem?.aksi?.toUpperCase() }}
              </span>
              <span class="text-sm text-slate-500">{{ formatTanggal(selectedItem?.created_at) }} {{ formatJam(selectedItem?.created_at) }}</span>
            </div>

            <div v-if="selectedItem?.data_lama" class="space-y-1">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Sebelum</p>
              <div class="bg-red-50 rounded-lg p-3 text-xs font-mono text-red-800 overflow-auto max-h-40">
                <div v-for="(val, key) in selectedItem.data_lama" :key="key" class="flex gap-2">
                  <span class="text-red-500 shrink-0">{{ key }}:</span>
                  <span>{{ val ?? '—' }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedItem?.data_baru" class="space-y-1">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Sesudah</p>
              <div class="bg-emerald-50 rounded-lg p-3 text-xs font-mono text-emerald-800 overflow-auto max-h-40">
                <div v-for="(val, key) in selectedItem.data_baru" :key="key" class="flex gap-2">
                  <span class="text-emerald-600 shrink-0">{{ key }}:</span>
                  <span>{{ val ?? '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { useAuditTrailStore } from '@/stores/auditTrail'

const auditStore = useAuditTrailStore()
const filters = ref({ aksi: '', tanggal_dari: '', tanggal_sampai: '' })
const showDetail   = ref(false)
const selectedItem = ref(null)

function formatTanggal(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}
function formatJam(d) {
  if (!d) return '—'
  return new Date(d).toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function openDetail(item) {
  selectedItem.value = item
  showDetail.value   = true
}

function fetchData() {
  auditStore.fetchAll(filters.value)
}

function clearFilters() {
  filters.value = { aksi: '', tanggal_dari: '', tanggal_sampai: '' }
  fetchData()
}

onMounted(fetchData)
</script>
