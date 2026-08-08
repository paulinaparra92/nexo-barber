import ServiceCard from '../../components/ui/ServiceCard/ServiceCard'
import type { PublicBookingStep } from '../../types/publicBooking'
import DateOption from '../../components/ui/DateOption'
import BookingSummary from '../../components/ui/BookingSummary/BookingSummary'
import TimeSlot from '../../components/ui/TimeSlot'
import { createAppointment } from '../../services/appointmentService'
import { useEffect, useState } from 'react'
import { getActiveServices } from '../../services/serviceService'
import { getTodayLabel, getTomorrowLabel,} from '../../utils/date'
import { getActiveTimeSlots } from '../../services/timeSlotService'
import { formatTimeLabel } from '../../utils/time'
import { getBookedTimes } from '../../services/availabilityService'

function PublicBooking() {
  const [step, setStep] = useState<PublicBookingStep>('service')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [selectedPrice, setSelectedPrice] = useState(0)
  const [customDate, setCustomDate] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])


  async function handleConfirmBooking() {
  const today = new Date()
  let formattedDate = ''

    if (selectedDate === 'Hoy') {
        formattedDate = today.toISOString().split('T')[0]
    }

    if (selectedDate === 'Mañana') {
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        formattedDate = tomorrow.toISOString().split('T')[0]
    }

    if (selectedDate === 'Elegir otra fecha') {
        formattedDate = customDate
    }

  const result = await createAppointment({
    client_name: customerName,
    whatsapp,
    service: selectedService,
    barber: selectedBarber,
    appointment_date: formattedDate,
    appointment_time: selectedTime,
    price: selectedPrice,
  })

  console.log(result)
}




useEffect(() => {
  async function loadServices() {
    const data = await getActiveServices()
    setServices(data)
    const slots = await getActiveTimeSlots()
    setTimeSlots(slots)
}

  loadServices()
}, [])



useEffect(() => {
  async function loadBookedTimes() {
    if (
      step !== 'time' ||
      !selectedBarber ||
      !selectedDate
    ) {
      return
    }

    let appointmentDate = ''

    const today = new Date()

    if (selectedDate === 'Hoy') {
      appointmentDate = today.toISOString().split('T')[0]
    }

    if (selectedDate === 'Mañana') {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      appointmentDate = tomorrow.toISOString().split('T')[0]
    }

    if (selectedDate === 'Elegir otra fecha') {
      appointmentDate = customDate
    }

    if (!appointmentDate) {
      return
    }

    const times = await getBookedTimes(
      selectedBarber,
      appointmentDate
    )

    setBookedTimes(times)
  }

  loadBookedTimes()
}, [
  step,
  selectedBarber,
  selectedDate,
  customDate,
])

  return (
    <main className="page">
      <h1>Agenda tu cita</h1>

        <BookingSummary
            service={selectedService}
            barber={selectedBarber}
            date={selectedDate}
            time={selectedTime}
        />


      {step === 'service' && (
        <>
          <h2>¿Qué servicio deseas?</h2>
            {services.map((service) => (
                <ServiceCard
                key={service.id}
                title={service.name}
                duration={`$${service.price} · ${service.duration} minutos`}
                onClick={() => {
                setSelectedService(service.name)
                setSelectedPrice(Number(service.price))
                setStep('barber')
                }}
                />
            ))}
          
        </>
      )}

      {step === 'barber' && (
        <>
          <h2>¿Con quién quieres tu cita?</h2>

          <ServiceCard
            title="Primera disponibilidad"
            duration="Te asignamos el primer horario disponible"
            onClick={() => {
                setSelectedBarber('Primera disponibilidad')
                setStep('date')
            }}
          />

          <ServiceCard
            title="Iván"
            duration="Barbero"
            onClick={() => {
                setSelectedBarber('Iván')
                setStep('date')
            }}
          />

          <ServiceCard
            title="Barber 2"
            duration="Barbero"
            onClick={() => {
                setSelectedBarber('Barber 2')
                setStep('date')
            }}
          />
        </>
      )}

      {step === 'date' && (
        <>
        <h2>¿Cuándo quieres tu cita?</h2>

        <div className="date-options">
            <DateOption
                title="Hoy"
                subtitle={getTodayLabel()}
                onClick={() => {
                    setSelectedDate('Hoy')
                    setStep('time')
                }}
            />

            <DateOption
                title="Mañana"
                subtitle={getTomorrowLabel()}
                onClick={() => {
                    setSelectedDate('Mañana')
                    setStep('time')
                }}
            />

            <DateOption
                title="Elegir otra fecha"
                subtitle="Abrir calendario"
                onClick={() => {
                setSelectedDate('Elegir otra fecha')
                }}
                />
                {selectedDate === 'Elegir otra fecha' && (
                <>
                    <input
                        type="date"
                        value={customDate}
                        onChange={(e) => {
                            setCustomDate(e.target.value)
                }}
                />

                    {customDate && (
                        <button
                        type="button"
                        className="confirm-booking-button"
                            onClick={() => setStep('time')}
                        >
                          Continuar
                         </button>
                         )}
                  </>
                 )}
                
                
        </div>
        </>
        )}

      {step === 'time' && (
        <>
            <h2>¿Qué horario prefieres?</h2>

            <div className="time-grid">
  {timeSlots.map((slot) => (
    <TimeSlot
      key={slot.id}
      time={formatTimeLabel(slot.time)}
      available={!bookedTimes.includes(slot.time)}
      selected={selectedTime === slot.time}
      onClick={() => {
        setSelectedTime(slot.time)
        setStep('customer')
      }}
    />
  ))}
</div>
        </>
    )}
    {step === 'customer' && (
        <>
        <h2>Perfecto.</h2>
        <p className="customer-intro">Solo necesitamos tus datos.</p>

        <label>¿Cómo te llamas?</label>
        <input
            type="text"
            placeholder="Escribe tu nombre"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
        />

        <label>
            ¿A qué WhatsApp te enviamos la confirmación?
        </label>
        <input
            type="tel"
            placeholder="6251234567"
            maxLength={10}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
        />

        <button
            type="button"
            className="confirm-booking-button"
            onClick={handleConfirmBooking}
            >
            Confirmar cita
        </button>
        </>
    )}
    </main>
  )
}

export default PublicBooking