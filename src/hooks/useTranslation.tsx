import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hyTranslations, enTranslations, TranslationSchema } from '../locales/translations';
import { useUserProfile } from './useUserProfile';

type Language = 'hy' | 'en';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile } = useUserProfile();
  
  // Try to load initial language from localStorage, profile, or navigator
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('krtlab_preferred_language');
    if (saved === 'hy' || saved === 'en') return saved;
    return 'hy'; // Default to Armenian
  });

  // Sync language with user profile if it changes
  useEffect(() => {
    if (profile && (profile as any).preferredLanguage && (profile as any).preferredLanguage !== language) {
      setLanguageState((profile as any).preferredLanguage);
    }
  }, [profile]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('krtlab_preferred_language', lang);
    if (profile) {
      updateProfile({
        ...(profile as any),
        preferredLanguage: lang,
      });
    }
  }, [profile, updateProfile]);

  const t = useCallback((keyPath: string): string => {
    const dictionary: TranslationSchema = language === 'hy' ? hyTranslations : enTranslations;
    const parts = keyPath.split('.');
    
    let current: any = dictionary;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback keypath if translation does not exist
        return keyPath;
      }
    }
    
    return typeof current === 'string' ? current : keyPath;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
