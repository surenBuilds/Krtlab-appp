import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { isQuotaError } from '../services/geminiService';

interface QuizMentorProps {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  context?: string;
}

export const QuizMentor: React.FC<QuizMentorProps> = ({ 
  question, 
  userAnswer, 
  correctAnswer,
  context 
}) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getExplanation = async () => {
    setLoading(true);
    setError(null);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = "gemini-3-flash-preview";
        
        const prompt = `
          Որպես KrtLab-ի կրթական մենթոր, բացատրիր, թե ինչու է օգտատիրոջ պատասխանը սխալ և ինչու է ճիշտ պատասխանը ճիշտ:
          
          Հարց: ${question}
          Օգտատիրոջ պատասխան: ${userAnswer}
          Ճիշտ պատասխան: ${correctAnswer}
          ${context ? `Կոնտեքստ: ${context}` : ''}
          
          Պատասխանիր հայերեն, եղիր քաջալերող և տուր հստակ բացատրություն: 
          Նաև առաջարկիր հաջորդ քայլը սովորելու համար:
          Պատասխանը ձևաչափիր որպես մաքուր տեքստ (առանց մարկդաունի):
        `;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        setExplanation(response.text || "Ներողություն, չհաջողվեց բացատրություն գտնել:");
        setLoading(false);
        break;
      } catch (err: any) {
        if (isQuotaError(err)) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const waitTime = Math.pow(2, retryCount) * 2000;
            console.warn(`Quota exceeded in Quiz Mentor. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        console.error("AI Mentor error:", err);
        setError("Չհաջողվեց կապվել ԱԲ մենթորի հետ: Խնդրում ենք փորձել մի փոքր ուշ:");
        setLoading(false);
        break;
      }
    }
  };

  return (
    <div className="mt-6">
      {!explanation && !loading && !error && (
        <button
          onClick={getExplanation}
          className="flex items-center gap-3 text-accent font-black text-sm hover:scale-105 transition-all bg-accent/5 px-6 py-3 rounded-2xl border-2 border-accent/10 shadow-sm uppercase tracking-widest"
        >
          <Sparkles size={18} className="fill-accent" />
          Հարցնել KrtLab ԱԲ Մենթորին
        </button>
      )}

      <AnimatePresence>
        {(loading || explanation || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "p-8 rounded-[2rem] border-2 space-y-6 shadow-2xl",
              error ? "bg-red-50 border-red-100 shadow-red-200/50" : "bg-accent/5 border-accent/10 shadow-accent/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-accent font-black text-lg tracking-tight">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Sparkles size={24} className="text-accent" />
                </div>
                <span>KrtLab ԱԲ Մենթոր</span>
              </div>
              {loading && <Loader2 size={20} className="animate-spin text-accent" />}
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-5 bg-accent/10 rounded-full w-full animate-pulse" />
                <div className="h-5 bg-accent/10 rounded-full w-3/4 animate-pulse" />
                <div className="h-5 bg-accent/10 rounded-full w-5/6 animate-pulse" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-red-700 text-base font-bold">{error}</p>
                <button 
                  onClick={getExplanation}
                  className="flex items-center gap-2 text-red-600 font-black text-xs hover:underline uppercase tracking-widest"
                >
                  <RefreshCcw size={14} />
                  Փորձել նորից
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-slate-800 leading-relaxed text-lg italic font-medium">
                  "{explanation}"
                </p>
                <div className="flex items-center gap-3 text-accent text-[10px] font-black uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-accent/10 w-fit">
                  <ArrowRight size={16} />
                  <span>Հաջորդ քայլը՝ շարունակիր կիրառել սովորածդ</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
