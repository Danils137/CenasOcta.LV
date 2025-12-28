import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Определяем режим работы
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development';
const hasValidConfig = SUPABASE_URL && SUPABASE_ANON_KEY && 
                      SUPABASE_URL.startsWith('http') && 
                      SUPABASE_ANON_KEY.length > 20;

// Создаем mock-клиент для разработки при отсутствии конфигурации
const createMockClient = (): SupabaseClient => {
  console.warn('Using mock Supabase client for development');
  
  return {
    auth: {
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
    },
    // Добавьте другие методы по мере необходимости
  } as unknown as SupabaseClient;
};

let supabaseInstance: SupabaseClient;

if (!hasValidConfig) {
  if (isDevelopment) {
    // В режиме разработки используем mock-клиент
    supabaseInstance = createMockClient();
    console.warn(
      'Supabase configuration is missing or invalid. Using mock client for development.'
    );
  } else {
    // В production выбрасываем ошибку
    const errorMessage = 'Supabase configuration is required in production environment.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
} else {
  // Создаем реальный клиент
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  
  // Логируем успешное подключение в development
  if (isDevelopment) {
    console.log('Supabase client initialized successfully');
  }
}

export const supabase: SupabaseClient = supabaseInstance;
