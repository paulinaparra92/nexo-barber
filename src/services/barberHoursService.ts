import { supabase } from '../lib/supabase'

export async function getBarberHours(barberId: string) {
  const { data, error } = await supabase
    .from('barber_hours')
    .select(
      'id, weekday, is_open, open_time, last_appointment_time'
    )
    .eq('barber_id', barberId)
    .order('weekday')

  if (error) {
    console.error(
      'Error al cargar disponibilidad del barbero:',
      error
    )

    return []
  }

  return data ?? []
}

export async function updateBarberHours(
  hours: {
    id: string
    is_open: boolean
    open_time: string | null
    last_appointment_time: string | null
  }[]
) {
  for (const day of hours) {
    const { error } = await supabase
      .from('barber_hours')
      .update({
        is_open: day.is_open,
        open_time: day.is_open
          ? day.open_time
          : null,
        last_appointment_time: day.is_open
          ? day.last_appointment_time
          : null,
      })
      .eq('id', day.id)

    if (error) {
      console.error(
        'Error al actualizar disponibilidad:',
        error
      )

      return false
    }
  }

  return true
}