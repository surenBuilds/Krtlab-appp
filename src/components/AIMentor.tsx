import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Loader2, Activity, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { chatWithMentor, isQuotaError } from '../services/geminiService';
import { useUserProfile } from '../hooks/useUserProfile';

interface AIMentorProps { userName: string; isOpen: boolean; onClose: () => void; }

export const AIMentor: React.FC<AIMentorProps> = ({ userName, isOpen, onClose }) => {
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Ողջույն, ${userName}: Ես քո KrtLab ԱԲ մենթորն եմ: Ինչո՞վ կարող եմ օգնել քեզ այսօր:` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const contextStr = useMemo(() => {
    if (!profile) return undefined;
    const progress = profile.progress?.categories || {};
    let completedLessons = 0, totalLessons = 0;
    Object.values(progress).forEach((cat: any) => {
      Object.values(cat.subfields || {}).forEach((sub: any) => {
        completedLessons += sub.completedLessons?.length || 0;
        totalLessons += 20;
      });
    });
    return `[USER CONTEXT] Name: ${profile.name} Level: ${profile.level || 1} XP: ${profile.xp || 0} Streak: ${profile.streak || 0}d Goal: ${(profile as any)?.discovery?.goal || 'not set'} Style: ${(profile as any)?.discovery?.style || 'not set'} Progress: ${completedLessons}/${totalLessons} lessons`;
  }, [profile]);

  const handleSend = async (overrideMsg?: string) => {
    const userMsg = overrideMsg || input.trim();
    if (!userMsg || loading) return;
    if (!overrideMsg) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    const maxRetries = 3;
    let retryCount = 0;
    while (retryCount <= maxRetries) {
      try {
        const history = [...messages, { role: 'user' as const, text: userMsg }].map(m => ({ role: m.role === 'ai' ? 'ai' : 'user', text: m.text }));
        const responseText = await chatWithMentor(history, userName, contextStr);
        setMessages(prev => [...prev, { role: 'ai', text: responseText || 'Ներողություն:' }]);
        setLoading(false);
        break;
      } catch (err: any) {
        if (isQuotaError(err)) { retryCount++; if (retryCount <= maxRetries) { await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 2000)); continue; } }
        setMessages(prev => [...prev, { role: 'ai', text: 'Չհաջողվեց: Փորձեք կրկին:' }]);
        setLoading(false);
        break;
      }
    }
  };

  if (!isOpen) return null;
  return (<>
    <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"/>
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col border-l border-slate-100">
      <div className="p-8 border-b flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center"><Sparkles size={24} className="text-white"/></div><div><h3 className="font-black text-lg">KrtLab AI Mentor</h3><p className="text-[10px] text-slate-400 font-black uppercase">Միշտ պատրաստ</p></div></div>
        <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><X size={24}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (<div key={i} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
          <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed font-medium shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border'}`}>{msg.text}</div>
        </div>))}
        {loading && <div className="flex items-center gap-3 text-accent text-[10px] font-black uppercase animate-pulse"><Loader2 size={16} className="animate-spin"/>Մտածում է...</div>}
      </div>
      <div className="p-8 border-t bg-white space-y-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button onClick={() => { handleSend('Կատարիր համակարգի ախտորոշում:'); }} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-slate-800 shrink-0"><Activity size={14}/> System Diagnosis</button>
          <button onClick={() => { handleSend('Առաջարկիր բովանդակային բարելավումներ:'); }} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-white border-2 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-accent/5 shrink-0"><Zap size={14}/> Optimize</button>
          <button onClick={() => { handleSend('Ստուգիր կրթական հետագիծը:'); }} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-white border-2 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-emerald-50 shrink-0"><ShieldCheck size={14}/> QA Check</button>
        </div>
        <div className="relative"><input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSend()} placeholder="Հարցրու մենթորին..." className="w-full px-8 py-5 bg-slate-50 border-2 rounded-[1.5rem] focus:border-primary focus:bg-white outline-none pr-16 font-medium"/><button onClick={()=>handleSend()} disabled={!input.trim()||loading} className="absolute right-2.5 top-2.5 bottom-2.5 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50"><Send size={20}/></button></div>
      </div>
    </div>
  </>);
};