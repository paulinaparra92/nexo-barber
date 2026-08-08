type AppointmentCardProps = {
  time: string
  clientName: string
  service: string
  duration: string
  status: 'confirmed' | 'pending' | 'available'
}

function AppointmentCard({
  time,
  clientName,
  service,
  duration,
  status,
}: AppointmentCardProps) {
  const statusText = {
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    available: 'Disponible',
  }

  return (
    <article className={`appointment ${status === 'available' ? 'available' : ''}`}>
      <div className="time">{time}</div>

      <div className="appointment-info">
        <strong>{clientName}</strong>
        <span>
          {service} · {duration}
        </span>
      </div>

      {status !== 'available' && (
        <span className={`status ${status}`}>
          {statusText[status]}
        </span>
      )}
    </article>
  )
}

export default AppointmentCard