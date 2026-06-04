<template>
  <AdminLayout>
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-display font-bold text-slate-900">Running Text</h1>
          <p class="text-slate-500 text-sm mt-1">Kelola teks berjalan yang tampil di bagian bawah Display</p>
        </div>
        <button @click="openModal()" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Tambah Teks
        </button>
      </div>

      <!-- Preview ticker -->
      <div class="card mb-6 overflow-hidden">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview Ticker</p>
        <div class="bg-primary-950 rounded-lg px-4 py-3 overflow-hidden">
          <div v-if="rtStore.aktifList.length === 0" class="text-slate-500 text-sm italic">
            Belum ada running text aktif
          </div>
          <div v-else class="ticker-preview">
            <span class="ticker-preview-text">{{ rtStore.tickerText }}</span>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="card p-0 overflow-hidden">
        <div v-if="rtStore.loading" class="text-center py-12 text-slate-400 text-sm">Memuat...</div>
        <div v-else-if="rtStore.list.length === 0" class="text-center py-12 text-slate-400">
          <svg class="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
          </svg>
          <p class="text-sm">Belum ada running text</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Urutan</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teks</th>
              <th class="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="item in rtStore.list" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-5 py-4 w-20 text-center font-mono text-slate-500 font-medium">{{ item.urutan }}</td>
              <td class="px-5 py-4 text-slate-800">{{ item.teks }}</td>
              <td class="px-5 py-4 text-center">
                <button @click="toggleAktif(item)"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  :class="item.aktif
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="item.aktif ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ item.aktif ? 'Aktif' : 'Nonaktif' }}
                </button>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openModal(item)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                    </svg>
                  </button>
                  <button @click="confirmDelete(item)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 class="text-lg font-display font-semibold text-slate-900">
              {{ isEditing ? 'Edit Running Text' : 'Tambah Running Text' }}
            </h2>
            <button @click="closeModal" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Teks <span class="text-red-500">*</span></label>
              <textarea v-model="form.teks" required rows="3" placeholder="Masukkan teks running text..."
                class="input-field resize-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Urutan Tampil</label>
              <input v-model.number="form.urutan" type="number" min="0" class="input-field" />
              <p class="text-xs text-slate-400 mt-1">Angka kecil tampil lebih dulu</p>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 cursor-pointer"
              @click="form.aktif = !form.aktif">
              <div class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                :class="form.aktif ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'">
                <svg v-if="form.aktif" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-sm font-medium text-emerald-800">Aktifkan teks ini</p>
            </div>
            <div v-if="formError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ formError }}
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="closeModal" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <svg v-if="isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan' : 'Tambah') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up p-6 text-center">
          <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
          <h3 class="text-lg font-display font-semibold text-slate-900 mb-2">Hapus Running Text?</h3>
          <p class="text-sm text-slate-500 mb-6">Teks ini akan dihapus permanen.</p>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-secondary flex-1 justify-center">Batal</button>
            <button @click="handleDelete" class="btn-danger flex-1 justify-center" :disabled="isDeleting">
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
import AdminLayout from '@/components/AdminLayout.vue'
import { useRunningTextStore } from '@/stores/runningText'

const rtStore = useRunningTextStore()
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const isSaving  = ref(false)
const isDeleting = ref(false)
const formError  = ref('')
const deleteTarget = ref(null)

const defaultForm = () => ({ id: null, teks: '', urutan: 0, aktif: true })
const form = ref(defaultForm())

function openModal(item = null) {
  formError.value = ''
  if (item) { isEditing.value = true;  form.value = { ...item } }
  else       { isEditing.value = false; form.value = defaultForm() }
  showModal.value = true
}
function closeModal() { showModal.value = false; form.value = defaultForm() }

async function toggleAktif(item) {
  await rtStore.update(item.id, { aktif: !item.aktif })
  rtStore.fetchAll()
}

async function handleSubmit() {
  isSaving.value = true; formError.value = ''
  try {
    const payload = { teks: form.value.teks, urutan: form.value.urutan, aktif: form.value.aktif }
    if (isEditing.value) await rtStore.update(form.value.id, payload)
    else                 await rtStore.create(payload)
    closeModal(); rtStore.fetchAll()
  } catch (e) { formError.value = e.message }
  finally     { isSaving.value = false }
}

function confirmDelete(item) { deleteTarget.value = item; showDeleteModal.value = true }
async function handleDelete() {
  isDeleting.value = true
  try { await rtStore.remove(deleteTarget.value.id); showDeleteModal.value = false; rtStore.fetchAll() }
  finally { isDeleting.value = false }
}

onMounted(() => rtStore.fetchAll())
</script>

<style scoped>
.ticker-preview {
  overflow: hidden;
  white-space: nowrap;
}
.ticker-preview-text {
  display: inline-block;
  color: #93c5fd;
  font-size: 0.875rem;
  font-weight: 500;
  animation: ticker 20s linear infinite;
}
@keyframes ticker {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
</style>
