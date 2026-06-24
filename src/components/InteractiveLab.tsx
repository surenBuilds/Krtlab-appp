import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Target, Brain, ArrowRight, CheckCircle2, XCircle, Info, Trophy, ChevronRight } from 'lucide-react';
import { InteractiveExercise } from '../types';
import { cn } from '../lib/utils';

interface InteractiveLabProps {
  exercises: InteractiveExercise[];
  onComplete: (totalPoints: number) => void;
}

export const InteractiveLab: React.FC<InteractiveLabProps> = ({ exercises, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentExercise = exercises[currentIdx];

  const handleSubmit = () => {
    if (isAnswered) return;

    let correct = false;
    const answer = currentExercise.type === 'multiple-choice' ? selectedOption : shortAnswer.trim();
    
    // Normalize for comparison
    const normalizedAnswer = String(answer).toLowerCase();
    const normalizedCorrect = String(currentExercise.correctAnswer).toLowerCase();

    if (currentExercise.type === 'calculation') {
      // Allow slight decimal diff if needed, but usually exact for these
      correct = parseFloat(normalizedAnswer) === parseFloat(normalizedCorrect);
    } else {
      correct = normalizedAnswer === normalizedCorrect;
    }

    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setTotalPoints(prev => prev + currentExercise.points);
    }
  };

  const handleNext = () => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShortAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] p-12 border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] text-center space-y-8"
      >
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Trophy size={48} className="text-amber-500" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Interactive Lab Completed!</h2>
          <p className="text-xl text-slate-500 font-medium">
            You've successfully navigated the real-world applications of this lesson.
          </p>
        </div>
        
        <div className="flex justify-center gap-8 py-6">
          <div className="text-center">
            <div className="text-4xl font-black text-accent">{totalPoints}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Total Points</div>
          </div>
          <div className="w-px h-12 bg-slate-100 mt-2" />
          <div className="text-center">
            <div className="text-4xl font-black text-emerald-500">{exercises.length}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Exercises Done</div>
          </div>
        </div>

        <button
          onClick={() => onComplete(totalPoints)}
          className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest group"
        >
          Proceed to Knowledge Check
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
            currentExercise.difficulty === 'Beginner' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            currentExercise.difficulty === 'Intermediate' ? "bg-blue-50 text-blue-600 border-blue-100" :
            "bg-purple-50 text-purple-600 border-purple-100"
          )}>
            {currentExercise.difficulty} Level
          </div>
          <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
            Exercise {currentIdx + 1} of {exercises.length}
          </div>
        </div>
        <div className="flex gap-2">
          {exercises.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentIdx ? "w-8 bg-accent" : i < currentIdx ? "w-4 bg-emerald-400" : "w-4 bg-slate-200"
              )} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-[3rem] p-10 border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8"
        >
          <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles size={100} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target size={16} /> The Scenario
            </h3>
            <p className="text-xl text-slate-800 font-bold leading-relaxed relative italic">
              "{currentExercise.scenario}"
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentExercise.question}
            </h4>

            {currentExercise.type === 'multiple-choice' && (
              <div className="grid gap-4">
                {currentExercise.options?.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => setSelectedOption(option)}
                    className={cn(
                      "w-full p-6 rounded-2xl border-4 text-left font-bold transition-all flex items-center justify-between group",
                      selectedOption === option 
                        ? (isAnswered 
                            ? (isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-red-500 bg-red-50 text-red-900")
                            : "border-accent bg-accent/5 text-slate-900")
                        : "border-slate-100 hover:border-slate-200 text-slate-600 bg-white"
                    )}
                  >
                    <span>{option}</span>
                    {selectedOption === option && isAnswered && (
                      isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {(currentExercise.type === 'calculation' || currentExercise.type === 'short-answer') && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  disabled={isAnswered}
                  placeholder={currentExercise.type === 'calculation' ? "Enter numerical value..." : "Type your answer..."}
                  className={cn(
                    "w-full p-6 rounded-2xl border-4 outline-none font-bold text-xl transition-all",
                    isAnswered 
                      ? (isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-red-500 bg-red-50 text-red-900")
                      : "border-slate-100 focus:border-accent bg-slate-50"
                  )}
                />
              </div>
            )}

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-8 rounded-[2rem] border-2 space-y-3",
                  isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                )}
              >
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-black uppercase tracking-widest text-xs">
                      <CheckCircle2 size={16} /> Correct! +{currentExercise.points} XP
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700 font-black uppercase tracking-widest text-xs">
                      <XCircle size={16} /> Incorrect
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-3">
                   <Info size={18} className={cn("mt-1 shrink-0", isCorrect ? "text-emerald-500" : "text-red-500")} />
                   <p className={cn("font-medium italic leading-relaxed", isCorrect ? "text-emerald-900" : "text-red-900")}>
                    {currentExercise.explanation}
                   </p>
                </div>
              </motion.div>
            )}

            {!isAnswered ? (
              <button
                disabled={currentExercise.type === 'multiple-choice' ? !selectedOption : !shortAnswer.trim()}
                onClick={handleSubmit}
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 uppercase tracking-widest group"
              >
                {currentIdx < exercises.length - 1 ? 'Next Exercise' : 'Complete Lab'}
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
