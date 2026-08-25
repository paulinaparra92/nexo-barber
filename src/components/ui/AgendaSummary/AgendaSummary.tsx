import './AgendaSummary.css'

type AgendaSummaryProps = {
  barberName: string
  appointments: number
  estimatedIncome: number
  completedIncome: number
}

function AgendaSummary({
  barberName,
  appointments,
  estimatedIncome,
  completedIncome,
}: AgendaSummaryProps) {
  return (
    <section className="agenda-summary">
      <h1>Agenda de {barberName}</h1>
      <div
        style={{
          fontSize: '10px',
          background: '#ffd',
          padding: '4px',
        }}
      >
        PROPS: {appointments} / {estimatedIncome} / {completedIncome}
      </div>



      <div className="agenda-summary-info">
        <span>
          {appointments} {appointments === 1 ? 'cita' : 'citas'}
        </span>

        <span className="agenda-summary-dot">·</span>

        <strong>${estimatedIncome} estimados</strong>

        <span className="agenda-summary-dot">·</span>

        <span>${completedIncome} realizados</span>
      </div>
    </section>
  )
}

export default AgendaSummary