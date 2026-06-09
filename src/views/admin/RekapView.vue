<template>
  <AdminLayout>
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-display font-bold text-slate-900">Rekap Kegiatan</h1>
          <p class="text-slate-500 text-sm mt-1">Ringkasan dan export data agenda kegiatan pimpinan</p>
        </div>
        <button @click="exportExcel" :disabled="!rekapData.length || isExporting"
          class="btn-primary">
          <svg v-if="isExporting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
          </svg>
          {{ isExporting ? 'Mengekspor...' : 'Export Excel' }}
        </button>
      </div>

      <!-- Filter periode -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Dari Tanggal</label>
            <input v-model="filters.dari" type="date" class="input-field w-40" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Sampai Tanggal</label>
            <input v-model="filters.sampai" type="date" class="input-field w-40" />
          </div>
          <button @click="fetchRekap" class="btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            Tampilkan
          </button>
          <!-- Shortcut periode -->
          <div class="flex gap-2 ml-auto flex-wrap">
            <button @click="setPeriode('minggu')" class="btn-secondary text-xs py-1.5 px-3">Minggu Ini</button>
            <button @click="setPeriode('bulan')"  class="btn-secondary text-xs py-1.5 px-3">Bulan Ini</button>
            <button @click="setPeriode('tahun')"  class="btn-secondary text-xs py-1.5 px-3">Tahun Ini</button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="rekapData.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card text-center py-4">
          <p class="text-3xl font-display font-bold text-primary-700">{{ stats.total }}</p>
          <p class="text-xs text-slate-500 mt-1">Total Kegiatan</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-3xl font-display font-bold text-amber-600">{{ stats.prioritas }}</p>
          <p class="text-xs text-slate-500 mt-1">Prioritas</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-3xl font-display font-bold text-slate-500">{{ stats.tentatif }}</p>
          <p class="text-xs text-slate-500 mt-1">Tentatif</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-3xl font-display font-bold text-emerald-600">{{ stats.terlaksana }}</p>
          <p class="text-xs text-slate-500 mt-1">Sudah Berlalu</p>
        </div>
      </div>

      <!-- Table -->
      <div class="card p-0 overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">
          <svg class="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Memuat rekap...
        </div>
        <div v-else-if="!hasSearched" class="text-center py-12 text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z"/>
          </svg>
          <p class="text-sm">Pilih periode dan klik Tampilkan</p>
        </div>
        <div v-else-if="rekapData.length === 0" class="text-center py-12 text-slate-400">
          <p class="text-sm">Tidak ada data pada periode yang dipilih</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">No</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hari, Tanggal</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kegiatan</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tempat</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterangan</th>
                <th class="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioritas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="(item, i) in rekapData" :key="item.id"
                class="hover:bg-slate-50/80 transition-colors"
                :class="{ 'bg-amber-50/50': item.prioritas }">
                <td class="px-5 py-3 text-slate-400 text-xs">{{ i + 1 }}</td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <p class="text-xs text-slate-400 uppercase font-semibold">{{ formatHari(item.tanggal) }}</p>
                  <p class="font-medium text-slate-700">{{ formatTanggal(item.tanggal) }}</p>
                </td>
                <td class="px-5 py-3 font-mono text-primary-700 font-medium whitespace-nowrap">
                  {{ item.waktu ? item.waktu.slice(0,5) : 'Tentatif' }}
                </td>
                <td class="px-5 py-3 font-medium text-slate-800">{{ item.kegiatan }}</td>
                <td class="px-5 py-3 text-slate-600">{{ item.tempat }}</td>
                <td class="px-5 py-3 text-slate-500">{{ item.keterangan || '—' }}</td>
                <td class="px-5 py-3 text-center">
                  <span v-if="item.prioritas" class="badge-priority">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Ya
                  </span>
                  <span v-else class="text-slate-300 text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { supabase } from '@/lib/supabase'

