import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Target, ChevronRight, BrainCircuit, Clock, Zap, CheckCircle2, Plus, BarChart3 } from "lucide-react";
import { cn } from "../lib/utils";
import { useUserProfile } from "../hooks/useUserProfile";
import { decomposeGoal, buildSkillGraph, computeNextAction, diagnoseSkills, type DecomposedGoal } from "../services/intelligenceEngine";
import type { Goal } from "../types/domain";

export const GoalSystem: React.FC = () => {
  const { profile } = useUserProfile();
  const gp = profile as any;
  const [goalInput, setGoalInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [decomposedGoal, setDecomposedGoal] = useState<DecomposedGoal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const baseline = useMemo(() => diagnoseSkills(gp), [profile]);

  const handleSetGoal = () => {
    if (!goalInput.trim()) return;
    setLoading(true);
    const currentSkills = baseline.filter(b => b.masteryScore > 30).map(b => b.skillId);
    const result = decomposeGoal(goalInput, gp.discovery?.goal || "career", 12, currentSkills);
    setDecomposedGoal(result);
    setGoals([result.goal, ...goals]);
    setGoalInput("");
    setLoading(false);
  };

  return <div className="space-y-8">
    <div><h2 className="text-4xl font-black flex items-center gap-3"><Target className="text-primary" size={32}/>Goal System</h2><p className="text-slate-500 mt-2">Set a goal, KrtLab builds your path</p></div>
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <h3 className="text-lg font-black mb-4">What goal do you want to achieve?</h3>
      <div className="flex gap-3">
        <input type="text" value={goalInput} onChange={e=>setGoalInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSetGoal()} placeholder="e.g. I want to learn Python and build AI apps in 12 months" className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary font-medium"/>
        <button onClick={handleSetGoal} disabled={loading||!goalInput.trim()} className="px-8 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"><Plus size={18}/>Create</button>
      </div>
    </div>
    {goals.length > 0 && goals.map(goal=><motion.div key={goal.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="flex items-start justify-between"><div><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Target size={20} className="text-primary"/></div><h3 className="text-xl font-black">{goal.title}</h3></div><p className="text-slate-500 text-sm">{goal.description}</p></div><span className={cn("px-3 py-1 rounded-xl text-xs font-bold",goal.status==="active"?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-500")}>{goal.status}</span></div>
        <div className="mt-4 flex gap-6 text-sm"><span className="flex items-center gap-2"><Clock size={14}/>{goal.estimatedHours}h</span><span className="flex items-center gap-2"><BrainCircuit size={14}/>{goal.linkedSkillIds.length} skills</span><span className="flex items-center gap-2"><BarChart3 size={14}/>{goal.progress}%</span></div>
      </div>
    </motion.div>)}
    {decomposedGoal && <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
      <h3 className="text-xl font-black flex items-center gap-2"><BrainCircuit size={20}/>Your Learning Path</h3>
      <div><h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Required Skills</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {decomposedGoal.requiredSkills.map(s=>{const bl=baseline.find(b=>b.skillId===s.skillId);return<div key={s.skillId} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50"><div className="flex-1"><div className="font-bold text-sm">{bl?.name||s.skillId}</div><div className="flex items-center gap-2 mt-1"><div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${bl?.masteryScore||0}%`}}/></div><span className="text-xs text-slate-400">{bl?.masteryScore||0}%</span></div></div><span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold",s.priority==="high"?"bg-red-100 text-red-600":"bg-slate-200 text-slate-600")}>{s.priority}</span></div>})}
        </div>
      </div>
      <div><h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Milestones</h4>
        <div className="space-y-2">{decomposedGoal.milestones.map((m,i)=><div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50"><div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary">{m.order}</div><div className="flex-1"><div className="font-bold">{m.title}</div><div className="text-xs text-slate-400">{m.estimatedWeeks} weeks</div></div><ChevronRight size={18} className="text-slate-300"/></div>)}</div>
      </div>
      <div><h4 className="text-sm font-bold text-slate-500 uppercase mb-3">First 4 Weeks</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">{decomposedGoal.learningPlan.slice(0,4).map((w,i)=><div key={i} className="p-4 rounded-2xl bg-slate-50"><div className="text-xs font-bold text-slate-400 mb-1">Week {w.week}</div><div className="font-black text-sm mb-2">{w.focus}</div><div className="space-y-1">{w.tasks.slice(0,3).map((t,j)=><div key={j} className="text-xs text-slate-500 flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500"/>{t}</div>)}</div></div>)}</div>
      </div>
    </motion.div>}
  </div>;
};
export default GoalSystem;