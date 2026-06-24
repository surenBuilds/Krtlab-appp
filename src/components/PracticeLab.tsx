import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Target, 
  Brain, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Trophy, 
  Sparkles,
  Search,
  Code,
  LineChart,
  Globe,
  Beaker,
  BookOpen,
  GraduationCap,
  Scale,
  Palette,
  Loader2,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Zap,
  Briefcase,
  Cpu,
  Wallet,
  Construction,
  Wrench,
  Dna,
  Atom,
  Languages,
  PenTool
} from 'lucide-react';
import { PracticeLabTask, PracticeLabStep } from '../types';
import { generatePracticeLabTask } from '../services/geminiService';
import { useUserProfile } from '../hooks/useUserProfile';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { CATEGORIES } from '../data/categories';

const ICON_MAP: Record<string, any> = {
  'Briefcase': Briefcase,
  'Wallet': Wallet,
  'Cpu': Cpu,
  'FlaskConical': FlaskConical,
  'BookOpen': BookOpen,
  'Scale': Scale,
  'Palette': Palette,
  'Construction': Construction,
  'Languages': Languages,
  'Dna': Dna,
  'Atom': Atom,
  'PenTool': PenTool,
};

interface PracticeLabProps {
  initialField?: string | null;
  initialTopic?: string | null;
  onClearInitial?: () => void;
}

