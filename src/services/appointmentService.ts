import { supabase } from '../lib/supabase'

type Appointment = {
  client_name: string
  whatsapp: string
  service: string
  barber: string
  appointment_date: string
  appointment_time: string
  price: number
}

export async function createAppointment(
  appointment: Appointment
) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        ...appointment,
        status: 'confirmed',
      },
    ])
    .select()

  if (error) {
    console.error('Error al crear cita:', error)
    return null
  }

  return data
}