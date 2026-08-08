import { supabase } from '../lib/supabase'

export async function getActiveServices() {
  const { data, error } = await supabase
  .from('services')
  .select('id, name, price, duration')
  .eq('active', true)
  .order('name')

  if (error) {
    console.error('Error al cargar servicios:', error)
    return []
  }

  

  return data
}