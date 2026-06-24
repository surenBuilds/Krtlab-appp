import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Brain, 
  Zap, 
  Rocket,
  Compass,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUserProfile } from '../hooks/useUserProfile';
import { CATEGORIZED_LEARNING_PATHS, LearningPath } from '../data/learningPaths';
import { toast } from 'sonner';

const KEYWORD_MAP = [
  { id: 'technology', keywords: ['ծրագրավորում', 'կոդ', 'վեբ', 'կայք', 'developer', 'coding', 'programming', 'software', 'web', 'frontend', 'backend', 'app', 'react', 'js', 'javascript', 'python', 'ծրագրավորող'] },
  { id: 'business', keywords: ['բիզնես', 'ձեռնարկատեր', 'վաճառք', 'սկսել', 'business', 'entrepreneur', 'startup', 'freelance', 'ստարտափ'] },
  { id: 'marketing', keywords: ['մարքեթինգ', 'գովազդ', 'branding', 'marketing', 'ads', 'smm', 'seo', 'social', 'media', 'մարքեթոլոգ'] },
  { id: 'languages', keywords: ['անգլերեն', 'լեզու', 'խոսել', 'գերմաներեն', 'english', 'language', 'speak', 'vocabulary', 'word', 'անգլերենի', 'լեզվի'] },
  { id: 'finance', keywords: ['ֆինանսներ', 'փող', 'ներդրում', 'տնտեսություն', 'finance', 'invest', 'money', 'economy', 'crypto', 'banking', 'ակտիվ', 'ֆինանսական'] },
  { id: 'psychology', keywords: ['հոգեբանություն', 'էմոցիա', 'սթրես', 'psychology', 'mindset', 'emotion', 'mental', 'health', 'հոգեկան'] },
  { id: 'science', keywords: ['գիտություն', 'ֆիզիկա', 'քիմիա', 'աստղ', 'science', 'physics', 'chemistry', 'biology', 'space', 'գիտնական'] },
];

