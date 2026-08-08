export type AppointmentStatus = 'confirmed' | 'pending'

export type Appointment = {
  client: string
  service: string
  barber: string
  date: string
  time: string
  status: AppointmentStatus
}