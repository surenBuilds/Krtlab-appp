import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Code, 
  Megaphone, 
  Languages, 
  Clock, 
  BookOpen, 
  Play, 
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface GoalDiscoveryProps {
  onComplete: (answers: any) => void;
}

const STEPS = [
  {
    id: 'goal',
    title: 'Ո՞րն է քո հիմնական նպատակը:',
    options: [
      { id: 'programmer', label: 'Դառնալ ծրագրավորող', icon: Code },
      { id: 'marketing', label: 'Սովորել մարքեթինգ', icon: Megaphone },
      { id: 'english', label: 'Բարելավել անգլերենը', icon: Languages },
      { id: 'other', label: 'Այլ (ինքնազարգացում)', icon: Target },
    ]
  },
  {
    id: 'skillLevel',
    title: 'Ինչպիսի՞ն է քո գիտելիքների մակարդակը:',
    options: [
      { id: 'Beginner', label: 'Սկսնակ', icon: Zap },
      { id: 'Intermediate', label: 'Միջին', icon: BookOpen },
      { id: 'Advanced', label: 'Բարձր', icon: Sparkles },
    ]
  },
  {
    id: 'dailyTime',
    title: 'Որքա՞ն ժամանակ ես պատրաստ տրամադրել օրական:',
    options: [
      { id: '10', label: '10 րոպե', icon: Clock },
      { id: '30', label: '30 րոպե', icon: Clock },
      { id: '60', label: '1 ժամ և ավելի', icon: Clock },
    ]
  },
  {
    id: 'style',
    title: 'Ո՞րն է քո սիրած ուսումնական ոճը:',
    options: [
      { id: 'reading', label: 'Կարդալ', icon: BookOpen },
      { id: 'video', label: 'Դիտել (Տեսադասեր)', icon: Play },
      { id: 'practice', label: 'Գործնական (Պրակտիկա)', icon: Target },
    ]
  }
];

export const GoalDiscovery: React.FC<GoalDiscoveryProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [STEPS[currentStep].id]: optionId };
    setAnswers(newAnswers);
    
    if (currentStep < STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => onComplete(newAnswers), 300);
    }
  };

  const stepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 overflow-hidden border border-slate-100"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-50">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="space-y-12">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                Քայլ {currentStep + 1} / {STEPS.length}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {stepData.title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {stepData.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={cn(
                      "flex items-center gap-6 p-6 rounded-3xl border-2 transition-all group text-left",
                      answers[stepData.id] === option.id
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                        : "bg-white border-slate-100 hover:border-primary/30 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      answers[stepData.id] === option.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                    )}>
                      <option.icon size={28} />
                    </div>
                    <div className="flex-1">
                      <span className={cn(
                        "text-lg font-black tracking-tight block",
                        answers[stepData.id] === option.id ? "text-primary" : "text-slate-900"
                      )}>
                        {option.label}
                      </span>
                    </div>
                    {answers[stepData.id] === option.id && (
                      <CheckCircle2 size={24} className="text-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-2 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={20} />
              Հետ
            </button>
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    i === currentStep ? "w-6 bg-primary" : "bg-slate-100"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
