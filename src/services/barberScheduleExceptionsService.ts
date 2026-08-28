import { supabase } from '../lib/supabase'

export async function getBarberScheduleExceptions(
    barberId: string
) {
    const { data, error } = await supabase
        .from('barber_schedule_exceptions')
        .select(
            'id, barber_id, exception_date, is_open, open_time, last_appointment_time'
        )
        .eq('barber_id', barberId)
        .order('exception_date')

    if (error) {
        console.error(
            'Error al cargar excepciones del barbero:',
            error
        )
        return []
    }

    return data ?? []
}
export async function createBarberScheduleException(
    exception: {
        barber_id: string
        exception_date: string
        is_open: boolean
        open_time: string | null
        last_appointment_time: string | null
    }
) {
    const { data, error } = await supabase
        .from('barber_schedule_exceptions')
        .insert([exception])
        .select()
        .single()

    if (error) {
        console.error(
            'Error al crear excepción del barbero:',
            error
        )
        return null
    }

    return data
}

export async function deleteBarberScheduleException(
    exceptionId: string
) {
    const { error } = await supabase
        .from('barber_schedule_exceptions')
        .delete()
        .eq('id', exceptionId)

    if (error) {
        console.error(
            'Error al eliminar excepción del barbero:',
            error
        )
        return false
    }

    return true
}