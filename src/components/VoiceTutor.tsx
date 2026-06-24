import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Loader2, Volume2, VolumeX, User, Bot, Trash2 } from 'lucide-react';
import { askTutorQuestion } from '../services/geminiService';
import { TutorMessage } from '../types';
import { cn } from '../lib/utils';
import { pcmToWav } from '../lib/audioUtils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface VoiceTutorProps {
  lessonId: string;
  lessonText: string;
}

export const VoiceTutor: React.FC<VoiceTutorProps> = ({ lessonId, lessonText }) => {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: TutorMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const result = await askTutorQuestion(lessonText, text, history);

      const aiMessage: TutorMessage = { 
        role: 'model', 
        text: result.text,
        audio: result.audio 
      };
      setMessages(prev => [...prev, aiMessage]);

      if (!isMuted && result.audio) {
        const url = pcmToWav(result.audio);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(e => {
            console.warn("Autoplay blocked:", e);
            const speech = new SpeechSynthesisUtterance(result.text);
            speech.lang = "hy-AM";
            speechSynthesis.speak(speech);
          });
        }
      }
    } catch (error) {
      console.error("Tutor error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Ցավոք, սխալ տեղի ունեցավ: Խնդրում եմ փորձեք նորից:" }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Ձեր բրաուզերը չի աջակցում ձայնային մուտքագրում:");
      return;
    }

    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor || typeof SpeechRecognitionConstructor !== 'function') {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'hy-AM';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error("Voice recognition failed:", e);
      toast.error("Ձայնային մուտքագրումը չհաջողվեց:");
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-[600px]">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">KrtLab ԱԲ Թյութոր</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Հարցրու ինձ դասի մասին</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "p-3 rounded-2xl transition-all border-2",
              isMuted 
                ? "text-slate-400 bg-slate-50 border-slate-100 hover:bg-slate-100" 
                : "text-accent bg-accent/5 border-accent/10 hover:bg-accent/10"
            )}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={clearChat}
            className="p-3 text-slate-400 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6">
            <div className="w-20 h-20 rounded-[2rem] bg-accent/10 text-accent flex items-center justify-center shadow-inner">
              <Mic size={40} />
            </div>
            <p className="text-base text-slate-500 max-w-[240px] font-medium leading-relaxed">
              Սեղմիր խոսափողի վրա կամ գրիր հարցդ դասի վերաբերյալ:
            </p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-4 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm",
                msg.role === 'user' ? "bg-white text-slate-600 border border-slate-100" : "bg-gradient-brand text-white shadow-primary/20"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "p-5 rounded-[1.5rem] text-base shadow-sm leading-relaxed font-medium",
                msg.role === 'user' 
                  ? "bg-white text-slate-800 border border-slate-100 rounded-tr-none" 
                  : "bg-accent/5 text-slate-900 border border-accent/10 rounded-tl-none"
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot size={20} />
            </div>
            <div className="bg-accent/5 p-5 rounded-[1.5rem] rounded-tl-none border border-accent/10 shadow-sm">
              <Loader2 size={20} className="animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={startListening}
            className={cn(
              "p-4 rounded-2xl transition-all shadow-lg",
              isListening 
                ? "bg-red-500 text-white animate-pulse shadow-red-200" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-100"
            )}
          >
            <Mic size={24} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Հարց տուր..."
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-medium focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-accent disabled:text-slate-300 transition-all hover:scale-110"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};
