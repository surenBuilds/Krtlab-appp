import React, { createContext, useContext, ReactNode } from 'react';
import { useLessonStore, LessonState } from './useLessonStore';

interface LessonContextType {
  lessons: Record<string, LessonState>;
  fetchLesson: (categoryId: string, subfieldId: string, levelId: number, forceRefresh?: boolean) => Promise<LessonState | undefined>;
  preGenerate: (categoryId: string, subfieldId: string, levelId: number) => void;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export const LessonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useLessonStore();
  return (
    <LessonContext.Provider value={store}>
      {children}
    </LessonContext.Provider>
  );
};

export const useLessons = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessons must be used within a LessonProvider');
  }
  return context;
};
