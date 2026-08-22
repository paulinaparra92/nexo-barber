import ServiceCard from '../../components/ui/ServiceCard/ServiceCard'
import type { PublicBookingStep } from '../../types/publicBooking'
import DateOption from '../../components/ui/DateOption'
import BookingSummary from '../../components/ui/BookingSummary/BookingSummary'
import TimeSlot from '../../components/ui/TimeSlot'
import { createPublicAppointment } from '../../services/appointmentService'
import { useEffect, useState } from 'react'
import { getActiveServices } from '../../services/serviceService'
import { getTodayLabel, getTomorrowLabel, } from '../../utils/date'
import { getActiveTimeSlots } from '../../services/timeSlotService'
import { formatTimeLabel } from '../../utils/time'
import { getPublicBookedTimes } from '../../services/availabilityService'
import { getActiveBarbers } from '../../services/barberService'
import { getScheduleForDate } from '../../services/scheduleService'
import { getBarberServiceConfigs } from '../../services/barberServiceConfig'
import { supabase } from '../../lib/supabase'
import './PublicBooking.css'
import itcMonogram from '../../assets/itc-monogram.png'

function PublicBooking() {
  const [step, setStep] = useState<PublicBookingStep>('barber')
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
  const [bookedAppointments, setBookedAppointments] = useState<
    {
      appointment_time: string
      service: string
    }[]
  >([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [barberServiceConfigs, setBarberServiceConfigs] =
    useState<any[]>([])

  const [formError, setFormError] = useState('')
  const [savingBooking, setSavingBooking] = useState(false)


  async function handleConfirmBooking() {

    setFormError('')

    const cleanName = customerName.trim()
    const cleanWhatsapp = whatsapp.replace(/\D/g, '')

    if (cleanName.length < 2) {
      setFormError('Escribe tu nombre para continuar.')
      return
    }

    if (cleanWhatsapp.length !== 10) {
      setFormError('Ingresa un número de WhatsApp de 10 dígitos.')
      return
    }

    if (
      !selectedBarber ||
      !selectedService ||
      !selectedDate ||
      !selectedTime
    ) {
      setFormError(
        'Falta información de tu cita. Revisa barbero, servicio, fecha y horario.'
      )
      return
    }

    const selectedBarberData = barbers.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        selectedBarber.trim().toLowerCase()
    )

    if (!selectedBarberData?.id) {
      alert('No se pudo identificar al barbero seleccionado.')
      return
    }

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





    setSavingBooking(true)

    const success = await createPublicAppointment({
      client_name: customerName,
      whatsapp,
      service: selectedService,
      barber: selectedBarber,
      barber_id: selectedBarberData.id,
      appointment_date: formattedDate,
      appointment_time: selectedTime,
      price: selectedPrice,
    })
    setSavingBooking(false)

    if (!success) {
      setFormError(
        'No pudimos registrar tu cita. Intenta nuevamente.'
      )
      return
    }
    if (success) {
      if (selectedBarberData.notification_email) {
        const { error } = await supabase.functions.invoke(
          'send-appointment-email',
          {
            body: {
              to: selectedBarberData.notification_email,
              barberName: selectedBarberData.name,
              clientName: customerName,
              service: selectedService,
              appointmentDate: formattedDate,
              appointmentTime: selectedTime,
              whatsapp,
            },
          }
        )

        if (error) {
          console.error(
            'Error al enviar notificación de nueva cita:',
            error
          )
        }
      }

      setBookingConfirmed(true)
    }


  }

  const [daySchedule, setDaySchedule] = useState<{
    is_open: boolean
    open_time: string | null
    close_time: string | null
  } | null>(null)





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
    async function loadBarberServiceConfigs() {
      if (!selectedBarber) {
        setBarberServiceConfigs([])
        return
      }

      const barber = barbers.find(
        (item) =>
          item.name.trim().toLowerCase() ===
          selectedBarber.trim().toLowerCase()
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

        appointmentDate =
          tomorrow.toISOString().split('T')[0]
      }

      if (selectedDate === 'Elegir otra fecha') {
        appointmentDate = customDate
      }

      if (!appointmentDate) {
        return
      }

      const selectedBarberData = barbers.find(
        (item) =>
          item.name.trim().toLowerCase() ===
          selectedBarber.trim().toLowerCase()
      )

      if (!selectedBarberData?.id) {
        setBookedAppointments([])
        return
      }

      const appointmentsData =
        await getPublicBookedTimes(
          selectedBarberData.id,
          appointmentDate
        )

      setBookedAppointments(appointmentsData)
    }

    loadBookedTimes()
  }, [
    step,
    selectedBarber,
    selectedDate,
    customDate,
    barbers,
  ])

  useEffect(() => {
    async function loadBarbers() {
      const data = await getActiveBarbers()

      console.log('Barberos públicos:', data)

      setBarbers(data)
    }

    loadBarbers()
  }, [])



  useEffect(() => {
    async function loadDaySchedule() {
      if (step !== 'time' || !selectedDate) {
        return
      }

      const today = new Date()
      let appointmentDate = ''

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

      const schedule = await getScheduleForDate(appointmentDate)

      setDaySchedule(schedule)
    }

    loadDaySchedule()
  }, [
    step,
    selectedDate,
    customDate,
  ])


  const formattedSelectedDate = (() => {
    if (!selectedDate) return ''

    const today = new Date()
    let dateValue = ''

    if (selectedDate === 'Hoy') {
      dateValue = today.toISOString().split('T')[0]
    }

    if (selectedDate === 'Mañana') {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)

      dateValue = tomorrow.toISOString().split('T')[0]
    }

    if (selectedDate === 'Elegir otra fecha') {
      dateValue = customDate
    }

    if (!dateValue) return ''

    return new Date(`${dateValue}T12:00:00`).toLocaleDateString(
      'es-MX',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }
    )
  })()


  if (bookingConfirmed) {
    return (
      <main className="page public-booking-page confirmation-page">

        <header className="itc-booking-header">
          <div className="itc-monogram">
            <img
              src={itcMonogram}
              alt="In The Cut"
              className="itc-monogram-image"
            />
          </div>

          <div className="itc-brand">
            <div className="itc-brand-name">IN THE CUT</div>
            <div className="itc-brand-subtitle">BARBER STUDIO</div>
          </div>

          <div className="itc-established">
            EST. 2022
          </div>
        </header>

        <section className="confirmation-card">

          <div className="confirmation-check">
            ✓
          </div>

          <span className="confirmation-eyebrow">
            RESERVA COMPLETADA
          </span>

          <h1>¡Cita confirmada!</h1>

          <p className="confirmation-message">
            Tu cita con <strong>{selectedBarber}</strong> quedó registrada.
          </p>

          <div className="confirmation-details">

            <div className="confirmation-detail">
              <span>Servicio</span>
              <strong>{selectedService}</strong>
            </div>

            <div className="confirmation-detail">
              <span>Barbero</span>
              <strong>{selectedBarber}</strong>
            </div>

            <div className="confirmation-detail">
              <span>Fecha</span>
              <strong>{formattedSelectedDate}</strong>
            </div>

            <div className="confirmation-detail">
              <span>Hora</span>
              <strong>{formatTimeLabel(selectedTime)}</strong>
            </div>

            <div className="confirmation-detail">
              <span>Total</span>
              <strong>${selectedPrice}</strong>
            </div>

          </div>

          <p className="confirmation-goodbye">
            Te esperamos 💈
          </p>

          <button
            type="button"
            className="confirmation-new-booking"
            onClick={() => {
              setBookingConfirmed(false)
              setStep('barber')
              setSelectedBarber('')
              setSelectedService('')
              setSelectedDate('')
              setSelectedTime('')
              setCustomerName('')
              setWhatsapp('')
              setSelectedPrice(0)
              setCustomDate('')
              setDaySchedule(null)
              setFormError('')
            }}
          >
            Agendar otra cita
          </button>

          <p className="confirmation-powered">
            Reservas gestionadas con Nexo
          </p>

        </section>
      </main>
    )
  }


  function timeToMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  function getServiceDuration(serviceName?: string) {
    if (!serviceName) {
      return 30
    }

    const serviceData = services.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        serviceName.trim().toLowerCase()
    )

    if (!serviceData) {
      return 30
    }

    const config = barberServiceConfigs.find(
      (item) => item.service_id === serviceData.id
    )

    return Number(
      config?.duration_override ??
      serviceData.duration ??
      30
    )
  }

  function hasPublicTimeConflict(time: string) {
    if (!selectedService) return false

    const newStart = timeToMinutes(time)
    const newDuration = getServiceDuration(selectedService)
    const newEnd = newStart + newDuration

    return bookedAppointments.some((appointment) => {
      const existingStart = timeToMinutes(
        appointment.appointment_time
      )

      const existingDuration = getServiceDuration(
        appointment.service
      )

      const existingEnd =
        existingStart + existingDuration

      return (
        newStart < existingEnd &&
        newEnd > existingStart
      )
    })
  }

  function getDisplayedServiceDuration(serviceId: string, defaultDuration: number) {
    const config = barberServiceConfigs.find(
      (item) => item.service_id === serviceId
    )

    return Number(
      config?.duration_override ??
      defaultDuration
    )
  }



  function getDisplayedServicePrice(
    serviceId: string,
    defaultPrice: number
  ) {
    const config = barberServiceConfigs.find(
      (item) => item.service_id === serviceId
    )

    return Number(
      config?.price_override ??
      defaultPrice
    )
  }




  return (
    <main className="page public-booking-page">

      <header className="itc-booking-header">
        <div className="itc-monogram">
          <img
            src={itcMonogram}
            alt="In The Cut"
            className="itc-monogram-image"
          />
        </div>

        <div className="itc-brand">
          <div className="itc-brand-name">IN THE CUT</div>
          <div className="itc-brand-subtitle">BARBER STUDIO</div>
        </div>

        <div className="itc-established">EST. 2022</div>
      </header>

      <section className="booking-intro">
        <span className="booking-eyebrow">RESERVAS</span>
        <h1>Agenda tu cita</h1>
        <p>Elige tu barbero, servicio y horario.</p>
      </section>

      <BookingSummary
        service={selectedService}
        barber={selectedBarber}
        date={formattedSelectedDate}
        time={selectedTime}
      />


      {step === 'service' && (
        <>
          <h2>¿Qué servicio deseas?</h2>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.name}
              duration={`$${getDisplayedServicePrice(
                service.id,
                Number(service.price)
              )} · ${getDisplayedServiceDuration(
                service.id,
                Number(service.duration)
              )} minutos`}
              onClick={() => {
                setSelectedService(service.name)
                setSelectedPrice(
                  getDisplayedServicePrice(
                    service.id,
                    Number(service.price)
                  )
                )
                setStep('date')
              }}
            />
          ))}

        </>
      )}

      {step === 'barber' && (
        <>
          <>
            <h2>¿Con quién quieres tu cita?</h2>



            {barbers.map((barber) => (
              <ServiceCard
                key={barber.id}
                title={barber.name}
                duration="Barbero"
                variant="barber"
                onClick={() => {
                  setSelectedBarber(barber.name)
                  setStep('service')
                }}
              />
            ))}
          </>

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
                {formError && (
                  <p className="booking-form-error">
                    {formError}
                  </p>
                )}
                {customDate && (
                  <button
                    type="button"
                    className="confirm-booking-button"
                    onClick={handleConfirmBooking}
                    disabled={savingBooking}
                  >
                    {savingBooking ? 'Registrando...' : 'Confirmar cita'}
                  </button>
                )}
              </>
            )}


          </div>
        </>
      )}

      {step === 'time' && (
        <>
          {daySchedule === null ? (
            <p>Consultando disponibilidad...</p>
          ) : !daySchedule.is_open ? (
            <>
              <h2>Este día no abrimos</h2>
              <p>
                Selecciona otra fecha para tu cita.
              </p>

              <button
                type="button"
                className="confirm-booking-button"
                onClick={() => {
                  setSelectedDate('')
                  setSelectedTime('')
                  setDaySchedule(null)
                  setStep('date')
                }}
              >
                Elegir otra fecha
              </button>
            </>
          ) : (
            <>
              <h2>¿Qué horario prefieres?</h2>

              <div className="time-grid">
                {timeSlots
                  .filter((slot) => {
                    if (
                      !daySchedule.open_time ||
                      !daySchedule.close_time
                    ) {
                      return false
                    }

                    const slotTime = slot.time.substring(0, 5)
                    const openTime = daySchedule.open_time.substring(0, 5)
                    const closeTime = daySchedule.close_time.substring(0, 5)

                    return (
                      slotTime >= openTime &&
                      slotTime < closeTime
                    )
                  })
                  .map((slot) => (
                    <TimeSlot
                      key={slot.id}
                      time={formatTimeLabel(slot.time)}
                      available={!hasPublicTimeConflict(slot.time)}
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
        </>
      )}
      {step === 'customer' && (
        <>
          <h2>Solo faltan tus datos.</h2>
          <p className="customer-intro">Te contactaremos únicamente si es necesario.</p>

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

          {formError && (
            <p className="booking-form-error">
              {formError}
            </p>
          )}

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