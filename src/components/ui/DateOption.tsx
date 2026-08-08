type DateOptionProps = {
  title: string
  subtitle: string
  selected?: boolean
  onClick?: () => void
}

function DateOption({
  title,
  subtitle,
  selected = false,
  onClick,
}: DateOptionProps) {
  return (
    <button
      type="button"
      className={`date-option ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </button>
  )
}

export default DateOption