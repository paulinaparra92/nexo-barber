import { supabase } from '../lib/supabase'

export async function findClientByWhatsapp(
  whatsapp: string
) {
  const { data, error } = await supabase
    .from('appointments')
    .select('client_name, whatsapp')
    .eq('whatsapp', whatsapp)
    .neq('whatsapp', '')
    .order('appointment_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error al buscar cliente:', error)
    return null
  }

  return data
}