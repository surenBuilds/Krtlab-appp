import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Sector
} from 'recharts';
import { UserProfile } from '../types';
import { CATEGORIES } from '../data/categories';
import { Award, Zap, Target, TrendingUp, Brain, BookOpen, Clock, Flame, Rocket, RefreshCcw, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { StreakCalendar } from './StreakCalendar';
import { AchievementsList } from './AchievementsList';
import { DailyChallenge } from './DailyChallenge';

interface DashboardProps {
  profile: UserProfile;
  onSync?: () => void;
  isLoggedIn?: boolean;
  onStartLesson: (categoryId: string, subfieldId: string, levelId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onSync, isLoggedIn, onStartLesson }) => {
  const totalLevels = CATEGORIES.reduce((acc, cat) => acc + cat.subfields.length * 20, 0);
  
  const getSubfieldProgress = (catId: string, subId: string) => {
    const subfield = profile.progress.categories[catId]?.subfields[subId];
    if (!subfield || !subfield.stageStatus) return [];
    
    // A level is completed if explicitly marked or if all stages are done
    return Object.keys(subfield.stageStatus).filter(levelId => {
      const status = subfield.stageStatus[Number(levelId)];
      return status.isFullyCompleted || (status.lesson && status.quiz && status.practice && status.game);
    }).map(Number);
  };

  const completedCount = CATEGORIES.reduce((acc, cat) => {
    return acc + cat.subfields.reduce((subAcc, sub) => {
      return subAcc + getSubfieldProgress(cat.id, sub.id).length;
    }, 0);
  }, 0);

  const progressPercent = Math.round((completedCount / totalLevels) * 100) || 0;

  const subfieldProgress = CATEGORIES.flatMap(cat => 
    cat.subfields.map(sub => ({
      name: sub.title,
      category: cat.title,
      completed: getSubfieldProgress(cat.id, sub.id).length,
      total: 20,
      percent: Math.round((getSubfieldProgress(cat.id, sub.id).length / 20) * 100),
      color: getCategoryColor(cat.id)
    }))
  );

  const strengths = [...subfieldProgress]
    .filter(s => s.completed > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  const categoryProgress = CATEGORIES.map(cat => {
    const completedInCat = cat.subfields.reduce((acc, sub) => acc + getSubfieldProgress(cat.id, sub.id).length, 0);
    const totalInCat = cat.subfields.length * 20;
    return {
      name: cat.title,
      progress: Math.round((completedInCat / totalInCat) * 100),
      color: getCategoryColor(cat.id)
    };
  }).filter(c => c.progress > 0);

  const isStreakAtRisk = React.useMemo(() => {
    if (!profile?.lastStreakUpdate || profile.streak === 0) return false;
    const now = new Date();
    const last = new Date(profile.lastStreakUpdate);
    return now.toDateString() !== last.toDateString();
  }, [profile]);

  return (
    <div className="space-y-10">
      {!isLoggedIn && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/10 border border-accent/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
              <RefreshCcw className="text-accent animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Պահպանեք ձեր առաջընթացը</h4>
              <p className="text-sm text-slate-500 font-medium">Միացրեք Google հաշիվը՝ բոլոր սարքերով սինխրոնիզացնելու համար:</p>
            </div>
          </div>
          <button 
            onClick={onSync}
            className="flex items-center gap-3 bg-white border-2 border-accent/20 text-slate-700 px-8 py-3.5 rounded-[1.2rem] font-black hover:bg-accent/5 transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Սինխրոնիզացնել Google-ով
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <StatCard 
          icon={<Star className="text-primary" />} 
          label="Մակարդակ" 
          value={profile.level.toString()} 
          subValue={`Մակարդակ ${profile.level}`}
          color="primary"
        />
        <StatCard 
          icon={<Zap className="text-accent" />} 
          label="Միավորներ (Points)" 
          value={(profile.points || 0).toLocaleString()} 
          subValue={`${profile.xp.toLocaleString()} XP`}
          color="accent"
        />
        <StatCard 
          icon={<Target className="text-amber-500" />} 
          label="Հաջորդ մակարդակ" 
          value={((profile.level - 1) * 5000 - profile.xp).toLocaleString()} 
          subValue="XP մինչև +1 LVL"
          color="amber"
        />
        <StatCard 
          icon={<Zap className={cn(isStreakAtRisk ? "text-amber-600 animate-pulse" : "text-emerald-500")} />} 
          label="Օրական շղթա" 
          value={profile.streak.toString()} 
          subValue={isStreakAtRisk ? "Վտանգված է: Շարունակեք հիմա" : "օր անընդմեջ"}
          color={isStreakAtRisk ? "amber" : "emerald"}
          isAtRisk={isStreakAtRisk}
        />
        <StatCard 
          icon={<Award className="text-secondary" />} 
          label="Ձեռքբերումներ" 
          value={profile.achievements.length.toString()} 
          subValue="նոր նպատակներ"
          color="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <DailyChallenge profile={profile} onStartLesson={onStartLesson} />
           
           <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Առաջընթացն ըստ բնագավառների</h3>
              <p className="text-sm text-slate-500 font-medium">Քո ուսումնական ակտիվությունը</p>
            </div>
            <div className="flex items-center gap-2 bg-accent/10 px-5 py-2.5 rounded-2xl border border-accent/20">
              <TrendingUp size={18} className="text-accent" />
              <span className="text-sm font-black text-accent">{progressPercent}% Ավարտված</span>
            </div>
          </div>
          {categoryProgress.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryProgress} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} 
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                      padding: '16px 20px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="progress" radius={[14, 14, 0, 0]} barSize={44}>
                    {categoryProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400 gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
                <BookOpen size={40} />
              </div>
              <p className="text-sm font-medium italic">Սկսեք սովորել՝ առաջընթացը տեսնելու համար</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-brand p-10 rounded-[3rem] shadow-2xl shadow-primary/20 text-white flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[100px] rounded-full -mr-40 -mt-40 group-hover:bg-accent/30 transition-all duration-700" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <Brain size={24} className="text-accent" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Ուսումնական Վիճակագրություն</h3>
            </div>

            <div className="space-y-10">
              <div>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-5xl font-black tracking-tighter">{progressPercent}%</span>
                  <span className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Ընդհանուր առաջընթաց</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-accent rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/10 shadow-lg">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Ավարտված</p>
                  <p className="text-3xl font-black">{completedCount}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/10 shadow-lg">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Մնացած</p>
                  <p className="text-3xl font-black">{totalLevels - completedCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-white/10 relative">
            <p className="text-sm text-white/70 leading-relaxed font-medium">
              Դու ավելի լավ ես սովորում, քան օգտատերերի <span className="text-accent font-black">75%-ը</span>: Շարունակիր նույն ոգով:
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <StreakCalendar 
            streak={profile.streak} 
            activityHistory={profile.activityHistory || []} 
          />
        </div>
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm">
              <Zap size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ուժեղ կողմեր</h3>
          </div>
          <div className="space-y-8">
            {strengths.length > 0 ? strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all group-hover:scale-110" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-black text-slate-800 text-lg">{s.name}</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.category}</span>
                  </div>
                  <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.percent}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full shadow-sm"
                      style={{ backgroundColor: s.color }}
                    />
                  </div>
                </div>
                <div className="text-right min-w-[60px]">
                  <span className="text-xl font-black text-slate-900">{s.percent}%</span>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center text-slate-400 font-medium italic">
                Դեռևս չկան բավարար տվյալներ ուժեղ կողմերը որոշելու համար
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AchievementsList unlockedIds={profile.achievements} />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color, isAtRisk }: { icon: React.ReactNode, label: string, value: string, subValue: string, color: string, isAtRisk?: boolean }) => (
  <div className={cn(
    "bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border transition-all group hover:-translate-y-1",
    isAtRisk ? "border-amber-200 shadow-amber-100/50" : "border-slate-100"
  )}>
    <div className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-all group-hover:scale-110",
      color === 'accent' ? "bg-accent/10" : 
      color === 'primary' ? "bg-primary/10" : 
      color === 'emerald' ? "bg-emerald-50" : 
      color === 'amber' ? "bg-amber-50" : "bg-secondary/10"
    )}>
      {icon}
    </div>
    <span className={cn(
      "text-[10px] font-black uppercase tracking-widest",
      isAtRisk ? "text-amber-600" : "text-slate-400"
    )}>{label}</span>
    <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">{value}</span>
    <span className={cn(
      "text-xs font-bold",
      isAtRisk ? "text-amber-500" : "text-slate-500"
    )}>{subValue}</span>
  </div>
);

function getCategoryColor(id: string) {
  const colors: Record<string, string> = {
    finance: '#1E3A8A', // Primary
    business: '#7C3AED', // Secondary
    tech: '#06B6D4', // Accent
    languages: '#06B6D4', // Accent
    'natural-sciences': '#10b981',
    humanities: '#f59e0b',
    'political-science': '#8b5cf6',
    law: '#ef4444',
    'urban-planning': '#ec4899',
    aviation: '#f97316',
    transport: '#64748b',
    space: '#0f172a',
    industry: '#475569'
  };
  return colors[id] || '#cbd5e1';
}
