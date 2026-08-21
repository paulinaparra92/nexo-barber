import { useState } from 'react'
import { login } from '../../services/authService'
import './Login.css'

type LoginProps = {
  onLoginSuccess: () => void
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await login(email, password)

      if (result) {
        onLoginSuccess()
      } else {
        setError('Correo o contraseña incorrectos.')
      }
    } catch {
      setError('No pudimos iniciar sesión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo">N</div>

          <div>
            <h1>Nexo</h1>
            <p>Gestión para barberías</p>
          </div>
        </div>

        <div className="login-heading">
          <h2>Bienvenido</h2>
          <p>Ingresa a tu cuenta para administrar tu barbería.</p>
        </div>

        <div className="login-form">
          <label>
            Correo
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin()
              }}
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin()
              }}
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-button"
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </div>

        <p className="login-footer">
          Nexo · Tu barbería, conectada.
        </p>
      </section>
    </main>
  )
}

export default Login