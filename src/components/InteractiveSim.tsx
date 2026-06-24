import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Info, Zap, ChevronRight, Layout } from 'lucide-react';

interface InteractiveSimProps {
  topic: string;
  data: any;
}

export const InteractiveSim: React.FC<InteractiveSimProps> = ({ topic, data }) => {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(0);

  // Example logic for a simple simulation based on topic
  const isFinance = topic.toLowerCase().includes('finance') || topic.toLowerCase().includes('ֆինանս');

  return (
    <div className="my-10 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-slate-800">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand opacity-50" />
      
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Layout className="text-accent" />
          </div>
          <div>
            <h4 className="text-white font-black text-lg tracking-tight">Ինտերակտիվ Սիմուլյացիա</h4>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest">{topic}</p>
          </div>
        </div>
        <button className="p-3 text-white/40 hover:text-white transition-colors">
          <Info size={20} />
        </button>
      </div>

      <div className="h-[400px] relative flex flex-col items-center justify-center p-12 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div 
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8 relative z-10"
            >
              <div className="w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl group transition-all hover:scale-110">
                <Play className="text-accent fill-accent ml-1" size={40} />
              </div>
              <div>
                <h5 className="text-2xl font-black text-white mb-2 tracking-tight">Սովորիր գործնականում</h5>
                <p className="text-white/50 font-medium max-w-sm mx-auto">Մուտք գործիր սիմուլյացիոն միջավայր և տես, թե ինչպես է աշխատում այս թեման իրականում:</p>
              </div>
              <button 
                onClick={() => setIsActive(true)}
                className="bg-accent text-slate-900 px-10 py-4 rounded-2xl font-black shadow-lg shadow-accent/20 hover:scale-105 transition-all"
              >
                Սկսել սիմուլյացիան
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full h-full flex flex-col gap-8 relative z-10"
            >
              <div className="flex-1 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-8 flex items-center justify-center text-center">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto border border-accent/30 animate-pulse">
                    <Zap className="text-accent" size={32} />
                  </div>
                  <h6 className="text-xl font-bold text-white">Փուլ {step + 1}․ {isFinance ? 'Կապիտալի Ձևավորում' : 'Հիմնական Գաղափարներ'}</h6>
                  <p className="text-white/60 font-medium">Այս փուլում դուք տեսնում եք տեսական գիտելիքների գործնական կիրառումը:</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setIsActive(false)}
                  className="px-6 py-4 bg-white/5 text-white/60 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-3"
                >
                  <RotateCcw size={18} /> Վերսկսել
                </button>
                <button 
                  onClick={() => setStep(s => (s + 1) % 3)}
                  className="flex-1 px-8 py-4 bg-accent text-slate-900 rounded-xl font-black hover:opacity-90 transition-all flex items-center justify-center gap-3"
                >
                  Հաջորդ քայլը <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Սիմուլյացիոն Ռեժիմ</span>
      </div>
    </div>
  );
};
