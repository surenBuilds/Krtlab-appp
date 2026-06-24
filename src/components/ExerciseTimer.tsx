import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Timer as TimerIcon, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ExerciseTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
}

export const ExerciseTimer: React.FC<ExerciseTimerProps> = ({ duration, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isActive]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 5;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
        <div className={cn(
          "flex items-center gap-2 transition-all duration-300",
          isLow ? "text-red-500 animate-pulse scale-110" : "text-slate-400"
        )}>
          <TimerIcon size={16} className={cn(isLow ? "text-red-500" : "text-accent")} />
          <span>{timeLeft} վայրկյան</span>
        </div>
        {isLow && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-red-500"
          >
            <AlertCircle size={14} />
            <span>Շտապիր:</span>
          </motion.div>
        )}
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "linear" }}
          className={cn(
            "h-full rounded-full transition-all duration-300 shadow-sm",
            isLow ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-brand"
          )}
        />
      </div>
    </div>
  );
};
