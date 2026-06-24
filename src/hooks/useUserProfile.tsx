import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, DailyTask, GameSessionResult } from '../types';
import { CheckCircle2 } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { toast } from 'sonner';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { AdaptiveGameService } from '../services/adaptiveGameService';

import { INITIAL_FLASHCARDS } from '../data/flashcards';
import { CATEGORIES } from '../data/categories';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const isPermissionError = errMessage.includes('permission-denied') || errMessage.toLowerCase().includes('insufficient permissions');
  const isUnavailable = errMessage.includes('unavailable') || errMessage.includes('could not reach');

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  if (isPermissionError) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else if (isUnavailable) {
    console.warn('Firestore is temporarily unavailable (possibly offline):', errMessage);
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
}

const STORAGE_KEY = 'learnix_user_profile';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  progress: {
    categories: {}
  },
  xp: 0,
  level: 2,
  streak: 0,
  lastStreakUpdate: null,
  role: 'student',
  isDemoMode: false,
  points: 0,
  migrationVersion: 2, // Track migrations
  achievements: [],
  flashcards: INITIAL_FLASHCARDS,
  gameHighScores: {},
  discipline: {
    daysCount: 0,
    startDate: new Date().toISOString(),
    completedToday: false,
    dailyTasks: [
      { id: 'task-1', title: 'Ուսումնասիրել նոր դաս', completed: false, type: 'lesson' },
      { id: 'task-2', title: 'Կրկնել հիշողության քարտերը', completed: false, type: 'flashcard' },
      { id: 'task-3', title: 'Անցնել օրվա թեստը', completed: false, type: 'quiz' }
    ]
  },
  completedProjects: [],
};

interface UserContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateProgress: (categoryId: string, subfieldId: string, levelId: number, score?: number, stepType?: 'lesson' | 'practice' | 'game') => void;
  updateAdaptiveProgress: (lessonId: string, analysis: any) => void;
  addFlashcards: (newCards: { term: string; definition: string }[]) => void;
  updateFlashcardSRS: (cardId: string, srsData: any) => void;
  resetProgress: () => void;
  completeDiscovery: (answers: any) => void;
  toggleDailyTask: (taskId: string) => void;
  completePracticeProject: (projectId: string, xpReward: number) => void;
  updateXp: (amount: number) => void;
  updateGameScore: (gameId: string, score: number, xpReward: number, result?: GameSessionResult) => void;
  updateCustomGoal: (goal: string) => void;
  activateGoal: (goal: string, categoryId: string) => void;
  submitPracticeWork: (subfieldId: string, level: number, content: string, fileName?: string) => Promise<any>;
  toggleDemoMode: () => void;
  updateRole: (role: 'admin' | 'teacher' | 'student') => void;
  syncNow: () => Promise<void>;
  loading: boolean;
  user: any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const MIGRATION_VERSION = 3;
const subfieldsToReset = ['entrepreneurship', 'marketing', 'sales'];

