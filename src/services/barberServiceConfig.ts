import { supabase } from '../lib/supabase'

export async function getBarberServiceConfig(
  barberId: string,
  serviceId: string
) {
  const { data, error } = await supabase
    .from('barber_services')
    .select(`
      duration_override,
      price_override,
      active
    `)
    .eq('barber_id', barberId)
    .eq('service_id', serviceId)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('Error al cargar configuración del barbero:', error)
    return null
  }

  return data
}
export async function getBarberServiceConfigs(
  barberId: string
) {
  const { data, error } = await supabase
    .from('barber_services')
    .select(`
      service_id,
      duration_override,
      price_override,
      active
    `)
    .eq('barber_id', barberId)
    .eq('active', true)

  if (error) {
    console.error(
      'Error al cargar configuraciones del barbero:',
      error
    )
    return []
  }

  return data
}