import { supabase } from '../lib/supabase'

export async function getActiveBarbers() {
  const { data, error } = await supabase
    .from('barbers')
    .select('id, name, role, notification_email')
    .eq('active', true)
    .order('name')

  if (error) {
    console.error('Error al cargar barberos:', error)
    return []
  }

  return data
}