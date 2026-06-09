import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export const useAuditTrailStore = defineStore('auditTrail', () => {
  const list    = ref([])
  const loading = ref(false)
  const total   = ref(0)

  // Catat aksi ke audit trail
  async function log({ aksi, dataId, dataLama = null, dataBaru = null, keterangan = null }) {
    const auth = useAuthStore()
    try {
      await supabase.from('audit_trail').insert([{
        user_id:    auth.user?.id || null,
        user_nama:  auth.profile?.nama || null,
        user_email: auth.user?.email || null,
        aksi,
        tabel:      'agenda',
        data_id:    dataId || null,
        data_lama:  dataLama,
        data_baru:  dataBaru,
        keterangan,
      }])
    } catch (e) {
      console.error('Audit log error:', e.message)
    }
  }

  async function fetchAll(filters = {}) {
    loading.value = true
    try {
      let query = supabase
        .from('audit_trail')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100)

      if (filters.aksi)        query = query.eq('aksi', filters.aksi)
      if (filters.user_id)     query = query.eq('user_id', filters.user_id)
      if (filters.tanggal_dari) query = query.gte('created_at', filters.tanggal_dari + 'T00:00:00+08:00')
      if (filters.tanggal_sampai) query = query.lte('created_at', filters.tanggal_sampai + 'T23:59:59+08:00')

      const { data, error, count } = await query
      if (error) throw error
      list.value  = data || []
      total.value = count || 0
    } catch (e) {
      console.error('fetchAudit error:', e.message)
    } finally {
      loading.value = false
    }
  }

  return { list, loading, total, log, fetchAll }
})
