import { supabase } from '../lib/supabase'

export async function getActiveTimeSlots() {
  const { data, error } = await supabase
    .from('time_slots')
    .select('id, time')
    .eq('active', true)
    .order('time')

  if (error) {
    console.error('Error al cargar horarios:', error)
    return []
  }

  return data
}