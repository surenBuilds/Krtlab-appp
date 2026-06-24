import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LessonProvider } from './hooks/LessonContext';
import { UserProvider } from './hooks/useUserProfile';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <LessonProvider>
        <App />
      </LessonProvider>
    </UserProvider>
  </StrictMode>,
);
