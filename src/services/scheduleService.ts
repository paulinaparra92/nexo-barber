import { supabase } from '../lib/supabase'

export async function getScheduleForDate(
  date: string
) {
  const { data: exception, error: exceptionError } =
    await supabase
      .from('schedule_exceptions')
      .select('is_open, open_time, close_time')
      .eq('exception_date', date)
      .maybeSingle()

  if (exceptionError) {
    console.error(
      'Error al cargar excepción de horario:',
      exceptionError
    )
    return null
  }

  if (exception) {
    return exception
  }

  const weekday = new Date(`${date}T12:00:00`).getDay()

  const { data: businessHours, error: hoursError } =
    await supabase
      .from('business_hours')
      .select('is_open, open_time, close_time')
      .eq('weekday', weekday)
      .single()

  if (hoursError) {
    console.error(
      'Error al cargar horario del negocio:',
      hoursError
    )
    return null
  }

  return businessHours
}
