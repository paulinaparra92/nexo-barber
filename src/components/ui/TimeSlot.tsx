type TimeSlotProps = {
  time: string
  available?: boolean
  selected?: boolean
  onClick?: () => void
}

function TimeSlot({
  time,
  available = true,
  selected = false,
  onClick,
}: TimeSlotProps) {
  return (
    <button
      type="button"
      className={`time-slot
        ${selected ? 'selected' : ''}
        ${!available ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={!available}
    >
      {time}
    </button>
  )
}

export default TimeSlot