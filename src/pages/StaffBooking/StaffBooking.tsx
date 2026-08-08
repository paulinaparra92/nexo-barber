
import { useState } from 'react'
import OptionCard from '../../components/ui/OptionCard'
import TimeSlot from '../../components/ui/TimeSlot'
import DateOption from '../../components/ui/DateOption'
import type { Appointment } from '../../types/appointment'


function StaffBooking() {
  const [selectedService, setSelectedService] = useState('')
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const clients = ['Juan Pérez','Juan García','Julio Ramos','Miguel Soto','Carlos Ruiz','Luis García',]
  const [clientSearch, setClientSearch] = useState('')
  const [showClientResults, setShowClientResults] = useState(false)
  const [lastAppointment, setLastAppointment] = useState<Appointment | null>(null)
  const requiresApproval = false

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()

  if (
    !clientSearch ||
    !selectedService ||
    !selectedBarber ||
    !selectedDate ||
    !selectedTime
  ) {
    alert('Completa todos los datos de la cita')
    return
  }

  const appointment: Appointment = {
    client: clientSearch,
    service: selectedService,
    barber: selectedBarber,
    date: selectedDate,
    time: selectedTime,
    status: requiresApproval ? 'pending' : 'confirmed',
  }

  setLastAppointment(appointment)
  setClientSearch('')
  setSelectedService('')
  setSelectedBarber('')
  setSelectedDate('')
  setSelectedTime('')
  setShowClientResults(false)

}

const serviceLabels: Record<string, string> = {
  corte: 'Corte',
  barba: 'Barba',
  'corte-barba': 'Corte + Barba',
}

const barberLabels: Record<string, string> = {
  any: 'Primera disponibilidad',
  Ivan: 'Iván',
  Barber2: 'Barber 2',
}

const dateLabels: Record<string, string> = {
  today: 'Hoy',
  tomorrow: 'Mañana',
  other: 'Otra fecha',
}

  return (

    <main className="page">
      <h1>Nueva cita</h1>
      

      <form onSubmit={handleSubmit}>

        <label>Cliente</label>
        <input
          type="text"
          placeholder="Buscar o agregar cliente"
          value={clientSearch}
          onChange={(e) => {
            setClientSearch(e.target.value)
            setShowClientResults(true)
          }}
        />

        {clientSearch.trim() !== '' && (
          <div className="client-results">
            {showClientResults && clientSearch.trim() !== '' && (
              <div className="client-results">
              {clients
                .filter((client) =>
                  client.toLowerCase().includes(clientSearch.toLowerCase())
                )
                .map((client) => (
                  <button
                    key={client}
                    type="button"
                    className="client-item"
                    onClick={() => {
                      setClientSearch(client)
                      setShowClientResults(false)
                    }}
                  >
                    {client}
                  </button>
                  ))}
            </div>
          )}
          </div>
        )}
        
        <h2>Selecciona un servicio</h2>
        
        <div className="option-list">
          <OptionCard
            title="Corte"
            subtitle="$200 · 30 minutos"
            selected={selectedService === 'corte'}
            onClick={() => setSelectedService('corte')}
          />

          <OptionCard
            title="Barba"
            subtitle="$150 · 15 minutos"
            selected={selectedService === 'barba'}
            onClick={() => setSelectedService('barba')}
          />

          <OptionCard
            title="Corte + Barba"
            subtitle="$250 · 45 minutos"
            selected={selectedService === 'corte-barba'}
            onClick={() => setSelectedService('corte-barba')}
          />
        </div>

        <h2>Selecciona un barbero</h2>

        <div className="option-list">
            <OptionCard
                title="Primero disponible"
                subtitle="Primera disponibilidad"
                selected={selectedBarber === 'any'}
                onClick={() => setSelectedBarber('any')}
            />

            <OptionCard
                title="Iván"
                subtitle="Barbero"
                selected={selectedBarber === 'Ivan'}
                onClick={() => setSelectedBarber('Ivan')}
            />

            <OptionCard
                title="Barber2"
                subtitle="Barbero"
                selected={selectedBarber === 'Barber2'}
                onClick={() => setSelectedBarber('Barber2')}
            />
        </div>

        <h2>Selecciona una fecha</h2>

      <div className="date-options">
        <DateOption
          title="Hoy"
          subtitle="Jueves 6 de agosto"
          selected={selectedDate === 'today'}
          onClick={() => setSelectedDate('today')}
        />

        <DateOption
          title="Mañana"
          subtitle="Viernes 7 de agosto"
          selected={selectedDate === 'tomorrow'}
          onClick={() => setSelectedDate('tomorrow')}
        />

        <DateOption
          title="Elegir otra fecha"
          subtitle="Abrir calendario"
          selected={selectedDate === 'other'}
          onClick={() => setSelectedDate('other')}
        />
      </div>

        <h2>Selecciona un horario</h2>

        <div className="time-grid">

            <TimeSlot
                time="09:00"
                selected={selectedTime==="09:00"}
                onClick={()=>setSelectedTime("09:00")}
            />

            <TimeSlot
             time="09:30"
             available={false}
            />

            <TimeSlot
                time="10:00"
                selected={selectedTime==="10:00"}
                onClick={()=>setSelectedTime("10:00")}
            />

            <TimeSlot
                time="10:30"
             selected={selectedTime==="10:30"}
             onClick={()=>setSelectedTime("10:30")}
            />

            <TimeSlot
                time="11:00"
                selected={selectedTime==="11:00"}
                onClick={()=>setSelectedTime("11:00")}
            />

            <TimeSlot
                time="11:30"
                available={false}
            />

        </div>

        <button className="save-button" type="submit">
            Guardar cita
        </button>
      </form>
      {lastAppointment && (
      <section className="appointment-summary">
        <h2>✅ Cita creada correctamente</h2>

        <p><strong>Cliente:</strong> {lastAppointment.client}</p>
        <p><strong>Servicio:</strong>{' '}{serviceLabels[lastAppointment.service]}</p>
        <p><strong>Barbero:</strong>{' '}{barberLabels[lastAppointment.barber]}</p>
        <p><strong>Fecha:</strong>{' '} {dateLabels[lastAppointment.date]}</p>
        <p><strong>Hora:</strong> {lastAppointment.time}</p>
        <p><strong>Estado:</strong>{' '}{lastAppointment.status === 'confirmed'
            ? 'Confirmada'
            : 'Pendiente'}
        </p>
      </section>
    )}

    </main>
  )
}

export default StaffBooking