type BookingSummaryProps = {
  service?: string
  barber?: string
  date?: string
  time?: string
}

function BookingSummary({
  service,
  barber,
  date,
  time,
}: BookingSummaryProps) {

  // No mostrar el resumen mientras no haya ninguna selección
  if (!service && !barber && !date && !time) {
    return null
  }

  return (
    <section className="booking-summary itc-booking-summary">

      <span className="itc-summary-label">
        TU CITA
      </span>

      <div className="itc-summary-details">

        {service && (
          <div className="itc-summary-item">
            <span>Servicio</span>
            <strong>{service}</strong>
          </div>
        )}

        {barber && (
          <div className="itc-summary-item">
            <span>Barbero</span>
            <strong>{barber}</strong>
          </div>
        )}

        {date && (
          <div className="itc-summary-item">
            <span>Fecha</span>
            <strong>{date}</strong>
          </div>
        )}

        {time && (
          <div className="itc-summary-item">
            <span>Hora</span>
            <strong>{time}</strong>
          </div>
        )}

      </div>

    </section>
  )
}

export default BookingSummary