import './AppointmentCard.css'

type AppointmentCardProps = {
  id: string
  time: string
  client: string
  service: string
  price: number
  status: string
  onClick: (id: string) => void
}
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)

  const period = hours >= 12 ? 'PM' : 'AM'
  const formattedHour = hours % 12 || 12

  return `${formattedHour}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`
}
function AppointmentCard({
  id,
  time,
  client,
  service,
  price,
  status,
  onClick,
}: AppointmentCardProps) {
  return (
    <div
      className="appointment-card"
      onClick={() => onClick(id)}
    >

      <div className="appointment-time">
        {formatTime(time)}
      </div>

      <div className="appointment-content">
        <h3>{client}</h3>
        <p>{service}</p>
      </div>

      <span className={`appointment-status ${status}`}>
        {status === 'completed'
          ? 'Finalizada'
          : status === 'cancelled'
            ? 'Cancelada'
            : 'Confirmada'}
      </span>

      <strong className="appointment-price">
        ${price}
      </strong>

    </div>
  )
}

export default AppointmentCard