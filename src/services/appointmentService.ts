import { supabase } from '../lib/supabase'

type Appointment = {
  client_name: string
  whatsapp: string
  service: string
  barber: string
  barber_id?: string
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

export async function updateAppointmentStatus(
  id: string,
  status: string
) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar estado de cita:', error)
    return null
  }

  return data
}

export async function getAppointmentById(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error al cargar la cita:', error)
    return null
  }

  return data
}

export async function createPublicAppointment(
  appointment: Appointment
) {
  const { error } = await supabase
    .from('appointments')
    .insert([
      {
        ...appointment,
        status: 'confirmed',
        booking_source: 'public',
      },
    ])

  if (error) {
    console.error('Error al crear cita pública:', error)
    return false
  }

  return true
}

export async function updateAppointment(
  id: string,
  appointment: {
    client_name: string
    whatsapp: string
    service: string
    barber: string
    barber_id?: string
    appointment_date: string
    appointment_time: string
    price: number
  }
) {
  const { data, error } = await supabase
    .from('appointments')
    .update(appointment)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar cita:', error)
    return null
  }

  return data
}