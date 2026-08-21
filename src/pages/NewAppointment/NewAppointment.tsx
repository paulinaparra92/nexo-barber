import PageContainer from '../../components/layout/PageContainer/PageContainer'
import { useEffect, useState } from 'react'
import { getActiveBarbers } from '../../services/barberService'
import {
    createAppointment,
    getAppointmentById,
    updateAppointment,
} from '../../services/appointmentService'
import { getActiveTimeSlots } from '../../services/timeSlotService'
import {
    getBookedTimes,
    getBookedAppointments,
} from '../../services/availabilityService'
import { findClientByWhatsapp } from '../../services/clientService'
import './NewAppointment.css'
import { getActiveServices } from '../../services/serviceService'
import {
    getBarberServiceConfig,
    getBarberServiceConfigs,
} from '../../services/barberServiceConfig'


type NewAppointmentProps = {
    onBack: () => void
    onSaved: () => void
    currentBarberName: string
    currentBarberId: string
    role: 'partner' | 'barber'
    editingAppointmentId?: string | null
    initialDate?: string | null
}

function NewAppointment({
    onBack,
    onSaved,
    currentBarberName,
    currentBarberId,
    role,
    editingAppointmentId,
    initialDate,
}: NewAppointmentProps) {

    const [barbers, setBarbers] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])

    const [selectedBarber, setSelectedBarber] = useState(
        role === 'barber' ? currentBarberName : ''
    )
    const [clientName, setClientName] = useState('')
    const [service, setService] = useState('')
    const [appointmentDate, setAppointmentDate] = useState(
        initialDate ?? new Date().toISOString().split('T')[0]
    )
    const [appointmentTime, setAppointmentTime] = useState('')
    const selectedService = services.find(
        (item) =>
            item.name.trim().toLowerCase() ===
            service.trim().toLowerCase()
    )

    const [barberServiceConfig, setBarberServiceConfig] = useState<any>(null)

    const price = Number(
        barberServiceConfig?.price_override ??
        selectedService?.price ??
        0
    )

    const duration = Number(
        barberServiceConfig?.duration_override ??
        selectedService?.duration ??
        0
    )


    const [whatsapp, setWhatsapp] = useState('')

    const [barberServiceConfigs, setBarberServiceConfigs] = useState<any[]>([])


    function timeToMinutes(time: string) {
        const [hours, minutes] = time.split(':').map(Number)

        return hours * 60 + minutes
    }

    function hasTimeConflict(time: string) {
        if (!service || duration === 0) return false

        const newStart = timeToMinutes(time)
        const newEnd = newStart + duration

        return bookedAppointments.some((appointment) => {
            if (
                editingAppointmentId &&
                appointment.id === editingAppointmentId
            ) {
                return false
            }
            const existingStart = timeToMinutes(
                appointment.appointment_time
            )

            const existingService = services.find(
                (item) =>
                    item.name.trim().toLowerCase() ===
                    appointment.service.trim().toLowerCase()
            )

            const existingConfig = barberServiceConfigs.find(
                (config) =>
                    config.service_id === existingService?.id
            )

            const existingDuration = Number(
                existingConfig?.duration_override ??
                existingService?.duration ??
                30
            )

            const existingEnd =
                existingStart + existingDuration

            return (
                newStart < existingEnd &&
                newEnd > existingStart
            )
        })
    }
    const [timeSlots, setTimeSlots] = useState<any[]>([])
    const [bookedTimes, setBookedTimes] = useState<string[]>([])
    const [bookedAppointments, setBookedAppointments] = useState<any[]>([])

    useEffect(() => {
        async function loadBarbers() {
            if (role !== 'partner') return

            const data = await getActiveBarbers()
            setBarbers(data)
        }

        loadBarbers()
    }, [role])

    useEffect(() => {
        async function loadServices() {
            const data = await getActiveServices()
            setServices(data)
        }

        loadServices()
    }, [])

    useEffect(() => {
        async function loadAvailability() {
            const slots = await getActiveTimeSlots()
            setTimeSlots(slots)

            if (!selectedBarber || !appointmentDate) {
                setBookedTimes([])
                setBookedAppointments([])
                return
            }

            const times = await getBookedTimes(
                selectedBarber,
                appointmentDate
            )

            const appointmentsData = await getBookedAppointments(
                selectedBarber,
                appointmentDate
            )

            setBookedTimes(times)
            setBookedAppointments(appointmentsData)
        }

        loadAvailability()
    }, [selectedBarber, appointmentDate])


    useEffect(() => {
        async function loadBarberServiceConfigs() {
            if (!selectedBarber) {
                setBarberServiceConfigs([])
                return
            }

            const barber = barbers.find(
                (item) => item.name === selectedBarber
            )

            if (!barber?.id) {
                setBarberServiceConfigs([])
                return
            }

            const configs = await getBarberServiceConfigs(
                barber.id
            )

            setBarberServiceConfigs(configs)
        }

        loadBarberServiceConfigs()
    }, [selectedBarber, barbers])

    async function handleSaveAppointment() {
        if (
            !selectedBarber ||
            !clientName ||
            !service ||
            !appointmentDate ||
            !appointmentTime
        ) {
            alert('Completa todos los datos de la cita')
            return
        }
        if (hasTimeConflict(appointmentTime)) {
            alert(
                'Ese horario ya no está disponible. Selecciona otro horario.'
            )
            return
        }

        const selectedBarberData =
            role === 'barber'
                ? {
                    id: currentBarberId,
                    name: currentBarberName,
                }
                : barbers.find(
                    (item) =>
                        item.name.trim().toLowerCase() ===
                        selectedBarber.trim().toLowerCase()
                )

        



        const appointmentData = {
            client_name: clientName,
            whatsapp,
            service,
            barber: selectedBarber,
            barber_id: selectedBarberData?.id,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            price,
        }

        let result

        if (editingAppointmentId) {
            result = await updateAppointment(
                editingAppointmentId,
                appointmentData
            )
        } else {
            result = await createAppointment(
                appointmentData
            )
        }

        if (result) {
            onSaved()
        }

    }



    async function handleWhatsappBlur() {
        if (!whatsapp.trim()) return

        const client = await findClientByWhatsapp(
            whatsapp.trim()
        )

        if (client) {
            setClientName(client.client_name)
        }
    }

    function formatTime(time: string) {
        const [hours, minutes] = time.split(':').map(Number)

        const period = hours >= 12 ? 'PM' : 'AM'
        const formattedHour = hours % 12 || 12

        return `${formattedHour}:${minutes
            .toString()
            .padStart(2, '0')} ${period}`
    }


    useEffect(() => {
        async function loadAppointmentForEdit() {
            if (!editingAppointmentId) return

            const appointment = await getAppointmentById(
                editingAppointmentId
            )

            if (!appointment) return

            setSelectedBarber(appointment.barber)
            setClientName(appointment.client_name)
            setWhatsapp(appointment.whatsapp ?? '')
            setService(appointment.service)
            setAppointmentDate(appointment.appointment_date)
            setAppointmentTime(
                appointment.appointment_time.substring(0, 5)
            )
        }

        loadAppointmentForEdit()
    }, [editingAppointmentId])

    useEffect(() => {
        async function loadBarberServiceConfig() {
            if (!selectedBarber || !selectedService?.id) {
                setBarberServiceConfig(null)
                return
            }

            const barber = barbers.find(
                (item) => item.name === selectedBarber
            )

            if (!barber?.id) {
                setBarberServiceConfig(null)
                return
            }

            const config = await getBarberServiceConfig(
                barber.id,
                selectedService.id
            )

            setBarberServiceConfig(config)
        }

        loadBarberServiceConfig()
    }, [selectedBarber, selectedService, barbers])



    return (
        <PageContainer>
            <main className="new-appointment-page">
                <div className="new-appointment-card">
                    <button
                        type="button"
                        onClick={onBack}
                        className="back-button"
                    >
                        ← Volver
                    </button>

                    <div className="new-appointment-header">
                        <h1>
                            {editingAppointmentId ? 'Editar cita' : 'Nueva cita'}
                        </h1>

                        <p>
                            {editingAppointmentId
                                ? 'Modifica los datos de la cita.'
                                : 'Registra una cita en la agenda.'}
                        </p>
                    </div>

                    {role === 'partner' ? (
                        <div>
                            <label>Barbero</label>

                            <select
                                value={selectedBarber}
                                onChange={(e) => setSelectedBarber(e.target.value)}
                            >
                                <option value="">Selecciona un barbero</option>

                                {barbers.map((barber) => (
                                    <option
                                        key={barber.id}
                                        value={barber.name}
                                    >
                                        {barber.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label>Barbero</label>
                            <p><strong>{currentBarberName}</strong></p>
                        </div>
                    )}



                    <div>
                        <label>WhatsApp</label>

                        <input
                            type="tel"
                            placeholder="Ej. 6251234567"
                            value={whatsapp}
                            onChange={(e) => {
                                setWhatsapp(e.target.value)
                                setClientName('')
                            }}
                            onBlur={handleWhatsappBlur}
                        />
                    </div>

                    <div>
                        <label>Cliente</label>

                        <input
                            type="text"
                            placeholder="Nombre del cliente"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>


                    <div>
                        <label>Servicio</label>
                        <div>


                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                            >
                                <option value="">Selecciona un servicio</option>
                                <option value="Corte">Corte</option>
                                <option value="Barba">Barba</option>
                                <option value="Corte + Barba">Corte + Barba</option>
                            </select>
                        </div>
                        {service && (
                            <p>
                                Precio: <strong>${price}</strong>
                            </p>
                        )}
                    </div>


                    <div className="date-time-row">
                        <div>
                            <label>Fecha</label>

                            <input
                                type="date"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Hora</label>

                            <select
                                value={appointmentTime}
                                onChange={(e) => setAppointmentTime(e.target.value)}
                            >
                                <option value="">Selecciona una hora</option>

                                {timeSlots.map((slot) => {
                                    const time = slot.time.substring(0, 5)
                                    const isBooked = bookedTimes.includes(time)
                                    const hasConflict = hasTimeConflict(time)
                                    const isUnavailable = isBooked || hasConflict

                                    return (
                                        <option
                                            key={slot.id}
                                            value={time}
                                            disabled={isUnavailable}
                                        >
                                            {formatTime(time)} {isUnavailable ? '— Ocupado' : ''}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSaveAppointment}
                        className="save-appointment-button"
                    >
                        {editingAppointmentId ? 'Guardar cambios' : 'Guardar cita'}
                    </button>
                </div>
            </main>
        </PageContainer>
    )
}

export default NewAppointment