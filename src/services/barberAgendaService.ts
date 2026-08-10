import { supabase } from '../lib/supabase'

export async function getAppointmentsByDate(
  barber: string,
  appointmentDate: string
) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('barber', barber)
    .eq('appointment_date', appointmentDate)
    .order('appointment_time')

  if (error) {
    console.error('Error al cargar agenda:', error)
    return []
  }

  return data
}