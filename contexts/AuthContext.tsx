import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/lib/supabaseClient';
import { signIn, signUp, signOut, getCurrentUser } from '../src/lib/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAuthenticated: boolean;
  token: string | null;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 Supabase auth state changed:', event, session?.user?.email || 'No user');

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in via Supabase:', session.user.email);
          const user = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || ''
          };

          await AsyncStorage.setItem('userData', JSON.stringify(user));
          setUser(user);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out from Supabase - clearing local state');
          await AsyncStorage.multiRemove(['userData', 'authToken']);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed for user:', session?.user?.email || 'Unknown');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if there's a current user using authService
      const currentUser = await getCurrentUser();

      if (currentUser) {
        const user = {
          id: currentUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || ''
        };

        await AsyncStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
      } else {
        // Fallback to AsyncStorage for existing users
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUser(user);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login with authService...');
      const data = await signIn(email, password);

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.email);
        const user = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || ''
        };

        await AsyncStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      return { success: false, error: error.message || 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration with authService...');
      const data = await signUp(email, password);

      if (data.user) {
        console.log('✅ Registration successful for user:', email);
        const user = {
          id: data.user.id,
          name: name,
          email: email
        };

        await AsyncStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('❌ Registration error:', error.message);
      return { success: false, error: error.message || 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };



  const refreshUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...');

      // Sign out using authService (this should trigger the auth state listener)
      await signOut();
      console.log('✅ Supabase sign out successful');

      // Clear local storage immediately to ensure clean state
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      console.log('🗑️ Local storage cleared');

      // Set user state to null immediately
      setUser(null);
      console.log('🚪 User state cleared');

    } catch (error: any) {
      console.error('❌ Logout error:', error.message);

      // Even if there's an error with Supabase logout, we should still clear local state
      try {
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        setUser(null);
        console.log('🗑️ Local state cleared despite Supabase error');
      } catch (storageError) {
        console.error('❌ Failed to clear local storage:', storageError);
      }
    }
  };

  // Helper function to get token from AsyncStorage
  const getToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
    isAuthenticated: !!user,
    token: null, // We'll use getToken() function when needed
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
