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


  return data.map((item) => item.appointment_time.substring(0, 5))
}

export async function getBookedAppointments(
  barber: string,
  appointmentDate: string
) {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, appointment_time, service')
    .eq('barber', barber)
    .eq('appointment_date', appointmentDate)
    .neq('status', 'cancelled')

  if (error) {
    console.error('Error al cargar citas ocupadas:', error)
    return []
  }

  return data
}

export async function getPublicBookedTimes(
  barberId: string,
  appointmentDate: string
) {
  const { data, error } = await supabase.rpc(
    'get_public_booked_times',
    {
      p_barber_id: barberId,
      p_appointment_date: appointmentDate,
    }
  )

  if (error) {
    console.error(
      'Error al cargar disponibilidad pública:',
      error
    )
    return []
  }

  return data.map(
    (item: {
      appointment_time: string
      service: string
    }) => ({
      appointment_time: item.appointment_time.substring(0, 5),
      service: item.service,
    })
  )
}