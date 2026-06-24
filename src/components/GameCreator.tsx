import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, 
  Gamepad2, 
  AlignLeft, 
  Layers, 
  Briefcase, 
  Loader2, 
  CheckCircle2, 
  Layout, 
  ChevronRight,
  ArrowLeft,
  Target,
  Zap,
  ShieldCheck,
  Search
} from 'lucide-react';
import { generateStandaloneGame } from '../services/geminiService';
import { SimulationGame } from './games/SimulationGame';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export const GameCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [domain, setDomain] = useState('Entrepreneurship');
  const [content, setContent] = useState('');
  const [generatedGame, setGeneratedGame] = useState<any>(null);
  const [view, setView] = useState<'form' | 'preview'>('form');

  const handleTransform = async () => {
    if (!topic || !content) {
      toast.error('Խնդրում ենք լրացնել թեման և բովանդակությունը:');
      return;
    }

    setLoading(true);
    try {
      const game = await generateStandaloneGame(topic, level, domain, content);
      setGeneratedGame(game);
      setView('preview');
      toast.success('Խաղը պատրաստ է:');
    } catch (error) {
      toast.error('Չհաջողվեց գեներացնել խաղը:');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <AnimatePresence mode="wait">
        {view === 'form' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                  <Wand2 className="text-accent" size={48} />
                  Ինտերակտիվ Խաղերի Գեներատոր
                </h2>
                <p className="text-xl text-slate-500 font-medium">Տրանսֆորմացրեք ցանկացած դասը գործնական սիմուլյացիայի:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Layout size={14} /> Թեմա
                    </label>
                    <input 
                      type="text" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Օրինակ՝ Վաճառքի հմտություններ"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:border-accent focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} /> Մակարդակ
                    </label>
                    <div className="flex gap-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevel(l)}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all",
                            level === l ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={14} /> Ոլորտ
                    </label>
                    <select 
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:border-accent focus:bg-white transition-all outline-none"
                    >
                      {['Entrepreneurship', 'Marketing', 'Sales', 'Finance', 'HR', 'Startups', 'Strategy', 'Other'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <AlignLeft size={14} /> Դասի բովանդակությունը
                    </label>
                    <span className="text-[10px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest">Պատճենեք այստեղ</span>
                  </div>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Պատճենեք դասի տեքստը կամ հիմնական դրույթները այստեղ, որպեսզի մենք այն վերածենք խաղի..."
                    className="w-full h-[350px] bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 font-medium text-slate-700 leading-relaxed focus:border-accent focus:bg-white transition-all outline-none resize-none"
                  />
                  
                  <button
                    onClick={handleTransform}
                    disabled={loading}
                    className="w-full bg-gradient-brand text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={32} />
                        Կառուցում ենք խաղը...
                      </>
                    ) : (
                      <>
                        <Gamepad2 size={32} className="group-hover:rotate-12 transition-transform" />
                        Գեներացնել Ինտերակտիվ Խաղ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setView('form')}
                className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-xs"
              >
                <ArrowLeft size={20} />
                Հետ դեպի խմբագրիչ
              </button>
              <div className="flex items-center gap-4">
                <div className="px-5 py-2 bg-accent/10 rounded-full border border-accent/20">
                  <span className="text-[10px] font-black text-accent uppercase tracking-widest">{generatedGame?.gameType}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Target size={14} /> Ուսումնական նպատակ
                    </h4>
                    <p className="font-bold text-slate-900 leading-snug">{generatedGame?.learningObjective}</p>
                  </div>
                  
                  {generatedGame?.keyConcepts && (
                    <div>
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap size={14} /> Հիմնական հասկացություններ
                      </h4>
                      <ul className="space-y-2">
                        {generatedGame.keyConcepts.map((concept: string, idx: number) => (
                          <li key={idx} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1" />
                            {concept}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generatedGame?.realApplications && (
                    <div>
                      <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Briefcase size={14} /> Կիրառություն
                      </h4>
                      <ul className="space-y-2">
                        {generatedGame.realApplications.map((app: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-600 font-medium leading-relaxed">
                            • {app}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generatedGame?.alignmentCheck && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck size={14} /> Բովանդակային ստուգում
                      </h4>
                      <p className="text-xs text-slate-500 italic leading-relaxed mb-4">
                        {generatedGame.alignmentCheck}
                      </p>
                      
                      {generatedGame.validation && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                          {Object.entries(generatedGame.validation).map(([key, value]) => (
                            <div 
                              key={key}
                              className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter transition-all",
                                value ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                              )}
                            >
                              {key.replace('_', ' ')}: {value ? 'PASS' : 'FAIL'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Հաղթանակի պայման</h4>
                      <p className="text-xs font-bold text-emerald-600">{generatedGame?.winLoseConditions?.win}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Պարտության պայման</h4>
                      <p className="text-xs font-bold text-red-600">{generatedGame?.winLoseConditions?.lose}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-[3.5rem] p-4 shadow-3xl border border-slate-100">
                  <SimulationGame 
                    dataset={generatedGame?.dataset} 
                    onComplete={(score) => {
                      toast.success(`Շնորհավորում ենք: Դուք ավարտեցիք խաղը ${score}% արդյունքով:`);
                    }}
                    internalLevel={level === 'Beginner' ? 1 : level === 'Intermediate' ? 2 : 3}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
