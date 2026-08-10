

import { useEffect, useState } from 'react'
import { getAppointmentsByDate } from '../../services/barberAgendaService'
import AppointmentCard from '../../components/ui/AppointmentCard/AppointmentCard'
import AgendaSummary from '../../components/ui/AgendaSummary/AgendaSummary'

function BarberAgenda() {

  const [appointments, setAppointments] = useState<any[]>([])



  useEffect(() => {
  async function loadAgenda() {
    //const today = new Date().toISOString().split('T')[0]
    const today = '2026-08-07'

    const data = await getAppointmentsByDate(
      'Iván',
      today
    )

    setAppointments(data)
  }

  loadAgenda()
}, [])

//console.log('Agenda de hoy:', appointments)
console.log('Primera cita:', appointments[0])
  return (

    <main className="page">
      {/* <h1>Nueva cita</h1> */}
      <h1>Agenda de Iván</h1>


<AgendaSummary
  appointments={appointments.length}
  estimatedIncome={appointments.reduce(
    (total, appointment) => total + Number(appointment.price ?? 0),
    0
  )}
/>





<div className="agenda-list">
  {appointments.map((appointment) => (
    <AppointmentCard
      key={appointment.id}
      time={appointment.appointment_time.substring(0, 5)}
      client={appointment.client_name}
      service={appointment.service}
      price={Number(appointment.price ?? 0)}
    />
  ))}
</div>







 {/*      <form onSubmit={handleSubmit}>

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
      </form> */}


      

    </main>
  )

}

export default BarberAgenda