<template>
  <AdminLayout>
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-display font-bold text-slate-900">Profil Instansi</h1>
        <p class="text-slate-500 text-sm mt-1">Kelola nama, logo, dan identitas instansi yang tampil di Display</p>
      </div>

      <div v-if="instansiStore.loading" class="card text-center py-12 text-slate-400">Memuat...</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Preview -->
        <div class="card flex flex-col items-center gap-4 text-center">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider w-full text-left">Preview Logo</p>
          <div class="w-28 h-28 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
            <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-contain p-2" alt="Logo" />
            <svg v-else class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
            </svg>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-400">{{ form.nama_pemda }}</p>
            <p class="font-bold text-slate-800">{{ form.nama }}</p>
            <p class="text-xs text-slate-500">{{ form.unit }}</p>
          </div>
        </div>

        <!-- Form -->
        <div class="card lg:col-span-2">
          <form @submit.prevent="handleSave" class="space-y-5">

            <!-- Upload Logo -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Logo Instansi</label>
              <div class="flex items-center gap-3">
                <label class="btn-secondary cursor-pointer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  Pilih File
                  <input type="file" class="hidden" accept="image/*" @change="onFileChange" />
                </label>
                <span class="text-xs text-slate-400">{{ logoFile ? logoFile.name : 'PNG, JPG, SVG (maks. 2MB)' }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Nama Pemerintah Daerah</label>
              <input v-model="form.nama_pemda" type="text" class="input-field"
                placeholder="PEMERINTAH PROVINSI KALIMANTAN SELATAN" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Nama Instansi <span class="text-red-500">*</span></label>
              <input v-model="form.nama" type="text" required class="input-field"
                placeholder="BADAN PENGELOLA KEUANGAN DAN ASET DAERAH" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Unit / Bidang</label>
              <input v-model="form.unit" type="text" class="input-field"
                placeholder="Provinsi Kalimantan Selatan" />
            </div>

            <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errorMsg }}
            </div>

            <div v-if="successMsg" class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              {{ successMsg }}
            </div>

            <div class="flex justify-end">
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <svg v-if="isSaving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { useInstansiStore } from '@/stores/instansi'

const instansiStore = useInstansiStore()
const isSaving  = ref(false)
const errorMsg  = ref('')
const successMsg = ref('')
const logoFile  = ref(null)
const previewUrl = ref('')

const form = ref({ nama_pemda: '', nama: '', unit: '' })

watch(() => instansiStore.data, (val) => {
  if (val) {
    form.value = { nama_pemda: val.nama_pemda, nama: val.nama, unit: val.unit || '' }
    previewUrl.value = val.logo_url || ''
  }
}, { immediate: true })

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { errorMsg.value = 'Ukuran file maks. 2MB'; return }
  logoFile.value   = file
  previewUrl.value = URL.createObjectURL(file)
  errorMsg.value   = ''
}

async function handleSave() {
  isSaving.value  = true
  errorMsg.value  = ''
  successMsg.value = ''
  try {
    let logo_url = instansiStore.data?.logo_url || null
    if (logoFile.value) {
      logo_url = await instansiStore.uploadLogo(logoFile.value)
    }
    await instansiStore.update({ ...form.value, logo_url })
    successMsg.value = 'Profil instansi berhasil disimpan!'
    logoFile.value   = null
    setTimeout(() => successMsg.value = '', 3000)
  } catch (e) {
    errorMsg.value = e.message || 'Gagal menyimpan.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => instansiStore.fetch())
</script>
