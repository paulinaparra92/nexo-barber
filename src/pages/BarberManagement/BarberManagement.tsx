import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
    getBarberHours,
    updateBarberHours,
} from '../../services/barberHoursService'
import {
    getBarberScheduleExceptions,
    createBarberScheduleException,
    updateBarberScheduleException,
    deleteBarberScheduleException,
} from '../../services/barberScheduleExceptionsService'
import './BarberManagement.css'




type Barber = {
    id: string
    name: string
}

type BarberHour = {
    id: string
    weekday: number
    is_open: boolean
    open_time: string | null
    last_appointment_time: string | null
}

type BarberManagementProps = {
    onBack: () => void
}

const weekdayNames = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
]

const scheduleTimeOptions = Array.from(
    { length: 37 },
    (_, index) => {
        const totalMinutes = 8 * 60 + index * 20

        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        return `${String(hours).padStart(2, '0')}:${String(
            minutes
        ).padStart(2, '0')}`
    }
)

function formatTime(time: string) {
    const [hours, minutes] = time.split(':').map(Number)

    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours % 12 || 12

    return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
}
function formatExceptionDate(date: string) {
    const [year, month, day] = date
        .split('-')
        .map(Number)

    return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(
        new Date(year, month - 1, day)
    )
}

function BarberManagement({
    onBack,
}: BarberManagementProps) {
    const [barbers, setBarbers] = useState<Barber[]>([])
    const [selectedBarberId, setSelectedBarberId] =
        useState('')
    const [hours, setHours] = useState<BarberHour[]>([])
    const [exceptions, setExceptions] = useState<any[]>([])
    const [showExceptionForm, setShowExceptionForm] =
        useState(false)
    const [editingExceptionId, setEditingExceptionId] = useState<string | null>(null)
    const [exceptionDate, setExceptionDate] = useState('')
    const [exceptionIsOpen, setExceptionIsOpen] = useState(false)
    const [exceptionOpenTime, setExceptionOpenTime] =
        useState('08:00')
    const [
        exceptionLastAppointmentTime,
        setExceptionLastAppointmentTime,
    ] = useState('18:00')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadBarbers() {
            const { data, error } = await supabase
                .from('barbers')
                .select('id, name')
                .eq('active', true)
                .order('name')

            if (error) {
                console.error(
                    'Error al cargar barberos:',
                    error
                )
                return
            }

            setBarbers(data ?? [])
        }

        loadBarbers()
    }, [])

    useEffect(() => {
        async function loadHours() {
            console.log(
                'Barbero seleccionado:',
                selectedBarberId
            )

            if (!selectedBarberId) {
                setHours([])
                return
            }

            setLoading(true)

            const data =
                await getBarberHours(selectedBarberId)

            console.log(
                'Horarios recibidos:',
                data
            )

            setHours(data)
            setLoading(false)
        }

        loadHours()
    }, [selectedBarberId])



    useEffect(() => {
        async function loadExceptions() {
            if (!selectedBarberId) {
                setExceptions([])
                return
            }

            const data =
                await getBarberScheduleExceptions(
                    selectedBarberId
                )

            setExceptions(data)
        }

        loadExceptions()
    }, [selectedBarberId])


    function updateDay(
        id: string,
        changes: Partial<BarberHour>
    ) {
        setHours((current) =>
            current.map((day) =>
                day.id === id
                    ? { ...day, ...changes }
                    : day
            )
        )
    }

    async function handleSave() {
        setMessage('')
        setError('')
        setSaving(true)

        const success = await updateBarberHours(
            hours.map((day) => ({
                id: day.id,
                is_open: day.is_open,
                open_time: day.is_open
                    ? day.open_time
                    : null,
                last_appointment_time: day.is_open
                    ? day.last_appointment_time
                    : null,
            }))
        )

        setSaving(false)

        if (!success) {
            setError(
                'No pudimos guardar la disponibilidad.'
            )
            return
        }

        setMessage(
            'Disponibilidad actualizada correctamente.'
        )
    }

    async function handleSaveException() {
        if (!selectedBarberId || !exceptionDate) {
            setError('Selecciona una fecha.')
            return
        }

        setError('')
        setMessage('')

        const exceptionData = {
            exception_date: exceptionDate,
            is_open: exceptionIsOpen,
            open_time: exceptionIsOpen
                ? exceptionOpenTime
                : null,
            last_appointment_time: exceptionIsOpen
                ? exceptionLastAppointmentTime
                : null,
        }

        if (editingExceptionId) {
            const updatedException =
                await updateBarberScheduleException(
                    editingExceptionId,
                    exceptionData
                )

            if (!updatedException) {
                setError(
                    'No pudimos actualizar la fecha especial.'
                )
                return
            }

            setExceptions((current) =>
                current.map((exception) =>
                    exception.id === editingExceptionId
                        ? updatedException
                        : exception
                )
            )

            setMessage('Fecha especial actualizada.')
        } else {
            const newException =
                await createBarberScheduleException({
                    barber_id: selectedBarberId,
                    ...exceptionData,
                })

            if (!newException) {
                setError(
                    'No pudimos guardar la fecha especial.'
                )
                return
            }

            setExceptions((current) => [
                ...current,
                newException,
            ])

            setMessage('Fecha especial guardada.')
        }

        setShowExceptionForm(false)
        setEditingExceptionId(null)
        setExceptionDate('')
        setExceptionIsOpen(false)
        setExceptionOpenTime('08:00')
        setExceptionLastAppointmentTime('18:00')
    }
    function handleEditException(exception: any) {
        setEditingExceptionId(exception.id)
        setExceptionDate(exception.exception_date)
        setExceptionIsOpen(exception.is_open)
        setExceptionOpenTime(
            exception.open_time?.substring(0, 5) || '08:00'
        )
        setExceptionLastAppointmentTime(
            exception.last_appointment_time?.substring(0, 5) || '18:00'
        )
        setShowExceptionForm(true)
        setMessage('')
        setError('')
    }
    async function handleDeleteException(
        exceptionId: string
    ) {
        const confirmed = window.confirm(
            '¿Eliminar esta fecha especial?'
        )

        if (!confirmed) return

        setError('')
        setMessage('')

        const success =
            await deleteBarberScheduleException(
                exceptionId
            )

        if (!success) {
            setError(
                'No pudimos eliminar la fecha especial.'
            )
            return
        }

        setExceptions((current) =>
            current.filter(
                (exception) =>
                    exception.id !== exceptionId
            )
        )

        setMessage('Fecha especial eliminada.')
    }

    return (
        <main className="my-account-page">
            <button
                type="button"
                className="my-account-back"
                onClick={onBack}
            >
                ← Volver a la agenda
            </button>

            <header className="my-account-header">
                <span>Administración</span>
                <h1>Barberos</h1>
            </header>

            <section className="my-account-card">
                <h2>Disponibilidad</h2>

                <p className="my-account-description">
                    Selecciona un barbero para consultar
                    su horario de citas.
                </p>

                <div className="my-account-field">
                    <label>Barbero</label>

                    <select
                        value={selectedBarberId}
                        onChange={(e) =>
                            setSelectedBarberId(e.target.value)
                        }
                    >
                        <option value="">
                            Selecciona un barbero
                        </option>

                        {barbers.map((barber) => (
                            <option
                                key={barber.id}
                                value={barber.id}
                            >
                                {barber.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <p>Cargando disponibilidad...</p>
                )}

                {!loading &&
                    selectedBarberId &&
                    hours.length === 0 && (
                        <p>
                            No encontramos disponibilidad
                            configurada para este barbero.
                        </p>
                    )}

                {!loading && hours.length > 0 && (
                    <div className="availability-list">
                        {hours.map((day) => (
                            <div
                                key={day.id}
                                className="availability-edit-row"
                            >
                                <div className="availability-day-header">
                                    <strong>
                                        {weekdayNames[day.weekday]}
                                    </strong>

                                    <label className="availability-toggle">
                                        <input
                                            type="checkbox"
                                            checked={day.is_open}
                                            onChange={(e) => {
                                                const isOpen = e.target.checked

                                                updateDay(day.id, {
                                                    is_open: isOpen,
                                                    open_time:
                                                        isOpen && !day.open_time
                                                            ? '08:00'
                                                            : day.open_time,
                                                    last_appointment_time:
                                                        isOpen && !day.last_appointment_time
                                                            ? '08:00'
                                                            : day.last_appointment_time,
                                                })
                                            }}
                                        />

                                        <span>
                                            {day.is_open
                                                ? 'Trabaja'
                                                : 'Cerrado'}
                                        </span>
                                    </label>
                                </div>

                                {day.is_open && (
                                    <div className="availability-time-fields">
                                        <div>
                                            <label>Primera cita</label>

                                            <select
                                                value={day.open_time?.substring(0, 5) ?? ''}
                                                onChange={(e) =>
                                                    updateDay(day.id, {
                                                        open_time: e.target.value,
                                                    })
                                                }
                                            >
                                                {scheduleTimeOptions.map((time) => (
                                                    <option key={time} value={time}>
                                                        {formatTime(time)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label>Última cita</label>

                                            <select
                                                value={
                                                    day.last_appointment_time?.substring(0, 5) ?? ''
                                                }
                                                onChange={(e) =>
                                                    updateDay(day.id, {
                                                        last_appointment_time: e.target.value,
                                                    })
                                                }
                                            >
                                                {scheduleTimeOptions.map((time) => (
                                                    <option key={time} value={time}>
                                                        {formatTime(time)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>


                        ))}
                    </div>



                )}
            </section>

            {/* FECHAS ESPECIALES */}
            <section className="my-account-section">
                <div className="account-section-header">
                    <div>
                        <h3>Fechas especiales</h3>
                        <p>
                            Cambios de horario o días libres
                            para fechas específicas.
                        </p>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setShowExceptionForm(true)}
                        >
                            + Agregar fecha especial
                        </button>
                    </div>
                </div>
                {showExceptionForm && (
                    <div className="availability-edit-row">
                        <div className="my-account-field">
                            <label>Fecha</label>

                            <input
                                type="date"
                                value={exceptionDate}
                                onChange={(e) =>
                                    setExceptionDate(e.target.value)
                                }
                            />
                        </div>

                        <div className="availability-day-header">
                            <strong>¿Trabaja este día?</strong>

                            <label className="availability-toggle">
                                <input
                                    type="checkbox"
                                    checked={exceptionIsOpen}
                                    onChange={(e) =>
                                        setExceptionIsOpen(
                                            e.target.checked
                                        )
                                    }
                                />

                                <span>
                                    {exceptionIsOpen
                                        ? 'Trabaja'
                                        : 'No trabaja'}
                                </span>
                            </label>
                        </div>

                        {exceptionIsOpen && (
                            <div className="availability-time-fields">
                                <div>
                                    <label>Primera cita</label>

                                    <select
                                        value={exceptionOpenTime}
                                        onChange={(e) =>
                                            setExceptionOpenTime(
                                                e.target.value
                                            )
                                        }
                                    >
                                        {scheduleTimeOptions.map((time) => (
                                            <option
                                                key={time}
                                                value={time}
                                            >
                                                {formatTime(time)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Última cita</label>

                                    <select
                                        value={
                                            exceptionLastAppointmentTime
                                        }
                                        onChange={(e) =>
                                            setExceptionLastAppointmentTime(
                                                e.target.value
                                            )
                                        }
                                    >
                                        {scheduleTimeOptions.map((time) => (
                                            <option
                                                key={time}
                                                value={time}
                                            >
                                                {formatTime(time)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className="exception-form-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => {
                                    setShowExceptionForm(false)
                                    setEditingExceptionId(null)
                                    setExceptionDate('')
                                    setExceptionIsOpen(false)
                                    setExceptionOpenTime('08:00')
                                    setExceptionLastAppointmentTime('18:00')
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleSaveException}
                            >
                                Guardar fecha especial
                            </button>
                        </div>
                    </div>

                )}

                {exceptions.length === 0 ? (
                    <p className="account-empty-text">
                        No hay fechas especiales configuradas.
                    </p>
                ) : (
                    <div className="availability-list">
                        {exceptions.map((exception) => (
                            <div
                                key={exception.id}
                                className="availability-row"
                            >
                                <div>
                                    <strong className="exception-date">
                                        {formatExceptionDate(
                                            exception.exception_date
                                        )}
                                    </strong>

                                    <div>
                                        {exception.is_open
                                            ? `${formatTime(
                                                exception.open_time?.substring(0, 5)
                                            )} – ${formatTime(
                                                exception.last_appointment_time?.substring(0, 5)
                                            )}`
                                            : 'No trabaja'}
                                    </div>
                                </div>

                                <div className="exception-actions">
                                    <button
                                        type="button"
                                        className="exception-edit-button"
                                        onClick={() => handleEditException(exception)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        className="exception-delete-button"
                                        onClick={() => handleDeleteException(exception.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>





            {error && (
                <p className="my-account-error">
                    {error}
                </p>
            )}

            {message && (
                <p className="my-account-success">
                    {message}
                </p>
            )}

            <button
                type="button"
                className="my-account-save"
                onClick={handleSave}
                disabled={saving}
            >
                {saving
                    ? 'Guardando...'
                    : 'Guardar disponibilidad'}
            </button>
        </main>
    )
}

export default BarberManagement