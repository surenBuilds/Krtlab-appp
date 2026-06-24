import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Lightbulb, 
  Brain, 
  Target, 
  Award,
  MessageSquare,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  RotateCcw,
  ArrowRight,
  Loader2,
  Clock,
  Volume2,
  Pause,
  Rocket,
  UserCircle,
  Sparkles,
  History,
  FlaskConical
} from 'lucide-react';
import { Level, QuizQuestion, ProgressAnalysis, LessonProgression, OptimizationAudit } from '../types';
import { CATEGORIES } from '../data/categories';
import { analyzeProgress, generateProgressionFeedback, extractTermsFromLesson, generatePracticeLabTask } from '../services/geminiService';
import { runOptimizationEngine } from '../services/optimizationService';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { ExerciseTimer } from './ExerciseTimer';
import { QuizMentor } from './QuizMentor';
import { VoiceTutor } from './VoiceTutor';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLessons } from '../hooks/LessonContext';
import { InteractiveSim } from './InteractiveSim';
import { CommunitySection } from './CommunitySection';
import { PracticalScenarioView } from './PracticalScenarioView';
import { InteractiveLab } from './InteractiveLab';
import { PracticeLabTask } from '../types';

const LessonSkeleton = () => (
  <div className="flex flex-col items-center justify-center h-96 gap-8 max-w-4xl mx-auto">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Brain size={32} className="text-accent animate-pulse" />
      </div>
    </div>
    <p className="text-slate-500 font-black animate-pulse tracking-tight text-xl">Դասը պատրաստվում է...</p>
  </div>
);

interface LearningModuleProps {
  categoryId: string;
  categoryTitle: string;
  subfieldId: string;
  subfieldTitle: string;
  levelId: number;
  onComplete: () => void;
  onExit: () => void;
  onEnterLab?: (topic: string) => void;
}

