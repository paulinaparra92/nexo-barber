type ServiceCardProps = {
  title: string
  duration: string
  onClick?: () => void
}

function ServiceCard({
  title,
  duration,
  onClick,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      className="option-card"
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span>{duration}</span>
    </button>
  )
}

export default ServiceCard