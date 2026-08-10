import './AppointmentCard.css'

type AppointmentCardProps = {
  time: string
  client: string
  service: string
  price: number
}

function AppointmentCard({
  time,
  client,
  service,
  price,
}: AppointmentCardProps) {
  return (
  <div className="appointment-card">
    <div className="appointment-time">
      {time}
    </div>

    <div className="appointment-content">
      <h3>{client}</h3>

      <p>{service}</p>

      <strong>${price}</strong>
    </div>
  </div>
)
}

export default AppointmentCard