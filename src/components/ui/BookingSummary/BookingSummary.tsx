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
  return (
    <section className="booking-summary">

      {service && <p>💈 {service}</p>}

      {barber && <p>👤 {barber}</p>}

      {date && <p>📅 {date}</p>}

      {time && <p>🕒 {time}</p>}

    </section>
  )
}

export default BookingSummary