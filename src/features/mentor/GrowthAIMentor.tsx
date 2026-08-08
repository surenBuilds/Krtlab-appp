import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Loader2, Brain } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUserProfile } from "../../hooks/useUserProfile";
import { calculateGrowthScore } from "../../services/growthEngine";
import { chatWithMentor } from "../../services/geminiService";
import type { GrowthProfile } from "../../types/domain";

interface Props { isOpen: boolean; onClose: () => void }

export const GrowthAIMentor: React.FC<Props> = ({ isOpen, onClose }) => {
  const { profile } = useUserProfile();
  const userName = profile?.name || "User";
  const [messages, setMessages] = useState<{role:"user"|"ai";text:string}[]>([{role:"ai",text:`Ողջույն ${userName}: Ես KrtLab Growth OS AI մենթորն եմ: Ինչո՞վ կարող եմ օգնել:`}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const mentorContext = useMemo(() => {
    if (!profile) return "";
    const gp = profile as unknown as GrowthProfile;
    return `[CONTEXT]\nName:${gp.name} Level:${gp.level} XP:${gp.xp} Streak:${gp.streak}\nStrengths:${(gp.strengths||[]).join(",")||"none"}\nWeaknesses:${(gp.weaknesses||[]).join(",")||"none"}\nGoal:${gp.discovery?.goal||"not set"}\nStyle:${gp.discovery?.style||"none"} Time:${gp.discovery?.dailyTime||"?"}min/day`;
  }, [profile]);

  const handleSend = async () => {
    const msg = input.trim(); if (!msg || loading) return;
    setInput(""); setMessages(p=>[...p,{role:"user",text:msg}]); setLoading(true);
    try {
      const ctx = { role: "user", text: mentorContext };
      const hist = [...messages, {role:"user" as const, text:msg}].map(m=>({role:m.role==="ai"?"ai":"user",text:m.text}));
      const text = await chatWithMentor([ctx, ...hist], userName);
      setMessages(p=>[...p,{role:"ai",text:text||"Ներողություն:"}]);
    } catch { setMessages(p=>[...p,{role:"ai",text:"Չհաջողվեց:"}]); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (<AnimatePresence><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col" style={{maxHeight:"85vh"}}>
      <div className="p-6 border-b flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Sparkles className="text-white" size={20}/></div><div><h3 className="font-black">KrtLab AI Mentor</h3><p className="text-[10px] text-slate-400 font-bold uppercase">Growth OS</p></div></div><button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X size={20}/></button></div>
      {profile && <div className="px-6 py-2 bg-slate-50 border-b flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><Brain size={12}/> Lv.{profile.level} · {profile.streak}d · {profile.xp} XP</div>}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">{messages.map((m,i)=><div key={i} className={cn("flex",m.role==="user"?"justify-end":"justify-start")}><div className={cn("max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium",m.role==="user"?"bg-slate-900 text-white rounded-br-md":"bg-slate-100 text-slate-800 rounded-bl-md")}>{m.text}</div></div>)}{loading&&<div className="flex justify-start"><div className="bg-slate-100 px-5 py-3 rounded-2xl"><Loader2 className="animate-spin" size={18}/></div></div>}</div>
      <div className="p-4 border-t"><div className="flex gap-2"><input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Հարցրեք..." className="flex-1 px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary font-medium"/><button onClick={handleSend} disabled={loading||!input.trim()} className="px-5 py-3 bg-primary text-white rounded-2xl font-bold disabled:opacity-50"><Send size={18}/></button></div></div>
    </div>
  </motion.div></AnimatePresence>);
};
