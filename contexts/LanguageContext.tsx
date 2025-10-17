import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';
import { Language, getTranslation } from '@/constants/translations';

const LANGUAGE_STORAGE_KEY = 'app_language';

// Simple storage implementation for web and native
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    // For native, we'll use a simple in-memory storage for now
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    }
    // For native, we'll use a simple in-memory storage for now
  },
};

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('lv');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await storage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && ['lv', 'en', 'ru'].includes(savedLanguage)) {
        setLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (newLanguage: Language) => {
    if (!newLanguage || !['lv', 'en', 'ru'].includes(newLanguage)) {
      console.warn('Invalid language provided:', newLanguage);
      return;
    }
    
    try {
      await storage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  }, []);

  const t = useCallback((key: keyof typeof import('@/constants/translations').translations.lv): string => {
    if (!key || typeof key !== 'string') {
      console.warn('Invalid translation key provided:', key);
      return String(key);
    }
    return getTranslation(language, key);
  }, [language]);

  return useMemo(() => ({
    language,
    changeLanguage,
    t,
    isLoading,
  }), [language, changeLanguage, t, isLoading]);
});