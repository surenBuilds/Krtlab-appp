import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, BrainCircuit, CheckCircle2, ChevronRight, 
  Gamepad2, GraduationCap, Languages, Loader2, 
  Play, RefreshCcw, Sparkles, Trophy, Volume2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  generateLanguagePlacementTest, 
  generateLanguageVocabulary, 
  generateLanguageGrammar 
} from '../services/geminiService';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { calculateSRS } from '../lib/srs';

interface LanguageModuleProps {
  languageId: string;
  languageTitle: string;
  onExit: () => void;
}

interface WordMatchGameProps {
  words: any[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

const displayText = (val: any): string => {
  if (typeof val === 'string') return val;
  if (!val) return '';
  if (typeof val === 'object') {
    return val.armenian || val.english || val.text || JSON.stringify(val);
  }
  return String(val);
};

const WordMatchGame: React.FC<WordMatchGameProps> = ({ words, onComplete, onExit }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<[string, string] | null>(null);

  const shuffledWords = useMemo(() => [...(words || [])].sort(() => Math.random() - 0.5), [words]);
  const shuffledDefs = useMemo(() => [...(words || [])].sort(() => Math.random() - 0.5), [words]);

  useEffect(() => {
    if (selectedWord && selectedDef) {
      const wordObj = words.find(w => displayText(w.word) === selectedWord);
      if (wordObj && displayText(wordObj.definition) === selectedDef) {
        setMatches(prev => [...prev, selectedWord]);
        setSelectedWord(null);
        setSelectedDef(null);
        toast.success("Ճիշտ է:", { duration: 1000 });
      } else {
        setWrongMatch([selectedWord, selectedDef]);
        setTimeout(() => {
          setWrongMatch(null);
          setSelectedWord(null);
          setSelectedDef(null);
        }, 1000);
        toast.error("Սխալ է:", { duration: 1000 });
      }
    }
  }, [selectedWord, selectedDef, words]);

  useEffect(() => {
    if (matches.length === words.length && words.length > 0) {
      onComplete(100);
    }
  }, [matches, words, onComplete]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
          <ChevronRight className="rotate-180" size={16} />
          Դուրս գալ
        </button>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Բառերի համապատասխանեցում</h2>
        <div className="text-xs font-black text-accent bg-accent/10 px-5 py-2 rounded-full border border-accent/10 uppercase tracking-widest">
          {matches.length} / {words.length}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Բառեր</h4>
          {shuffledWords.map((w, i) => {
            const wordStr = displayText(w.word);
            return (
              <button
                key={i}
                disabled={matches.includes(wordStr)}
                onClick={() => setSelectedWord(wordStr)}
                className={cn(
                  "w-full p-5 rounded-[1.5rem] border-2 transition-all font-black text-left text-lg shadow-sm",
                  matches.includes(wordStr) ? "bg-emerald-50 border-emerald-100 text-emerald-600 opacity-50" :
                  selectedWord === wordStr ? "border-accent bg-accent/5 text-accent shadow-xl shadow-accent/10" :
                  wrongMatch?.[0] === wordStr ? "border-red-500 bg-red-50 text-red-700" :
                  "bg-white border-slate-100 hover:border-accent/30 text-slate-700"
                )}
              >
                {wordStr}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Բացատրություններ</h4>
          {shuffledDefs.map((w, i) => {
            const defStr = displayText(w.definition);
            const wordStr = displayText(w.word);
            return (
              <button
                key={i}
                disabled={matches.includes(wordStr)}
                onClick={() => setSelectedDef(defStr)}
                className={cn(
                  "w-full p-5 rounded-[1.5rem] border-2 transition-all font-medium text-left text-base shadow-sm",
                  matches.includes(wordStr) ? "bg-emerald-50 border-emerald-100 text-emerald-600 opacity-50" :
                  selectedDef === defStr ? "border-accent bg-accent/5 text-accent shadow-xl shadow-accent/10" :
                  wrongMatch?.[1] === defStr ? "border-red-500 bg-red-50 text-red-700" :
                  "bg-white border-slate-100 hover:border-accent/30 text-slate-700"
                )}
              >
                {defStr}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const LanguageModule: React.FC<LanguageModuleProps> = ({
  languageId,
  languageTitle,
  onExit
}) => {
  const { profile, updateProfile, addFlashcards } = useUserProfile();
  const [step, setStep] = useState<'intro' | 'placement' | 'dashboard' | 'vocabulary' | 'grammar' | 'game'>('intro');
  const [loading, setLoading] = useState(false);
  const [placementQuestions, setPlacementQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [placementAnswers, setPlacementAnswers] = useState<number[]>([]);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [grammar, setGrammar] = useState<any>(null);
  const [gameScore, setGameScore] = useState(0);

  const userLevel = profile?.languageLevels?.[languageId] || null;

  const startPlacement = async () => {
    setLoading(true);
    setStep('placement');
    try {
      const questions = await generateLanguagePlacementTest(languageTitle);
      setPlacementQuestions(questions);
    } catch (err) {
      toast.error("Չհաջողվեց բեռնել թեստը:");
    } finally {
      setLoading(false);
    }
  };

  const handlePlacementAnswer = (answerIndex: number) => {
    const newAnswers = [...placementAnswers, answerIndex];
    setPlacementAnswers(newAnswers);

    if (currentQuestion < placementQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate level
      let correctCount = 0;
      newAnswers.forEach((ans, idx) => {
        if (ans === placementQuestions[idx].correctAnswer) correctCount++;
      });

      let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (correctCount > 7) level = 'advanced';
      else if (correctCount > 4) level = 'intermediate';

      updateProfile({
        languageLevels: {
          ...(profile?.languageLevels || {}),
          [languageId]: level
        }
      });
      setStep('dashboard');
      toast.success(`Ձեր մակարդակը որոշված է՝ ${level.toUpperCase()}`);
    }
  };

  const loadVocabulary = async () => {
    setLoading(true);
    setStep('vocabulary');
    try {
      const words = await generateLanguageVocabulary(languageTitle, userLevel || 'beginner');
      setVocabulary(words);
      
      // Automatically add to flashcards with SRS
      const flashcardsToAdd = words.map((w: any) => ({
        term: w.word,
        definition: w.definition,
        language: languageId,
        level: userLevel || 'beginner',
        ...calculateSRS(3) // Initial SRS state
      }));
      addFlashcards(flashcardsToAdd);
    } catch (err) {
      toast.error("Չհաջողվեց բեռնել բառապաշարը:");
    } finally {
      setLoading(false);
    }
  };

  const loadGrammar = async () => {
    setLoading(true);
    setStep('grammar');
    try {
      const lesson = await generateLanguageGrammar(languageTitle, userLevel || 'beginner');
      setGrammar(lesson);
    } catch (err) {
      toast.error("Չհաջողվեց բեռնել քերականությունը:");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageId === 'english' ? 'en-US' : 
                   languageId === 'spanish' ? 'es-ES' : 
                   languageId === 'french' ? 'fr-FR' : 
                   languageId === 'german' ? 'de-DE' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="text-center space-y-10 py-16"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] mx-auto flex items-center justify-center text-white shadow-2xl shadow-primary/20 animate-pulse">
              <Languages size={56} />
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                Բարի գալուստ <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{languageTitle}</span> լեզվի ուսուցման մոդուլ
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                Մեր ԱԲ համակարգը կօգնի ձեզ սովորել {languageTitle} լեզուն՝ հարմարվելով ձեր գիտելիքներին և արագությանը:
              </p>
            </div>

            {!userLevel ? (
              <button
                onClick={startPlacement}
                className="px-12 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center gap-4 mx-auto group"
              >
                <Play size={24} className="group-hover:translate-x-1 transition-transform" />
                Սկսել մակարդակի ստուգումը
              </button>
            ) : (
              <button
                onClick={() => setStep('dashboard')}
                className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center gap-4 mx-auto group"
              >
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                Շարունակել ուսումը
              </button>
            )}
          </motion.div>
        )}

        {step === 'placement' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse" />
                  <Loader2 size={64} className="animate-spin text-accent relative z-10" />
                </div>
                <p className="text-accent font-black tracking-tight text-xl">Պատրաստում ենք ձեր թեստը...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-12">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-accent uppercase tracking-widest px-6 py-2 bg-accent/10 rounded-full border border-accent/10">Մակարդակի ստուգում</span>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{currentQuestion + 1} / {placementQuestions.length}</span>
                </div>
                
                <div className="space-y-10">
                  <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                    {displayText(placementQuestions[currentQuestion]?.question)}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {placementQuestions[currentQuestion]?.options.map((option: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handlePlacementAnswer(idx)}
                        className="p-6 text-left rounded-[1.5rem] border-2 border-slate-50 hover:border-accent hover:bg-accent/5 transition-all font-bold text-xl text-slate-700 shadow-sm hover:shadow-xl hover:shadow-accent/10"
                      >
                        {displayText(option)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{languageTitle}</h2>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs mt-2">Ձեր մակարդակը՝ <span className="text-accent">{userLevel}</span></p>
              </div>
              <button 
                onClick={startPlacement}
                className="px-6 py-3 text-slate-400 hover:bg-slate-100 rounded-2xl transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-slate-100"
              >
                <RefreshCcw size={16} />
                Վերստուգել մակարդակը
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DashboardCard 
                icon={<BookOpen className="text-primary" />}
                title="Բառապաշար"
                description="Սովորեք նոր բառեր և արտահայտություններ"
                onClick={loadVocabulary}
                color="blue"
              />
              <DashboardCard 
                icon={<GraduationCap className="text-secondary" />}
                title="Քերականություն"
                description="Հասկացեք լեզվի կառուցվածքը և կանոնները"
                onClick={loadGrammar}
                color="purple"
              />
              <DashboardCard 
                icon={<Gamepad2 className="text-amber-500" />}
                title="Խաղեր"
                description="Մարզեք ձեր գիտելիքները խաղերի միջոցով"
                onClick={() => setStep('game')}
                color="orange"
              />
              <DashboardCard 
                icon={<BrainCircuit className="text-emerald-500" />}
                title="SRS Կրկնություն"
                description="Կրկնեք բառերը օպտիմալ ժամանակում"
                onClick={() => toast.info("Այս ֆունկցիան հասանելի կլինի շուտով:")}
                color="green"
              />
            </div>
          </motion.div>
        )}

        {step === 'vocabulary' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between">
              <button onClick={() => setStep('dashboard')} className="text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <ChevronRight className="rotate-180" size={16} />
                Հետ
              </button>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Նոր բառեր</h2>
              <div className="w-10" />
            </div>

            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-8">
                <Loader2 size={64} className="animate-spin text-primary" />
                <p className="text-primary font-black tracking-tight text-xl">Գեներիացնում ենք բառապաշարը...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {(vocabulary || []).map((w, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{displayText(w.word)}</h3>
                        <button onClick={() => speak(displayText(w.word))} className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                          <Volume2 size={20} />
                        </button>
                      </div>
                      <p className="text-slate-600 text-lg font-medium">{displayText(w.definition)}</p>
                      <p className="text-base text-slate-400 italic font-medium">"{displayText(w.example)}"</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all shadow-inner">
                      <Sparkles size={28} />
                    </div>
                  </motion.div>
                ))}
                <button 
                  onClick={loadVocabulary}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black text-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest"
                >
                  Բեռնել ավելի շատ բառեր
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'grammar' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between">
              <button onClick={() => setStep('dashboard')} className="text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <ChevronRight className="rotate-180" size={16} />
                Հետ
              </button>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Քերականություն</h2>
              <div className="w-10" />
            </div>

            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-8">
                <Loader2 size={64} className="animate-spin text-secondary" />
                <p className="text-secondary font-black tracking-tight text-xl">Պատրաստում ենք դասը...</p>
              </div>
            ) : grammar && (
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-12">
                <div className="space-y-6">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{grammar.title}</h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 text-xl leading-relaxed whitespace-pre-wrap font-medium">{grammar.explanation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Կանոններ</h4>
                    <ul className="space-y-4">
                      {grammar.rules?.map((rule: string, i: number) => (
                        <li key={i} className="text-base text-slate-700 flex items-start gap-3 font-medium">
                          <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-secondary/5 p-8 rounded-[2rem] border border-secondary/10 shadow-inner">
                    <h4 className="text-[10px] font-black text-secondary/60 uppercase tracking-widest mb-6">Օրինակներ</h4>
                    <ul className="space-y-4">
                      {grammar.examples?.map((ex: string, i: number) => (
                        <li key={i} className="text-base text-secondary font-black italic">"{ex}"</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'game' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {vocabulary.length > 0 ? (
              <WordMatchGame 
                words={vocabulary.slice(0, 5)} 
                onComplete={(score) => {
                  setGameScore(score);
                  toast.success(`Խաղն ավարտված է: Միավորներ՝ ${score}`);
                  setStep('dashboard');
                }}
                onExit={() => setStep('dashboard')}
              />
            ) : (
              <div className="h-96 flex flex-col items-center justify-center space-y-8">
                <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-100">
                  <Gamepad2 size={48} />
                </div>
                <p className="text-slate-500 font-black text-xl tracking-tight">Խաղալու համար նախ բեռնեք բառապաշարը:</p>
                <button 
                  onClick={loadVocabulary}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                >
                  Բեռնել բառապաշարը
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'orange' | 'green';
}> = ({ icon, title, description, onClick, color }) => {
  const colors = {
    blue: 'hover:border-primary/30 hover:bg-primary/5 shadow-primary/5',
    purple: 'hover:border-secondary/30 hover:bg-secondary/5 shadow-secondary/5',
    orange: 'hover:border-amber-500/30 hover:bg-amber-50 shadow-amber-500/5',
    green: 'hover:border-emerald-500/30 hover:bg-emerald-50 shadow-emerald-500/5',
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-left transition-all group hover:shadow-2xl",
        colors[color]
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-base text-slate-500 leading-relaxed font-medium">{description}</p>
    </button>
  );
};