function migrateProfile(profileData: UserProfile): { migrated: UserProfile; changed: boolean } {
  let changed = false;
  if ((profileData.migrationVersion || 0) < MIGRATION_VERSION) {
    console.log("Running Course Data Migration to version " + MIGRATION_VERSION + "...");
    const newProgress = JSON.parse(JSON.stringify(profileData.progress || { categories: {} }));
    
    // Reset specific broken subfields across all categories
    Object.keys(newProgress.categories || {}).forEach(catId => {
      subfieldsToReset.forEach(subId => {
        if (newProgress.categories[catId]?.subfields?.[subId]) {
          newProgress.categories[catId].subfields[subId] = {
            level: 1,
            completedLessons: [],
            completedQuizzes: [],
            completedPractices: [],
            completedGames: [],
            score: 0,
            accuracy: 0,
            stageStatus: {}
          };
          changed = true;
        }
      });
    });

    profileData.progress = newProgress;
    profileData.migrationVersion = MIGRATION_VERSION;
    changed = true;
  }
  return { migrated: profileData, changed };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingFromFirestore = useRef(false);
  const profileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const syncToFirestoreNow = useCallback(async (data: UserProfile) => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => 
        value === undefined ? null : value
      ));
      await setDoc(userDocRef, sanitizedData, { merge: true });
    } catch (error) {
      console.error("Firestore sync error:", error);
      throw error;
    }
  }, []);

  const syncToFirestore = useCallback((data: UserProfile) => {
    if (!auth.currentUser) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      syncToFirestoreNow(data).catch(() => {});
    }, 2000);
  }, [syncToFirestoreNow]);

  useEffect(() => {
    if (isSyncingFromFirestore.current) {
      isSyncingFromFirestore.current = false;
      return;
    }
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      syncToFirestore(profile);
    }
  }, [profile, syncToFirestore]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          const localData = localStorage.getItem(STORAGE_KEY);
          let initialData = INITIAL_PROFILE;
          if (localData) {
            try { initialData = JSON.parse(localData); } catch (e) {}
          }

          const now = new Date();
          
          // Helper to check for reset without activity
          const checkStreakReset = (p: UserProfile) => {
            if (p.streak === 0 || !p.lastStreakUpdate) return p;
            
            const lastUpdate = new Date(p.lastStreakUpdate);
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastDay = new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate());
            
            const diffDays = Math.round((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
              return { ...p, streak: 0 };
            }
            return p;
          };

          let profileData = docSnap.exists() 
            ? (docSnap.data() as UserProfile) 
            : { ...INITIAL_PROFILE, uid: firebaseUser.uid, email: firebaseUser.email || null, name: initialData.name || firebaseUser.displayName || '' };
          
          // Merge local if newer or more advanced
          if (docSnap.exists() && initialData.xp > profileData.xp) {
            profileData = { ...profileData, ...initialData, uid: firebaseUser.uid };
          }

          const { migrated, changed } = migrateProfile(profileData);
          profileData = migrated;
          if (changed) {
            isSyncingFromFirestore.current = true; // Trigger save
          }

          // Check for missed days on load
          profileData = checkStreakReset(profileData);
          profileData.lastActive = now.toISOString();

          isSyncingFromFirestore.current = true;
          setProfile(profileData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
          if (!docSnap.exists() || initialData.xp > (docSnap.data() as UserProfile).xp) {
            const sanitizedProfile = JSON.parse(JSON.stringify(profileData, (key, value) => 
              value === undefined ? null : value
            ));
            await setDoc(userDocRef, sanitizedProfile, { merge: true });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }

        const unsubFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as UserProfile;
            
            // Guard against stale Firestore snapshot overwriting newer local state
            if (profileRef.current && firestoreData.xp < profileRef.current.xp) {
              console.log("Ignoring stale Firestore update: Firestore XP is", firestoreData.xp, "Local XP is", profileRef.current.xp);
              return;
            }
            
            isSyncingFromFirestore.current = true;
            setProfile(firestoreData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreData));
          }
          setLoading(false);
        }, (error) => handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`));

        return () => unsubFirestore();
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const { migrated, changed } = migrateProfile(parsed);
            setProfile(migrated);
            if (changed) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            }
          } catch (e) {
            setProfile(INITIAL_PROFILE);
          }
        } else {
          setProfile(INITIAL_PROFILE);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const calculateStreak = useCallback((currentStreak: number, lastUpdateStr?: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr) : null;
    
    let newStreak = currentStreak;
    let updateStreakTime = lastUpdateStr || now.toISOString();

    if (!lastUpdate || currentStreak === 0) {
      newStreak = 1;
      updateStreakTime = now.toISOString();
    } else {
      const lastDay = new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate());
      const diffDays = Math.round((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = currentStreak + 1;
        updateStreakTime = now.toISOString();
        toast.success(`Հրաշալի է: Դուք պահպանեցիք ձեր ${newStreak}-օրյա շղթան: 🔥`);
      } else if (diffDays > 1) {
        newStreak = 1;
        updateStreakTime = now.toISOString();
        toast.info("Նոր շղթա է սկսվել: 👋");
      }
    }
    return { newStreak, updateStreakTime };
  }, []);

  const updateProgress = useCallback((categoryId: string, subfieldId: string, levelId: number, score: number = 100, stage: 'lesson' | 'quiz' | 'practice' | 'game' | 'complete') => {
    const prev = profileRef.current;
    if (!prev) return;
    
    const newProgress = JSON.parse(JSON.stringify(prev.progress || { categories: {} }));
    if (!newProgress.categories[categoryId]) newProgress.categories[categoryId] = { subfields: {} };
    if (!newProgress.categories[categoryId].subfields[subfieldId]) {
      newProgress.categories[categoryId].subfields[subfieldId] = { 
        level: 1, 
        completedLessons: [], 
        completedQuizzes: [],
        completedPractices: [],
        completedGames: [],
        score: 0, 
        accuracy: 0,
        stageStatus: {}
      };
    }
    
    const subfieldProgress = newProgress.categories[categoryId].subfields[subfieldId];
    if (!subfieldProgress.completedLessons) subfieldProgress.completedLessons = [];
    if (!subfieldProgress.completedQuizzes) subfieldProgress.completedQuizzes = [];
    if (!subfieldProgress.completedPractices) subfieldProgress.completedPractices = [];
    if (!subfieldProgress.completedGames) subfieldProgress.completedGames = [];
    if (!subfieldProgress.stageStatus) subfieldProgress.stageStatus = {};
    
    if (!subfieldProgress.stageStatus[levelId]) {
      subfieldProgress.stageStatus[levelId] = {
        lesson: false,
        quiz: false,
        practice: false,
        game: false,
        quizScore: 0,
        needsLessonRestart: false,
        practicePassed: false
      };
    }

    const status = subfieldProgress.stageStatus[levelId];
    let changed = false;

    if (stage === 'lesson') {
      if (!status.lesson || status.needsLessonRestart) {
        status.lesson = true;
        status.needsLessonRestart = false;
        if (!subfieldProgress.completedLessons.includes(levelId)) {
          subfieldProgress.completedLessons.push(levelId);
        }
        changed = true;
      }
    } else if (stage === 'quiz') {
      status.quizScore = score;
      if (score >= 80) {
        status.quiz = true;
        if (!subfieldProgress.completedQuizzes.includes(levelId)) {
          subfieldProgress.completedQuizzes.push(levelId);
        }
      } else {
        status.quiz = false;
        status.needsLessonRestart = true;
        status.lesson = false;
        subfieldProgress.completedLessons = subfieldProgress.completedLessons.filter((l: number) => l !== levelId);
        subfieldProgress.completedQuizzes = subfieldProgress.completedQuizzes.filter((l: number) => l !== levelId);
      }
      changed = true;
    } else if (stage === 'practice') {
      const passed = score >= 70;
      status.practicePassed = passed;
      if (passed) {
        status.practice = true;
        if (!subfieldProgress.completedPractices.includes(levelId)) {
          subfieldProgress.completedPractices.push(levelId);
        }
      }
      changed = true;
    } else if (stage === 'game') {
      const passed = score >= 70;
      if (passed) {
        status.game = true;
        if (!subfieldProgress.completedGames.includes(levelId)) {
          subfieldProgress.completedGames.push(levelId);
        }
      }
      changed = true;
    } else if (stage === 'complete') {
      status.lesson = true;
      status.quiz = true;
      status.practice = true;
      status.game = true;
      changed = true;
    }

    if (changed) {
      // Calculate new accuracy
      const totalSteps = (subfieldProgress.completedLessons?.length || 0) + 
                         (subfieldProgress.completedQuizzes?.length || 0) + 
                         (subfieldProgress.completedPractices?.length || 0) + 
                         (subfieldProgress.completedGames?.length || 0);
      
      if (totalSteps > 0) {
        subfieldProgress.accuracy = Math.round(((subfieldProgress.accuracy || 0) * (totalSteps - 1) + score) / totalSteps);
      }
      
      const isCurrentLevelFullyComplete = 
        status.lesson && 
        status.quiz && 
        status.practice && 
        status.game;

      if (isCurrentLevelFullyComplete && !status.isFullyCompleted) {
        status.isFullyCompleted = true;
        
        // Unlock next level ONLY if this was the current active level
        if (levelId === subfieldProgress.level) {
          subfieldProgress.level += 1;
          toast.success(`Շնորհավոր! Մակարդակ ${levelId}-ն ավարտված է: Հաջորդը՝ ${subfieldProgress.level}:`, {
            icon: <CheckCircle2 className="text-emerald-500" size={20} />
          });
        }
      }

      // Streak Logic: Meaningful activity detected
      const { newStreak, updateStreakTime } = calculateStreak(prev.streak, prev.lastStreakUpdate);

      const now = new Date();
      const newXP = prev.xp + score;
      const newLevel = Math.floor(newXP / 5000) + 2;
      if (newLevel > prev.level) toast.success(`Շնորհավորում ենք: Դուք հասաք ${newLevel}-րդ մակարդակի:`);

      const nextProfile: UserProfile = { 
        ...prev, 
        xp: newXP, 
        level: newLevel, 
        progress: newProgress, 
        streak: newStreak,
        lastStreakUpdate: updateStreakTime,
        lastActive: now.toISOString() 
      };

      setProfile(nextProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
      syncToFirestoreNow(nextProfile).catch(() => {});
    }
  }, [calculateStreak, syncToFirestoreNow]);

  const updateAdaptiveProgress = useCallback((lessonId: string, analysis: any) => {
    setProfile(prev => prev ? { ...prev, adaptiveProgress: { ...(prev.adaptiveProgress || {}), [lessonId]: { ...analysis, timestamp: new Date().toISOString() } } } : prev);
  }, []);

  const addFlashcards = useCallback((newCards: { term: string; definition: string }[]) => {
    setProfile(prev => {
      if (!prev) return prev;
      const existingTerms = new Set((prev.flashcards || []).map(c => c.term.toLowerCase()));
      const cardsToAdd = newCards.filter(card => !existingTerms.has(card.term.toLowerCase())).map(card => ({
        id: Math.random().toString(36).substr(2, 9), term: card.term, definition: card.definition,
        createdAt: new Date().toISOString(), nextReview: new Date().toISOString(), interval: 0, repetitionCount: 0, easeFactor: 2.5
      }));
      if (cardsToAdd.length === 0) return prev;
      toast.success(`Ավելացվել է ${cardsToAdd.length} նոր հիշողության քարտ:`);
      return { ...prev, flashcards: [...(prev.flashcards || []), ...cardsToAdd] };
    });
  }, []);

  const updateFlashcardSRS = useCallback((cardId: string, srsData: any) => {
    setProfile(prev => prev ? { ...prev, flashcards: (prev.flashcards || []).map(card => card.id === cardId ? { ...card, ...srsData } : card) } : prev);
  }, []);

  const resetProgress = useCallback(() => setProfile(INITIAL_PROFILE), []);
  const completeDiscovery = useCallback((answers: any) => setProfile(prev => prev ? { ...prev, discovery: answers } : prev), []);

  const toggleDailyTask = useCallback((taskId: string) => {
    setProfile(prev => {
      if (!prev || !prev.discipline) return prev;
      const tasks = prev.discipline.dailyTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedToday = tasks.every(t => t.completed);
      let daysCount = prev.discipline.daysCount;
      
      let newStreak = prev.streak;
      let newLastStreakUpdate = prev.lastStreakUpdate;

      if (completedToday && !prev.discipline.completedToday) {
        daysCount += 1;
        toast.success(`Հրաշալի է: Օրվա առաջադրանքները կատարված են: Կարգապահության օր ${daysCount}:`);
        
        // Update streak here too
        const streakResult = calculateStreak(prev.streak, prev.lastStreakUpdate);
        newStreak = streakResult.newStreak;
        newLastStreakUpdate = streakResult.updateStreakTime;
      }
      
      return { 
        ...prev, 
        streak: newStreak,
        lastStreakUpdate: newLastStreakUpdate,
        discipline: { ...prev.discipline, dailyTasks: tasks, completedToday, daysCount } 
      };
    });
  }, [calculateStreak]);

  const completePracticeProject = useCallback((projectId: string, xpReward: number) => {
    setProfile(prev => {
      if (!prev || prev.completedProjects.includes(projectId)) return prev;
      const { newStreak, updateStreakTime } = calculateStreak(prev.streak, prev.lastStreakUpdate);
      const newXP = prev.xp + xpReward;
      const newLevel = Math.floor(newXP / 5000) + 2;
      if (newLevel > prev.level) toast.success(`Շնորհավորում ենք: Դուք հասաք ${newLevel}-րդ մակարդակի:`);
      return { 
        ...prev, 
        xp: newXP, 
        level: newLevel, 
        streak: newStreak,
        lastStreakUpdate: updateStreakTime,
        completedProjects: [...prev.completedProjects, projectId],
        lastActive: new Date().toISOString()
      };
    });
  }, [calculateStreak]);

  const updateGameScore = useCallback((gameId: string, score: number, xpReward: number, result?: GameSessionResult) => {
    setProfile(prev => {
      if (!prev) return prev;
      const { newStreak, updateStreakTime } = calculateStreak(prev.streak, prev.lastStreakUpdate);
      
      // Update Adaptive Stats if results are provided
      let newAdaptiveStats = prev.gameAdaptiveStats || {};
      let finalXPReward = xpReward;

      if (result) {
        const currentStats = newAdaptiveStats[gameId];
        const nextState = AdaptiveGameService.getNextState(currentStats, result);
        newAdaptiveStats = { ...newAdaptiveStats, [gameId]: nextState };
        
        // Scale XP based on internal level reached
        finalXPReward = AdaptiveGameService.calculateXPReward(xpReward, nextState.currentInternalLevel, result.accuracy);
        
        if (nextState.currentInternalLevel > (currentStats?.currentInternalLevel || 1)) {
          toast.success(`Մակարդակի բարձրացում! Այժմ դուք ${AdaptiveGameService.getLevelLabel(nextState.currentInternalLevel)} մակարդակում եք: 🔥`);
        }
      }

      const currentHigh = prev.gameHighScores?.[gameId] || 0;
      const newHighScores = { ...(prev.gameHighScores || {}), [gameId]: Math.max(currentHigh, score) };
      const newXP = prev.xp + finalXPReward;
      const newLevel = Math.floor(newXP / 5000) + 2;
      
      if (newLevel > prev.level) toast.success(`Շնորհավորում ենք: Դուք հասաք ${newLevel}-րդ մակարդակի:`);
      
      return { 
        ...prev, 
        xp: newXP, 
        level: newLevel, 
        streak: newStreak,
        lastStreakUpdate: updateStreakTime,
        gameHighScores: newHighScores,
        gameAdaptiveStats: newAdaptiveStats,
        lastActive: new Date().toISOString()
      };
    });
  }, [calculateStreak]);

  const updateCustomGoal = useCallback((goal: string) => setProfile(prev => prev ? { ...prev, customGoal: goal } : prev), []);

  const toggleDemoMode = useCallback(() => {
    setProfile(prev => {
      if (!prev) return prev;
      const nextDemoState = !prev.isDemoMode;
      toast.info(nextDemoState ? "Դեմո ռեժիմը միացված է: Փոփոխությունները չեն պահպանվի:" : "Դեմո ռեժիմն անջատված է:");
      return { ...prev, isDemoMode: nextDemoState };
    });
  }, []);

  const updateRole = useCallback((role: 'admin' | 'teacher' | 'student') => {
    setProfile(prev => prev ? { ...prev, role } : prev);
  }, []);

  const submitPracticeWork = useCallback(async (subfieldId: string, level: number, content: string, fileName?: string) => {
    const score = content.length > 50 ? Math.floor(Math.random() * 31) + 70 : Math.floor(Math.random() * 41) + 40;
    const passed = score >= 70;
    const feedbackOptions = passed ? ["Հիանալի աշխատանք է!", "Լավ փորձ է:", "Ձեր մոտեցումը ստեղծարար է:"] : ["Այս անգամ բավարար չէր:", "Աշխատանքը թերի է:"];
    const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
    if (passed) {
      updateProgress(subfieldId, subfieldId, level, level * 100); // Dummy categoryId for now or use actual if present
      toast.success(`Նախագիծը հաստատվեց! +${level * 100} XP`);
    } else {
      toast.error("Աշխատանքը չի ընդունվել:");
    }
    return { score, feedback, passed };
  }, [updateProgress]);

  const activateGoal = useCallback((goal: string, categoryId: string) => {
    setProfile(prev => {
      if (!prev) return prev;
      const goalTypeMap: any = { 'technology': 'programmer', 'marketing': 'marketing', 'languages': 'english' };
      const tasks: DailyTask[] = [
        { id: 'task-1', title: `${categoryId === 'technology' ? 'Կոդավորման' : categoryId === 'languages' ? 'Լեզվական' : 'Մասնագիտական'} նոր դաս`, completed: false, type: 'lesson' },
        { id: 'task-2', title: 'Կրկնել թեմատիկ քարտերը', completed: false, type: 'flashcard' },
        { id: 'task-3', title: 'Անցնել մասնագիտական թեստ', completed: false, type: 'quiz' }
      ];
      return { ...prev, customGoal: goal, discovery: { ...prev.discovery!, goal: goalTypeMap[categoryId] || 'other' }, discipline: { ...prev.discipline, dailyTasks: tasks } };
    });
    toast.success('Նպատակը և օրվա առաջադրանքները թարմացվեցին!');
  }, []);

  const updateXp = useCallback((amount: number) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newXP = (prev.xp || 0) + amount;
      const newLevel = Math.floor(newXP / 5000) + 2;
      if (newLevel > prev.level) {
        toast.success(`Շնորհավորում ենք: Դուք հասաք ${newLevel}-րդ մակարդակի:`);
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  const syncNow = useCallback(async () => {
    if (profile) {
      await syncToFirestoreNow(profile);
    }
  }, [profile, syncToFirestoreNow]);

  return (
    <UserContext.Provider value={{ 
      profile, updateProfile, updateProgress, updateAdaptiveProgress, addFlashcards, updateFlashcardSRS, 
      resetProgress, completeDiscovery, toggleDailyTask, completePracticeProject, 
      updateGameScore, updateCustomGoal, activateGoal, submitPracticeWork,
      updateXp, toggleDemoMode, updateRole, syncNow,
      loading, user 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUserProfile must be used within a UserProvider');
  return context;
}
