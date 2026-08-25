
import PageContainer from '../../components/layout/PageContainer/PageContainer'
import { useEffect, useRef, useState } from 'react'
import { getAppointmentsByDate } from '../../services/barberAgendaService'
import AppointmentCard from '../../components/ui/AppointmentCard/AppointmentCard'
import AgendaSummary from '../../components/ui/AgendaSummary/AgendaSummary'
import { getActiveBarbers } from '../../services/barberService'
import './BarberAgenda.css'
import { updateAppointmentStatus } from '../../services/appointmentService'

type BarberAgendaProps = {
  currentBarberName: string
  role: 'partner' | 'barber'
  onNewAppointment: (date: string) => void
  onEditAppointment: (appointmentId: string) => void
}

function BarberAgenda({
  currentBarberName,
  role,
  onNewAppointment,
  onEditAppointment,
}: BarberAgendaProps) {

  const [appointments, setAppointments] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [selectedBarber, setSelectedBarber] = useState(currentBarberName)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const selectedAppointment = appointments.find(
    (appointment) => appointment.id === selectedAppointmentId
  )
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  })
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadAgenda() {
      const barberData = await getActiveBarbers()
      setBarbers(barberData)



      if (!selectedBarber) {
        setAppointments([])
        return
      }

      const data = await getAppointmentsByDate(
        selectedBarber,
        selectedDate
      )

      setAppointments(data)
    }

    loadAgenda()
  }, [selectedBarber, selectedDate])


  async function handleCompleteAppointment() {
    if (!selectedAppointmentId) return

    const updatedAppointment = await updateAppointmentStatus(
      selectedAppointmentId,
      'completed'
    )

    if (!updatedAppointment) return

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === selectedAppointmentId
          ? updatedAppointment
          : appointment
      )
    )

    setSelectedAppointmentId(null)
  }

  async function handleCancelAppointment() {
    if (!selectedAppointmentId) return

    const updatedAppointment = await updateAppointmentStatus(
      selectedAppointmentId,
      'cancelled'
    )

    if (!updatedAppointment) return

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === selectedAppointmentId
          ? updatedAppointment
          : appointment
      )
    )

    setSelectedAppointmentId(null)
  }

  function openWhatsapp(appointment: any) {
    const cleanNumber = appointment.whatsapp.replace(/\D/g, '')

    const fullNumber =
      cleanNumber.length === 10
        ? `52${cleanNumber}`
        : cleanNumber

    const formattedDate = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(
      new Date(`${appointment.appointment_date}T12:00:00`)
    )

    const formattedTime = formatTime(
      appointment.appointment_time.substring(0, 5)
    )

    const message = `Hola ${appointment.client_name} 👋

Te recordamos que tienes cita en In The Cut Barber Studio el ${formattedDate} a las ${formattedTime} con ${appointment.barber}.

Te pedimos llegar 10 minutos antes para poder atenderte puntualmente.

¡Te esperamos! 💈`

    const encodedMessage = encodeURIComponent(message)

    window.open(
      `https://wa.me/${fullNumber}?text=${encodedMessage}`,
      '_blank'
    )
  }

  const activeAppointments = appointments.filter(
    (appointment) => appointment.status !== 'cancelled'
  )

  const estimatedIncome = activeAppointments.reduce(
    (total, appointment) =>
      total + Number(appointment.price ?? 0),
    0
  )

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === 'completed'
  )

  const completedIncome = completedAppointments.reduce(
    (total, appointment) =>
      total + Number(appointment.price ?? 0),
    0
  )



  function formatTime(time: string) {
    const [hours, minutes] = time.split(':').map(Number)

    const period = hours >= 12 ? 'PM' : 'AM'
    const formattedHour = hours % 12 || 12

    return `${formattedHour}:${minutes
      .toString()
      .padStart(2, '0')} ${period}`
  }

  function changeDate(days: number) {
    const currentDate = new Date(`${selectedDate}T12:00:00`)

    currentDate.setDate(
      currentDate.getDate() + days
    )

    const newDate = currentDate
      .toISOString()
      .split('T')[0]

    setSelectedDate(newDate)
  }

  function formatSelectedDate(date: string) {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(`${date}T12:00:00`))
  }







  return (
    <PageContainer>
      <main className="page">



        <AgendaSummary
          barberName={selectedBarber}
          appointments={activeAppointments.length}
          estimatedIncome={estimatedIncome}
          completedIncome={completedIncome}
        />



        <div className="agenda-date-navigation">
          <button
            type="button"
            onClick={() => changeDate(-1)}
          >
            ‹
          </button>

          <div className="agenda-date-picker">
            <button
              type="button"
              onClick={() => {
                dateInputRef.current?.showPicker()
              }}
            >
              {formatSelectedDate(selectedDate)}
            </button>

            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value)
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => changeDate(1)}
          >
            ›
          </button>
        </div>


        <div className="agenda-toolbar">
          <div className="agenda-barber-selector">
            {role === 'partner' && (
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
            )}
          </div>
          <button
            type="button"
            className="new-appointment-button"
            onClick={() => onNewAppointment(selectedDate)}
          >
            + Nueva cita
          </button>
        </div>



        {!selectedAppointment && (
          <div className="agenda-list">
            {appointments.length === 0 && (
              <div className="agenda-empty">
                <p>No hay citas para este día.</p>
                <span>
                  Puedes registrar una nueva cita desde el botón de arriba.
                </span>
              </div>
            )}
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                id={appointment.id}
                time={appointment.appointment_time.substring(0, 5)}
                client={appointment.client_name}
                service={appointment.service}
                price={Number(appointment.price ?? 0)}
                status={appointment.status}
                onClick={(id) => {
                  setSelectedAppointmentId(id)
                }}
              />
            ))}

          </div>)}


        {selectedAppointment && (
          <div className="appointment-detail">
            <button
              type="button"
              className="detail-back-button"
              onClick={() => setSelectedAppointmentId(null)}
            >
              ← Volver
            </button>

            <h2>{selectedAppointment.client_name}</h2>

            <p>
              <strong>Servicio:</strong>{' '}
              {selectedAppointment.service}
            </p>

            <p>
              <strong>Hora:</strong>{' '}
              {formatTime(
                selectedAppointment.appointment_time.substring(0, 5)
              )}
            </p>

            <p>
              <strong>Precio:</strong>{' '}
              ${Number(selectedAppointment.price ?? 0)}
            </p>

            {selectedAppointment.whatsapp && (
              <p>
                <strong>WhatsApp:</strong>{' '}
                {selectedAppointment.whatsapp}
              </p>
            )}

            <div className="appointment-actions">
              {selectedAppointment.whatsapp && (
                <button
                  type="button"
                  className="whatsapp-button"
                  onClick={() =>
                    openWhatsapp(selectedAppointment)
                  }
                >
                  Abrir WhatsApp
                </button>
              )}

              {selectedAppointment.status === 'confirmed' && (
                <>
                  <button
                    type="button"
                    className="edit-appointment-button"
                    onClick={() => {
                      onEditAppointment(selectedAppointment.id)
                    }}
                  >
                    Editar cita
                  </button>

                  <button
                    type="button"
                    className="complete-appointment-button"
                    onClick={handleCompleteAppointment}
                  >
                    Finalizar cita
                  </button>

                  <button
                    type="button"
                    className="cancel-appointment-button"
                    onClick={handleCancelAppointment}
                  >
                    Cancelar cita
                  </button>
                </>
              )}
            </div>
          </div>
        )}


      </main>
    </PageContainer>
  )

}

export default BarberAgenda