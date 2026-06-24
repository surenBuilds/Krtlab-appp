import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ArrowRight, CheckCircle2, XCircle, Timer as TimerIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GameSessionResult } from '../../types';

interface Stage {
  question: string;
  options: string[];
  correctAnswer: number;
  feedback: string;
}

interface ApplicationScenarioProps {
  dataset: { scenario: string; stages: Stage[] };
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

export const ApplicationScenario: React.FC<ApplicationScenarioProps> = ({ dataset, onComplete, internalLevel = 1 }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [startTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scaling logic
  const stageList = dataset?.stages || [];
  const stageLimit = Math.min(stageList.length, 2 + (internalLevel - 1));
  const stages = stageList.slice(0, stageLimit);
  const timeLimitPerStage = Math.max(15, 60 - (internalLevel * 10));

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    
    const correct = idx === stages[currentStage].correctAnswer;
    setAnswers(prev => [...prev, correct]);
  };

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const score = Math.round((answers.filter(a => a).length / stages.length) * 100);
      const duration = (Date.now() - startTime) / 1000;
      
      onComplete(score, {
        accuracy: score,
        reactionTime: Math.round((duration / stages.length) * 1000),
        completionTime: duration,
        errorCount: answers.filter(a => !a).length,
        timestamp: new Date().toISOString(),
        difficultyLevel: internalLevel
      });
    }
  };

  const stage = stages[currentStage];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <TimerIcon size={18} />
          <span>{timer}վ</span>
          {internalLevel > 1 && <span className="text-slate-300">/ {timeLimitPerStage * stages.length}վ</span>}
        </div>
        <div className="text-xs font-black text-slate-400">
          Բարդություն: <span className="text-accent">{internalLevel}</span>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
        <h4 className="text-accent uppercase font-black tracking-widest text-xs mb-4">Իրավիճակ</h4>
        <p className="text-xl font-medium leading-relaxed italic">{displayText(dataset.scenario)}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-black">
              {currentStage + 1}
            </span>
            <h3 className="text-2xl font-black text-slate-800">{displayText(stage.question)}</h3>
          </div>

          <div className="grid gap-3">
            {stage.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={cn(
                  "p-6 text-left rounded-2xl font-bold transition-all border-2",
                  selected === i 
                    ? (i === stage.correctAnswer ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-red-50 border-red-500 text-red-900")
                    : "bg-white border-slate-100 hover:border-accent/30 text-slate-600"
                )}
              >
                {displayText(option)}
              </button>
            ))}
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-6 rounded-2xl flex gap-4",
                selected === stage.correctAnswer ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
              )}
            >
              <div className="shrink-0 mt-1">
                {selected === stage.correctAnswer ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <p className="font-bold leading-relaxed">{displayText(stage.feedback)}</p>
            </motion.div>
          )}

          {showFeedback && (
            <button
              onClick={handleNext}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl mt-8 hover:bg-slate-800 transition-all"
            >
              {currentStage === stages.length - 1 ? "Ավարտել" : "Հաջորդ քայլը"}
              <ArrowRight size={24} />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