export const GoalsSection = () => {
  const { profile, updateCustomGoal, updateProfile, activateGoal } = useUserProfile();
  const [goalText, setGoalText] = useState(profile?.customGoal || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<LearningPath[]>([]);
  const [matchedCategoryId, setMatchedCategoryId] = useState<string | null>(null);
  const [matchedCategoryTitle, setMatchedCategoryTitle] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (profile?.customGoal && !showResults) {
      setGoalText(profile.customGoal);
    }
  }, [profile?.customGoal, showResults]);

  const analyzeGoal = () => {
    if (!goalText.trim()) {
      toast.error('Խնդրում ենք մուտքագրել ձեր նպատակը:');
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    // Keyword matching logic
    const lowerText = goalText.toLowerCase();
    let bestMatch = { id: 'business', score: 0 };

    KEYWORD_MAP.forEach(item => {
      let score = 0;
      item.keywords.forEach(kw => {
        if (lowerText.includes(kw.toLowerCase())) score++;
      });
      if (score > bestMatch.score) {
        bestMatch = { id: item.id, score };
      }
    });

    // Simulate analysis time
    setTimeout(() => {
      const category = CATEGORIZED_LEARNING_PATHS.find(c => c.id === bestMatch.id) || CATEGORIZED_LEARNING_PATHS[0];
      setMatchedCategoryId(category.id);
      setMatchedCategoryTitle(category.title);
      setRecommendations(category.paths.slice(0, 3));
      setIsAnalyzing(false);
      setShowResults(true);
      
      // Save global goal
      updateCustomGoal(goalText);
      
      toast.success('Նպատակի վերլուծությունն ավարտվեց:');
    }, 1500);
  };

  const handleActivate = () => {
    if (matchedCategoryId) {
      activateGoal(goalText, matchedCategoryId);
    }
  };

  const examples = [
    "Ցանկանում եմ դառնալ frontend ծրագրավորող",
    "Ուզում եմ բարելավել անգլերենս աշխատանքի համար",
    "Սովորել մարքեթինգ և սկսել ֆրիլանս",
    "Հասկանալ ներդրումների և ֆինանսների աշխարհը"
  ];

  const refinedGoal = () => {
    if (!goalText) return "";
    const prefix = "Իմ հիմնական նպատակն է ";
    const suffix = "՝ օգտագործելով KrtLab-ի համակարգված ուսումնական ուղիները:";
    return `${prefix}${goalText.charAt(0).toLowerCase() + goalText.slice(1)}${suffix}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary mb-2"
        >
          <Target size={32} />
        </motion.div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight">Ո՞րն է քո նպատակը:</h2>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Նկարագրիր այն ամենը, ինչին ցանկանում ես հասնել, և մենք կկառուցենք քո անհատական ուսումնական պլանը:
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Brain size={120} />
            </div>
            
            <div className="space-y-4 relative z-10">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Քո տեքստը</label>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="Օրինակ՝ Ցանկանում եմ ստեղծել սեփական ստարտափը..."
                className="w-full h-48 px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-primary focus:bg-white outline-none transition-all text-xl font-medium resize-none placeholder:text-slate-300 shadow-inner group-hover:border-slate-200"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
              <button
                onClick={analyzeGoal}
                disabled={isAnalyzing || !goalText.trim()}
                className={cn(
                  "w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
                  isAnalyzing ? "animate-pulse" : "shadow-xl shadow-slate-200"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="animate-spin" size={24} />
                    Վերլուծվում է...
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    Վերլուծել Նպատակը
                  </>
                )}
              </button>
              
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, i) => (
                  <button 
                    key={i}
                    onClick={() => setGoalText(ex)}
                    className="text-[11px] font-bold text-slate-400 hover:text-primary transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"
                  >
                    #{ex.length > 25 ? ex.substring(0, 25) + '...' : ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-emerald-900 leading-tight">Վերլուծությունը հաջողվեց!</h4>
                      <p className="text-emerald-600 font-medium">Ուղղությունը: <span className="font-black underline">{matchedCategoryTitle}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={handleActivate}
                    className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    Ակտիվացնել Ուղին <Zap size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                      <Rocket className="text-primary" />
                      Քեզ համար երաշխավորված
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((path) => (
                      <motion.div
                        key={path.id}
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {path.icon ? <path.icon size={24} /> : <Compass size={24} />}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{path.title}</h4>
                            <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed line-clamp-2">{path.description}</p>
                          </div>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{path.duration} • {path.difficulty}</span>
                          <button className="flex items-center gap-2 text-primary font-black text-sm group-hover:translate-x-1 transition-transform">
                            Սկսել <ChevronRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-brand p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Lightbulb size={100} />
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    <Sparkles className="text-accent" />
                    <h3 className="text-xl font-black tracking-tight">Բարելավված տարբերակը</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 italic font-medium relative z-10">
                    "{refinedGoal()}"
                  </div>
                  <button 
                    onClick={() => {
                      setGoalText(refinedGoal());
                      updateCustomGoal(refinedGoal());
                      toast.success('Նպատակը թարմացվեց բարելավված տարբերակով:');
                    }}
                    className="bg-white text-primary px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-50 transition-colors relative z-10 shadow-lg"
                  >
                    Օգտագործել այս տարբերակը
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Ինչու՞ է սա կարևոր:</h3>
            <div className="space-y-4">
              <BenefitItem 
                icon={<Zap size={18} />} 
                title="Կենտրոնացում" 
                desc="Կոնկրետ նպատակը օգնում է զտել ավելորդ տեղեկատվությունը:" 
              />
              <BenefitItem 
                icon={<ArrowRight size={18} />} 
                title="Արագ արդյունք" 
                desc="Համակարգված ուղիները 3 անգամ ավելի արագ են տանում նպատակին:" 
              />
              <BenefitItem 
                icon={<Target size={18} />} 
                title="Մոտիվացիա" 
                desc="Տեսնելով քո առաջընթացը՝ դու երբեք կանգ չես առնի:" 
              />
            </div>
          </div>

          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
             <h4 className="text-lg font-black mb-2 relative z-10">Փորձագիտական խորհուրդ</h4>
             <p className="text-indigo-200 text-sm font-medium leading-relaxed relative z-10">
               «Նպատակները պետք է լինեն SMART՝ Սպեցիֆիկ, Չափելի, Հասանելի, Ռեալիստական և Ժամանակային սահմանափակումով:»
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 shrink-0">
      {icon}
    </div>
    <div className="space-y-0.5">
      <h4 className="font-black text-slate-900 text-sm tracking-tight">{title}</h4>
      <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);
