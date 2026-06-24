import React, { useMemo } from 'react';
import { UserProfile, ProgressAnalysis } from '../types';
import { CATEGORIES } from '../data/categories';
import { Target, Zap, ChevronRight, Brain, AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DailyChallengeProps {
  profile: UserProfile;
  onStartLesson: (categoryId: string, subfieldId: string, levelId: number) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({ profile, onStartLesson }) => {
  const challenge = useMemo(() => {
    const adaptiveEntries = Object.entries(profile.adaptiveProgress || {}) as [string, ProgressAnalysis | null][];
    
    // 0. Revision Content for recently failed lessons
    const failures = adaptiveEntries
      .filter(([_, analysis]) => analysis && analysis.level === 'low')
      .sort((a, b) => {
        const timeA = a[1] ? new Date((a[1] as ProgressAnalysis).timestamp).getTime() : 0;
        const timeB = b[1] ? new Date((b[1] as ProgressAnalysis).timestamp).getTime() : 0;
        return timeB - timeA;
      });

    if (failures.length > 0) {
      const [lessonId, analysis] = failures[0] as [string, ProgressAnalysis];
      const [subId, levelIdStr] = lessonId.split('_');
      const levelId = parseInt(levelIdStr);
      let categoryId = '';
      let subfieldTitle = '';
      for (const cat of CATEGORIES) {
        const sub = cat.subfields.find(s => s.id === subId);
        if (sub) { categoryId = cat.id; subfieldTitle = sub.title; break; }
      }
      return {
        type: 'revision',
        title: 'Վերանայման Բովանդակություն',
        description: `Կրկնիր «${subfieldTitle}» դասը: Համակարգը նկատել է, որ այս թեման բարդ է քեզ համար:`,
        recommendation: analysis.recommendation,
        categoryId,
        subfieldId: subId,
        levelId,
        icon: <RefreshCcw className="text-red-500" />
      };
    }

    // 1. Look for weak points in adaptive progress

    // 2. Prioritize Discovery Goal
    if (profile.discovery) {
      const goal = profile.discovery.goal;
      let targetCatId = 'business';
      if (goal === 'programmer') targetCatId = 'technology';
      if (goal === 'marketing') targetCatId = 'marketing';
      if (goal === 'english') targetCatId = 'languages';

      const targetCat = CATEGORIES.find(c => c.id === targetCatId);
      if (targetCat) {
        for (const sub of targetCat.subfields) {
          const completed = profile.progress.categories[targetCatId]?.subfields[sub.id]?.completedLessons || [];
          const nextLevel = completed.length > 0 ? Math.max(...completed) + 1 : 1;
          if (nextLevel <= 20) {
            return {
              type: 'goal',
              title: 'Նպատակին ուղղված',
              description: `Քայլ դեպի քո նպատակը. «${sub.title}»`,
              categoryId: targetCatId,
              subfieldId: sub.id,
              levelId: nextLevel,
              icon: <Target className="text-primary" />
            };
          }
        }
      }
    }

    // 3. Look for the next uncompleted lesson

    // 3. Fallback: Start a new subfield in a category
    const randomCat = CATEGORIES[0];
    const randomSub = randomCat.subfields[0];
    return {
      type: 'new',
      title: 'Նոր Մարտահրավեր',
      description: `Բացահայտիր նոր թեմա. «${randomSub.title}»`,
      categoryId: randomCat.id,
      subfieldId: randomSub.id,
      levelId: 1,
      icon: <Rocket className="text-emerald-500" />
    };
  }, [profile.adaptiveProgress, profile.progress]);

  const isCompletedToday = useMemo(() => {
    // Basic check: if lastActive is today and XP increased? 
    // For now let's just show it as active.
    return false;
  }, [profile.lastActive]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150">
        {challenge.icon}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm">
            <Target className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{challenge.title}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Խելացի մարտահրավեր</p>
          </div>
        </div>
        {isCompletedToday && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 size={16} /> Ավարտված է
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <p className="text-slate-700 font-bold mb-2">{challenge.description}</p>
        {challenge.recommendation && (
          <div className="flex items-start gap-3 mt-4 text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium italic leading-relaxed">{challenge.recommendation}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => onStartLesson(challenge.categoryId, challenge.subfieldId, challenge.levelId)}
        className="w-full flex items-center justify-between px-8 py-5 bg-gradient-brand text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 transition-all glow-cyan-hover"
      >
        <span>Սկսել հիմա</span>
        <ChevronRight size={20} />
      </button>

      <div className="flex items-center justify-center gap-2 text-slate-400">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        <span className="text-[10px] font-black uppercase tracking-widest">Թարմացվում է ամեն օր</span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
      </div>
    </motion.div>
  );
};

const Rocket = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/>
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/>
  </svg>
);
