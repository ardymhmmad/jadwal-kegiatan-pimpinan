import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAgendaStore = defineStore('agenda', () => {
  const agendaList = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ─── Helpers ───────────────────────────────────────────────
  function todayStr() {
    return new Date().toISOString().split('T')[0]
  }
  function weekRange() {
    const now = new Date()
    const day = now.getDay()
    const mon = new Date(now)
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    return {
      start: mon.toISOString().split('T')[0],
      end:   sun.toISOString().split('T')[0],
    }
  }
  function monthRange() {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
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
        .select('id,tanggal,waktu,kegiatan,tempat,keterangan,prioritas,created_at,updated_at')
        .order('tanggal', { ascending: true })
        .order('waktu',   { ascending: true })
        .lt('created_at', new Date(Date.now() + 86400000).toISOString()) // bypass cache

      if (filters.tanggal) {
        query = query.eq('tanggal', filters.tanggal)
      }
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
      // Buat query baru setiap kali dipanggil — hindari reuse connection
      const today = new Date().toISOString().split('T')[0]
      const { data, error: err } = await supabase
        .from('agenda')
        .select('id,tanggal,waktu,kegiatan,tempat,keterangan,prioritas')
        .gte('tanggal', today)
        .order('tanggal',   { ascending: true })
        .order('prioritas', { ascending: false })
        .order('waktu',     { ascending: true })
        .limit(50)
      if (err) throw err
      agendaList.value = data || []
    } catch (e) {
      error.value = e.message
      console.error('fetchFromToday error:', e.message)
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const { error: err } = await supabase
      .from('agenda')
      .insert([payload])
    if (err) throw err
  }

  async function update(id, payload) {
    const { error: err } = await supabase
      .from('agenda')
      .update(payload)
      .eq('id', id)
    if (err) throw err
  }

  async function remove(id) {
    const { error: err } = await supabase
      .from('agenda')
      .delete()
      .eq('id', id)
    if (err) throw err
  }

  return {
    agendaList, loading, error,
    todayCount, weekCount, monthCount, todayAgenda, displayAgenda,
    fetchAll, fetchFromToday, create, update, remove,
  }
})
