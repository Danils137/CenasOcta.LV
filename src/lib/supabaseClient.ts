import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Читаем из process.env — Expo/Metro подхватывает EXPO_PUBLIC_* переменные.

// Если вы используете app.config.js с extra, замените на Constants.expoConfig.extra.

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Не выбрасываем исключение — просто логируем, чтобы разработчик увидел
  console.warn(
    'Supabase env vars are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
