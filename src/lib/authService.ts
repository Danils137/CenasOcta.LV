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

export function getCurrentUser(): User | null {
  return supabase.auth.getUser().then(r => r.data.user).catch(() => null) as unknown as User | null;
}

export async function updateUserProfile(updates: { email?: string; password?: string; data?: any }): Promise<AuthResult> {
  const { data, error } = await supabase.auth.updateUser(updates);
  return { user: data.user ?? null, error: error ?? null };
}
