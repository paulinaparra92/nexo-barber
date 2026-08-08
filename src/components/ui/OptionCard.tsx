type OptionCardProps = {
  title: string
  subtitle?: string
  selected?: boolean
  onClick?: () => void
}

function OptionCard({
  title,
  subtitle,
  selected = false,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      className={`option-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <strong>{title}</strong>

      {subtitle && <span>{subtitle}</span>}
    </button>
  )
}

export default OptionCard