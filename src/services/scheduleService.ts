import { supabase } from '../lib/supabase'

export async function getScheduleForDate(
  date: string,
  barberId?: string
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
  }

  if (exception) {
    return {
      is_open: exception.is_open,
      open_time: exception.open_time,
      close_time: exception.close_time,
    }
  }

  // Excepción específica del barbero para esta fecha
if (barberId) {
  const {
    data: barberException,
    error: barberExceptionError,
  } = await supabase
    .from('barber_schedule_exceptions')
    .select(
      'is_open, open_time, last_appointment_time'
    )
    .eq('barber_id', barberId)
    .eq('exception_date', date)
    .maybeSingle()

  if (barberExceptionError) {
    console.error(
      'Error al cargar excepción del barbero:',
      barberExceptionError
    )
  }

  if (barberException) {
    return {
      is_open: barberException.is_open,
      open_time: barberException.open_time,
      close_time:
        barberException.last_appointment_time,
    }
  }
}

  const weekday = new Date(
    `${date}T12:00:00`
  ).getDay()

  // Primero intentamos usar el horario individual del barbero
  if (barberId) {
    const {
      data: barberHours,
      error: barberHoursError,
    } = await supabase
      .from('barber_hours')
      .select(
        'is_open, open_time, last_appointment_time'
      )
      .eq('barber_id', barberId)
      .eq('weekday', weekday)
      .maybeSingle()

    if (barberHoursError) {
      console.error(
        'Error al cargar horario del barbero:',
        barberHoursError
      )
    }

    if (barberHours) {
      return {
        is_open: barberHours.is_open,
        open_time: barberHours.open_time,
        close_time:
          barberHours.last_appointment_time,
      }
    }
  }

  // Fallback: horario general del negocio
  const {
    data: businessHours,
    error: hoursError,
  } = await supabase
    .from('business_hours')
    .select('is_open, open_time, close_time')
    .eq('weekday', weekday)
    .maybeSingle()

  if (hoursError) {
    console.error(
      'Error al cargar horario del negocio:',
      hoursError
    )

    return {
      is_open: false,
      open_time: null,
      close_time: null,
    }
  }

  return (
    businessHours ?? {
      is_open: false,
      open_time: null,
      close_time: null,
    }
  )
}