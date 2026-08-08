export function formatTimeLabel(time: string) {
  const [hour, minute] = time.split(':').map(Number)

  const date = new Date()
  date.setHours(hour, minute, 0, 0)

  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}