import React from 'react';
import { motion } from 'motion/react';
import { Flame, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface StreakCalendarProps {
  streak: number;
  activityHistory: string[];
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ streak, activityHistory }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dayNames = ['Կիր', 'Երկ', 'Երք', 'Չոր', 'Հին', 'Ուրբ', 'Շաբ'];

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center shadow-sm">
            <Flame size={28} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{streak} Օրվա Շղթա</h3>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Բաց մի թող ոչ մի օր</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-6">
        {last7Days.map((dateStr, i) => {
          const date = new Date(dateStr);
          const isActive = activityHistory.includes(dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div key={i} className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {dayNames[date.getDay()]}
              </span>
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                  backgroundColor: isActive ? '#7C3AED' : '#f8fafc',
                  borderColor: isToday ? '#7C3AED' : isActive ? '#7C3AED' : '#f1f5f9'
                }}
                className={cn(
                  "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-sm",
                  isActive ? "text-white shadow-xl shadow-secondary/20" : "text-slate-300"
                )}
              >
                {isActive ? <Check size={24} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
              </motion.div>
              {isToday && (
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Այսօր</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 bg-secondary/5 rounded-[2rem] border border-secondary/10 shadow-sm">
        <p className="text-sm text-secondary leading-relaxed text-center font-black uppercase tracking-widest">
          {streak >= 3 
            ? "Դու հիանալի ես շարժվում: Շարունակիր նույն տեմպով:" 
            : "Սկսիր քո ուսումնական շղթան այսօր և տես արդյունքը:"}
        </p>
      </div>
    </div>
  );
};
