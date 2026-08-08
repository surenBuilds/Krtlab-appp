import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Loader2, Brain, Activity, Clock, TrendingUp, Target, BookOpen, Award, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { calculateGrowthScore } from "../../services/growthEngine";
import { chatWithMentor } from "../../services/geminiService";
import type { GrowthProfile } from "../../types/domain";

interface Props { isOpen: boolean; onClose: () => void }

export const GrowthAIMentor: React.FC<Props> = ({ isOpen, onClose }) => {
  const { profile } = useUserProfile();
  const userName = profile?.name || "User";
  const [messages, setMessages] = useState<{role:"user"|"ai";text:string}>([{role:"ai",text:`Ողջույն ${userName}: Ես KrtLab Growth OS AI մենթորն եմ: Ես հետևում եմ ձեր ամբողջ առաջընթացին, հմտություններին, նպատակներին և կարիերային: Ինչպե՞ս կարող եմ օգնել:`}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  const mentorContext = useMemo(() => {
    if (!profile) return "";
    const gp = profile as unknown as GrowthProfile;
    const progress = profile.progress?.categories || {};
    let completedLessons = 0, totalLevels = 0;
    Object.values(progress).forEach((cat: any) => { Object.values(cat.subfields || {}).forEach((sub: any) => { completedLessons += sub.completedLessons?.length || 0; totalLevels += 20; }); });

    return `[FULL USER CONTEXT]
Name: ${gp.name} | Level: ${gp.level} | XP: ${gp.xp} | Streak: ${gp.streak} days
Role: ${gp.role} | Language: ${gp.preferredLanguage}
Growth Score: ${calculateGrowthScore({profile:gp,skills:[],goals:[],projects:[],habits:[{currentStreak:gp.streak||0}]})}/1000

SKILLS: ${(gp.strengths||[]).join(", ") || "none yet"}
WEAKNESSES: ${(gp.weaknesses||[]).join(", ") || "none yet"}

LEARNING PROGRESS:
- Completed ${completedLessons} lessons across ${Object.keys(progress).length} categories
- ${totalLevels > 0 ? Math.round((completedLessons/totalLevels)*100) : 0}% overall completion

GOAL: ${gp.discovery?.goal||"not set"} (${gp.discovery?.skillLevel||"beginner"})
STYLE: ${gp.discovery?.style||"not set"} | DAILY TIME: ${gp.discovery?.dailyTime||"?"} min
LAST ACTIVE: ${gp.lastActive||"unknown"}

[TASK: Analyze user's progress and provide 1-3 very specific, actionable recommendations in Armenian. Respond naturally as an AI mentor.]`;
  }, [profile]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    const msg = input.trim(); if (!msg || loading) return;
    setInput(""); setMessages(p=>[...p,{role:"user",text:msg}]); setLoading(true);
    try {
      const ctx = { role: "user" as const, text: mentorContext };
      const hist = [...messages, {role:"user" as const, text:msg}].map(m=>({role:m.role==="ai"?"ai":"user",text:m.text}));
      const text = await chatWithMentor([ctx, ...hist], userName);
      setMessages(p=>[...p,{role:"ai",text:text||"Ներողություն:"}]);
    } catch { setMessages(p=>[...p,{role:"ai",text:"Չհաջողվեց կապվել AI-ի հետ: Փորձեք կրկին:"}]); }
    finally { setLoading(false); }
  };

  const quickActions = [
    { label: "Իմ առաջընթացը", query: "Վերլուծիր իմ առաջընթացը և ասա ինչ պետք է անեմ հաջորդը" },
    { label: "Կարիերա", query: "Ինչ կարիերա է ինձ հարմար իմ հմտություններով?" },
    { label: "Սովորելու պլան", query: "Կազմիր ինձ սովորելու պլան 1 ամսվա համար" },
    { label: "Թույլ կողմեր", query: "Որո՞նք են իմ թույլ կողմերը և ինչպես բարելավել" },
  ];

  if (!isOpen) return null;
  return (<AnimatePresence><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col" style={{maxHeight:"90vh"}}>
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white" size={24}/>
          </div>
          <div>
            <h3 className="font-black text-xl">KrtLab AI Mentor</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Growth OS Intelligence · Continuous Monitoring</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X size={20}/></button>
      </div>

      {profile && (
        <div className="px-6 py-2 bg-slate-50 border-b flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-wrap">
          <span className="flex items-center gap-1"><Brain size={12}/> Lv.{profile.level}</span>
          <span className="flex items-center gap-1"><Zap size={12}/> {profile.streak}d streak</span>
          <span className="flex items-center gap-1"><Activity size={12}/> {profile.xp} XP</span>
          <span className="flex items-center gap-1"><Target size={12}/> {((profile as any)?.strengths?.length||0)} skills</span>
          {profile.discovery?.goal && <span className="flex items-center gap-1"><BookOpen size={12}/> {profile.discovery.goal}</span>}
        </div>
      )}

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-6 py-3 border-b flex gap-2 overflow-x-auto">
          {quickActions.map((qa, i) => (
            <button key={i} onClick={() => { setInput(qa.query); setTimeout(() => handleSend(), 100); }} className="px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-xl text-xs font-bold text-primary whitespace-nowrap transition-all">{qa.label}</button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m,i) => (
          <div key={i} className={cn("flex gap-3", m.role==="user"?"justify-end":"justify-start")}>
            {m.role==="ai" && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0"><Sparkles className="text-white" size={14}/></div>}
            <div className={cn("max-w-[75%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed", m.role==="user"?"bg-slate-900 text-white rounded-br-md":"bg-slate-100 text-slate-800 rounded-bl-md")}>{m.text}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={16}/></div><div className="bg-slate-100 px-5 py-3 rounded-2xl rounded-bl-md"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"/><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"0.1s"}}/><div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"0.2s"}}/></div></div>}
        <div ref={msgEndRef}/>
      </div>

      <div className="p-4 border-t bg-white rounded-b-[2.5rem]">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Հարցրեք ձեր աճի, կարիերայի կամ սովորելու մասին..." className="flex-1 px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm"/>
          <button onClick={handleSend} disabled={loading||!input.trim()} className="px-5 py-3.5 bg-primary text-white rounded-2xl font-bold disabled:opacity-50 hover:bg-primary/90 transition-all active:scale-95"><Send size={18}/></button>
        </div>
      </div>
    </div>
  </motion.div></AnimatePresence>);
};
