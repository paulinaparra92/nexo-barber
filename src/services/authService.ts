import { supabase } from '../lib/supabase'

export async function login(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error al iniciar sesión:', error)
    return null
  }

  return data
}

export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      role,
      active,
      barber_id,
      barbers (
        name
      )
    `)
    .eq('id', user.id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}
export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error al cerrar sesión:', error)
    return false
  }

  return true
}