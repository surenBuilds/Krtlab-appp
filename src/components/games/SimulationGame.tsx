import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ScrollText, 
  Goal, 
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  Timer as TimerIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GameSessionResult } from '../../types';

interface Challenge {
  question: string;
  options: string[];
  impacts: {
    score: number;
    feedback: string;
    metrics?: {
      profit?: number;
      reputation?: number;
      satisfaction?: number;
    };
  }[];
  correctAnswer: number;
}

interface SimulationGameProps {
  dataset: {
    scenario: string;
    objectives: string[];
    rules: string[];
    challenges: Challenge[];
    successCriteria: string;
    metrics?: {
      label: string;
      icon: 'profit' | 'users' | 'zap';
      initialValue: number;
    }[];
  };
  onComplete: (score: number, result: GameSessionResult) => void;
  internalLevel?: number;
}

const displayText = (val: any): string => {
  if (typeof val === 'string') return val;
  if (!val) return '';
  if (typeof val === 'object') {
    return val.armenian || val.english || val.text || JSON.stringify(val);
  }
  return String(val);
};

export const SimulationGame: React.FC<SimulationGameProps> = ({ dataset, onComplete, internalLevel = 1 }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timer, setTimer] = useState(0);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [metrics, setMetrics] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    dataset?.metrics?.forEach(m => {
      initial[m.label] = m.initialValue;
    });
    return initial;
  });

  // Scaling logic
  const challengeLimit = Math.min(dataset?.challenges?.length || 0, 2 + (internalLevel - 1));
  const challenges = (dataset?.challenges || []).slice(0, challengeLimit);
  const objectives = dataset?.objectives || [];
  const rules = dataset?.rules || [];
  
  const currentChallenge = challenges[currentChallengeIdx];

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const handleSelect = (idx: number) => {
    if (showFeedback || !currentChallenge) return;
    setSelected(idx);
    setShowFeedback(true);
    
    const impact = currentChallenge?.impacts?.[idx];
    if (impact) {
      setTotalScore(prev => prev + (impact.score || 0));
      if (idx !== currentChallenge.correctAnswer) {
        setErrors(prev => prev + 1);
      }
      
      if (impact.metrics) {
        setMetrics(prev => {
          const next = { ...prev };
          Object.entries(impact.metrics!).forEach(([key, val]) => {
            if (next[key] !== undefined) next[key] += (val as number);
          });
          return next;
        });
      }
    }
  };

  const handleNext = () => {
    if (currentChallengeIdx < challenges.length - 1) {
      setCurrentChallengeIdx(currentChallengeIdx + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('summary');
    }
  };

  const calculateFinalScore = () => {
    if (challenges.length === 0) return 0;
    const maxPossibleScore = challenges.length * 100;
    return Math.max(0, Math.round((totalScore / maxPossibleScore) * 100));
  };

  const handleFinish = () => {
    const finalScore = calculateFinalScore();
    const duration = (Date.now() - startTime) / 1000;
    
    onComplete(finalScore, {
      accuracy: finalScore,
      reactionTime: Math.round((duration / challenges.length) * 1000),
      completionTime: duration,
      errorCount: errors,
      timestamp: new Date().toISOString(),
      difficultyLevel: internalLevel
    });
  };

  if (!dataset || (dataset?.challenges || []).length === 0) {
    return <div className="text-center p-12 text-slate-400">Սիմուլյացիայի տվյալները բացակայում են:</div>;
  }

  if (gameState === 'intro') {
    return (
      <div className="space-y-12">
        <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <ScrollText size={120} />
          </div>
          <h4 className="text-accent uppercase font-black tracking-widest text-sm mb-6 flex items-center gap-3">
            <ScrollText size={20} />
            Սիմուլյացիոն Սցենար
          </h4>
          <p className="text-2xl font-medium leading-relaxed italic relative z-10">
            {displayText(dataset.scenario)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
            <h4 className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-sm mb-6">
              <Goal size={20} />
              Նպատակներ
            </h4>
            <ul className="space-y-4">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-emerald-900 font-bold">
                  <CheckCircle2 size={20} className="shrink-0 mt-1 text-emerald-500" />
                  {displayText(obj)}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
            <h4 className="flex items-center gap-3 text-amber-600 font-black uppercase tracking-widest text-sm mb-6">
              <ShieldCheck size={20} />
              Կանոններ
            </h4>
            <ul className="space-y-4">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-amber-900 font-bold">
                  <AlertTriangle size={20} className="shrink-0 mt-1 text-amber-500" />
                  {displayText(rule)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={() => setGameState('playing')}
          className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 glow-cyan-hover uppercase tracking-widest"
        >
          Սկսել Սիմուլյացիան <ArrowRight size={32} />
        </button>
      </div>
    );
  }

  if (gameState === 'summary') {
    const finalScore = calculateFinalScore();
    const isSuccess = finalScore >= 70;

    return (
      <div className="text-center space-y-12">
        <div className={cn(
          "w-32 h-32 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl",
          isSuccess ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          {isSuccess ? <TrendingUp size={64} /> : <AlertTriangle size={64} />}
        </div>

        <div className="space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            Սիմուլյացիայի Ավարտ
          </h2>
          <p className="text-xl text-slate-500 font-bold">
            {isSuccess ? "Դուք հաջողությամբ կառավարեցիք իրավիճակը:" : "Մարտահրավերը բարդ էր ձեզ համար:"}
          </p>
        </div>

        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 max-w-lg mx-auto">
          <h4 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-4">Հաջողության Չափանիշ</h4>
          <p className="text-xl text-slate-800 font-bold italic">
            {displayText(dataset.successCriteria)}
          </p>
        </div>

        <button
          onClick={handleFinish}
          className="bg-slate-900 text-white px-16 py-8 rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest"
        >
          Շարունակել
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <TimerIcon size={18} />
          <span>{timer}վ</span>
        </div>
        <div className="text-xs font-black text-slate-400">
          Մակարդակ: <span className="text-accent">{internalLevel}</span>
        </div>
      </div>

      {dataset.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {dataset.metrics.map((m, i) => (
            <div key={i} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                {m.icon === 'profit' ? <TrendingUp size={20} /> : m.icon === 'users' ? <Users size={20} /> : <Zap size={20} />}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{displayText(m.label)}</p>
                <p className="text-lg font-black text-slate-800">{metrics[m.label]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentChallengeIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-slate-900 text-accent rounded-2xl flex items-center justify-center font-black text-2xl shrink-0">
              {currentChallengeIdx + 1}
            </div>
            <h3 className="text-3xl font-black text-slate-900 leading-tight">
              {displayText(currentChallenge.question)}
            </h3>
          </div>

          <div className="grid gap-4">
            {currentChallenge.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={cn(
                  "p-8 text-left rounded-[2rem] font-bold text-xl transition-all border-2",
                  selected === i 
                    ? (i === currentChallenge.correctAnswer ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-red-50 border-red-500 text-red-900")
                    : showFeedback ? "bg-slate-50 border-slate-100 opacity-50" : "bg-white border-slate-100 hover:border-accent/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                )}
              >
                {displayText(opt)}
              </button>
            ))}
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-10 rounded-[2.5rem] flex gap-6",
                selected === currentChallenge.correctAnswer ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
              )}
            >
              <div className="shrink-0 mt-1">
                {selected === currentChallenge.correctAnswer ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
              </div>
              <div className="space-y-2">
                <h5 className="font-black uppercase tracking-widest text-xs">Արձագանք</h5>
                <p className="text-xl font-bold leading-relaxed">
                  {displayText(currentChallenge.impacts[selected!]?.feedback)}
                </p>
              </div>
            </motion.div>
          )}

          {showFeedback && (
            <button
              onClick={handleNext}
              className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 shadow-2xl mt-12 hover:bg-slate-800 transition-all uppercase tracking-widest"
            >
              {currentChallengeIdx === challenges.length - 1 ? "Ավարտել" : "Հաջորդ Մարտահրավերը"}
              <ArrowRight size={32} />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
