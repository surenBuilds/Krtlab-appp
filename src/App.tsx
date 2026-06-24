import React, { useState, useCallback, useEffect } from 'react';
import { useUserProfile } from './hooks/useUserProfile';
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
import { 
  BookOpen, LayoutDashboard, MessageSquare, BrainCircuit, 
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

const ICON_MAP: Record<string, any> = {
  Wallet, Briefcase, Cpu, FlaskConical, BookOpen, Globe, Scale, 
  Building2, Plane, Truck, Rocket, Factory, Languages
};

import { useLessons } from './hooks/LessonContext';

export default function App() {
  const { 
    profile, 
    updateProfile, 
    updateProgress, 
    addFlashcards, 
    updateFlashcardSRS, 
    completeDiscovery,
    toggleDailyTask,
    completePracticeProject,
    updateGameScore,
    updateCustomGoal,
    toggleDemoMode,
    updateRole,
    loading, 
    user 
  } = useUserProfile();
  const { preGenerate } = useLessons();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'learn' | 'flashcards' | 'paths' | 'games' | 'goals' | 'creator' | 'lab' | 'school' | 'module'>('dashboard');
  const [labTopic, setLabTopic] = useState<{ field: string, topic: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pre-generate lessons for the selected category to make navigation faster
  useEffect(() => {
    if (selectedCategory) {
      const category = CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        // Pre-generate level 1 for the first 3 subfields
        category.subfields.slice(0, 3).forEach(sub => {
          preGenerate(selectedCategory, sub.id, 1);
        });
      }
    }
  }, [selectedCategory, preGenerate]);

  const [selectedSubfield, setSelectedSubfield] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [certificateData, setCertificateData] = useState<{ courseName: string; levelName: string; date: string } | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Դուք դուրս եկաք համակարգից:");
    } catch (e) {
      toast.error("Դուրս գալու սխալ:");
    }
  };

  const startVoiceCommand = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Ձեր բրաուզերը չի աջակցում ձայնային հրահանգներ:");
      return;
    }

    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor || typeof SpeechRecognitionConstructor !== 'function') {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'hy-AM';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsVoiceActive(true);
      recognition.onend = () => setIsVoiceActive(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setLastVoiceCommand(transcript);
        console.log("Voice Command Recognized:", transcript);

        // Intent Recognition logic with Synonym Support and Keyword detection
        const cleanCommand = transcript.replace(/open|show|go to|take me to|բաց|գնա|ցույց տուր|տար ինձ|ինձ տար/g, '').trim();

        let targetTab: typeof activeTab | 'mentor' | null = null;
        let successMessage = "";

        // Home / Dashboard
        if (/գլխավոր|դաշբորդ|home|dashboard|main/.test(cleanCommand)) {
          targetTab = 'dashboard';
          successMessage = "Անցում Գլխավոր էջ";
        } 
        // Courses / Learn / Education
        else if (/դաս|սովորել|դասընթաց|courses?|learn|edu/.test(cleanCommand)) {
          targetTab = 'learn';
          successMessage = "Անցում Դասընթացների բաժին";
        }
        // Paths / Roadmap
        else if (/ուղի|ճանապարհ|ուղիներ|paths?|roadmap/.test(cleanCommand)) {
          targetTab = 'paths';
          successMessage = "Անցում Ուղիների բաժին";
        }
        // Laboratory / Lab
        else if (/լաբորատորիա|լաբ|laboratory|lab/.test(cleanCommand)) {
          targetTab = 'lab';
          successMessage = "Անցում Լաբորատորիա";
        }
        // Goals / Aim
        else if (/նպատակ|նպատակներ|goals?|aims?/.test(cleanCommand)) {
          targetTab = 'goals';
          successMessage = "Անցում Նպատակների բաժին";
        }
        // Cards / Flashcards
        else if (/քարտ|ֆլեշ|քարտեր|cards?|flashcards?/.test(cleanCommand)) {
          targetTab = 'flashcards';
          successMessage = "Անցում Քարտերի բաժին";
        }
        // Games
        else if (/խաղ|խաղեր|games?|play/.test(cleanCommand)) {
          targetTab = 'games';
          successMessage = "Անցում Խաղերի բաժին";
        }
        // Mentor / Assistant
        else if (/մենթոր|օգնություն|mentor|help|assistant|bot/.test(cleanCommand)) {
          targetTab = 'mentor';
          successMessage = "Բացվում է KrtLab ԱԲ Մենթորը";
        }

        if (targetTab) {
          if (targetTab === 'mentor') {
            setIsMentorOpen(true);
          } else {
            setActiveTab(targetTab as typeof activeTab);
            if (targetTab === 'dashboard') setSelectedCategory(null);
          }
          toast.success(successMessage, { 
            description: `Ճանաչված հրահանգ՝ "${transcript}"`,
            icon: <Mic className="text-secondary" size={16} />
          });
        } else {
          toast.info(`Հրահանգը չի ճանաչվել: "${transcript}"`, {
            description: "Փորձեք ասել՝ 'Գլխավոր', 'Դասեր', 'Լաբորատորիա', 'Նպատակներ' կամ 'Քարտեր'"
          });
        }

        setTimeout(() => setLastVoiceCommand(null), 3000);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsVoiceActive(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech Recognition initialization failed:", e);
      toast.error("Ձայնային հրահանգը չհաջողվեց միացնել:");
    }
  }, []);

  const handleLevelComplete = useCallback((categoryId: string, subfieldId: string, levelId: number) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    const subfield = category?.subfields?.find(s => s.id === subfieldId);
    const maxLevels = subfield?.maxLevels || 20;

    // Check if subfield is complete
    if (levelId === maxLevels) {
      if (subfield) {
        setCertificateData({
          courseName: subfield.title,
          levelName: `Մակարդակ ${maxLevels} / Ավարտական`,
          date: new Date().toLocaleDateString('hy-AM')
        });
      }
    }
  }, []);
  
  const handleNextLevel = useCallback(() => {
    if (activeLevel && selectedCategory && selectedSubfield) {
      handleLevelComplete(selectedCategory, selectedSubfield, activeLevel);

      // Redirect to Course level list as requested
      // This shows the updated progress in the grid
      setActiveLevel(null);
      toast.success("Դասն ավարտված է: Առաջընթացը պահպանված է:");
      
      // We no longer auto-advance to next level here to satisfy the redirect requirement
    }
  }, [activeLevel, selectedCategory, selectedSubfield, handleLevelComplete]);

  const handleAddFlashcard = useCallback((term: string, definition: string, categoryId: string, level: any) => {
    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      term,
      definition,
      categoryId,
      subcategoryId: 'general',
      createdAt: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      interval: 0,
      repetitionCount: 0,
      easeFactor: 2.5,
      level: level || 'beginner'
    };
    updateProfile({
      flashcards: [...(profile?.flashcards || []), newCard]
    });
  }, [profile, updateProfile]);

  const handleDeleteFlashcard = useCallback((id: string) => {
    updateProfile({
      flashcards: (profile?.flashcards || []).filter(c => c.id !== id)
    });
  }, [profile, updateProfile]);

  const getSubfieldProgress = useCallback((catId: string, subId: string) => {
    if (!profile?.progress?.categories) return [];
    const subfield = profile.progress.categories[catId]?.subfields?.[subId];
    if (!subfield || !subfield.stageStatus) return [];
    return Object.keys(subfield.stageStatus).filter(levelId => {
      const status = subfield.stageStatus[Number(levelId)];
      return status.isFullyCompleted || (status.lesson && status.quiz && status.practice && status.game);
    }).map(Number);
  }, [profile]);

  const currentCategory = React.useMemo(() => CATEGORIES.find(c => c.id === selectedCategory), [selectedCategory]);
  const currentSubfield = React.useMemo(() => currentCategory?.subfields?.find(s => s.id === selectedSubfield), [currentCategory, selectedSubfield]);

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  const isStreakAtRisk = React.useMemo(() => {
    if (!profile?.lastStreakUpdate || profile.streak === 0) return false;
    const now = new Date();
    const last = new Date(profile.lastStreakUpdate);
    const isToday = now.getFullYear() === last.getFullYear() && 
                    now.getMonth() === last.getMonth() && 
                    now.getDate() === last.getDate();
    return !isToday;
  }, [profile]);

  if (!isSplashComplete) {
    return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;
  }

  if (loading) return null;

  if (!profile || !profile.name) {
    return <Onboarding onComplete={(data) => updateProfile(data)} user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Toaster position="top-center" richColors />
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen transition-opacity",
        activeLevel && "opacity-50 pointer-events-none grayscale"
      )}>
        <div className="p-8">
          <Logo size="md" />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSelectedCategory(null); }}
            icon={<LayoutDashboard size={20} />}
            label="Գլխավոր"
          />
          <NavItem 
            active={activeTab === 'learn'} 
            onClick={() => setActiveTab('learn')}
            icon={<BookOpen size={20} />}
            label="Դասընթացներ"
          />
          <NavItem 
            active={activeTab === 'paths'} 
            onClick={() => { setActiveTab('paths'); setSelectedPath(null); }}
            icon={<Map size={20} />}
            label="Ուղիներ"
          />
          <NavItem 
            active={activeTab === 'lab'} 
            onClick={() => setActiveTab('lab')}
            icon={<FlaskConical size={20} />}
            label="Լաբորատորիա"
          />
          <NavItem 
            active={activeTab === 'flashcards'} 
            onClick={() => setActiveTab('flashcards')}
            icon={<BrainCircuit size={20} />}
            label="Քարտեր"
          />
          <NavItem 
            active={activeTab === 'goals'} 
            onClick={() => setActiveTab('goals')}
            icon={<Target size={20} />}
            label="Նպատակներ"
          />
          <NavItem 
            active={activeTab === 'module'} 
            onClick={() => setActiveTab('module')}
            icon={<BookOpen size={20} />}
            label="Open Module"
          />
          {(isAdmin || isTeacher) && (
            <NavItem 
              active={activeTab === 'school'} 
              onClick={() => setActiveTab('school')}
              icon={<Building2 size={20} />}
              label="Դպրոցի Կառավարում"
            />
          )}
          {isAdmin && (
            <NavItem 
              active={activeTab === 'creator'} 
              onClick={() => setActiveTab('creator')}
              icon={<Wand2 size={20} />}
              label="Game Creator"
            />
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-5 rounded-[1.5rem] font-black transition-all text-red-500 hover:bg-red-50"
            >
              <LogOut size={20} />
              <span>Դուրս գալ</span>
            </button>
          )}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex flex-col gap-4">
            {(isAdmin || isTeacher) && (
              <button 
                onClick={toggleDemoMode}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all group",
                  profile?.isDemoMode 
                    ? "bg-amber-500/10 border-amber-500 text-amber-600 shadow-lg shadow-amber-200/50" 
                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <RefreshCcw size={18} className={cn(profile?.isDemoMode && "animate-spin-slow")} />
                  <span className="text-xs font-black uppercase tracking-widest">Demo Mode</span>
                </div>
                <div className={cn(
                   "w-8 h-4 rounded-full relative transition-colors",
                   profile?.isDemoMode ? "bg-amber-500" : "bg-slate-300"
                )}>
                   <div className={cn(
                     "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                     profile?.isDemoMode ? "right-0.5" : "left-0.5"
                   )} />
                </div>
              </button>
            )}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                {profile?.name ? profile.name[0].toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{profile?.name || 'Օգտատեր'}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    profile?.role === 'admin' ? "bg-red-400" : profile?.role === 'teacher' ? "bg-purple-400" : "bg-emerald-400"
                  )} />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                    {profile?.role === 'admin' ? 'Ադմին' : profile?.role === 'teacher' ? 'Ուսուցիչ' : 'Աշակերտ'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={cn(
          "h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between transition-opacity",
          activeLevel && "opacity-50 pointer-events-none"
        )}>
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" showText={false} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={startVoiceCommand}
              className={cn(
                "p-2.5 rounded-2xl transition-all flex items-center gap-2",
                isVoiceActive 
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              title="Ձայնային հրահանգ"
            >
              <Mic size={20} />
              {isVoiceActive && <span className="text-xs font-bold hidden sm:inline">Լսում եմ...</span>}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full border border-accent/20">
              <Award size={18} />
              <span className="text-sm font-bold">{profile?.xp} XP</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
              isStreakAtRisk 
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse" 
                : (profile?.streak || 0) > 0 ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-slate-100 text-slate-400 border-slate-200"
            )}>
              <Zap size={18} className={cn(isStreakAtRisk && "fill-amber-600")} />
              <span className="text-sm font-bold">Օր {profile?.streak || 0}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsMentorOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 glow-cyan-hover"
          >
            <MessageSquare size={18} />
            <span className="text-sm font-bold hidden sm:inline">KrtLab ԱԲ Մենթոր</span>
          </button>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Բարի գալուստ, {profile?.name || 'Օգտատեր'}</h2>
                    <p className="text-slate-500 font-medium mt-1">Ահա քո այսօրվա առաջընթացը:</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <DisciplineSystem 
                    daysCount={profile.discipline?.daysCount || 0}
                    streak={profile.streak}
                    tasks={profile.discipline?.dailyTasks || []}
                    onToggleTask={toggleDailyTask}
                    xp={profile.xp}
                    level={profile.level}
                  />

                  <div className="pt-10 border-t border-slate-100">
                    <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-8 text-left group hover:border-primary transition-all relative overflow-hidden mb-10">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BrainCircuit size={80} className="text-primary" />
                      </div>
                      <div className="w-14 h-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                        <Rocket size={28} />
                      </div>
                      <h4 className="text-xl font-black text-white mb-2">Advanced Learning Engine</h4>
                      <p className="text-sm text-white/50 font-medium">Անհատականացված ուսումնական ուղիներ՝ հարմարեցված ձեր նպատակներին:</p>
                    </div>

                    <Dashboard 
                      profile={profile!} 
                      onSync={signInWithGoogle}
                      isLoggedIn={!!user}
                      onStartLesson={(catId, subId, lvId) => {
                        setSelectedCategory(catId);
                        setSelectedSubfield(subId);
                        setActiveLevel(lvId);
                        setActiveTab('learn');
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'school' && (isAdmin || isTeacher) && (
              <motion.div
                key="school"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
                   <div className="mb-10 text-center">
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">Դպրոցի Կառավարում</h2>
                      <p className="text-slate-500 font-medium mt-2">Կառավարեք աշակերտներին և դիտեք առաջընթացը</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                         <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Աշակերտներ</p>
                         <p className="text-3xl font-black text-slate-900">248</p>
                      </div>
                      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                         <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Ակտիվություն</p>
                         <p className="text-3xl font-black text-emerald-700">85%</p>
                      </div>
                      <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20">
                         <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Average XP</p>
                         <p className="text-3xl font-black text-primary">12.4k</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-xl font-black text-slate-900 px-2">Վերջին ակտիվություն</h3>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                 S{i}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900">Աշակերտ {i}</p>
                                 <p className="text-xs text-slate-500">Ավարտել է «Ֆինանսական Գրագիտություն» դասը</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-emerald-500">+250 XP</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black">2 րոպե առաջ</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'creator' && isAdmin && (
              <motion.div
                key="creator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GameCreator />
              </motion.div>
            )}

            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GamesSection />
              </motion.div>
            )}

            {activeTab === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GoalsSection />
              </motion.div>
            )}

            {activeTab === 'learn' && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!selectedCategory ? (
                  <div className="space-y-8">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ընտրիր բնագավառը</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {CATEGORIES.map(cat => {
                        const Icon = ICON_MAP[cat.icon];
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-accent/30 hover:-translate-y-1 transition-all text-left space-y-4 relative overflow-hidden"
                          >
                            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-gradient-brand group-hover:text-white transition-all shadow-sm">
                              <Icon size={28} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{cat.title}</h3>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-slate-500 font-medium">{cat.subfields.length} ենթաբնագավառ</p>
                                {(() => {
                                  const catSubfieldIds = cat.subfields.map(s => s.id);
                                  const completedInCat = catSubfieldIds.reduce((acc, id) => acc + getSubfieldProgress(cat.id, id).length, 0);
                                  const totalInCat = cat.subfields.reduce((acc, sub) => acc + (sub.maxLevels || 20), 0);
                                  const progress = Math.round((completedInCat / totalInCat) * 100);
                                  return progress > 0 ? (
                                    <span className="text-xs font-bold text-accent">{progress}%</span>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                            {(() => {
                              const catSubfieldIds = cat.subfields.map(s => s.id);
                              const completedInCat = catSubfieldIds.reduce((acc, id) => acc + getSubfieldProgress(cat.id, id).length, 0);
                              const totalInCat = cat.subfields.reduce((acc, sub) => acc + (sub.maxLevels || 20), 0);
                              const progress = (completedInCat / totalInCat) * 100;
                              return progress > 0 ? (
                                <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
                              ) : null;
                            })()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : !selectedSubfield ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-primary shadow-sm hover:shadow-md"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{currentCategory?.title}</h2>
                        <p className="text-slate-500 font-medium">Ընտրեք մասնագիտացված ենթաբնագավառը</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentCategory?.subfields?.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubfield(sub.id);
                            // Pre-generate next level
                            const completed = getSubfieldProgress(selectedCategory!, sub.id);
                            const nextLevel = completed.length + 1;
                            if (nextLevel <= (sub.maxLevels || 20)) {
                              preGenerate(selectedCategory!, sub.id, nextLevel);
                            }
                          }}
                          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-secondary/30 flex items-center justify-between group transition-all"
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-lg font-bold text-slate-800 group-hover:text-secondary transition-colors">{sub.title}</span>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{sub.maxLevels || 20} Մակարդակ</span>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
                            <ChevronRight size={24} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : selectedCategory === 'languages' ? (
                  <LanguageModule 
                    languageId={selectedSubfield || ''}
                    languageTitle={currentSubfield?.title || ''}
                    onExit={() => setSelectedSubfield(null)}
                  />
                ) : !activeLevel ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedSubfield(null)}
                        className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-primary shadow-sm hover:shadow-md"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-1">
                          <span>{currentCategory?.title}</span>
                          <ChevronRight size={12} />
                          <span>{currentSubfield?.title}</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ուսումնական մակարդակներ</h2>
                      </div>
                    </div>
                    
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-6">
                        {Array.from({ length: currentSubfield?.maxLevels || 20 }).map((_, i) => {
                          const levelNum = i + 1;
                          const subfieldProgress = profile?.progress?.categories[selectedCategory!]?.subfields?.[selectedSubfield!];
                          const currentLevel = subfieldProgress?.level || 1;
                          const stageStatus = subfieldProgress?.stageStatus?.[levelNum];
                          
                          const isCompleted = stageStatus?.isFullyCompleted || (
                                            stageStatus?.lesson && 
                                            stageStatus?.quiz && 
                                            stageStatus?.practice &&
                                            stageStatus?.game
                                          );
                          
                          const isLocked = levelNum > currentLevel;
                          
                          return (
                            <motion.button
                              layout
                              initial={false}
                              animate={{ scale: 1, opacity: 1 }}
                              key={levelNum}
                              disabled={isLocked}
                              onClick={() => setActiveLevel(levelNum)}
                              onMouseEnter={() => {
                                if (!isLocked && !isCompleted) {
                                  preGenerate(selectedCategory!, selectedSubfield!, levelNum);
                                }
                              }}
                              className={cn(
                                "aspect-square rounded-[1.5rem] flex flex-col items-center justify-center font-black text-xl transition-all relative group shadow-sm overflow-hidden",
                                isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 border-2 border-emerald-400" :
                                isLocked ? "bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100" :
                                "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/20"
                              )}
                            >
                              <div className="flex flex-col items-center gap-1">
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2 size={24} className="animate-in zoom-in duration-500" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Ավարտված</span>
                                  </>
                                ) : (
                                  <span>{levelNum}</span>
                                )}
                                {stageStatus && !isCompleted && (
                                  <div className="flex gap-1 mt-1">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", stageStatus.lesson ? "bg-emerald-400" : "bg-slate-200")} />
                                    <div className={cn("w-1.5 h-1.5 rounded-full", stageStatus.quiz ? "bg-emerald-400" : "bg-slate-200")} />
                                    <div className={cn("w-1.5 h-1.5 rounded-full", stageStatus.practice ? "bg-emerald-400" : "bg-slate-200")} />
                                    <div className={cn("w-1.5 h-1.5 rounded-full", stageStatus.game ? "bg-emerald-400" : "bg-slate-200")} />
                                  </div>
                                )}
                              </div>
                              {!isLocked && !isCompleted && !stageStatus && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse shadow-lg shadow-accent/50" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                      <LearningModule 
                        categoryId={selectedCategory || ''}
                        categoryTitle={currentCategory?.title || ''}
                        subfieldId={selectedSubfield || ''}
                        subfieldTitle={currentSubfield?.title || ''}
                        levelId={activeLevel}
                        onComplete={handleNextLevel}
                        onExit={() => setActiveLevel(null)}
                        onEnterLab={(topic) => {
                          setLabTopic({ field: currentSubfield?.title || 'General', topic });
                          setActiveTab('lab');
                          setActiveLevel(null);
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'paths' && (
              <motion.div
                key="paths"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!selectedPath ? (
                  <LearningPaths 
                    profile={profile!}
                    onStartPath={(path) => setSelectedPath(path)}
                    completedSteps={Object.keys(profile?.progress?.categories || {}).flatMap(catId => 
                      Object.keys(profile?.progress?.categories[catId]?.subfields || {}).flatMap(subId => {
                        const subfield = profile?.progress?.categories[catId]?.subfields[subId];
                        if (!subfield || !subfield.stageStatus) return [];
                        return Object.keys(subfield.stageStatus).filter(levelId => {
                          const status = subfield.stageStatus[Number(levelId)];
                          return status.lesson && status.quiz && status.practice && status.game;
                        }).map(levelId => `${catId}-${subId}-${levelId}`);
                      })
                    )}
                  />
                ) : !activeLevel ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedPath(null)}
                        className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-primary shadow-sm hover:shadow-md"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedPath.title}</h2>
                        <p className="text-slate-500 font-medium">Հետևիր քայլերին՝ նպատակին հասնելու համար</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedPath.steps.map((step, i) => {
                        const isCompleted = getSubfieldProgress(step.categoryId, step.subfieldId).includes(step.levelId);
                        const isLocked = i > 0 && !getSubfieldProgress(selectedPath.steps[i-1].categoryId, selectedPath.steps[i-1].subfieldId).includes(selectedPath.steps[i-1].levelId);

                        return (
                          <button
                            key={i}
                            disabled={isLocked}
                            onClick={() => {
                              setSelectedCategory(step.categoryId);
                              setSelectedSubfield(step.subfieldId);
                              setActiveLevel(step.levelId);
                            }}
                            className={cn(
                              "bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl flex items-center justify-between group transition-all text-left",
                              isLocked ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-accent/30"
                            )}
                          >
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-sm",
                                isCompleted ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"
                              )}>
                                {isCompleted ? <CheckCircle2 size={28} /> : i + 1}
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{step.title}</h4>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Մակարդակ {step.levelId}</p>
                              </div>
                            </div>
                            {!isLocked && !isCompleted && (
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <ChevronRight size={24} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                      <LearningModule 
                        categoryId={selectedCategory || ''}
                        categoryTitle={currentCategory?.title || ''}
                        subfieldId={selectedSubfield || ''}
                        subfieldTitle={currentSubfield?.title || ''}
                        levelId={activeLevel}
                        onComplete={handleNextLevel}
                        onExit={() => setActiveLevel(null)}
                        onEnterLab={(topic) => {
                          setLabTopic({ field: currentSubfield?.title || 'General', topic });
                          setActiveTab('lab');
                          setActiveLevel(null);
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PracticeLab 
                  initialField={labTopic?.field}
                  initialTopic={labTopic?.topic}
                  onClearInitial={() => setLabTopic(null)}
                />
              </motion.div>
            )}

            {activeTab === 'flashcards' && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Հիշողության քարտեր</h2>
                  <p className="text-slate-500 font-medium mt-2">Ամրապնդիր քո գիտելիքները արագ հարցերի միջոցով:</p>
                </div>
                <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
                  <FlashcardSystem 
                    cards={profile?.flashcards || []}
                    onAddCard={handleAddFlashcard}
                    onDeleteCard={handleDeleteFlashcard}
                    onUpdateSRS={updateFlashcardSRS}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'module' && (
              <ModulePage onBack={() => setActiveTab('dashboard')} />
            )}
          </AnimatePresence>
        </div>
      </main>

        {profile?.isDemoMode && (
          <div className="fixed bottom-6 left-6 z-[60]">
            <motion.div 
               initial={{ x: -100, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/40 flex items-center gap-3 border-2 border-white/20 backdrop-blur-md"
            >
               <RefreshCcw size={16} className="animate-spin-slow" />
               School Demo Mode Active
            </motion.div>
          </div>
        )}

        <AIMentor 
          userName={profile?.name || ''} 
          isOpen={isMentorOpen} 
          onClose={() => setIsMentorOpen(false)} 
        />

      <AnimatePresence>
        {lastVoiceCommand && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-50 bg-slate-900/80 backdrop-blur-md text-white px-8 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4 min-w-[300px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center animate-pulse shadow-lg shadow-accent/20">
              <Mic size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Ձայնային հրահանգ</p>
              <p className="text-sm font-bold italic tracking-tight text-white/90">«{lastVoiceCommand}»</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <AnimatePresence>
        {certificateData && (
          <CertificateGenerator
            profile={profile!}
            courseName={certificateData.courseName}
            levelName={certificateData.levelName}
            completionDate={certificateData.date}
            onClose={() => setCertificateData(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="w-72 h-full bg-white p-8 space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <Logo size="sm" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X /></button>
              </div>
              <nav className="space-y-4">
                <MobileNavItem 
                  active={activeTab === 'dashboard'} 
                  onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                  icon={<LayoutDashboard />}
                  label="Գլխավոր"
                />
                <MobileNavItem 
                  active={activeTab === 'learn'} 
                  onClick={() => { setActiveTab('learn'); setIsMobileMenuOpen(false); }}
                  icon={<BookOpen />}
                  label="Դասընթացներ"
                />
                <MobileNavItem 
                  active={activeTab === 'paths'} 
                  onClick={() => { setActiveTab('paths'); setSelectedPath(null); setIsMobileMenuOpen(false); }}
                  icon={<Map />}
                  label="Ուղիներ"
                />
                <MobileNavItem 
                  active={activeTab === 'flashcards'} 
                  onClick={() => { setActiveTab('flashcards'); setIsMobileMenuOpen(false); }}
                  icon={<BrainCircuit />}
                  label="Քարտեր"
                />
                <MobileNavItem 
                  active={activeTab === 'games'} 
                  onClick={() => { setActiveTab('games'); setIsMobileMenuOpen(false); }}
                  icon={<Gamepad2 />}
                  label="Խաղեր"
                />
                <MobileNavItem 
                  active={activeTab === 'goals'} 
                  onClick={() => { setActiveTab('goals'); setIsMobileMenuOpen(false); }}
                  icon={<Target />}
                  label="Նպատակներ"
                />
                <MobileNavItem 
                  active={activeTab === 'module'} 
                  onClick={() => { setActiveTab('module'); setIsMobileMenuOpen(false); }}
                  icon={<BookOpen />}
                  label="Open Module"
                />
                <MobileNavItem 
                  active={activeTab === 'creator'} 
                  onClick={() => { setActiveTab('creator'); setIsMobileMenuOpen(false); }}
                  icon={<Wand2 />}
                  label="Ստեղծել Խաղ"
                />
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Discovery Overlay */}
      <AnimatePresence>
        {profile && !profile.discovery && (
          <GoalDiscovery onComplete={completeDiscovery} />
        )}
      </AnimatePresence>
      </div>
  );
}

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-6 py-5 rounded-[1.5rem] font-black transition-all relative group",
      active 
        ? "bg-primary/5 text-primary shadow-sm border border-primary/10" 
        : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    {active && (
      <motion.div 
        layoutId="nav-active"
        className="absolute left-0 w-1.5 h-8 bg-gradient-brand rounded-r-full"
      />
    )}
    <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>
      {icon}
    </span>
    <span className="tracking-tight">{label}</span>
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 p-5 rounded-[1.5rem] font-black transition-all",
      active ? "bg-gradient-brand text-white shadow-xl shadow-primary/20" : "text-slate-500 hover:bg-slate-50"
    )}
  >
    <span className={cn("transition-transform duration-300", active ? "scale-110" : "")}>
      {icon}
    </span>
    <span className="tracking-tight">{label}</span>
  </button>
);

const Onboarding = ({ onComplete, user, onLogout }: { onComplete: (data: { name: string, school?: string, role: 'admin' | 'teacher' | 'student' }) => void, user: any, onLogout: () => void }) => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Մուտքը հաջողվեց Google-ի միջոցով:");
    } catch (e) {
      toast.error("Google-ով մուտքի սխալ:");
    }
  };

  const handleEmailAuth = async () => {
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
        toast.success("Գրանցումը հաջողվեց:");
      } else {
        await loginWithEmail(email, password);
        toast.success("Մուտքը հաջողվեց:");
      }
    } catch (e: any) {
      toast.error(e.message || "Մուտքի սխալ:");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute w-[600px] h-[600px] bg-accent/20 blur-[120px] rounded-full -top-48 -left-48" />
      <div className="absolute w-[500px] h-[500px] bg-secondary/20 blur-[100px] rounded-full -bottom-48 -right-48" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3.5rem] p-12 space-y-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" className="mb-2" />
          <p className="text-slate-500 font-medium text-center">Բարի գալուստ ապագայի կրթական հարթակ:</p>
        </div>
        
        {!user && !showEmailLogin ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Ի՞նչպես դիմենք քեզ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Մուտքագրեք ձեր անունը"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm focus:shadow-xl focus:shadow-accent/10"
              />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Դպրոց / Հաստատություն (ըստ ցանկության)"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm focus:shadow-xl focus:shadow-accent/10"
              />
              
              <div className="space-y-3">
                <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Դեր</label>
                <div className="grid grid-cols-3 gap-3">
                   {(['student', 'teacher', 'admin'] as const).map(r => (
                     <button
                       key={r}
                       onClick={() => setSelectedRole(r)}
                       className={cn(
                         "py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all",
                         selectedRole === r 
                           ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                           : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                       )}
                     >
                       {r === 'admin' ? 'Ադմին' : r === 'teacher' ? 'Ուսուցիչ' : 'Աշակերտ'}
                     </button>
                   ))}
                </div>
              </div>

              <button
                onClick={() => name.trim() && onComplete({ name, school, role: selectedRole })}
                disabled={!name.trim()}
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                Շարունակել առանց մուտքի
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Կամ</span></div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-50 transition-all shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Մուտք Google-ով
              </button>
              <button
                onClick={() => setShowEmailLogin(true)}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-700 py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-50 transition-all shadow-sm"
              >
                <Mail size={24} />
                Մուտք Էլ. փոստով
              </button>
            </div>
          </div>
        ) : !user && showEmailLogin ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Էլ. փոստ"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent outline-none transition-all font-bold"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Գաղտնաբառ"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent outline-none transition-all font-bold"
              />
            </div>
            <button
              onClick={handleEmailAuth}
              className="w-full bg-gradient-brand text-white py-5 rounded-[1.5rem] font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20"
            >
              {isRegistering ? 'Գրանցվել' : 'Մուտք գործել'}
            </button>
            <div className="flex justify-between text-sm font-bold">
              <button onClick={() => setIsRegistering(!isRegistering)} className="text-accent hover:underline">
                {isRegistering ? 'Արդեն ունե՞ք հաշիվ: Մուտք' : 'Չունե՞ք հաշիվ: Գրանցվել'}
              </button>
              <button onClick={() => setShowEmailLogin(false)} className="text-slate-400 hover:underline">Հետ</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Լրացրեք ձեր անունը</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Մուտքագրեք ձեր անունը"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm focus:shadow-xl focus:shadow-accent/10"
              />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Դպրոց / Հաստատություն (ըստ ցանկության)"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-accent focus:bg-white outline-none transition-all text-xl font-bold shadow-sm focus:shadow-xl focus:shadow-accent/10"
              />

              <div className="space-y-3">
                <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Դեր</label>
                <div className="grid grid-cols-3 gap-3">
                   {(['student', 'teacher', 'admin'] as const).map(r => (
                     <button
                       key={r}
                       onClick={() => setSelectedRole(r)}
                       className={cn(
                         "py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all",
                         selectedRole === r 
                           ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                           : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                       )}
                     >
                       {r === 'admin' ? 'Ադմին' : r === 'teacher' ? 'Ուսուցիչ' : 'Աշակերտ'}
                     </button>
                   ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => name.trim() && onComplete({ name, school, role: selectedRole })}
              disabled={!name.trim()}
              className="w-full bg-gradient-brand text-white py-6 rounded-[1.5rem] font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 glow-cyan-hover"
            >
              Պահպանել և Սկսել
            </button>
            <button onClick={onLogout} className="w-full text-slate-400 font-bold hover:underline">Դուրս գալ</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
