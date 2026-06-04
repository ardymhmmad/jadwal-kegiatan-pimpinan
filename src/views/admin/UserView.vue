<template>
  <AdminLayout>
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-display font-bold text-slate-900">Manajemen User</h1>
          <p class="text-slate-500 text-sm mt-1">Kelola akun admin yang dapat mengakses sistem</p>
        </div>
        <button @click="openModal()" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Tambah User
        </button>
      </div>

      <!-- Table -->
      <div class="card p-0 overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-slate-400 text-sm">Memuat...</div>
        <div v-else-if="users.length === 0" class="text-center py-12 text-slate-400">
          <p class="text-sm">Belum ada user</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th class="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 uppercase shrink-0">
                    {{ u.nama?.charAt(0) || '?' }}
                  </div>
                  <span class="font-medium text-slate-800">{{ u.nama }}</span>
                  <span v-if="u.id === currentUserId"
                    class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">Anda</span>
                </div>
              </td>
              <td class="px-5 py-4 text-slate-500">{{ u.email }}</td>
              <td class="px-5 py-4 text-center">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="u.role === 'superadmin'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'">
                  {{ u.role === 'superadmin' ? 'Superadmin' : 'Operator' }}
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(u)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                    </svg>
                  </button>
                  <button v-if="u.id !== currentUserId" @click="confirmDelete(u)"
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

      <!-- Info box -->
      <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
        <strong>Catatan:</strong> Tambah user membuat akun baru di Supabase Auth dan langsung terdaftar di sistem.
        Reset password dilakukan melalui fitur "Forgot Password" atau Supabase Dashboard.
      </div>
    </div>

    <!-- Modal Tambah/Edit -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 class="text-lg font-display font-semibold text-slate-900">
              {{ isEditing ? 'Edit User' : 'Tambah User' }}
            </h2>
            <button @click="closeModal" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap <span class="text-red-500">*</span></label>
              <input v-model="form.nama" type="text" required class="input-field" placeholder="Nama lengkap" />
            </div>
            <div v-if="!isEditing">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email <span class="text-red-500">*</span></label>
              <input v-model="form.email" type="email" required class="input-field" placeholder="email@instansi.go.id" />
            </div>
            <div v-if="!isEditing">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password <span class="text-red-500">*</span></label>
              <input v-model="form.password" type="password" required minlength="8" class="input-field" placeholder="Minimal 8 karakter" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Role <span class="text-red-500">*</span></label>
              <select v-model="form.role" required class="input-field">
                <option value="operator">Operator — hanya kelola agenda</option>
                <option value="superadmin">Superadmin — akses penuh</option>
              </select>
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
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan' : 'Buat User') }}
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
          <h3 class="text-lg font-display font-semibold text-slate-900 mb-2">Hapus User?</h3>
          <p class="text-sm text-slate-500 mb-6">User <strong>{{ deleteTarget?.nama }}</strong> akan dihapus dari sistem.</p>
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
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const auth = useAuthStore()
const currentUserId = computed(() => auth.user?.id)

const users   = ref([])
const loading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing  = ref(false)
const isSaving   = ref(false)
const isDeleting = ref(false)
const formError  = ref('')
const deleteTarget = ref(null)

const defaultForm = () => ({ id: null, nama: '', email: '', password: '', role: 'operator' })
const form = ref(defaultForm())

async function fetchUsers() {
  loading.value = true
  // Join profiles dengan auth.users menggunakan admin API tidak tersedia di client
  // Ambil profiles dulu, lalu email dari auth jika tersedia
  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at')
  // Enrich dengan email dari auth store jika user itu sendiri
  users.value = (profiles || []).map(p => ({
    ...p,
    email: p.id === auth.user?.id ? auth.user.email : p.email || '—'
  }))
  loading.value = false
}

function openModal() {
  isEditing.value = false
  form.value = defaultForm()
  formError.value = ''
  showModal.value = true
}

function openEditModal(u) {
  isEditing.value = true
  form.value = { id: u.id, nama: u.nama, email: u.email, password: '', role: u.role }
  formError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false; form.value = defaultForm() }

async function handleSubmit() {
  isSaving.value = true; formError.value = ''
  try {
    if (isEditing.value) {
      // Update profile saja (nama & role)
      const { error } = await supabase.from('profiles')
        .update({ nama: form.value.nama, role: form.value.role })
        .eq('id', form.value.id)
      if (error) throw error
    } else {
      // Buat user baru via Supabase Auth Admin (memerlukan service role)
      // Menggunakan signUp biasa — user perlu konfirmasi email atau disable email confirm di Supabase
      const { data, error } = await supabase.auth.signUp({
        email: form.value.email,
        password: form.value.password,
      })
      if (error) throw error
      // Insert profile
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: data.user.id,
        nama: form.value.nama,
        role: form.value.role,
      })
      if (profileErr) throw profileErr
    }
    closeModal()
    await fetchUsers()
  } catch (e) {
    formError.value = e.message || 'Gagal menyimpan user.'
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(u) { deleteTarget.value = u; showDeleteModal.value = true }

async function handleDelete() {
  isDeleting.value = true
  try {
    // Hapus profile dulu (auth user hanya bisa dihapus via service role / dashboard)
    await supabase.from('profiles').delete().eq('id', deleteTarget.value.id)
    showDeleteModal.value = false
    await fetchUsers()
  } catch (e) {
    console.error(e)
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchUsers)
</script>
