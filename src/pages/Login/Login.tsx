import { useState } from 'react'
import { login } from '../../services/authService'

type LoginProps = {
  onLoginSuccess: () => void
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    const result = await login(email, password)

    if (result) {
      onLoginSuccess()
    }
  }

  return (
    <main>
      <h1>Iniciar sesión</h1>

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="button"
        onClick={handleLogin}
      >
        Entrar
      </button>
    </main>
  )
}

export default Login