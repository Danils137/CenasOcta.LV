import { supabase } from './supabaseClient'

// 🔐 Регистрация нового пользователя
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    console.error('❌ Registration failed:', error.message)
    throw error
  }

  console.log('✅ Registration successful:', data)
  return data
}

// 🔑 Логин существующего пользователя
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('❌ Login failed:', error.message)
    throw error
  }

  console.log('✅ Login successful:', data)
  return data
}

// 🚪 Выход из аккаунта
export async function signOut() {
  try {
    console.log('🔄 Attempting to sign out from Supabase...')

    // First, get the current session to verify we're logged in
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.log('ℹ️ No active session found, already signed out')
      return
    }

    console.log('👤 Current session found for user:', session.user?.email)

    // Now sign out
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ Supabase sign out failed:', error.message)
      throw error
    }

    console.log('✅ Successfully signed out from Supabase')
  } catch (error) {
    console.error('❌ Sign out error:', error)
    throw error
  }
}

// 👤 Получение текущего пользователя
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('⚠️ Failed to get user:', error.message)
    return null
  }

  return data?.user || null
}
