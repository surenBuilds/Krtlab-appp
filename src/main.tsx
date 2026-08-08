import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LessonProvider } from './hooks/LessonContext';
import { UserProvider } from './hooks/useUserProfile';
import { TranslationProvider } from './hooks/useTranslation';
import { CertificateVerificationPage } from './components/CertificateVerificationPage';

// Public certificate verification pages render standalone — no auth/lesson
// providers needed, and no account required to check a certificate is real.
const verifyMatch = window.location.pathname.match(/^\/verify\/([A-Za-z0-9_-]+)$/);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {verifyMatch ? (
      <CertificateVerificationPage certificateId={verifyMatch[1]} />
    ) : (
      <UserProvider>
        <TranslationProvider>
          <LessonProvider>
            <App />
          </LessonProvider>
        </TranslationProvider>
      </UserProvider>
    )}
  </StrictMode>,
);