const rekapData  = ref([])
const loading    = ref(false)
const hasSearched = ref(false)
const isExporting = ref(false)
const filters = ref({ dari: '', sampai: '' })

// ─── Stats ───────────────────────────────────────────────
const todayStr = () => {
  const now = new Date()
  const wita = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return wita.toISOString().split('T')[0]
}

const stats = computed(() => ({
  total:     rekapData.value.length,
  prioritas: rekapData.value.filter(a => a.prioritas).length,
  tentatif:  rekapData.value.filter(a => !a.waktu).length,
  terlaksana: rekapData.value.filter(a => a.tanggal < todayStr()).length,
}))

// ─── Formatters ──────────────────────────────────────────
function formatHari(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
}
function formatTanggal(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

// ─── Shortcut periode ────────────────────────────────────
function setPeriode(tipe) {
  const now  = new Date()
  const wita = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const y = wita.getUTCFullYear()
  const m = wita.getUTCMonth()
  const d = wita.getUTCDay()
  const today = wita.toISOString().split('T')[0]

  if (tipe === 'minggu') {
    const mon = new Date(wita)
    mon.setUTCDate(wita.getUTCDate() - (d === 0 ? 6 : d - 1))
    const sun = new Date(mon)
    sun.setUTCDate(mon.getUTCDate() + 6)
    filters.value.dari   = mon.toISOString().split('T')[0]
    filters.value.sampai = sun.toISOString().split('T')[0]
  } else if (tipe === 'bulan') {
    filters.value.dari   = new Date(Date.UTC(y, m, 1)).toISOString().split('T')[0]
    filters.value.sampai = new Date(Date.UTC(y, m + 1, 0)).toISOString().split('T')[0]
  } else if (tipe === 'tahun') {
    filters.value.dari   = `${y}-01-01`
    filters.value.sampai = `${y}-12-31`
  }
  fetchRekap()
}

// ─── Fetch ───────────────────────────────────────────────
async function fetchRekap() {
  if (!filters.value.dari || !filters.value.sampai) return
  loading.value    = true
  hasSearched.value = true
  try {
    const { data, error } = await supabase
      .from('agenda')
      .select('*')
      .gte('tanggal', filters.value.dari)
      .lte('tanggal', filters.value.sampai)
      .order('tanggal', { ascending: true })
      .order('waktu',   { ascending: true })
    if (error) throw error
    rekapData.value = data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// ─── Export Excel ─────────────────────────────────────────
async function exportExcel() {
  isExporting.value = true
  try {
    // Import SheetJS dinamis
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs')

    const rows = rekapData.value.map((item, i) => ({
      'No':         i + 1,
      'Hari':       formatHari(item.tanggal),
      'Tanggal':    formatTanggal(item.tanggal),
      'Waktu':      item.waktu ? item.waktu.slice(0,5) : 'Tentatif',
      'Kegiatan':   item.kegiatan,
      'Tempat':     item.tempat,
      'Keterangan': item.keterangan || '',
      'Prioritas':  item.prioritas ? 'Ya' : 'Tidak',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)

    // Lebar kolom
    ws['!cols'] = [
      { wch: 4 }, { wch: 12 }, { wch: 22 }, { wch: 10 },
      { wch: 40 }, { wch: 30 }, { wch: 30 }, { wch: 10 }
    ]

    const wb = XLSX.utils.book_new()
    const sheetName = `Rekap ${filters.value.dari} sd ${filters.value.sampai}`
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))

    const fileName = `Rekap-Kegiatan-${filters.value.dari}-sd-${filters.value.sampai}.xlsx`
    XLSX.writeFile(wb, fileName)
  } catch (e) {
    console.error('Export error:', e)
    alert('Gagal export Excel. Coba lagi.')
  } finally {
    isExporting.value = false
  }
}

onMounted(() => {
  // Set default bulan ini
  setPeriode('bulan')
})
</script>
