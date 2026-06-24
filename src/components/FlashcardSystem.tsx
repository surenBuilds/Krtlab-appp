import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  X, 
  Trash2, 
  Brain, 
  Sparkles, 
  History, 
  Search, 
  Filter,
  Briefcase,
  Megaphone,
  Cpu,
  Languages,
  FlaskConical,
  User,
  BrainCircuit,
  ShieldCheck,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react';
import { Flashcard } from '../types';
import { calculateSRS } from '../lib/srs';
import { cn } from '../lib/utils';

// Category mapping with icons and titles in Armenian
const FLASHCARD_CATEGORIES = [
  { id: 'all', title: 'Բոլորը', icon: MoreHorizontal, color: 'text-slate-500' },
  { id: 'business', title: 'Բիզնես և Ձեռնարկատիրություն', icon: Briefcase, color: 'text-blue-500' },
  { id: 'marketing', title: 'Մարքեթինգ', icon: Megaphone, color: 'text-pink-500' },
  { id: 'technology', title: 'Տեխնոլոգիա / Ծրագրավորում', icon: Cpu, color: 'text-emerald-500' },
  { id: 'languages', title: 'Լեզուներ', icon: Languages, color: 'text-orange-500' },
  { id: 'science', title: 'Գիտություն', icon: FlaskConical, color: 'text-purple-500' },
  { id: 'personal', title: 'Անձնական Աճ', icon: User, color: 'text-amber-500' },
  { id: 'psychology', title: 'Հոգեբանություն', icon: BrainCircuit, color: 'text-rose-500' },
  { id: 'cybersecurity', title: 'Կիբեռանվտանգություն', icon: ShieldCheck, color: 'text-cyan-500' },
];

interface FlashcardSystemProps {
  cards: Flashcard[];
  onAddCard: (term: string, definition: string, categoryId: string, level: string) => void;
  onDeleteCard: (id: string) => void;
  onUpdateSRS: (id: string, srsData: any) => void;
}

const SRSButton: React.FC<{ label: string; color: 'red' | 'orange' | 'blue' | 'green'; onClick: () => void }> = ({ label, color, onClick }) => {
  const colors = {
    red: "bg-red-500 hover:bg-red-600 shadow-red-200",
    orange: "bg-orange-500 hover:bg-orange-600 shadow-orange-200",
    blue: "bg-primary hover:bg-primary/90 shadow-primary/20",
    green: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg",
        colors[color]
      )}
    >
      {label}
    </button>
  );
};

