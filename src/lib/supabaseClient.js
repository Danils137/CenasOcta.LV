import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mpkjdqwlsgsuddqswsxn.supabase.co'
const supabaseKey =
  process.env.SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wa2pkcXdsc2dzdWRkcXN3c3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Mjc1OTcsImV4cCI6MjA3NjMwMzU5N30.fYrv31tW4-0AulzvR-cm6XwU3-CGjr4C6F0PnNwdZbU'

// ✅ Добавляем опции, чтобы сессия сохранялась между перезагрузками
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
