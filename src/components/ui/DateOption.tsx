type DateOptionProps = {
  title: string
  subtitle: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

function DateOption({
  title,
  subtitle,
  selected = false,
  disabled = false,
  onClick,
}: DateOptionProps) {
  return (
    <button
      type="button"
      className={`date-option ${selected ? 'selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </button>
  )
}

export default DateOption