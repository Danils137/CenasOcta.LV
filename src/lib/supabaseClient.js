import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mpkjdqwlsgsuddqswsxn.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wa2pkcXdsc2dzdWRkcXN3c3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Mjc1OTcsImV4cCI6MjA3NjMwMzU5N30.fYrv31tW4-0AulzvR-cm6XwU3-CGjr4C6F0PnNwdZbU'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 API Key configured:', !!supabaseKey);

    // Try to get current session (this will work even without auth)
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Supabase connected successfully!');
    console.log('👤 Current session:', data.session ? 'Active' : 'None');
    return { success: true, session: data.session };
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return { success: false, error: error.message };
  }
}

// Debug function to test authentication
export const testSupabaseAuth = async () => {
  console.log('🔐 Testing Supabase authentication...');

  try {
    // Test 1: Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
    } else {
      console.log('✅ Session check passed. Current user:', sessionData.session?.user?.email || 'None');
    }

    // Test 2: Try to get user (if session exists)
    if (sessionData.session?.user) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('❌ User check failed:', userError.message);
      } else {
        console.log('✅ User check passed:', userData.user?.email);
      }
    }

    return { success: !sessionError, session: sessionData.session };
  } catch (error) {
    console.error('❌ Auth test error:', error);
    return { success: false, error: error.message };
  }
}