export const LearningModule: React.FC<LearningModuleProps> = ({
  categoryId,
  categoryTitle,
  subfieldId,
  subfieldTitle,
  levelId,
  onComplete,
  onExit,
  onEnterLab,
}) => {
  const { lessons, fetchLesson } = useLessons();
  const lessonId = `${subfieldId}_${levelId}`;
  const lessonState = lessons[lessonId];
  const hasFetched = useRef(false);
  
  const [step, setStep] = useState<'theory' | 'lab' | 'quiz' | 'task' | 'practice' | 'result' | 'completed'>('theory');
  const [quizScore, setQuizScore] = useState<number>(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [masteryScore, setMasteryScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [practiceSubmission, setPracticeSubmission] = useState(false);
  const [isPracticeSubmitting, setIsPracticeSubmitting] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  const [progression, setProgression] = useState<LessonProgression | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isStartingPractice, setIsStartingPractice] = useState(false);
  const [isReadingDetailed, setIsReadingDetailed] = useState(false);
  const [isDetailedPaused, setIsDetailedPaused] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [optimization, setOptimization] = useState<OptimizationAudit | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [generatedPractice, setGeneratedPractice] = useState<PracticeLabTask | null>(null);
  const [isLoadingPractice, setIsLoadingPractice] = useState(false);
  
  const [isFinishing, setIsFinishing] = useState(false);
  const { profile, updateProgress, updateAdaptiveProgress, addFlashcards, updateXp, syncNow } = useUserProfile();

  const handleNextLesson = useCallback(async () => {
    window.speechSynthesis.cancel();
    setIsFinishing(true);
    try {
      // Ensure the entire level is marked as complete
      updateProgress(categoryId, subfieldId, levelId, 100, 'complete');
      
      // Ensure latest progress is synced
      await syncNow();
      onComplete();
    } catch (error) {
      console.error("Failed to save progress:", error);
      toast.error("Չհաջողվեց պահպանել առաջընթացը: Խնդրում ենք փորձել նորից:");
    } finally {
      setIsFinishing(false);
    }
  }, [categoryId, subfieldId, levelId, onComplete, syncNow, updateProgress]);

  const level = lessonState?.content;

  // Calculate topic progression for UI
  const currentCategory = CATEGORIES.find(c => c.id === categoryId);
  const currentSubfield = currentCategory?.subfields.find(s => s.id === subfieldId);
  const totalTopics = currentSubfield?.courseTopics?.length || 20;
  const currentTopicName = currentSubfield?.courseTopics?.[levelId - 1] || level?.title || `Level ${levelId}`;

  const toggleDetailedSpeech = useCallback(() => {
    if (isReadingDetailed && !isDetailedPaused) {
      window.speechSynthesis.pause();
      setIsDetailedPaused(true);
    } else if (isDetailedPaused) {
      window.speechSynthesis.resume();
      setIsDetailedPaused(false);
    } else {
      window.speechSynthesis.cancel();
      if (!level?.detailedExplanation) return;
      
      const utterance = new SpeechSynthesisUtterance(level.detailedExplanation);
      utterance.lang = 'hy-AM';
      utterance.rate = 0.9;
      
      utterance.onstart = () => {
        setIsReadingDetailed(true);
        setIsDetailedPaused(false);
      };
      utterance.onend = () => {
        setIsReadingDetailed(false);
        setIsDetailedPaused(false);
      };
      utterance.onerror = () => {
        setIsReadingDetailed(false);
        setIsDetailedPaused(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, [level?.detailedExplanation, isReadingDetailed, isDetailedPaused]);

  useEffect(() => {
    // 🔥 STRICT ONE-TIME FETCH (Requirement 4)
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchLesson(categoryId, subfieldId, levelId);
    
    // DEBUG CHECK (Requirement 8)
    const completedTopicsCount = profile?.progress.categories[categoryId]?.subfields[subfieldId]?.completedLessons.length || 0;
    console.log("Current topic:", currentTopicName);
    console.log("Completed topics count:", completedTopicsCount);
  }, [categoryId, subfieldId, levelId, fetchLesson, currentTopicName, profile, categoryId]);

  // Extract terms once lesson is loaded and locked
  useEffect(() => {
    if (lessonState?.content && lessonState.isLocked) {
      const timer = setTimeout(() => {
        extractTermsFromLesson(lessonState.content!.detailedExplanation).then(terms => {
          if (terms && terms.length > 0) {
            addFlashcards(terms);
          }
        }).catch(err => console.error("Failed to extract terms:", err));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lessonState?.content, lessonState?.isLocked, addFlashcards]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (step !== 'theory') {
      window.speechSynthesis.cancel();
      setIsReadingDetailed(false);
      setIsDetailedPaused(false);
    }
  }, [step]);

  const ensureScenario = useCallback((task: any) => {
    if (task?.scenario && task.scenario.length > 20) return task.scenario;
    
    // Auto-generator fallback based on current lesson
    const baseScenario = `${subfieldTitle} թեմայի շրջանակներում ձեզ հանձնարարված է կատարել գործնական աշխատանք:`;
    const context = `Որպես ${categoryTitle} մասնագետ, ձեր նպատակն է կիրառել ${level?.title || 'այս դասի'} հիմնական սկզբունքները իրական իրավիճակում:`;
    const taskDetails = `Վերլուծեք իրավիճակը և առաջարկեք լուծումներ՝ հիմնվելով ձեր ստացած գիտելիքների վրա:`;
    
    return `${baseScenario} ${context} ${taskDetails}`;
  }, [subfieldTitle, categoryTitle, level?.title]);

  const handleStartPractice = useCallback(async () => {
    console.log("Start Practice Clicked. Current step:", step);
    setIsStartingPractice(true);
    
    try {
      // 1. Minimum delay for smooth transition and UI feedback
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // 2. Data Integrity Check & Fallback Generation
      if (!level?.practicalTask && !level?.game) {
        console.log("Missing practice data. Generating AI-powered task...");
        setIsLoadingPractice(true);
        const task = await generatePracticeLabTask(
          categoryTitle,
          subfieldId,
          subfieldTitle,
          levelId,
          level?.title || subfieldTitle
        );
        if (task) {
          setGeneratedPractice(task);
          setStep('practice');
        } else {
          toast.error("Չհաջողվեց ստեղծել գործնական առաջադրանքը:");
          setStep('result');
        }
        setIsLoadingPractice(false);
        return;
      }

      // If we have practicalTask, go to 'task' step first (Mission briefing)
      // If we only have 'game', go straight to 'practice'
      if (level?.practicalTask) {
        setStep('task');
      } else {
        setStep('practice');
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error starting practice:", error);
      toast.error("Գործնական առաջադրանքը բացելիս խնդիր առաջացավ:");
      setStep('result');
    } finally {
      setIsStartingPractice(false);
    }
  }, [level, categoryTitle, subfieldId, subfieldTitle, levelId, step, categoryId]);

  const handleQuizSubmit = useCallback(async (answers: number[] = []) => {
    if (!level) return;
    const safeAnswers = Array.isArray(answers) ? answers : [];
    setQuizAnswers(safeAnswers);
    
    // Analyze progress
    setAnalyzing(true);
    const questionsToUse = (shuffledQuestions.length > 0 ? shuffledQuestions : level.quiz) || [];
    const correctCount = safeAnswers.filter((ans, i) => ans === questionsToUse[i]?.correctAnswer).length;
    const score = questionsToUse.length > 0 ? Math.round((correctCount / questionsToUse.length) * 100) : 0;
    setQuizScore(score);
    const earnedXp = score * 2;
    setTotalXpEarned(prev => prev + earnedXp); 
    updateXp(earnedXp);

    // Part 4: Track Step Progress - QUIZ
    updateProgress(categoryId, subfieldId, levelId, score, 'quiz');

    const mistakes = questionsToUse
      .filter((q, i) => safeAnswers[i] !== q.correctAnswer)
      .map(q => q.question);

    const result = await analyzeProgress(`${subfieldId}_${levelId}`, score, mistakes, questionsAsked);
    if (result) {
      setAnalysis(result);
      updateAdaptiveProgress(`${subfieldId}_${levelId}`, result);
    }

    // Generate progression feedback
    if (profile) {
      try {
        const prog = await generateProgressionFeedback({
          userId: profile.name,
          userName: profile.name,
          lessonId: `${subfieldId}_${levelId}`,
          lessonCompleted: score >= (level.requiredScore || 80),
          quizScore: score,
          timeSpent: "5:00",
          mistakes: mistakes,
          currentLevel: levelId,
          maxLevel: 20
        });
        setProgression(prog);
        
        // Try to auto-play feedback audio
        if (prog.audioUrl) {
          const audio = new Audio(prog.audioUrl);
          audio.play().catch(e => {
            console.warn("Autoplay blocked or failed:", e);
          });
        }
      } catch (e) {
        console.error("Failed to generate progression feedback:", e);
      }
    }

    // Optimization Engine Trigger
    setQuizAttempts(prev => prev + 1);
    if (score < 80 && quizAttempts >= 1 && !optimization) {
      setIsOptimizing(true);
      try {
        const opt = await runOptimizationEngine(level, {
          quizScore: score,
          completionTime: 300, 
          failureRate: 100,
          dropOffPoint: 'quiz'
        });
        if (opt) {
          setOptimization(opt);
          // Auto-apply improved data to lessons context
          // Note: In a real app we might patch the lesson state
        }
      } catch (e) {
        console.error("Optimization failed:", e);
      } finally {
        setIsOptimizing(false);
      }
    }

    setAnalyzing(false);
    
    // Requirements: Automatically open practice if successful
    if (score >= (level.requiredScore || 80)) {
      toast.success("Թեստը հաջողությամբ հանձնված է: Անցնում ենք պրակտիկային:");
      setTimeout(() => {
        handleStartPractice();
      }, 1500);
    }
    
    setStep('result');
  }, [level, subfieldId, levelId, questionsAsked, profile, updateProgress, updateAdaptiveProgress, shuffledQuestions, categoryId, quizAttempts, optimization, handleStartPractice]);

  const handleLabComplete = (points: number) => {
    console.log("Lab complete with points:", points);
    // You could update total points/XP here if needed
    setStep('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaskComplete = () => {
    // Mark task as completed
    updateProgress(categoryId, subfieldId, levelId, 100, 'practice');
    setStep('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScenarioComplete = async (earnedXp: number) => {
    console.log("Scenario complete with XP:", earnedXp);
    setIsPracticeSubmitting(true);
    
    try {
      // Small delay for saving effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update progress marking game as done
      updateProgress(categoryId, subfieldId, levelId, 100, 'game');
      
      setPracticeSubmission(true);
      setIsPracticeSubmitting(false);
      setTotalXpEarned(prev => prev + earnedXp);
      updateXp(earnedXp);
      
      // Calculate Mastery Score (Average of Quiz and Practice)
      const mastery = Math.round((quizScore + 100) / 2);
      setMasteryScore(mastery);

      toast.success(`Գործնական սցենարն ավարտված է! +${earnedXp} XP`);

      // Transition to lesson completed view
      setStep('completed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Scenario submission failed:", error);
      setIsPracticeSubmitting(false);
      toast.error("Խնդիր առաջացավ պահպանելիս:");
    }
  };

  const handleGamesComplete = (totalGameScore: number) => {
    console.log("Games complete with score:", totalGameScore);
    
    // Part 4: Track Step Progress - GAME (Final step)
    updateProgress(categoryId, subfieldId, levelId, totalGameScore, 'game');
    
    // Mastery for games - same logic as scenario
    const mastery = Math.round((quizScore + totalGameScore) / 2);
    setMasteryScore(mastery);
    
    toast.success("Դասն ամբողջությամբ ավարտված է:");
    setStep('completed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeLabComplete = (points: number) => {
    handleScenarioComplete(points);
  };

  const handleRetry = useCallback(() => {
    setAnalyzing(false);
    setAnalysis(null);
    setProgression(null);
    setQuizAnswers([]);
    setStep('theory');
    setQuestionsAsked(0);
    // Shuffle again on retry
    if (level?.quiz) {
      setShuffledQuestions([...level.quiz].sort(() => Math.random() - 0.5));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [level?.quiz]);

  useEffect(() => {
    if (level?.quiz && shuffledQuestions.length === 0) {
      setShuffledQuestions([...level.quiz].sort(() => Math.random() - 0.5));
    }
  }, [level?.quiz, shuffledQuestions.length]);

  if (!lessonState || lessonState.isLoading) {
    return <LessonSkeleton />;
  }

  if (lessonState.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 shadow-sm border border-red-100">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Խնդիր առաջացավ</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {lessonState.error}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              hasFetched.current = false;
              fetchLesson(categoryId, subfieldId, levelId, true);
            }}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95"
          >
            <RefreshCw size={20} />
            Փորձել նորից
          </button>
          <button
            onClick={onExit}
            className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-sm"
          >
            Դուրս գալ
          </button>
        </div>
      </div>
    );
  }

  if (!level) return null;

  const handleFinalComplete = () => {
    // This is now handled in handleQuizSubmit
    setStep('result');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 p-8 lg:p-12">
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{currentTopicName}</h2>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs mt-2">
            Դաս {levelId} / {totalTopics} • {subfieldTitle}
          </p>
        </div>
        <div className="flex gap-3">
          {['theory', 'lab', 'quiz', 'task', 'practice', 'completed'].map((s, i) => (
            <div
              key={s}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-500",
                step === s ? "bg-accent shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-125" : 
                (i < ['theory', 'lab', 'quiz', 'task', 'practice', 'completed'].indexOf(step) ? "bg-emerald-400" : "bg-slate-200")
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'theory' && (
          <motion.div
            key="theory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="prose prose-slate max-w-none">
              <div className="mb-12 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Ներածություն</h4>
                <p className="text-2xl text-slate-700 font-medium leading-relaxed italic">
                  {level.introduction}
                </p>
              </div>

              <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative group/explanation">
                <div className="absolute top-8 right-8 flex gap-2">
                  <button
                    onClick={toggleDetailedSpeech}
                    className={cn(
                      "p-4 rounded-2xl transition-all duration-300 flex items-center gap-2 font-black text-sm uppercase tracking-widest",
                      isReadingDetailed 
                        ? "bg-accent text-white shadow-lg shadow-accent/30 scale-105" 
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    )}
                    title={isReadingDetailed ? "Դադարեցնել" : "Լսել բացատրությունը"}
                  >
                    {isReadingDetailed && !isDetailedPaused ? <Pause size={20} /> : <Volume2 size={20} />}
                    <span className="hidden sm:inline">
                      {isReadingDetailed ? (isDetailedPaused ? "Շարունակել" : "Դադար") : "Լսել"}
                    </span>
                  </button>
                </div>
                <div className="leading-relaxed text-2xl text-slate-700 font-medium whitespace-pre-wrap pt-4">
                  {level.detailedExplanation}
                </div>
              </div>

              {level.examples && level.examples.length > 0 && (
                <div className="bg-blue-50 p-12 rounded-[3rem] border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8 text-blue-800 font-black text-xl tracking-tight">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <Lightbulb size={28} />
                    </div>
                    <span>Գործնական օրինակներ</span>
                  </div>
                  <div className="space-y-6">
                    {level.examples.map((example, i) => (
                      <div key={i} className="bg-white/60 p-8 rounded-2xl border border-blue-200/50 shadow-sm text-blue-900 text-xl leading-relaxed font-medium">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {level.exercises && level.exercises.length > 0 && (
                <div className="bg-purple-50 p-12 rounded-[3rem] border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8 text-purple-800 font-black text-xl tracking-tight">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <Brain size={28} />
                    </div>
                    <span>Ինքնաստուգման վարժություններ</span>
                  </div>
                  <div className="space-y-6">
                    {level.exercises.map((exercise, i) => (
                      <div key={i} className="bg-white/60 p-8 rounded-2xl border border-purple-200/50 shadow-sm text-purple-900 text-xl leading-relaxed font-medium">
                        {exercise}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-12">
                {level.keyConcepts && level.keyConcepts.length > 0 && (
                  <div className="bg-gradient-brand p-12 rounded-[3rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[100px] rounded-full -mr-40 -mt-40 group-hover:bg-accent/30 transition-all duration-700" />
                    <h3 className="text-3xl font-black mb-10 flex items-center gap-4 relative tracking-tight">
                      <Target size={32} className="text-accent" />
                      Հիմնական հասկացություններ
                    </h3>
                    <div className="grid gap-4 relative">
                      {level.keyConcepts.map((concept, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:bg-white/15 transition-all flex items-center gap-4">
                          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent font-black text-sm">
                            {i + 1}
                          </div>
                          <div className="text-xl text-white font-medium">{concept}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 p-10 rounded-[3rem] border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8 text-amber-800 font-black text-xl tracking-tight">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <Lightbulb size={28} />
                    </div>
                    <span>Ամփոփում</span>
                  </div>
                  <div className="bg-white/60 p-8 rounded-2xl border border-amber-200/50 shadow-sm text-amber-900 text-lg leading-relaxed font-medium italic">
                    {level.miniSummary}
                  </div>
                </div>

                {level.recommendedReading && level.recommendedReading.length > 0 && (
                  <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8 text-emerald-800 font-black text-xl tracking-tight">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                        <Award size={28} />
                      </div>
                      <span>Առաջարկվող գրականություն</span>
                    </div>
                    <div className="space-y-4">
                      {level.recommendedReading.map((book, i) => (
                        <div key={i} className="bg-white/60 p-6 rounded-2xl border border-emerald-200/50 shadow-sm">
                          <div className="font-black text-emerald-900 text-lg">{book.title}</div>
                          <div className="text-emerald-700 text-sm font-bold mb-2">{book.author}</div>
                          <div className="text-emerald-800/70 text-sm italic">{book.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <VoiceTutor 
                    lessonId={`${subfieldId}_${levelId}`} 
                    lessonText={level.detailedExplanation} 
                  />
                </div>
              </div>
            </div>

            {level.miniSummary && (
              <div className="bg-secondary/5 p-10 rounded-[3rem] border border-secondary/10 shadow-sm">
                <div className="flex items-center gap-4 mb-8 text-secondary font-black text-xl tracking-tight">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center shadow-sm">
                    <MessageSquare size={28} />
                  </div>
                  <span>Ամփոփում</span>
                </div>
                <div className="space-y-5 text-slate-700 text-lg font-bold italic leading-relaxed whitespace-pre-wrap">
                  {level.miniSummary}
                </div>
              </div>
            )}

            <CommunitySection lessonId={`${subfieldId}_${levelId}`} profile={profile!} />

            <div className="flex items-center justify-between gap-8">
              <button
                onClick={() => setIsTimedMode(!isTimedMode)}
                className={cn(
                  "flex items-center gap-4 px-10 py-6 rounded-2xl font-black transition-all border-2 text-lg",
                  isTimedMode 
                    ? "bg-accent border-accent text-white shadow-2xl shadow-accent/20" 
                    : "bg-white border-slate-100 text-slate-500 hover:border-accent/30 hover:bg-accent/5"
                )}
              >
                <Clock size={28} />
                <span>Ժամանակով</span>
              </button>
              <button
                onClick={() => {
                  updateProgress(categoryId, subfieldId, levelId, 100, 'lesson');
                  if (level.interactiveExercises && level.interactiveExercises.length > 0) {
                    setStep('lab');
                  } else {
                    setStep('quiz');
                  }
                }}
                className="flex-1 bg-gradient-brand text-white py-6 rounded-2xl font-black text-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 glow-cyan-hover uppercase tracking-widest"
              >
                {level.interactiveExercises && level.interactiveExercises.length > 0 ? "Անցնել Լաբորատորիային" : "Անցնել Թեստին"} 
                <ChevronRight size={28} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'lab' && level.interactiveExercises && (
          <InteractiveLab 
            exercises={level.interactiveExercises} 
            onComplete={handleLabComplete} 
          />
        )}

        {step === 'quiz' && (
          <QuizView 
            questions={shuffledQuestions.length > 0 ? shuffledQuestions : level.quiz} 
            isTimedMode={isTimedMode}
            onComplete={handleQuizSubmit} 
          />
        )}

        {step === 'task' && level?.practicalTask && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="bg-white rounded-3xl p-8 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <Target size={32} className="text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{level.practicalTask.title}</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Գործնական Առաջադրանք</p>
              </div>
            </div>

            <div className="space-y-8">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <History size={14} /> Context
                  </h3>
                  <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <p className="text-slate-600 font-bold text-sm leading-relaxed">
                      {level.practicalTask.context}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <UserCircle size={14} /> Your Role
                  </h3>
                  <div className="p-5 bg-accent/5 rounded-2xl border-2 border-accent/10">
                    <p className="text-accent font-black text-sm uppercase tracking-tight">
                      {level.practicalTask.role}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  Իրավիճակ (Scenario)
                </h3>
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                  <p className="text-slate-700 leading-relaxed font-medium italic">
                    "{level.practicalTask.scenario}"
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  Mission
                </h3>
                <div className="p-6 bg-slate-900 text-white rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(30,41,59,0.2)]">
                  <p className="text-white/90 leading-relaxed font-black">
                    {level.practicalTask.mission}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  Սահմանափակումներ & Պահանջներ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {level.practicalTask.constraints.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 p-4 bg-slate-50 rounded-xl border-2 border-slate-100">
                      <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {i+1}
                      </div>
                      <span className="text-slate-600 font-bold text-sm">{c}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  Steps to Complete (Քայլեր)
                </h3>
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 space-y-4 shadow-sm">
                  <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                    {level.practicalTask.instructions}
                  </p>
                </div>
              </section>

              {level.practicalTask.bonusChallenge && (
                <section className="bg-amber-100/50 p-6 rounded-2xl border-2 border-dashed border-amber-200">
                  <h4 className="text-amber-900 font-black mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
                    <Award size={14} /> Bonus Challenge
                  </h4>
                  <p className="text-amber-800 font-bold italic">{level.practicalTask.bonusChallenge}</p>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                  <h4 className="text-emerald-900 font-black mb-2 uppercase text-xs tracking-widest">Expected Output</h4>
                  <p className="text-emerald-800 font-bold">{level.practicalTask.deliverable}</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
                  <h4 className="text-blue-900 font-black mb-2 uppercase text-xs tracking-widest">Success Criteria</h4>
                  <p className="text-blue-800 font-bold">{level.practicalTask.evaluationCriteria}</p>
                </div>
              </div>

              <div className="pt-8 flex justify-center">
                <button
                  onClick={handleTaskComplete}
                  className="group relative px-12 py-4 bg-accent text-white rounded-2xl font-black text-lg transition-all hover:-translate-y-1 hover:shadow-[0_8px_0_0_#9a3412] active:translate-y-1 active:shadow-none"
                >
                  <span className="flex items-center gap-2">
                    Անցնել Ինտերակտիվ Խաղին
                    <ChevronRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

        {step === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            {isLoadingPractice ? (
              <div className="flex flex-col items-center justify-center py-20 gap-8">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain size={32} className="text-accent animate-pulse" />
                  </div>
                </div>
                <p className="text-slate-500 font-black animate-pulse tracking-tight text-xl">Ստեղծում ենք անհատական պրակտիկա...</p>
              </div>
            ) : level?.game || generatedPractice ? (
              <>
                <div className="text-center space-y-4">
                  <span className="bg-primary/10 text-primary px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                    Քայլ 3: Գործնական Կիրառում
                  </span>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight">Իրական Սցենար</h2>
                  <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                    Կիրառեք ձեր ձեռք բերած գիտելիքները իրական իրավիճակում: Ձեր յուրաքանչյուր որոշումը կարևոր է:
                  </p>
                </div>

                {level?.game ? (
                  <PracticalScenarioView 
                    data={level.game} 
                    onComplete={handleScenarioComplete} 
                  />
                ) : generatedPractice ? (
                  <PracticeLabViewer 
                    task={generatedPractice}
                    onComplete={handlePracticeLabComplete}
                  />
                ) : null}
              </>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">Գործնական առաջադրանքը բացակայում է:</p>
                <button 
                  onClick={() => setStep('result')}
                  className="mt-6 text-primary font-black uppercase tracking-widest text-sm"
                >
                  Վերադառնալ
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12 space-y-12"
          >
            <div className="space-y-8">
              <div className={cn(
                "w-32 h-32 rounded-[3rem] flex items-center justify-center mx-auto animate-bounce shadow-2xl",
                quizScore === 100 ? "bg-emerald-500 text-white shadow-emerald-200/50" : "bg-amber-500 text-white shadow-amber-200/50"
              )}>
                {quizScore === 100 ? <Award size={64} /> : <Target size={64} />}
              </div>
              
              <div className="space-y-4">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
                  {quizScore === 100 ? "Հրաշալի է!" : "Լավ փորձ էր"}
                </h2>
                <div className="inline-flex items-center gap-4 bg-slate-50 px-8 py-4 rounded-full border border-slate-100 shadow-inner">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Քո արդյունքը՝</span>
                  <span className={cn(
                    "text-4xl font-black",
                    quizScore === 100 ? "text-emerald-500" : "text-amber-500"
                  )}>{quizScore}%</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500 font-black">100%</span>
                </div>
              </div>

              <p className="text-2xl text-slate-600 font-medium max-w-2xl mx-auto">
                {quizScore >= (level?.requiredScore || 80) 
                  ? "Դուք հաջողությամբ տիրապետեցիք տեսական մասին: Այժմ ժամանակն է կիրառել գիտելիքները գործնականում:"
                  : `Թեստը հաջողությամբ հանձնելու համար անհրաժեշտ է առնվազն ${(level?.requiredScore || 80)}% արդյունք: Խնդրում ենք կրկին ուսումնասիրել դասը և փորձել նորից:`}
              </p>
            </div>

            {analyzing || isOptimizing ? (
              <div className={cn(
                "p-16 rounded-[4rem] border-4 border-dashed flex flex-col items-center gap-10 shadow-2xl max-w-2xl mx-auto transition-colors duration-500",
                isOptimizing ? "bg-slate-900 border-accent animate-pulse" : "bg-accent/5 border-accent/20"
              )}>
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-accent/20 border-t-accent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain size={40} className="text-accent animate-pulse" />
                  </div>
                  {isOptimizing && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-4 -right-4 bg-accent p-3 rounded-2xl shadow-lg border-2 border-white/20"
                    >
                      <Sparkles size={20} className="text-white" />
                    </motion.div>
                  )}
                </div>
                <div className="text-center space-y-4">
                  <h3 className={cn(
                    "text-3xl font-black tracking-tight",
                    isOptimizing ? "text-white" : "text-slate-900"
                  )}>
                    {isOptimizing ? "Self-Improvement Engine" : "ԱԲ Վերլուծություն"}
                  </h3>
                  <p className={cn(
                    "text-xl font-medium",
                    isOptimizing ? "text-accent" : "text-slate-500"
                  )}>
                    {isOptimizing 
                      ? "Համակարգը օպտիմալացնում է բովանդակությունը ձեր կարիքների համար..." 
                      : "Վերլուծում ենք ձեր պատասխանները և կազմում հաջորդ քայլերը..."}
                  </p>
                </div>
              </div>
            ) : (
                <div className="space-y-12">
                  {optimization && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900 p-12 rounded-[3.5rem] border-4 border-accent shadow-2xl max-w-2xl mx-auto text-left space-y-8 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 transform rotate-12 opacity-10">
                        <Sparkles size={120} className="text-accent" />
                      </div>
                      
                      <div className="flex items-center gap-5 relative text-white">
                        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                          <Sparkles size={32} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-xl tracking-tight leading-none">Self-Improvement Engine</h3>
                          <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">Ինքնակարգավորումն ակտիվ է</p>
                        </div>
                      </div>

                      <div className="space-y-6 relative">
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                          <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Issue Detected</h4>
                          <p className="text-white leading-relaxed font-bold italic">
                            "{optimization.issueDetected}"
                          </p>
                        </div>

                        <div className="p-8 bg-accent/10 rounded-[2rem] border border-accent/20">
                          <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Fix Applied</h4>
                          <p className="text-white font-medium leading-relaxed">
                            {optimization.fixApplied}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                            <Target size={12} /> Impact: {optimization.impact}
                          </div>
                          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                            <Brain size={12} /> Type: {optimization.type}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <button
                    onClick={handleRetry}
                    className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                  >
                    <RotateCcw size={28} />
                    {quizScore >= (level?.requiredScore || 80) ? "Կրկնել" : "Փորձել նորից"}
                  </button>

                  {quizScore >= (level?.requiredScore || 80) ? (
                    <button
                      onClick={practiceSubmission ? handleNextLesson : handleStartPractice}
                      disabled={isStartingPractice || isFinishing}
                      className={cn(
                        "flex-1 bg-gradient-brand text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest",
                        (isStartingPractice || isFinishing) ? "opacity-70 scale-95" : "hover:scale-[1.02]"
                      )}
                    >
                      {isStartingPractice || isFinishing ? (
                        <>
                          <Loader2 size={28} className="animate-spin" />
                          {isFinishing ? "Պահպանվում է..." : "Բացվում է..."}
                        </>
                      ) : (
                        <>
                          {practiceSubmission ? <CheckCircle2 size={28} /> : <Rocket size={28} />}
                          {practiceSubmission ? "Ավարտել Դասը" : "Սկսել Պրակտիկան"}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleRetry}
                      className="flex-1 bg-slate-900 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest"
                    >
                      Կրկնել դասը
                      <RotateCcw size={28} />
                    </button>
                  ) }
                </div>

                {progression && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-10 rounded-[3rem] border-2 text-left space-y-8 shadow-2xl max-w-2xl mx-auto",
                      progression.status === 'level-up' ? "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-emerald-200/50" :
                      progression.status === 'same-level' ? "bg-accent/5 border-accent/10 text-accent shadow-accent/10" :
                      "bg-amber-50 border-amber-100 text-amber-900 shadow-amber-200/50"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                        progression.status === 'level-up' ? "bg-emerald-200" :
                        progression.status === 'same-level' ? "bg-accent/20" : "bg-amber-200"
                      )}>
                        {progression.status === 'level-up' ? <Award size={28} /> : 
                         progression.status === 'same-level' ? <TrendingUp size={28} /> : <RefreshCw size={28} />}
                      </div>
                      <h3 className="font-black text-2xl tracking-tight">
                        {progression.status === 'level-up' ? 'Մակարդակի բարձրացում!' : 
                         progression.status === 'same-level' ? 'Լավ առաջընթաց' : 'Կրկնություն'}
                      </h3>
                    </div>
                    <p className="text-2xl leading-relaxed italic font-medium">
                      "{progression.messageText}"
                    </p>
                  </motion.div>
                )}

                {analysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto text-left space-y-10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm",
                          analysis.level === 'high' ? "bg-emerald-100 text-emerald-600" :
                          analysis.level === 'medium' ? "bg-accent/10 text-accent" : "bg-amber-100 text-amber-600"
                        )}>
                          {analysis.level === 'high' ? <TrendingUp size={32} /> : 
                           analysis.level === 'medium' ? <RefreshCw size={32} /> : <TrendingDown size={32} />}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-xl tracking-tight">ԱԲ Վերլուծություն</h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">
                            Ըմբռնման մակարդակ՝ {analysis.level === 'high' ? 'Բարձր' : analysis.level === 'medium' ? 'Միջին' : 'Ցածր'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                        <p className="text-slate-700 text-lg leading-relaxed italic font-medium">
                          "{analysis.recommendation}"
                        </p>
                      </div>

                      {analysis.weakPoints.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Թույլ կողմեր</h4>
                          <div className="flex flex-wrap gap-3">
                            {analysis.weakPoints.map((point, i) => (
                              <span key={i} className="px-5 py-2 bg-red-50 text-red-600 rounded-full text-xs font-black border border-red-100 shadow-sm">
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
        {step === 'completed' && (
          <motion.div
            key="completed"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12 space-y-12"
          >
            <div className="space-y-8">
              <div className="relative inline-block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-40 h-40 bg-emerald-500 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200"
                >
                  <Award size={80} className="text-white" />
                </motion.div>
                <div className="absolute -top-4 -right-4 bg-accent p-4 rounded-3xl shadow-xl border-4 border-white animate-bounce">
                  <Sparkles size={32} className="text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Դասն Ավարտված է:</h2>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="bg-emerald-50 px-8 py-4 rounded-full border border-emerald-100 shadow-inner flex items-center gap-3">
                    <span className="text-emerald-400 font-black uppercase tracking-widest text-xs">Տիրապետում՝</span>
                    <span className="text-4xl font-black text-emerald-600">{masteryScore}%</span>
                  </div>
                  {masteryScore === 100 && (
                    <motion.div
                      initial={{ rotate: -10, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      className="bg-amber-100 px-6 py-4 rounded-2xl border-2 border-amber-200 shadow-lg flex items-center gap-3"
                    >
                      <Award className="text-amber-600" size={24} />
                      <span className="text-amber-900 font-black text-sm uppercase tracking-tight">Mastery Badge Unlocked!</span>
                    </motion.div>
                  )}
                  <div className="bg-primary/10 px-8 py-4 rounded-full border border-primary/10 shadow-inner flex items-center gap-3">
                    <span className="text-primary font-black uppercase tracking-widest text-xs">Վաստակած XP՝</span>
                    <span className="text-4xl font-black text-primary">+{totalXpEarned}</span>
                  </div>
                </div>
              </div>

              <div className="max-w-2xl mx-auto p-10 bg-slate-50 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-primary to-accent" />
                <p className="text-2xl text-slate-700 font-medium leading-relaxed italic relative z-10">
                  {masteryScore >= 90 
                    ? "Դուք ցուցադրեցիք փայլուն արդյունքներ: Թեման ամբողջությամբ յուրացված է, և դուք պատրաստ եք հաջորդ մարտահրավերին:" 
                    : masteryScore >= 75 
                    ? "Լավ աշխատանք: Դուք ունեք ամուր գիտելիքներ այս թեմայից: Շարունակեք նույն ոգով:" 
                    : "Դուք հանձնեցիք դասը, սակայն որոշ հասկացություններ կարող են լրացուցիչ կրկնություն պահանջել: Պատրաստվե՛ք հաջորդ դասին:"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
              <button
                onClick={handleRetry}
                className="flex-1 bg-white border-4 border-slate-900 p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
              >
                <RotateCcw size={28} />
                Կրկնել
              </button>
              <button
                onClick={handleNextLesson}
                disabled={isFinishing}
                className="flex-[2] bg-slate-900 text-white p-6 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-[8px_8px_0px_0px_#0ea5e9] glow-cyan-hover group disabled:opacity-70 disabled:cursor-wait"
              >
                {isFinishing ? (
                  <>
                    <Loader2 size={32} className="animate-spin" />
                    <span>Պահպանվում է...</span>
                  </>
                ) : (
                  <>
                    <span>Ավարտել Դասը</span>
                    <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PracticeLabViewer = ({ task, onComplete }: { task: PracticeLabTask, onComplete: (points: number) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [points, setPoints] = useState(0);

  const currentStep = task.steps[currentIdx];

  const handleEvaluate = () => {
    if (!userAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);

    const expected = currentStep.expectedOutcome.toLowerCase();
    const isCorrect = userAnswer.toLowerCase().includes(expected) || userAnswer.length > (expected.length * 0.8);

    setTimeout(() => {
      setEvaluation({
        isCorrect,
        feedback: isCorrect 
          ? "Հիանալի է: Դուք ճիշտ որոշում կայացրեցիք:" 
          : `Մասնակի ճիշտ է։ Կարևոր էր հաշվի առնել հետևյալը՝ ${currentStep.expectedOutcome}`
      });
      setIsEvaluating(false);
      if (isCorrect) setPoints(prev => prev + 20);
    }, 1000);
  };

  const handleNext = () => {
    if (currentIdx < task.steps.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setUserAnswer('');
      setEvaluation(null);
    } else {
      onComplete(points + 40); // Base points for completion
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-black text-slate-900">{task.title}</h3>
        <span className="bg-slate-100 px-4 py-2 rounded-full text-xs font-black text-slate-500 uppercase">
          Քայլ {currentIdx + 1} / {task.steps.length}
        </span>
      </div>

      <div className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-100">
        <p className="text-xl text-slate-700 font-medium leading-relaxed italic">
          "{currentStep.description}"
        </p>
        <p className="mt-4 text-slate-900 font-black">
          {currentStep.question}
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Ձեր լուծումը / պատասխանը</label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={!!evaluation}
          placeholder="Մուտքագրեք ձեր որոշումը այստեղ..."
          className="w-full p-8 bg-white border-4 border-slate-900 rounded-[2rem] min-h-[200px] text-xl font-bold focus:shadow-[8px_8px_0px_0px_#0ea5e9] outline-none transition-all disabled:opacity-50"
        />
      </div>

      {evaluation ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-8 rounded-2xl border-2 flex flex-col gap-4 shadow-sm",
            evaluation.isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
          )}
        >
          <div className="flex items-center gap-4">
            {evaluation.isCorrect ? <CheckCircle2 size={24} /> : <Rocket size={24} />}
            <span className="font-black text-lg">{evaluation.feedback}</span>
          </div>
          <button
            onClick={handleNext}
            className="bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm self-end px-12"
          >
            {currentIdx < task.steps.length - 1 ? "Հաջորդ քայլը" : "Ավարտել Պրակտիկան"}
          </button>
        </motion.div>
      ) : (
        <button
          onClick={handleEvaluate}
          disabled={!userAnswer.trim() || isEvaluating}
          className="w-full bg-accent text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {isEvaluating ? <Loader2 className="animate-spin" /> : <Target size={24} />}
          Ստուգել Որոշումը
        </button>
      )}
    </div>
  );
};

const QuizView = ({ questions = [], isTimedMode, onComplete }: { questions: QuizQuestion[], isTimedMode: boolean, onComplete: (ans: number[]) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!questions || questions.length === 0) {
    return <div className="text-center py-12 text-slate-500 font-black italic text-xl">Թեստի հարցերը բացակայում են:</div>;
  }

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (currentIdx < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelected(index);
    setShowFeedback(true);
  };

  const handleTimeUp = () => {
    if (!showFeedback) {
      setSelected(-1); // Mark as incorrect
      setShowFeedback(true);
    }
  };

  const currentQuestion = questions[currentIdx];
  if (!currentQuestion) return null;

  return (
    <motion.div
      key={currentIdx}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto space-y-12"
    >
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-12">
        <div className="flex items-center justify-between">
          <span className="text-accent font-black uppercase tracking-widest text-[10px] px-6 py-2.5 bg-accent/10 rounded-full border border-accent/10">
            Հարց {currentIdx + 1} / {questions.length}
          </span>
          {isTimedMode && !showFeedback && (
            <div className="w-56">
              <ExerciseTimer 
                duration={15} 
                onTimeUp={handleTimeUp} 
                isActive={!showFeedback} 
              />
            </div>
          )}
        </div>

        <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 gap-5">
          {currentQuestion.options?.map((opt, i) => {
            const isCorrect = i === currentQuestion.correctAnswer;
            const isSelected = i === selected;
            
            let variant = "default";
            if (showFeedback) {
              if (isCorrect) variant = "correct";
              else if (isSelected) variant = "incorrect";
            } else if (isSelected) {
              variant = "selected";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={cn(
                  "w-full p-8 rounded-[2rem] text-left font-black text-xl transition-all border-2 flex items-center justify-between group shadow-sm",
                  variant === "default" && "bg-white border-slate-50 hover:border-accent/30 hover:bg-accent/5 text-slate-700",
                  variant === "selected" && "bg-accent/10 border-accent text-accent",
                  variant === "correct" && "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-100",
                  variant === "incorrect" && "bg-red-50 border-red-500 text-red-700 shadow-red-100"
                )}
              >
                <span>{opt}</span>
                {showFeedback && isCorrect && <CheckCircle2 size={28} className="text-emerald-500" />}
                {showFeedback && isSelected && !isCorrect && <X size={28} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-8 rounded-[2rem] flex items-center gap-5 shadow-sm",
                selected === currentQuestion.correctAnswer ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              )}
            >
              {selected === currentQuestion.correctAnswer ? (
                <>
                  <CheckCircle2 size={32} />
                  <span className="font-black tracking-tight text-lg">Ճիշտ է: Հիանալի աշխատանք:</span>
                </>
              ) : (
                <>
                  <AlertCircle size={32} />
                  <span className="font-black tracking-tight text-lg leading-tight">
                    {selected === -1 ? "Ժամանակը սպառվեց:" : "Սխալ է:"} Ճիշտ պատասխանն է՝ {currentQuestion.options[currentQuestion.correctAnswer]}
                  </span>
                </>
              )}
            </motion.div>

            {selected !== currentQuestion.correctAnswer && (
              <QuizMentor 
                question={currentQuestion.question}
                userAnswer={selected === -1 ? "Ժամանակը սպառվել է" : currentQuestion.options[selected!]}
                correctAnswer={currentQuestion.options[currentQuestion.correctAnswer]}
              />
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!showFeedback}
        className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
      >
        {currentIdx === questions.length - 1 ? 'Ավարտել թեստը' : 'Հաջորդ հարցը'}
      </button>
    </motion.div>
  );
};
