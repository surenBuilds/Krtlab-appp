import React from 'react';
import { motion } from 'motion/react';
import { Award, Lock, Rocket, Flame, Zap, Wallet, Cpu, Trophy } from 'lucide-react';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import { cn } from '../lib/utils';

interface AchievementsListProps {
  unlockedIds: string[];
}

const IconMap: Record<string, any> = {
  Rocket,
  Flame,
  Zap,
  Wallet,
  Cpu,
  Trophy
};

export const AchievementsList: React.FC<AchievementsListProps> = ({ unlockedIds }) => {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shadow-sm">
          <Award size={28} className="text-accent" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ձեռքբերումներ</h3>
          <p className="text-sm text-slate-500 font-medium">Քո հաջողությունների պատմությունը</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const Icon = IconMap[achievement.icon] || Award;

          return (
            <motion.div 
              key={achievement.id}
              whileHover={isUnlocked ? { y: -4, scale: 1.02 } : {}}
              className={cn(
                "p-6 rounded-[2rem] border-2 transition-all flex items-center gap-6 relative overflow-hidden group",
                isUnlocked 
                  ? "bg-white border-accent/20 shadow-xl shadow-accent/5" 
                  : "bg-slate-50 border-slate-100 opacity-60 grayscale"
              )}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-accent/10 transition-all duration-500" />
              )}
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500 group-hover:rotate-6",
                isUnlocked ? "bg-gradient-brand text-white shadow-primary/20" : "bg-slate-200 text-slate-400"
              )}>
                {isUnlocked ? <Icon size={32} /> : <Lock size={24} />}
              </div>
              <div className="relative z-10">
                <h4 className={cn("font-black text-lg tracking-tight", isUnlocked ? "text-slate-900" : "text-slate-500")}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{achievement.description}</p>
                {isUnlocked && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-black text-accent uppercase tracking-widest">
                    <Zap size={14} className="fill-accent" />
                    <span>+{achievement.reward} XP</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
