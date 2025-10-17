import { createClient } from '@supabase/supabase-js'

// Используем переменные окружения для Expo/React Native
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Логируем переменные для диагностики (уберем в продакшене)
console.log('Supabase Config Debug:', {
  url: supabaseUrl ? 'URL exists' : 'URL missing',
  key: supabaseAnonKey ? 'Key exists' : 'Key missing',
  urlPrefix: supabaseUrl?.substring(0, 20) + '...',
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
})

// Проверяем, что переменные окружения определены
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl,
    key: supabaseAnonKey
  })
  throw new Error('Missing Supabase environment variables')
}

// Создаем клиент Supabase с дополнительными опциями для отладки
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
