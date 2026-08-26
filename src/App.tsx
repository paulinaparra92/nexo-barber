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
import SocialLinks from './pages/SocialLinks/SocialLinks'
import MyAccount from './pages/MyAccount/MyAccount'
import { supabase } from './lib/supabase'

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
  const [view, setView] = useState<
    'agenda' | 'newAppointment' | 'myAccount'
  >('agenda')
  const [newAppointmentDate, setNewAppointmentDate] = useState<string | null>(null)
  const [editingAppointmentId, setEditingAppointmentId] =
    useState<string | null>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [barberAvatarUrl, setBarberAvatarUrl] = useState('')

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
      setView('agenda')
      setProfile(profileData)
    }
  }

  async function handleLogout() {
    const success = await logout()

    if (success) {
      setView('agenda')
      setProfile(null)
    }
  }

  useEffect(() => {
    async function loadBarberAvatar() {
      if (!profile?.barber_id) {
        setBarberAvatarUrl('')
        return
      }

      const { data, error } = await supabase
        .from('barbers')
        .select('avatar_url')
        .eq('id', profile.barber_id)
        .single()

      if (error) {
        console.error('Error al cargar avatar del barbero:', error)
        return
      }

      setBarberAvatarUrl(data?.avatar_url ?? '')
    }

    loadBarberAvatar()
  }, [profile?.barber_id])


  if (loading) {
    return <div>Cargando...</div>
  }

  const hostname = window.location.hostname

  const isInTheCutSubdomain =
    hostname === 'inthecut.nexobarber.app'

  if (window.location.pathname === '/redes') {
    return <SocialLinks />
  }

  if (
    window.location.pathname === '/reservar' ||
    isInTheCutSubdomain
  ) {
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


      <div className="user-menu">
        <button
          type="button"
          className="user-menu-trigger"
          onClick={() =>
            setAccountMenuOpen((open) => !open)
          }
        >
          <span className="user-menu-avatar">
            {barberAvatarUrl ? (
              <img
                src={barberAvatarUrl}
                alt={barberName ?? 'Barbero'}
              />
            ) : (
              barberName?.charAt(0).toUpperCase() || 'N'
            )}
          </span>

          <span className="user-menu-label">
            Cuenta
          </span>

          <span className="user-menu-arrow">
            {accountMenuOpen ? '↑' : '↓'}
          </span>
        </button>

        {accountMenuOpen && (
          <div className="user-menu-dropdown">
            <button
              type="button"
              onClick={() => {
                setView('myAccount')
                setAccountMenuOpen(false)
              }}
            >
              Mi cuenta
            </button>

            <div className="user-menu-divider" />

            <button
              type="button"
              className="user-menu-logout"
              onClick={() => {
                setAccountMenuOpen(false)
                handleLogout()
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>



      {view === 'agenda' && (
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
      )}

      {view === 'newAppointment' && (
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

      {view === 'myAccount' && (
        <MyAccount
          barberName={barberName ?? ''}
          barberId={profile.barber_id}
          onBack={() => setView('agenda')}
          onAvatarUpdated={(url) => setBarberAvatarUrl(url)}
        />
      )}
    </>
  )
}

export default App