export function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function getTodayLabel() {
  return formatDateLabel(new Date())
}

export function getTomorrowLabel() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return formatDateLabel(tomorrow)
}