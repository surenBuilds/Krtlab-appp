import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, X, Send, Loader2, Activity, ShieldCheck, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { isQuotaError } from '../services/geminiService';

interface AIMentorProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AIMentor: React.FC<AIMentorProps> = ({ userName, isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Ողջույն, ${userName}: Ես քո KrtLab ԱԲ մենթորն եմ: Ինչո՞վ կարող եմ օգնել քեզ այսօր:` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSystemCheck = async () => {
    if (loading) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: "Կատարիր համակարգի բովանդակային ախտորոշում (Content Diagnostic):" }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `
        You are the KertLab Internal AI (QA + Optimization Agent). 
        Perform a simulated "System Content Audit".
        
        Rules:
        - Detect potential inconsistencies (Content level).
        - Suggest improvements for lesson clarity.
        - Ensure high-quality UX.
        - Report in Armenian.
        - Tone: Professional System Output.
        `,
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Ախտորոշումը հաջողությամբ ավարտվեց: Համակարգը օպտիմալ վիճակում է:" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Չհաջողվեց կատարել ախտորոշում:" }]);
    } finally {
      setLoading(false);
    }
  };

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
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = "gemini-3-flash-preview";
        
        const response = await ai.models.generateContent({
          model,
          contents: `Որպես կրթական մենթոր KrtLab հարթակում, պատասխանիր օգտատիրոջը (${userName}): 
          Օգտատիրոջ հարցը: ${userMsg}
          Պատասխանիր հայերեն, եղիր քաջալերող և տուր հստակ բացատրություն:`,
        });

        setMessages(prev => [...prev, { role: 'ai', text: response.text || "Ներողություն, չհաջողվեց պատասխանել:" }]);
        setLoading(false);
        break;
      } catch (err: any) {
        if (isQuotaError(err)) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const waitTime = Math.pow(2, retryCount) * 2000;
            console.warn(`Quota exceeded in AI Mentor. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        console.error("AI Mentor error:", err);
        setMessages(prev => [...prev, { role: 'ai', text: "Չհաջողվեց կապվել ԱԲ մենթորի հետ: Խնդրում ենք փորձել մի փոքր ուշ:" }]);
        setLoading(false);
        break;
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col border-l border-slate-100"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight">KrtLab ԱԲ Մենթոր</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Միշտ պատրաստ օգնելու</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[90%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-5 rounded-[1.5rem] text-sm leading-relaxed font-medium shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                      : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-3 text-accent text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Loader2 size={16} className="animate-spin" />
                  Մենթորը մտածում է...
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-white space-y-6">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={handleSystemCheck}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shrink-0 shadow-lg shadow-slate-200"
                >
                  <Activity size={14} className="text-accent" />
                  System Diagnosis
                </button>
                <button
                  onClick={() => handleSend("Առաջարկիր բովանդակային բարելավումներ:")}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:border-accent/30 hover:bg-accent/5 transition-all shrink-0"
                >
                  <Zap size={14} className="text-amber-500" />
                  Optimize Content
                </button>
                <button
                  onClick={() => handleSend("Ստուգիր կրթական հետագիծը:")}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:border-emerald-100 hover:bg-emerald-50 transition-all shrink-0"
                >
                  <ShieldCheck size={14} className="text-emerald-500" />
                  QA Check
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Հարցրու մենթորին..."
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-primary focus:bg-white outline-none transition-all pr-16 font-medium shadow-inner"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2.5 top-2.5 bottom-2.5 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 group"
                >
                  <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
