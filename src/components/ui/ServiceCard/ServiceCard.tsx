type ServiceCardProps = {
  title: string
  duration: string
  onClick?: () => void
  variant?: 'barber' | 'service'
  imageUrl?: string | null
}

function ServiceCard({
  title,
  duration,
  onClick,
  variant = 'service',
  imageUrl,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      className={`option-card itc-option-card itc-${variant}-card`}
      onClick={onClick}
    >
      {variant === 'barber' && (
        <div className="itc-barber-avatar">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
            />
          ) : (
            title.charAt(0).toUpperCase()
          )}
        </div>
      )}

      <div className="itc-option-content">
        <strong>{title}</strong>
        <span>{duration}</span>
      </div>

      <span className="itc-option-arrow">›</span>
    </button>
  )
}

export default ServiceCard