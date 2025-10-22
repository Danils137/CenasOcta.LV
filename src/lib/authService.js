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

// 🔑 Восстановление пароля
export async function resetPassword(email) {
  try {
    console.log('📧 Sending password reset email to:', email)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'your-app://reset-password', // Настройте deep link для вашего приложения
    })

    if (error) {
      console.error('❌ Password reset failed:', error.message)
      throw error
    }

    console.log('✅ Password reset email sent successfully')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Password reset error:', error)
    throw error
  }
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

    // 🧹 Жесткая очистка localStorage для веб-браузера (дополнительная гарантия)
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('🧹 Force cleaning localStorage...')

      // Удаляем основные токены Supabase
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-auth-token')

      // Удаляем все ключи начинающиеся с 'sb-'
      Object.keys(localStorage)
        .filter(key => key.startsWith('sb-'))
        .forEach(key => {
          console.log(`🗑️ Removing localStorage key: ${key}`)
          localStorage.removeItem(key)
        })

      console.log('✅ localStorage cleaned successfully')
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

    // Check storage (both web and React Native)
    const storageKeys = []
    if (typeof window !== 'undefined' && window.localStorage) {
      // Web browser
      const keys = Object.keys(localStorage).filter(key => key.includes('supabase'))
      console.log('💾 Supabase localStorage keys:', keys)
      storageKeys.push(...keys)
    }

    // Check AsyncStorage for React Native (if available)
    if (typeof AsyncStorage !== 'undefined') {
      try {
        const asyncKeys = await AsyncStorage.getAllKeys()
        const supabaseAsyncKeys = asyncKeys.filter(key => key.includes('supabase') || key.startsWith('sb-'))
        console.log('💾 Supabase AsyncStorage keys:', supabaseAsyncKeys)
        storageKeys.push(...supabaseAsyncKeys)
      } catch (e) {
        console.log('ℹ️ AsyncStorage not available or error:', e.message)
      }
    }

    return {
      hasSession: !!session,
      hasUser: !!user,
      sessionError: sessionError?.message,
      userError: userError?.message,
      storageKeys: storageKeys
    }
  } catch (error) {
    console.error('❌ Auth diagnosis error:', error)
    return { error: error.message }
  }
}
