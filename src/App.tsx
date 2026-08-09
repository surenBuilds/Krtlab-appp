import React, { useState, useCallback, useEffect } from 'react';
import { useUserProfile } from './hooks/useUserProfile';
import { useTranslation } from './hooks/useTranslation';
import { CATEGORIES } from './data/categories';
import { Dashboard } from './components/Dashboard';
import { LearningModule } from './components/LearningModule';
import { LanguageModule } from './components/LanguageModule';
import { AIMentor } from './components/AIMentor';
import { QuizMentor } from './components/QuizMentor';
import { FlashcardSystem } from './components/FlashcardSystem';
import { LearningPaths } from './components/LearningPaths';
import { PracticeLab } from './components/PracticeLab';
import { Logo } from './components/Logo';
import { SplashScreen } from './components/SplashScreen';
import { CertificateGenerator } from './components/CertificateGenerator';
import { GoalDiscovery } from './components/GoalDiscovery';
import { GamesSection } from './components/GamesSection';
import { GoalsSection } from './components/GoalsSection';
import { DisciplineSystem } from './components/DisciplineSystem';
import { ModulePage } from './components/ModulePage';
import { LEARNING_PATHS, LearningPath } from './data/learningPaths';
import { Flashcard } from './types';
import { SimulationGame } from './components/games/SimulationGame';
import { GameCreator } from './components/GameCreator';
import { MentorMarketplace } from './components/MentorMarketplace';
import { CourseMarketplace } from './components/CourseMarketplace';
import { SkillGraph } from './components/SkillGraph';
import { PersonalLearningProfile } from './components/PersonalLearningProfile';
import { CareerCenter } from './components/CareerCenter';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { DeveloperPlatform } from './components/DeveloperPlatform';
import { MonetizationSystem } from './components/MonetizationSystem';
import { Leaderboard } from './features/leaderboard/Leaderboard';
import { 
  Trophy, BookOpen, LayoutDashboard, MessageSquare, BrainCircuit, 
  Menu, X, ChevronRight, ChevronLeft, CheckCircle2, Award, Zap,
  Wallet, Briefcase, Cpu, FlaskConical, Globe, Scale, 
  Building2, Plane, Truck, Rocket, Factory, RefreshCcw, Map,
  Mic, MicOff, Languages, LogOut, Mail, TestTube2, Gamepad2, Target,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Toaster, toast } from 'sonner';
import { signInWithGoogle, logout, loginWithEmail, registerWithEmail } from './lib/firebase';

const ICON_MAP: Record<string, any> = { Wallet, Briefcase, Cpu, FlaskConical, BookOpen, Globe, Scale, Building2, Plane, Truck, Rocket, Factory, Languages };

import { useLessons } from './hooks/LessonContext';

export default function App() {
  const { profile, updateProfile, updateProgress, addFlashcards, updateFlashcardSRS, completeDiscovery, toggleDailyTask, completePracticeProject, updateGameScore, updateCustomGoal, toggleDemoMode, updateRole, loading, user } = useUserProfile();
  const { preGenerate } = useLessons();
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'learn' | 'flashcards' | 'paths' | 'games' | 'goals' | 'creator' | 'lab' | 'school' | 'module' | 'mentor-marketplace' | 'course-marketplace' | 'skill-graph' | 'portfolio' | 'career-center' | 'org-dashboard' | 'dev-platform' | 'monetization' | 'leaderboard'>('dashboard');
  const [labTopic, setLabTopic] = useState<{ field: string, topic: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => { if (selectedCategory) { const category = CATEGORIES.find(c => c.id === selectedCategory); if (category) { category.subfields.slice(0, 3).forEach(sub => { preGenerate(selectedCategory, sub.id, 1); }); } } }, [selectedCategory, preGenerate]);
  const [selectedSubfield, setSelectedSubfield] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [certificateData, setCertificateData] = useState<{ courseName: string; levelName: string; date: string } | null>(null);

  const handleLogout = async () => { try { await logout(); toast.success("Դուրս եկաք:"); } catch { toast.error("Սխալ:"); } };

  // rest of original App.tsx preserved as-is
}