export const PracticeLab: React.FC<PracticeLabProps> = ({ 
  initialField, 
  initialTopic, 
  onClearInitial 
}) => {
  const [view, setView] = useState<'selection' | 'loading' | 'lab'>('selection');
  
  // Find category index from initialField ID
  const initialCategory = initialField 
    ? CATEGORIES.find(c => c.id === initialField || c.subfields.some(s => s.id === initialField)) || CATEGORIES[0]
    : CATEGORIES[0];

  const [selectedField, setSelectedField] = useState(initialCategory.id);
  const [selectedSubfield, setSelectedSubfield] = useState(
    initialField && initialCategory.subfields.some(s => s.id === initialField)
      ? initialField 
      : initialCategory.subfields[0].id
  );
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [topic, setTopic] = useState(initialTopic || '');
  
  const [currentTask, setCurrentTask] = useState<PracticeLabTask | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [mistakesLog, setMistakesLog] = useState<{ step: number; userResponse: string; feedback: string }[]>([]);
  const [isFailed, setIsFailed] = useState(false);
  const [labPoints, setLabPoints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const { profile, updateXp } = useUserProfile();

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    // If we have an initial field/topic, we might want to automatically set the category/subfield
    if (initialField) {
      const cat = CATEGORIES.find(c => c.id === initialField || c.subfields.some(s => s.id === initialField));
      if (cat) {
        setSelectedField(cat.id);
        const sub = cat.subfields.find(s => s.id === initialField) || cat.subfields[0];
        setSelectedSubfield(sub.id);
      }
    }
  }, [initialField, initialTopic]);

  const resetLab = () => {
    setErrorCount(0);
    setMistakesLog([]);
    setIsFailed(false);
    setIsCompleted(false);
    setCurrentStepIdx(0);
    setUserAnswer('');
    setEvaluation(null);
    setShowHint(false);
  };

  const currentCategory = CATEGORIES.find(c => c.id === selectedField) || CATEGORIES[0];
  const currentSubfield = currentCategory.subfields.find(s => s.id === selectedSubfield) || currentCategory.subfields[0];

  const handleStartLab = async () => {
    resetLab();
    setView('loading');
    try {
      const task = await generatePracticeLabTask(
        currentCategory.title,
        currentSubfield.id,
        currentSubfield.title,
        selectedLevel,
        topic
      );
      if (task) {
        setCurrentTask(task);
        setView('lab');
      } else {
        toast.error("Չհաջողվեց ստեղծել առաջադրանքը: Խնդրում ենք նորից փորձել:");
        setView('selection');
      }
    } catch (error) {
      console.error(error);
      setView('selection');
    }
  };

  const currentStep = currentTask?.steps[currentStepIdx];

  const handleEvaluate = () => {
    if (!userAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);

    // Simple heuristic-based evaluation for now
    // In a real app, this would call an AI evaluation endpoint
    const expected = currentStep?.expectedOutcome?.toLowerCase() || '---';
    const correct = userAnswer.toLowerCase().includes(expected);
    
    setTimeout(() => {
      const feedbackText = correct 
        ? "Գերազանց է: Դուք ճիշտ կատարեցիք առաջադրանքը:"
        : `Ամբողջովին ճիշտ չէ: ${currentStep?.expectedOutcome ? 'Դիտարկեք պահանջվող տրամաբանությունը:' : 'Փորձեք վերանայել ձեր մոտեցումը՝ հիմնվելով սցենարի վրա:'}`;

      setEvaluation({
        isCorrect: correct,
        feedback: feedbackText
      });
      setIsEvaluating(false);

      if (!correct) {
        const newErrorCount = errorCount + 1;
        setErrorCount(newErrorCount);
        setMistakesLog(prev => [...prev, { 
          step: currentStepIdx + 1, 
          userResponse: userAnswer, 
          feedback: feedbackText 
        }]);

        if (newErrorCount === 1) {
          toast.warning("Զգուշացում. Սա ձեր 1-ին սխալն է: Խնդրում ենք ուշադիր կարդալ բացատրությունը:");
        } else if (newErrorCount === 2) {
          toast.warning("Զգուշացում. Սա ձեր 2-րդ սխալն է: Օգտվեք հուշումից՝ ճիշտ ուղղությունը գտնելու համար:");
          setShowHint(true);
        } else if (newErrorCount === 3) {
          toast.error("Կրիտիկական զգուշացում. Սա ձեր 3-րդ սխալն է: Եվս մեկ սխալ և առաջադրանքը կդադարեցվի:");
        } else if (newErrorCount >= 4) {
          setIsFailed(true);
          toast.error("Առաջադրանքը դադարեցված է սխալների առավելագույն քանակը գերազանցելու պատճառով:");
        }
      }
    }, 1000);
  };

  const handleNextStep = () => {
    if (evaluation?.isCorrect) {
      setLabPoints(prev => prev + 25); // Intermediate points for steps
      if (currentStepIdx < (currentTask?.steps.length || 0) - 1) {
        setCurrentStepIdx(prev => prev + 1);
        setUserAnswer('');
        setEvaluation(null);
        setShowHint(false);
      } else {
        // Final completion logic
        setIsCompleted(true);
        updateXp(currentTask?.xpReward || 50);
      }
    }
  };

  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-8">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-accent/20 border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FlaskConical size={40} className="text-accent animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">KertLab Պրակտիկ Լաբորատորիա</h2>
          <p className="text-slate-500 font-medium">Ստեղծվում է ձեր գործնական սցենարը...</p>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-white rounded-[3.5rem] p-12 border-4 border-slate-900 shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] space-y-12"
      >
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <XCircle size={64} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900">Առաջադրանքը Դադարեցված է</h2>
            <p className="text-xl text-slate-500 font-medium italic">
              Գործնական աշխատանքը դադարեցվել է թույլատրելի սխալների քանակը (3) գերազանցելու պատճառով:
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-slate-100 space-y-8">
          <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-xs">
            <ShieldAlert size={18} /> Սխալների Ամփոփում
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {mistakesLog.map((mistake, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border-2 border-slate-100 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Քայլ {mistake.step}
                  </span>
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                    Սխալ #{idx + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-slate-400">Ձեր պատասխանը:</span> "{mistake.userResponse}"
                  </p>
                  <p className="text-sm font-bold text-red-600 italic bg-red-50 p-3 rounded-lg border border-red-100">
                    {mistake.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 p-8 rounded-3xl border-2 border-amber-100 flex items-start gap-6">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Lightbulb size={24} />
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-amber-900 uppercase tracking-widest text-xs">Խորհուրդ</h4>
            <p className="text-amber-800 font-medium leading-relaxed italic">
              Խորհուրդ ենք տալիս վերանայել թեմայի տեսական մասը կամ անցնել <span className="font-black">«Ուղղորդված Պրակտիկա»</span> ռեժիմին նախքան նոր փորձ կատարելը:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={handleStartLab}
            className="bg-slate-900 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 group"
          >
            Փորձել նորից
            <Zap size={18} className="group-hover:text-accent transition-colors" />
          </button>
          <button
            onClick={() => setView('selection')}
            className="bg-white border-4 border-slate-900 text-slate-900 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            Վերանայել սխալները
            <Search size={18} />
          </button>
          <button
            onClick={() => setView('selection')}
            className="bg-accent text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
          >
            Ուղղորդված Պրակտիկա
            <GraduationCap size={18} />
          </button>
        </div>
      </motion.div>
    );
  }

  if (isCompleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-white rounded-[3.5rem] p-16 border-4 border-slate-900 shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] text-center space-y-10"
      >
        <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
          <Trophy size={64} className="text-amber-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 bg-accent p-4 rounded-3xl shadow-lg border-2 border-white/20"
          >
            <Sparkles size={24} className="text-white" />
          </motion.div>
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight tracking-tight">Առաքելությունն Ավարտված է:</h2>
          <p className="text-2xl text-slate-500 font-medium leading-relaxed">
            Դուք ցուցադրեցիք բացառիկ հմտություններ <span className="text-accent font-black">{currentTask?.subfieldTitle}</span> (Մակարդակ {currentTask?.level}) լաբորատորիայում:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 border-y-2 border-slate-100">
          <div className="text-center">
            <div className="text-5xl font-black text-accent">+{currentTask?.xpReward || 50}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Վաստակած XP</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-emerald-500">{currentTask?.steps.length}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Լուծված Խնդիրներ</div>
          </div>
        </div>

        <button
          onClick={() => {
            if (onClearInitial) onClearInitial();
            setView('selection');
            setCurrentTask(null);
            setIsCompleted(false);
            setCurrentStepIdx(0);
          }}
          className="w-full bg-slate-900 text-white py-8 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest group"
        >
          Վերադառնալ Մուտքի Մոտ
          <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </motion.div>
    );
  }

  if (view === 'lab' && currentTask && currentStep) {
    return (
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center justify-between bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
              <FlaskConical size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{currentTask.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-black uppercase tracking-widest text-accent">{currentTask.subfieldTitle}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-xs font-black uppercase tracking-widest text-white/40">Մակարդակ {currentTask.level}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              {currentTask.steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    i === currentStepIdx ? "w-12 bg-accent shadow-[0_0_15px_rgba(6,182,212,0.6)]" : 
                    i < currentStepIdx ? "w-6 bg-emerald-400" : "w-6 bg-white/10"
                  )} 
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Սխալներ՝</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <div 
                    key={num}
                    className={cn(
                      "w-3 h-3 rounded-sm border transition-all",
                      errorCount >= num 
                        ? "bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                        : "bg-white/5 border-white/10"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            <motion.div
              key={currentStepIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3rem] p-12 border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Target size={14} /> Քայլ {currentStepIdx + 1}՝ {currentTask.steps.length}-ից
                </div>
                <h3 className="text-3xl font-black text-slate-900 leading-tight">
                  {typeof currentStep.description === 'string' ? currentStep.description : JSON.stringify(currentStep.description)}
                </h3>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex items-start gap-6 group relative overflow-hidden">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm shrink-0">
                  <BookOpen size={24} />
                </div>
                <p className="text-xl text-slate-700 font-medium leading-relaxed italic z-10">
                  "{typeof currentStep.question === 'string' ? currentStep.question : JSON.stringify(currentStep.question)}"
                </p>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles size={80} />
                </div>
              </div>

              <div className="space-y-6">
                {currentStep.type === 'choice' ? (
                  <div className="grid gap-4">
                    {currentStep.options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserAnswer(option)}
                        disabled={!!evaluation}
                        className={cn(
                          "w-full p-6 rounded-2xl border-4 text-left font-bold transition-all flex items-center justify-between group",
                          userAnswer === option 
                            ? (evaluation 
                                ? (evaluation.isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-red-500 bg-red-50 text-red-900")
                                : "border-accent bg-accent/5 text-slate-900")
                            : "border-slate-100 hover:border-slate-200 text-slate-600 bg-white"
                        )}
                      >
                        {option}
                        {userAnswer === option && evaluation && (
                          evaluation.isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={!!evaluation}
                    placeholder="Նկարագրեք ձեր լուծումը կամ վերլուծությունը այստեղ..."
                    className={cn(
                      "w-full h-48 p-8 rounded-[2rem] border-4 focus:outline-none focus:ring-0 font-bold text-xl transition-all resize-none",
                      evaluation 
                        ? (evaluation.isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-red-500 bg-red-50 text-red-900")
                        : "border-slate-100 focus:border-accent bg-slate-50 text-slate-900"
                    )}
                  />
                )}

                <AnimatePresence>
                  {evaluation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-8 rounded-[2rem] border-2 space-y-3",
                        evaluation.isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {evaluation.isCorrect ? (
                          <CheckCircle2 className="text-emerald-600" />
                        ) : (
                          <ShieldAlert className="text-red-600" />
                        )}
                        <span className={cn(
                          "text-xs font-black uppercase tracking-widest",
                          evaluation.isCorrect ? "text-emerald-700" : "text-red-700"
                        )}>
                          {evaluation.isCorrect ? "Ստուգումը Հաջողվեց" : "Տրամաբանական Անհամապատասխանություն"}
                        </span>
                      </div>
                      <p className={cn(
                        "font-bold text-lg italic leading-relaxed",
                        evaluation.isCorrect ? "text-emerald-900" : "text-red-900"
                      )}>
                        {typeof evaluation.feedback === 'string' ? evaluation.feedback : JSON.stringify(evaluation.feedback)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-6">
                  {!evaluation ? (
                    <button
                      onClick={handleEvaluate}
                      disabled={!userAnswer.trim() || isEvaluating}
                      className="flex-1 bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50 uppercase tracking-widest"
                    >
                      {isEvaluating ? <Loader2 className="animate-spin" /> : "Ստուգել Լուծումը"}
                    </button>
                  ) : (
                    <button
                      onClick={evaluation.isCorrect ? handleNextStep : () => setEvaluation(null)}
                      className={cn(
                        "flex-1 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl uppercase tracking-widest group",
                        evaluation.isCorrect ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-500 text-white hover:bg-red-600"
                      )}
                    >
                      {evaluation.isCorrect 
                        ? (currentStepIdx < currentTask.steps.length - 1 ? "Հաջորդ Փուլ" : "Ավարտել Առաքելությունը") 
                        : "Վերանայել Լուծումը"}
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8">
              <div className="flex items-center gap-4 text-emerald-600">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <h4 className="font-black uppercase tracking-widest text-xs">ԱԲ Ուղեկցում</h4>
              </div>
              <p className="text-slate-600 font-bold leading-relaxed text-sm">
                KertLab լաբորատոր օգնականը տրամադրում է տեխնիկական հուշումներ՝ առանց բուն լուծումը բացահայտելու:
              </p>
              
              <AnimatePresence mode="wait">
                {showHint ? (
                  <motion.div
                    key="hint"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-6 bg-accent/5 border-2 border-accent/20 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[10px]">
                      <Lightbulb size={12} /> Տեխնիկական Ռազմավարություն
                    </div>
                    <p className="text-accent font-bold italic text-sm leading-relaxed">
                      {currentStep.hint}
                    </p>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="w-full py-4 border-2 border-dashed border-accent/30 text-accent rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
                  >
                    <HelpCircle size={14} /> Խնդրել Հուշում
                  </button>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-slate-100 space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">Համատեքստային Տվյալներ</h4>
              <p className="text-slate-600 font-medium leading-relaxed italic text-sm">
                {currentTask.scenario}
              </p>
              <div className="bg-slate-200/50 p-4 rounded-xl">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ձեր Դերը</div>
                 <div className="text-slate-900 font-black">{currentTask.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 bg-accent/10 p-3 pr-6 rounded-full border border-accent/20">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/20">
            <FlaskConical size={20} />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-accent">KertLab Պրակտիկ Լաբորատորիա</span>
        </div>
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
          Վերափոխեք Գիտելիքը <br/> <span className="text-accent">Գործնական Հմտության:</span>
        </h1>
        <p className="text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
          Պրակտիկ Լաբորատորիան ժամանակակից սիմուլյացիոն միջավայր է, որտեղ դուք լուծում եք իրական խնդիրներ և հասնում վարպետության:
        </p>
      </div>

      <div className="bg-white rounded-[4rem] p-12 lg:p-16 border-4 border-slate-900 shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] space-y-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">1. Ընտրեք Ոլորտը</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {CATEGORIES.map(category => {
                  const Icon = ICON_MAP[category.icon] || Briefcase;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedField(category.id);
                        setSelectedSubfield(category.subfields[0].id);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group",
                        selectedField === category.id 
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                          : "bg-white border-slate-100 hover:border-accent/30 text-slate-500"
                      )}
                    >
                      <Icon size={24} className={cn(selectedField === category.id ? "text-accent" : "text-slate-400")} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">{category.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">2. Մասնագիտացում</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCategory.subfields.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubfield(sub.id)}
                    className={cn(
                      "p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                      selectedSubfield === sub.id 
                        ? "bg-accent border-accent text-white shadow-lg" 
                        : "bg-slate-50 border-slate-100 hover:border-accent/30 text-slate-600"
                    )}
                  >
                    <span className="font-bold">{sub.title}</span>
                    {selectedSubfield === sub.id && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">3. Մակարդակ (1—20)</label>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 space-y-8 text-center">
                <div className="text-7xl font-black text-slate-900 drop-shadow-sm">
                  {selectedLevel}
                </div>
                <div className="space-y-4">
                   <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                   />
                   <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Սկսնակ</span>
                     <span>Փորձագետ</span>
                   </div>
                </div>
                <p className="text-xs font-bold text-slate-500 italic px-4">
                  {selectedLevel <= 5 ? "Հիմնական հասկացությունների կիրառում" :
                   selectedLevel <= 10 ? "Կիրառական իրավիճակներ և դեպքեր" :
                   selectedLevel <= 15 ? "Առաջադեմ համակարգեր և վերլուծություն" :
                   "Փորձագիտական սիմուլյացիա և վարպետություն"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">4. Կոնկրետ Թեմա</label>
              <div className="relative group">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="օրինակ՝ Ռիսկերի կառավարում..."
                  className="w-full bg-slate-50 border-4 border-slate-100 p-6 rounded-2xl focus:border-accent outline-none text-lg font-bold transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                  <Trophy size={24} />
                </div>
                <div>
                  <h4 className="font-black tracking-tight">Լաբորատոր Պարգև</h4>
                  <p className="text-[10px] text-accent font-black uppercase tracking-widest">Վարկանիշի Բարձրացում</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm font-black">
                <span className="text-white/40 uppercase tracking-widest">Պոտենցիալ XP</span>
                <span className="text-accent">+{25 + selectedLevel * 5}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartLab}
          className="w-full bg-accent text-white py-8 rounded-[2rem] font-black text-3xl flex items-center justify-center gap-6 hover:bg-accent/90 transition-all shadow-2xl shadow-accent/20 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          Նախաձեռնել Լաբորատոր Ուսուցումը
          <ChevronRight size={40} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 pb-12">
        <div className="p-8 bg-white rounded-3xl border-2 border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <Brain size={24} />
          </div>
          <h4 className="font-black text-slate-900 tracking-tight">Դինամիկ Ստեղծում</h4>
          <p className="text-slate-500 font-medium leading-relaxed">Առաջադրանքները ստեղծվում են ԱԲ-ի կողմից՝ հիմնվելով ձեր ոլորտի և առաջընթացի վրա:</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border-2 border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Lightbulb size={24} />
          </div>
          <h4 className="font-black text-slate-900 tracking-tight">Տեխնիկական Ուղեկցում</h4>
          <p className="text-slate-500 font-medium leading-relaxed">Ստացեք ուղղորդված հուշումներ և ռազմավարական խորհուրդներ խնդիրների լուծման ընթացքում:</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border-2 border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <h4 className="font-black text-slate-900 tracking-tight">Հմտությունների Գնահատում</h4>
          <p className="text-slate-500 font-medium leading-relaxed">Ձեր լուծումների ակնթարթային գնահատում տրամաբանական ստուգումների միջոցով:</p>
        </div>
      </div>
    </div>
  );
};