export const FlashcardSystem: React.FC<FlashcardSystemProps> = ({ 
  cards, 
  onAddCard, 
  onDeleteCard,
  onUpdateSRS
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'review'>('grid');
  
  // Review Mode State
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Add Card State
  const [isAdding, setIsAdding] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCategory, setNewCategory] = useState('business');
  const [newLevel, setNewLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Filtered Cards
  const cardsList = Array.isArray(cards) ? cards : [];
  
  const filteredCards = useMemo(() => {
    return cardsList.filter(card => {
      if (!card) return false;
      const matchesCategory = selectedCategory === 'all' || card.categoryId === selectedCategory;
      const matchesSearch = card.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           card.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || card.level === difficultyFilter;
      return matchesCategory && matchesSearch && matchesDifficulty;
    });
  }, [cardsList, selectedCategory, searchQuery, difficultyFilter]);

  // Review Cards (SRS based)
  const reviewCards = useMemo(() => {
    const now = new Date();
    return cardsList.filter(card => {
      if (!card?.nextReview) return true;
      return new Date(card.nextReview) <= now;
    });
  }, [cardsList]);

  const activeReviewCards = viewMode === 'review' ? reviewCards : [];

  const handleSRS = (quality: number) => {
    const card = activeReviewCards[reviewIndex];
    const srsData = calculateSRS(
      quality,
      card.interval,
      card.repetitionCount,
      card.easeFactor
    );
    onUpdateSRS(card.id, srsData);
    
    setIsFlipped(false);
    if (reviewIndex < activeReviewCards.length - 1) {
      setReviewIndex(prev => prev + 1);
    } else {
      setReviewIndex(0);
      setViewMode('grid');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTerm.trim() && newDefinition.trim()) {
      onAddCard(newTerm.trim(), newDefinition.trim(), newCategory, newLevel);
      setNewTerm('');
      setNewDefinition('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Հիշողության քարտեր</h2>
          <p className="text-slate-500 font-medium">Կազմակերպված ըստ ոլորտների</p>
        </div>
        <div className="flex gap-4">
          {reviewCards.length > 0 && viewMode !== 'review' && (
            <button
              onClick={() => { setViewMode('review'); setReviewIndex(0); }}
              className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:scale-105 transition-all shadow-xl shadow-emerald-200 font-black text-xs uppercase tracking-widest"
            >
              <Brain size={18} />
              Սկսել կրկնությունը ({reviewCards.length})
            </button>
          )}
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest"
          >
            <Plus size={18} />
            Նոր քարտ
          </button>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-4 px-4 border-b border-slate-100">
        {FLASHCARD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-2.5 px-5 py-3 rounded-t-2xl transition-all whitespace-nowrap font-black text-[10px] uppercase tracking-widest border-b-2",
              selectedCategory === cat.id 
                ? "bg-primary/5 border-primary text-primary" 
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <cat.icon size={16} className={selectedCategory === cat.id ? "text-primary" : cat.color} />
            {cat.title}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Փնտրել տերմիններ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-600 shadow-inner"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-black text-[10px] uppercase tracking-widest text-slate-600 shadow-inner appearance-none"
          >
            <option value="all">Բոլոր մակարդակները</option>
            <option value="beginner">Սկսնակ</option>
            <option value="intermediate">Միջին</option>
            <option value="advanced">Բարձր</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'review' ? (
          <motion.div
            key="review-mode"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-10 py-8"
          >
            <div className="flex items-center gap-4 text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
              <Sparkles size={16} />
              Կրկնության ռեժիմ
              <button 
                onClick={() => setViewMode('grid')}
                className="ml-2 p-1 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {activeReviewCards.length > 0 ? (
              <div className="w-full max-w-md space-y-8">
                <div className="relative aspect-[1.6/1] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                  <motion.div
                    className="w-full h-full relative transition-all duration-500 preserve-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex items-center justify-center p-12 text-center shadow-slate-200/50">
                      <div className="space-y-4">
                        <span className="inline-block px-4 py-1 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                          {FLASHCARD_CATEGORIES.find(c => c.id === activeReviewCards[reviewIndex].categoryId)?.title}
                        </span>
                        <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">{activeReviewCards[reviewIndex].term}</h3>
                      </div>
                      <p className="absolute bottom-8 text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">Սեղմիր շրջելու համար</p>
                    </div>
                    
                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary to-secondary rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white rotate-y-180 shadow-primary/20">
                      <p className="text-xl font-black leading-relaxed mb-10 tracking-tight">{activeReviewCards[reviewIndex].definition}</p>
                      
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <SRSButton label="Նորից" color="red" onClick={() => handleSRS(0)} />
                        <SRSButton label="Դժվար" color="orange" onClick={() => handleSRS(2)} />
                        <SRSButton label="Լավ" color="blue" onClick={() => handleSRS(4)} />
                        <SRSButton label="Հեշտ" color="green" onClick={() => handleSRS(5)} />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                      {reviewIndex + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      / {activeReviewCards.length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Բոլորը պատրաստ են</h3>
                <p className="text-slate-500 mt-2">Դուք ավարտել եք այսօրվա կրկնությունները</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCards.length > 0 ? (
              filteredCards.map((card, idx) => {
                const category = FLASHCARD_CATEGORIES.find(c => c.id === card.categoryId);
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("p-3 rounded-2xl bg-slate-50", category?.color || "text-primary")}>
                        {category ? <category.icon size={20} /> : <MoreHorizontal size={20} />}
                      </div>
                      <div className="flex gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                          card.level === 'beginner' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          card.level === 'intermediate' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          "bg-purple-50 text-purple-600 border-purple-100"
                        )}>
                          {card.level === 'beginner' ? 'Սկսնակ' : card.level === 'intermediate' ? 'Միջին' : 'Բարձր'}
                        </span>
                        <button 
                          onClick={() => onDeleteCard(card.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">{card.term}</h3>
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6 font-medium">
                      {card.definition}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Կատեգորիա</span>
                        <span className="text-[10px] text-slate-700 font-bold">{category?.title || 'Այլ'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Հաջորդը</span>
                        <span className="text-[10px] text-primary font-bold">
                          {card.nextReview ? new Date(card.nextReview).toLocaleDateString() : 'Այսօր'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Search size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Քարտեր չեն գտնվել</h3>
                <p className="text-slate-500 mt-2">Փորձեք փոխել որոնման պարամետրերը կամ ավելացնել նոր քարտ:</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 overflow-hidden border border-slate-100"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Նոր հիշողության քարտ</h3>
                <p className="text-slate-500 font-medium mt-2">Ավելացրու նոր տերմին և դրա բացատրությունը:</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Կատեգորիա</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm shadow-inner"
                    >
                      {FLASHCARD_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Բարդություն</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as any)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-sm shadow-inner"
                    >
                      <option value="beginner">Սկսնակ</option>
                      <option value="intermediate">Միջին</option>
                      <option value="advanced">Բարձր</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Տերմին</label>
                  <input
                    autoFocus
                    type="text"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="Օրինակ՝ Լիկվիդայնություն"
                    className="w-full px-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-black text-lg shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Բացատրություն</label>
                  <textarea
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="Գրեք տերմինի բացատրությունը այստեղ..."
                    rows={3}
                    className="w-full px-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium text-lg resize-none shadow-inner"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-[2rem] font-black text-lg hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest"
                >
                  Պահպանել քարտը
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
