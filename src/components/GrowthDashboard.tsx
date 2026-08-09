import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { BrainCircuit, Zap, Trophy, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import { useUserProfile } from "../hooks/useUserProfile";
import { buildSkillGraph, diagnoseSkills, computeNextAction, generateDailyMission } from "../services/intelligenceEngine";
import type { Goal } from "../types/domain";

export const GrowthDashboard: React.FC = () => {
  const { profile } = useUserProfile();
  const gp = profile as any;
  const [showAllSkills, setShowAllSkills] = useState(false);
  const skillGraph = useMemo(() => buildSkillGraph(gp), [profile]);
  const baseline = useMemo(() => diagnoseSkills(gp), [profile]);
  const goals: Goal[] = [];
  const nextAction = useMemo(() => computeNextAction(skillGraph, goals), [skillGraph, goals.length]);
  const mission = useMemo(() => generateDailyMission(skillGraph, goals, gp), [skillGraph, goals.length, profile]);
  const topSkills = useMemo(() => baseline.filter(b => b.masteryScore > 0).slice(0, showAllSkills ? 20 : 6), [baseline, showAllSkills]);
  const strengths = useMemo(() => baseline.filter(b => b.masteryScore > 50).map(b => b.name).slice(0, 5), [baseline]);
  const weaknesses = useMemo(() => baseline.filter(b => b.masteryScore > 0 && b.masteryScore < 30).map(b => b.name).slice(0, 5), [baseline]);

  return <div className="space-y-8">
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-300">
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div><p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Your Mission</p><h1 className="text-4xl font-black tracking-tight">Growth Dashboard</h1><p className="text-slate-400 mt-3 text-lg">Where am I → where am I going → what should I do today</p></div>
        <div className="flex gap-4"><div className="text-center bg-white/10 rounded-2xl p-4"><div className="text-3xl font-black">{gp?.xp||0}</div><div className="text-xs text-slate-400">XP</div></div><div className="text-center bg-white/10 rounded-2xl p-4"><div className="text-3xl font-black">{gp?.streak||0}d</div><div className="text-xs text-slate-400">Streak</div></div><div className="text-center bg-white/10 rounded-2xl p-4"><div className="text-3xl font-black">Lv.{gp?.level||1}</div><div className="text-xs text-slate-400">Level</div></div></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-black flex items-center gap-2"><BrainCircuit size={20}/>Skill Graph</h3><button onClick={()=>setShowAllSkills(!showAllSkills)} className="text-sm text-primary font-bold">{showAllSkills?"Show less":`View all ${baseline.length} skills`}</button></div>
        <div className="space-y-3">{topSkills.map(skill=><div key={skill.skillId}><div className="flex items-center justify-between mb-1"><span className="text-sm font-bold text-slate-700">{skill.name}</span><span className="text-xs text-slate-400">{skill.masteryScore}%</span></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${skill.masteryScore}%`}} transition={{duration:1}} className={cn("h-full rounded-full",skill.masteryScore>70?"bg-emerald-500":skill.masteryScore>40?"bg-primary":"bg-amber-500")}/></div><div className="flex items-center gap-2 mt-1"><span className="text-[10px] text-slate-400">{skill.category}</span><span className={cn("text-[10px] font-bold",skill.confidence==="high"?"text-emerald-600":skill.confidence==="medium"?"text-amber-600":"text-red-500")}>{skill.confidence}</span></div></div>)}</div>
      </div>
      <div className="space-y-6">
        <div className="bg-emerald-50 rounded-[2.5rem] p-6 border border-emerald-100"><h4 className="text-sm font-black flex items-center gap-2 mb-4"><Trophy size={16} className="text-emerald-600"/>Strengths</h4>{strengths.length>0?strengths.map((s,i)=><div key={i} className="flex items-center gap-2 py-1.5"><CheckCircle2 size={14} className="text-emerald-500"/><span className="text-sm font-medium">{s}</span></div>):<p className="text-sm text-slate-400">Complete lessons to discover strengths</p>}</div>
        <div className="bg-amber-50 rounded-[2.5rem] p-6 border border-amber-100"><h4 className="text-sm font-black flex items-center gap-2 mb-4"><AlertCircle size={16} className="text-amber-600"/>Focus Areas</h4>{weaknesses.length>0?weaknesses.map((s,i)=><div key={i} className="flex items-center gap-2 py-1.5"><AlertCircle size={14} className="text-amber-500"/><span className="text-sm font-medium">{s}</span></div>):<p className="text-sm text-slate-400">Keep learning</p>}</div>
      </div>
    </div>
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-black flex items-center gap-2"><Zap size={20} className="text-accent"/>Today's Mission</h3><span className="text-sm text-slate-400">{new Date().toLocaleDateString("hy-AM",{weekday:"long",month:"long",day:"numeric"})}</span></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mission.tasks.map((task,i)=><motion.div key={task.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className={cn("p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg",task.type==="learn"?"bg-blue-50 border-blue-100":task.type==="practice"?"bg-amber-50 border-amber-100":task.type==="build"?"bg-emerald-50 border-emerald-100":"bg-purple-50 border-purple-100")}><div className="flex items-start justify-between mb-3"><span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase",task.type==="learn"?"bg-blue-200 text-blue-700":task.type==="practice"?"bg-amber-200 text-amber-700":task.type==="build"?"bg-emerald-200 text-emerald-700":"bg-purple-200 text-purple-700")}>{task.type}</span><span className="text-xs text-slate-400">+{task.xpReward} XP</span></div><h4 className="font-bold text-sm mb-1">{task.title}</h4></motion.div>)}
      </div>
      <p className="text-center mt-6 text-sm text-slate-400 italic">«{mission.quote}»</p>
    </div>
    {nextAction&&<div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Sparkles size={28} className="text-primary"/></div><div><h4 className="text-lg font-black">AI Recommendation</h4><p className="text-slate-500 mt-1">{nextAction.reason}</p><p className="text-primary font-bold mt-2 flex items-center gap-1">{nextAction.suggestedTask}<ArrowRight size={14}/></p></div></div></div>}
  </div>;
};
export default GrowthDashboard;