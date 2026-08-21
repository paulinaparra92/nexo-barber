import { useEffect, useState } from 'react'
import Login from './pages/Login/Login'
import {
  getCurrentProfile,
  logout,
} from './services/authService'
import BarberAgenda from './pages/BarberAgenda/BarberAgenda'
import NewAppointment from './pages/NewAppointment/NewAppointment'
import './App.css'
import PublicBooking from './pages/PublicBooking/PublicBooking'

type Profile = {
  role: 'partner' | 'barber'
  active: boolean
  barber_id: string
  barbers:
  | {
    name: string
  }
  | {
    name: string
  }[]
}

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'agenda' | 'newAppointment'>('agenda')
  const [newAppointmentDate, setNewAppointmentDate] = useState<string | null>(null)
  const [editingAppointmentId, setEditingAppointmentId] =
    useState<string | null>(null)


  useEffect(() => {
    async function loadSession() {
      const profileData = await getCurrentProfile()

      if (profileData) {
        setProfile(profileData)
      }

      setLoading(false)
    }

    loadSession()
  }, [])


  async function handleLoginSuccess() {
    const profileData = await getCurrentProfile()

    if (profileData) {
      setProfile(profileData)
    }
  }

  async function handleLogout() {
    const success = await logout()

    if (success) {
      setProfile(null)
    }
  }


  if (loading) {
    return <div>Cargando...</div>
  }

  if (window.location.pathname === '/reservar') {
  return <PublicBooking />
}

  if (!profile) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  const barberName = Array.isArray(profile.barbers)
    ? profile.barbers[0]?.name
    : profile.barbers?.name

  return (
    <>
      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>

      {view === 'agenda' ? (
        <BarberAgenda
          currentBarberName={barberName ?? ''}
          role={profile.role}
          onNewAppointment={(date) => {
            setEditingAppointmentId(null)
            setNewAppointmentDate(date)
            setView('newAppointment')
          }}
          onEditAppointment={(appointmentId) => {
            setEditingAppointmentId(appointmentId)
            setView('newAppointment')
          }}
        />
      ) : (
        <NewAppointment
          onBack={() => setView('agenda')}
          currentBarberName={barberName ?? ''}
          currentBarberId={profile.barber_id}
          role={profile.role}
          editingAppointmentId={editingAppointmentId}
          initialDate={newAppointmentDate}
          onSaved={() => setView('agenda')}
        />
      )}
    </>
  )
}

export default App