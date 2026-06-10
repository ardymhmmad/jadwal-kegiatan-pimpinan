<template>
  <AdminLayout>
    <div class="p-8">
      <!-- Page header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-display font-bold text-slate-900">Kelola Agenda</h1>
          <p class="text-slate-500 text-sm mt-1">Tambah, edit, dan hapus agenda kegiatan pimpinan</p>
        </div>
        <button @click="openModal()" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Tambah Agenda
        </button>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="flex-1 min-w-48 relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
              </svg>
            </span>
            <input v-model="filters.search" @input="debouncedFetch" type="text"
              placeholder="Cari kegiatan, tempat..."
              class="input-field pl-9" />
          </div>
          <input v-model="filters.tanggal" @change="fetchData" type="date" class="input-field w-auto" />

          <!-- Toggle Akan Datang -->
          <button @click="toggleAkanDatang"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
            :class="filters.akanDatang
              ? 'bg-primary-700 text-white border-primary-700'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ filters.akanDatang ? 'Akan Datang' : 'Semua Agenda' }}
          </button>

          <button v-if="filters.search || filters.tanggal" @click="clearFilters" class="btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hari, Tanggal</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kegiatan</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tempat</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterangan</th>
                <th class="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioritas</th>
                <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="agendaStore.loading">
                <td colspan="7" class="text-center py-12 text-slate-400">
                  <svg class="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Memuat data...
                </td>
              </tr>
              <tr v-else-if="agendaStore.agendaList.length === 0">
                <td colspan="7" class="text-center py-12 text-slate-400">
                  <svg class="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                  </svg>
                  Tidak ada data agenda
                </td>
              </tr>
              <tr v-else v-for="item in agendaStore.agendaList" :key="item.id"
                class="hover:bg-slate-50/80 transition-colors"
                :class="isPast(item) ? 'opacity-50' : ''">
                <td class="px-5 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">{{ formatHari(item.tanggal) }}</span>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-medium text-slate-700">{{ formatTanggal(item.tanggal) }}</span>
                      <template v-if="item.tanggal_akhir && item.tanggal_akhir !== item.tanggal">
                        <span class="text-slate-400 text-xs">s.d.</span>
                        <span class="font-medium text-slate-700">{{ formatTanggal(item.tanggal_akhir) }}</span>
                      </template>
                      <span v-if="isToday(item.tanggal) || isToday(item.tanggal_akhir)"
                        class="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">Hari ini</span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 whitespace-nowrap font-mono text-primary-700 font-medium">
                  <span v-if="item.waktu">{{ item.waktu.slice(0,5) }}</span>
                  <span v-else class="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded font-sans font-medium">Tentatif</span>
                </td>
                <td class="px-5 py-4">
                  <p class="font-medium text-slate-800">{{ item.kegiatan }}</p>
                </td>
                <td class="px-5 py-4 text-slate-600">{{ item.tempat }}</td>
                <td class="px-5 py-4 text-slate-500 max-w-xs truncate">{{ item.keterangan || '-' }}</td>
                <td class="px-5 py-4 text-center">
                  <span v-if="item.prioritas" class="badge-priority">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Ya
                  </span>
                  <span v-else class="text-slate-300 text-xs">—</span>
                </td>
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="openModal(item)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                      </svg>
                    </button>
                    <button @click="confirmDelete(item)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 class="text-lg font-display font-semibold text-slate-900">
              {{ isEditing ? 'Edit Agenda' : 'Tambah Agenda' }}
            </h2>
            <button @click="closeModal" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal body -->
          <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Mulai <span class="text-red-500">*</span></label>
                <input v-model="form.tanggal" type="date" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Selesai
                  <span class="text-slate-400 font-normal text-xs">(opsional, jika multi-hari)</span>
                </label>
                <input v-model="form.tanggal_akhir" type="date" :min="form.tanggal" class="input-field" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Waktu
                <span class="text-slate-400 font-normal text-xs">(kosongkan jika tentatif)</span>
              </label>
              <input v-model="form.waktu" type="time" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Kegiatan <span class="text-red-500">*</span></label>
              <input v-model="form.kegiatan" type="text" required placeholder="Nama kegiatan" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Tempat <span class="text-red-500">*</span></label>
              <input v-model="form.tempat" type="text" required placeholder="Lokasi kegiatan" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Keterangan</label>
              <textarea v-model="form.keterangan" rows="2" placeholder="Keterangan tambahan (opsional)"
                class="input-field resize-none"></textarea>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100 cursor-pointer"
              @click="form.prioritas = !form.prioritas">
              <div class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                :class="form.prioritas ? 'bg-amber-500 border-amber-500' : 'border-slate-300'">
                <svg v-if="form.prioritas" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-amber-800">Tandai sebagai Prioritas</p>
                <p class="text-xs text-amber-600">Agenda ini akan ditampilkan di bagian atas</p>
              </div>
            </div>

            <!-- Error -->
            <div v-if="formError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ formError }}
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <svg v-if="isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up p-6 text-center">
          <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
          <h3 class="text-lg font-display font-semibold text-slate-900 mb-2">Hapus Agenda?</h3>
          <p class="text-sm text-slate-500 mb-6">
            Agenda "<strong>{{ deleteTarget?.kegiatan }}</strong>" akan dihapus secara permanen.
          </p>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-secondary flex-1 justify-center">Batal</button>
            <button @click="handleDelete" class="btn-danger flex-1 justify-center" :disabled="isDeleting">
              <svg v-if="isDeleting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout        from '@/components/AdminLayout.vue'
