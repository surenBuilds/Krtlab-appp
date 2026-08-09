import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Briefcase, Award, Github, Globe, Star, BookOpen, Zap, CheckCircle2, ExternalLink, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { SKILL_DEFINITIONS } from "../../data/skillMappings";
import { CATEGORIES } from "../../data/categories";
import type { GrowthProfile } from "../../types/learner";

export const LivePortfolio: React.FC = () => {
  const { profile } = useUserProfile();
  const gp = profile as unknown as GrowthProfile;
  const strengths = gp?.strengths || [];

  const learningProgress = useMemo(() => {
    if (!profile?.progress?.categories) return [];
    const items: { title: string; progress: number; subfield: string }[] = [];
    Object.entries(profile.progress.categories).forEach(([catId, cat]: [string, any]) => {
      Object.entries(cat.subfields || {}).forEach(([subId, sub]: [string, any]) => {
        const completed = sub.completedLessons?.length || 0;
        if (completed > 0) items.push({ title: subId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), progress: Math.round((completed / 20) * 100), subfield: subId });
      });
    });
    return items.sort((a, b) => b.progress - a.progress);
  }, [profile]);

  const skillsForPortfolio = useMemo(() => SKILL_DEFINITIONS.filter((s) => strengths.includes(s.id)).slice(0, 8), [strengths]);

  return (<div className="space-y-8">
    <div><h2 className="text-4xl font-black text-slate-900 flex items-center gap-3"><Briefcase className="text-primary" size={32}/>Live Portfolio</h2><p className="text-slate-500 mt-2">Ավտոմատ թարմացվող պորտֆոլիո — յուրաքանչյուր սովորելուց հետո</p></div>

    {/* Hero */}
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
      <div className="flex items-start gap-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-black">{profile?.name?.charAt(0) || "K"}</div>
        <div className="flex-1">
          <h3 className="text-3xl font-black text-slate-900">{profile?.name || "Your Name"}</h3>
          <p className="text-slate-500 mt-1">{profile?.school || "KrtLab Learner"}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-bold">Level {profile?.level || 1}</span>
            <span className="px-4 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold">{profile?.streak || 0} day streak</span>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold">{profile?.xp || 0} XP</span>
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold">{strengths.length} skills</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Skills */}
      <div className="bg-white rounded-[2rem] border p-6 shadow-sm">
        <h4 className="font-black text-lg flex items-center gap-2 mb-4"><Zap size={18} className="text-primary"/>Skills</h4>
        {skillsForPortfolio.length > 0 ? <div className="space-y-2">{skillsForPortfolio.map((s) => (<div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-sm font-bold">{s.name}</span><CheckCircle2 size={16} className="text-emerald-500"/></div>))}</div> : <p className="text-sm text-slate-400">Complete lessons to build your skill portfolio</p>}
      </div>

      {/* Learning Progress */}
      <div className="bg-white rounded-[2rem] border p-6 shadow-sm">
        <h4 className="font-black text-lg flex items-center gap-2 mb-4"><BookOpen size={18} className="text-primary"/>Learning</h4>
        {learningProgress.length > 0 ? <div className="space-y-3">{learningProgress.slice(0, 6).map((l) => (<div key={l.subfield}><div className="flex justify-between text-xs mb-1"><span className="font-bold capitalize">{l.title}</span><span className="text-slate-400">{l.progress}%</span></div><div className="w-full h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-primary rounded-full" style={{width:`${l.progress}%`}}/></div></div>))}</div> : <p className="text-sm text-slate-400">Start learning to see progress</p>}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-[2rem] border p-6 shadow-sm">
        <h4 className="font-black text-lg flex items-center gap-2 mb-4"><Award size={18} className="text-primary"/>Achievements</h4>
        <div className="space-y-2">
          {profile?.streak && profile.streak >= 3 && <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl"><Star size={16} className="text-emerald-600"/><span className="text-sm font-bold">{profile.streak} day streak</span></div>}
          {strengths.length >= 3 && <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"><Award size={16} className="text-blue-600"/><span className="text-sm font-bold">{strengths.length} skills mastered</span></div>}
          {profile?.xp && profile.xp >= 1000 && <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl"><TrendingUp size={16} className="text-amber-600"/><span className="text-sm font-bold">{Math.floor(profile.xp / 1000)}k XP earned</span></div>}
          {(!profile?.streak || profile.streak < 3) && <p className="text-sm text-slate-400">Keep learning to earn achievements</p>}
        </div>
      </div>
    </div>
  </div>);
};
