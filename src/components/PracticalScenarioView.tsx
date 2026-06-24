import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ArrowRight, CheckCircle2, XCircle, Award, Shield, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { PracticalScenario, ScenarioStep, ScenarioChoice } from '../types';

interface PracticalScenarioProps {
  data: PracticalScenario;
  onComplete: (totalXp: number) => void;
}

export const PracticalScenarioView: React.FC<PracticalScenarioProps> = ({ data, onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [accumulatedXp, setAccumulatedXp] = useState(0);
  const [history, setHistory] = useState<{ stepId: number; choice: ScenarioChoice }[]>([]);

  const currentStep = data.steps[currentStepIdx];

  const handleChoiceSelect = (idx: number) => {
    if (isFinalized) return;
    setSelectedChoiceIdx(idx);
    setIsFinalized(true);
    
    const choice = currentStep.choices[idx];
    setAccumulatedXp(prev => prev + choice.xp_change);
    setHistory(prev => [...prev, { stepId: currentStep.step_id, choice }]);
  };

  const handleNext = () => {
    if (currentStepIdx < data.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setSelectedChoiceIdx(null);
      setIsFinalized(false);
    } else {
      onComplete(accumulatedXp);
    }
  };

  if (!data || !data.steps) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Scenario Header */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10">
              <User size={18} className="text-accent" />
              <span className="text-xs font-black uppercase tracking-widest">{data.player_role}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10">
              <Award size={18} className="text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest">{accumulatedXp} XP</span>
            </div>
          </div>
          <h3 className="text-4xl font-black tracking-tight">{data.title}</h3>
          <p className="text-xl text-white/70 font-medium leading-relaxed italic border-l-4 border-accent pl-6">
            "{data.scenario}"
          </p>
        </div>
      </div>

      {/* Steps Tracking */}
      <div className="flex justify-center gap-3">
        {data.steps.map((step, idx) => (
          <div 
            key={idx}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              idx === currentStepIdx ? "w-12 bg-accent" : 
              idx < currentStepIdx ? "w-8 bg-emerald-500" : "w-4 bg-slate-200"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          {/* Situation Card */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-sm">
                <Shield size={28} />
              </div>
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">{currentStep.situation}</h4>
            </div>

            <div className="grid gap-4">
              {currentStep.choices.map((choice, idx) => {
                const isSelected = selectedChoiceIdx === idx;
                const isCorrect = choice.is_correct;
                
                let variant = "default";
                if (isFinalized) {
                  if (isSelected) {
                    variant = isCorrect ? "correct" : "incorrect";
                  } else if (isCorrect) {
                    variant = "highlight";
                  } else {
                    variant = "disabled";
                  }
                } else if (isSelected) {
                  variant = "selected";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleChoiceSelect(idx)}
                    disabled={isFinalized}
                    className={cn(
                      "p-8 rounded-[2rem] text-left font-black text-xl transition-all border-2 flex items-center justify-between group",
                      variant === "default" && "bg-white border-slate-100 hover:border-accent/30 hover:bg-accent/5 text-slate-600",
                      variant === "selected" && "bg-accent/10 border-accent text-accent",
                      variant === "correct" && "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100",
                      variant === "incorrect" && "bg-red-50 border-red-500 text-red-700",
                      variant === "highlight" && "bg-emerald-50/50 border-emerald-200 text-emerald-400 opacity-50",
                      variant === "disabled" && "opacity-30 grayscale cursor-not-allowed"
                    )}
                  >
                    <span>{choice.text}</span>
                    <div className="flex items-center gap-3">
                      {isFinalized && isSelected && (
                        <span className={cn(
                          "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full",
                          isCorrect ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"
                        )}>
                          {choice.xp_change > 0 ? `+${choice.xp_change}` : choice.xp_change} XP
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Section */}
          {isFinalized && selectedChoiceIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-10 rounded-[3rem] border-2 space-y-6 shadow-2xl",
                currentStep.choices[selectedChoiceIdx].is_correct 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-900" 
                  : "bg-amber-50 border-amber-100 text-amber-900"
              )}
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                  currentStep.choices[selectedChoiceIdx].is_correct ? "bg-emerald-200" : "bg-amber-200"
                )}>
                  {currentStep.choices[selectedChoiceIdx].is_correct ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                </div>
                <h5 className="text-2xl font-black tracking-tight">
                  {currentStep.choices[selectedChoiceIdx].result}
                </h5>
              </div>
              <p className="text-xl leading-relaxed font-medium italic border-t border-black/5 pt-6">
                {currentStep.choices[selectedChoiceIdx].reason}
              </p>
              
              <button
                onClick={handleNext}
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl mt-4"
              >
                {currentStepIdx === data.steps.length - 1 ? "Ավարտել Սցենարը" : "Հաջորդ իրավիճակը"}
                <ArrowRight size={24} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
