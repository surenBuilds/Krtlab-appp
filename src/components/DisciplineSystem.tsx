import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Zap, 
  Calendar, 
  Flame, 
  Star,
  ChevronRight,
  Target
} from 'lucide-react';
import { DailyTask } from '../types';
import { cn } from '../lib/utils';

interface DisciplineSystemProps {
  daysCount: number;
  streak: number;
  tasks: DailyTask[];
  onToggleTask: (taskId: string) => void;
  xp: number;
  level: number;
}

export const DisciplineSystem: React.FC<DisciplineSystemProps> = ({ 
  daysCount, 
  streak, 
  tasks = [], 
  onToggleTask,
  xp,
  level
}) => {
  const completedCount = (tasks || []).filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Discipline Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 transition-all group-hover:bg-primary/30" />
        
        <div className="relative space-y-12">
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
              <Calendar size={32} className="text-primary" />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Կարգապահություն</span>
              <div className="flex items-center gap-2">
                <Flame size={20} className={cn("transition-colors", streak > 0 ? "text-orange-500" : "text-slate-600")} />
                <span className="text-3xl font-black">{streak} Օր</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-5xl font-black tracking-tighter leading-none">
              ՕՐ {streak}
              <span className="block text-xl text-slate-400 font-bold mt-2 tracking-normal">Կարգապահության ուղի</span>
            </h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Յուրաքանչյուր օր կատարված առաջադրանքները մոտեցնում են քեզ քո նպատակին:
            </p>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
              <span className="text-slate-400">Օրվա առաջընթաց</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(var(--color-primary),0.5)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">XP / ՀԱՋՈՐԴ ՄԱԿԱՐԴԱԿ</div>
              <div className="text-2xl font-black text-amber-500">
                {xp.toLocaleString()} 
                <span className="text-[10px] block text-slate-400 font-bold mt-1">
                  {((level - 1) * 5000 - xp).toLocaleString()} XP մինչև հաջորդը
                </span>
              </div>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ՄԱԿԱՐԴԱԿ</div>
              <div className="text-4xl font-black text-primary">{level}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tasks Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
      >
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                <Target size={14} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Օրվա Առաջադրանքներ</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ի՞նչ ենք անում այսօր</h3>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-slate-900">{completedCount}/{tasks.length}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Կատարված</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task, idx) => (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                onClick={() => onToggleTask(task.id)}
                className={cn(
                  "flex items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all group text-left",
                  task.completed 
                    ? "bg-emerald-50 border-emerald-100 shadow-lg shadow-emerald-200/10"
                    : "bg-white border-slate-50 hover:border-primary/20 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  task.completed ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-300 group-hover:text-primary"
                )}>
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <div className="flex-1">
                  <span className={cn(
                    "text-lg font-black tracking-tight block",
                    task.completed ? "text-emerald-700 decoration-emerald-500/30" : "text-slate-900"
                  )}>
                    {task.title}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {task.type === 'lesson' ? 'Դաս' : task.type === 'quiz' ? 'Թեստ' : task.type === 'flashcard' ? 'Կրկնություն' : 'Նախագիծ'}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100/50 flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <Star size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-blue-900 tracking-tight">Խորհուրդ</h4>
              <p className="text-blue-700/70 font-medium">Կատարիր բոլոր առաջադրանքները՝ շղթան պահպանելու և լրացուցիչ +100 XP ստանալու համար:</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
