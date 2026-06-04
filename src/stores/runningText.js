import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useRunningTextStore = defineStore('runningText', () => {
  const list    = ref([])
  const loading = ref(false)

  const aktifList = computed(() =>
    list.value.filter(t => t.aktif).sort((a, b) => a.urutan - b.urutan)
  )

  // Gabungkan semua teks aktif jadi satu string dengan separator
  const tickerText = computed(() =>
    aktifList.value.map(t => t.teks).join('   ✦   ')
  )

  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase
      .from('running_text')
      .select('*')
      .order('urutan', { ascending: true })
    if (error) throw error
    list.value    = data || []
    loading.value = false
  }

  async function create(payload) {
    const { data, error } = await supabase
      .from('running_text')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function update(id, payload) {
    const { data, error } = await supabase
      .from('running_text')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function remove(id) {
    const { error } = await supabase
      .from('running_text')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return { list, loading, aktifList, tickerText, fetchAll, create, update, remove }
})
