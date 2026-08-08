import { supabase } from '../lib/supabase'

export async function getBookedTimes(
  barber: string,
  appointmentDate: string
) {
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('barber', barber)
    .eq('appointment_date', appointmentDate)
    .neq('status', 'cancelled')

  if (error) {
    console.error('Error al cargar horarios ocupados:', error)
    return []
  }
  console.log('Citas encontradas:', data)
console.log(
  'Horas ocupadas:',
  data.map((item) => item.appointment_time)
)
  


return data.map((item) => item.appointment_time.substring(0, 5))
}