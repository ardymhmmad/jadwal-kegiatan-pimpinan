import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAgendaStore = defineStore('agenda', () => {
  const agendaList = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ─── Helpers (WITA UTC+8) ──────────────────────────────────
  function nowWITA() {
    // Ambil waktu sekarang dalam zona WITA (UTC+8)
    const now = new Date()
    const wita = new Date(now.getTime() + (8 * 60 * 60 * 1000))
    return wita
  }
  function todayStr() {
    return nowWITA().toISOString().split('T')[0]
  }
  function weekRange() {
    const now = nowWITA()
    const day = now.getUTCDay()
    const mon = new Date(now)
    mon.setUTCDate(now.getUTCDate() - (day === 0 ? 6 : day - 1))
    const sun = new Date(mon)
    sun.setUTCDate(mon.getUTCDate() + 6)
    return {
      start: mon.toISOString().split('T')[0],
      end:   sun.toISOString().split('T')[0],
    }
  }
  function monthRange() {
    const now = nowWITA()
    const year  = now.getUTCFullYear()
    const month = now.getUTCMonth()
    const start = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0]
    const end   = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0]
    return { start, end }
  }

  // ─── Computed stats ────────────────────────────────────────
  const todayCount = computed(() =>
    agendaList.value.filter(a => a.tanggal === todayStr()).length
  )
  const weekCount = computed(() => {
    const { start, end } = weekRange()
    return agendaList.value.filter(a => a.tanggal >= start && a.tanggal <= end).length
  })
  const monthCount = computed(() => {
    const { start, end } = monthRange()
    return agendaList.value.filter(a => a.tanggal >= start && a.tanggal <= end).length
  })

  // ─── Today's agenda for Display ────────────────────────────
  const todayAgenda = computed(() => {
    return agendaList.value
      .filter(a => a.tanggal === todayStr())
      .sort((a, b) => {
        if (a.prioritas !== b.prioritas) return a.prioritas ? -1 : 1
        // tentatif (null waktu) ke bawah
        if (!a.waktu && !b.waktu) return 0
        if (!a.waktu) return 1
        if (!b.waktu) return -1
        return a.waktu.localeCompare(b.waktu)
      })
  })

  // ─── Display agenda: hari ini + mendatang, maks 8, sort prioritas per hari ───
  const displayAgenda = computed(() => {
    const today = todayStr()
    return agendaList.value
      .filter(a => a.tanggal >= today)
      .sort((a, b) => {
        if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal)
        if (a.prioritas !== b.prioritas) return a.prioritas ? -1 : 1
        // tentatif (null waktu) ke bawah
        if (!a.waktu && !b.waktu) return 0
        if (!a.waktu) return 1
        if (!b.waktu) return -1
        return a.waktu.localeCompare(b.waktu)
      })
      .slice(0, 8)
  })

  // ─── Fetch ─────────────────────────────────────────────────
  async function fetchAll(filters = {}) {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('agenda')
        .select('id,tanggal,tanggal_akhir,waktu,kegiatan,tempat,keterangan,prioritas,created_at,updated_at')
        .order('tanggal', { ascending: true })
        .order('waktu',   { ascending: true })

      // Filter akan datang — sembunyikan yang sudah lewat (tanggal_akhir atau tanggal < hari ini)
      if (filters.akanDatang) {
        const today = todayStr()
        // Tampilkan jika tanggal_akhir >= today ATAU (tanggal_akhir null dan tanggal >= today)
        query = query.or(`tanggal_akhir.gte.${today},and(tanggal_akhir.is.null,tanggal.gte.${today})`)
      }
      if (filters.tanggal) query = query.eq('tanggal', filters.tanggal)
      if (filters.search) {
        query = query.or(
          `kegiatan.ilike.%${filters.search}%,tempat.ilike.%${filters.search}%,keterangan.ilike.%${filters.search}%`
        )
      }

      const { data, error: err } = await query
      if (err) throw err
      agendaList.value = data || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchFromToday() {
    loading.value = true
    error.value = null
    try {
      const today = todayStr()
      const { data, error: err } = await supabase
        .from('agenda')
        .select('id,tanggal,tanggal_akhir,waktu,kegiatan,tempat,keterangan,prioritas')
        .or(`tanggal_akhir.gte.${today},and(tanggal_akhir.is.null,tanggal.gte.${today})`)
        .order('tanggal',   { ascending: true })
        .order('prioritas', { ascending: false })
        .order('waktu',     { ascending: true })
        .limit(50)
      if (err) throw err
      agendaList.value = data || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
        .limit(50)
      if (err) throw err
      agendaList.value = data || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const { error: err } = await supabase.from('agenda').insert([payload])
    if (err) throw err
  }

  async function update(id, payload) {
    const { error: err } = await supabase.from('agenda').update(payload).eq('id', id)
    if (err) throw err
  }

  async function remove(id) {
    const { error: err } = await supabase.from('agenda').delete().eq('id', id)
    if (err) throw err
  }

  return {
    agendaList, loading, error,
    todayCount, weekCount, monthCount, todayAgenda, displayAgenda,
    fetchAll, fetchFromToday, create, update, remove,
  }
})