import { useAgendaStore }     from '@/stores/agenda'
import { useAuditTrailStore } from '@/stores/auditTrail'

const agendaStore = useAgendaStore()
const auditStore  = useAuditTrailStore()

const filters = ref({ search: '', tanggal: '', akanDatang: true })
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing  = ref(false)
const isSaving   = ref(false)
const isDeleting = ref(false)
const formError  = ref('')
const deleteTarget = ref(null)
let searchTimeout = null

const defaultForm = () => ({
  id: null, tanggal: '', tanggal_akhir: '', waktu: '',
  kegiatan: '', tempat: '', keterangan: '', prioritas: false
})
const form = ref(defaultForm())

function todayWITA() {
  const now = new Date()
  return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
}
function formatHari(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
}
function formatTanggal(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}
function isToday(d) {
  if (!d) return false
  return d === todayWITA()
}
function isPast(item) {
  const endDate = item.tanggal_akhir || item.tanggal
  return endDate < todayWITA()
}

function fetchData() {
  agendaStore.fetchAll({
    search:     filters.value.search,
    tanggal:    filters.value.tanggal,
    akanDatang: filters.value.akanDatang,
  })
}
function debouncedFetch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchData, 400)
}
function toggleAkanDatang() {
  filters.value.akanDatang = !filters.value.akanDatang
  fetchData()
}
function clearFilters() {
  filters.value = { search: '', tanggal: '', akanDatang: true }
  fetchData()
}

function openModal(item = null) {
  formError.value = ''
  if (item) {
    isEditing.value = true
    form.value = { ...item, tanggal_akhir: item.tanggal_akhir || '' }
  } else {
    isEditing.value = false
    form.value = defaultForm()
  }
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  form.value = defaultForm()
}

async function handleSubmit() {
  isSaving.value = true
  formError.value = ''
  try {
    const payload = {
      tanggal:       form.value.tanggal,
      tanggal_akhir: form.value.tanggal_akhir || null,
      waktu:         form.value.waktu || null,
      kegiatan:      form.value.kegiatan,
      tempat:        form.value.tempat,
      keterangan:    form.value.keterangan || null,
      prioritas:     form.value.prioritas,
    }
    if (isEditing.value) {
      const dataLama = agendaStore.agendaList.find(a => a.id === form.value.id)
      await agendaStore.update(form.value.id, payload)
      await auditStore.log({ aksi: 'edit', dataId: form.value.id, dataLama, dataBaru: payload, keterangan: `Edit agenda: ${payload.kegiatan}` })
    } else {
      await agendaStore.create(payload)
      await auditStore.log({ aksi: 'tambah', dataBaru: payload, keterangan: `Tambah agenda: ${payload.kegiatan}` })
    }
    closeModal()
    await new Promise(r => setTimeout(r, 500))
    fetchData()
  } catch (e) {
    formError.value = e.message || 'Terjadi kesalahan. Coba lagi.'
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(item) { deleteTarget.value = item; showDeleteModal.value = true }

async function handleDelete() {
  isDeleting.value = true
  try {
    const dataLama = { ...deleteTarget.value }
    await agendaStore.remove(deleteTarget.value.id)
    await auditStore.log({ aksi: 'hapus', dataId: deleteTarget.value.id, dataLama, keterangan: `Hapus agenda: ${deleteTarget.value.kegiatan}` })
    showDeleteModal.value = false
    await new Promise(r => setTimeout(r, 500))
    fetchData()
  } catch (e) { console.error(e) }
  finally { isDeleting.value = false }
}

onMounted(fetchData)
</script>
