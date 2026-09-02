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
  const appointmentId = crypto.randomUUID()

  const newAppointment = {
    ...appointment,
    id: appointmentId,
    status: 'confirmed',
  }

  const { error } = await supabase
    .from('appointments')
    .insert([newAppointment])

  if (error) {
    console.error('Error al crear cita:', error)
    return null
  }

  return [newAppointment]
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
  const appointmentId = crypto.randomUUID()

  const newAppointment = {
    ...appointment,
    id: appointmentId,
    status: 'confirmed',
    booking_source: 'public',
  }

  const { error } = await supabase
    .from('appointments')
    .insert([newAppointment])

  if (error) {
    console.error('Error al crear cita pública:', error)

    if (error.code === '23505') {
      return {
        success: false,
        reason: 'slot_taken',
      }
    }

    return {
      success: false,
      reason: 'unknown',
    }
  }

  return {
    success: true,
    reason: null,
    appointment: newAppointment,
  }
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