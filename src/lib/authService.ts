import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

export type AuthResult = {
  user: User | null;
  error: Error | null;
};

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user ?? null, error: error ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { user: data.user ?? null, error: error ?? null };
}

export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ?? null };
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return data.user ?? null;
  } catch (error) {
    console.error('Exception in getCurrentUser:', error);
    return null;
  }
}

export async function updateUserProfile(updates: { email?: string; password?: string; data?: any }): Promise<AuthResult> {
  const { data, error } = await supabase.auth.updateUser(updates);
  return { user: data.user ?? null, error: error ?? null };
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  try {
    // Валидация email перед отправкой
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: new Error('Invalid email address') };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ?? null };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return { error: error instanceof Error ? error : new Error('Failed to reset password') };
  }
}
