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
      return { success: true }
    }

    console.log('👤 Current session found for user:', session.user?.email)

    // Now sign out - this will clear the session and trigger the auth state change
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ Supabase sign out failed:', error.message)
      throw error
    }

    console.log('✅ Successfully signed out from Supabase')
    return { success: true }
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

// 🔍 Диагностика аутентификации для отладки проблем с logout
export async function diagnoseAuth() {
  try {
    console.log('🔍 Diagnosing authentication state...')

    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('📋 Session status:', session ? 'Active' : 'None')
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message)
    }

    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('👤 Current user:', user ? user.email : 'None')
    if (userError) {
      console.error('❌ User error:', userError.message)
    }

    // Check local storage (web)
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage).filter(key => key.includes('supabase'))
      console.log('💾 Supabase localStorage keys:', keys)

      keys.forEach(key => {
        try {
          const value = localStorage.getItem(key)
          console.log(`  ${key}:`, value ? 'Present' : 'Empty')
        } catch (e) {
          console.log(`  ${key}: Error accessing`)
        }
      })
    }

    return {
      hasSession: !!session,
      hasUser: !!user,
      sessionError: sessionError?.message,
      userError: userError?.message,
      localStorageKeys: typeof window !== 'undefined' ? Object.keys(localStorage || {}).filter(key => key.includes('supabase')) : []
    }
  } catch (error) {
    console.error('❌ Auth diagnosis error:', error)
    return { error: error.message }
  }
}
