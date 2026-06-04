import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useInstansiStore = defineStore('instansi', () => {
  const data    = ref(null)
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    const { data: row } = await supabase
      .from('instansi')
      .select('*')
      .limit(1)
      .single()
    data.value    = row
    loading.value = false
  }

  async function update(payload) {
    const { data: row, error } = await supabase
      .from('instansi')
      .update(payload)
      .eq('id', data.value.id)
      .select()
      .single()
    if (error) throw error
    data.value = row
    return row
  }

  async function uploadLogo(file) {
    const ext      = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('instansi-assets')
      .upload(fileName, file, { upsert: true })
    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('instansi-assets')
      .getPublicUrl(fileName)
    return urlData.publicUrl
  }

  return { data, loading, fetch, update, uploadLogo }
})
