import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './app/AppRouter';
import './index.css';
import { LessonProvider } from './hooks/LessonContext';
import { UserProvider } from './hooks/useUserProfile';
import { TranslationProvider } from './hooks/useTranslation';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <TranslationProvider>
        <LessonProvider>
          <AppRouter />
        </LessonProvider>
      </TranslationProvider>
    </UserProvider>
  </StrictMode>,
);
