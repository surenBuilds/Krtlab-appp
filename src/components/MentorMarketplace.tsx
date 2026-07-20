import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';
import { Search, Plus, Sparkles, Star, Check, Award, Compass, Heart, Zap, DollarSign, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AIMentorModel {
  id: string;
  name: string;
  role: string;
  bio: string;
  persona: 'Socratic' | 'Supportive' | 'Brutal' | 'Pragmatic';
  subject: string;
  price: number;
  rating: number;
  subscribers: number;
  avatar: string;
  isCustom?: boolean;
}

const INITIAL_MENTORS: AIMentorModel[] = [
  {
    id: 'm1',
    name: 'Արա Մինասյան (Ara)',
    role: 'Full Stack Tech Lead',
    bio: '15+ տարվա փորձ ծրագրավորման ոլորտում։ Օգնում է սովորել React, Node.js և ամպային տեխնոլոգիաներ։',
    persona: 'Pragmatic',
    subject: 'Programming',
    price: 0,
    rating: 4.9,
    subscribers: 2450,
    avatar: '💻'
  },
  {
    id: 'm2',
    name: 'Սառա Հովհաննիսյան (Sara)',
    role: 'Socratic AI Ethicist',
    bio: 'Հարցերի միջոցով ուղղորդում է ձեզ բացահայտելու մեքենայական ուսուցման և էթիկայի խորքային գաղտնիքները։',
    persona: 'Socratic',
    subject: 'AI & Machine Learning',
    price: 9.99,
    rating: 4.8,
    subscribers: 1210,
    avatar: '👁️'
  },
  {
    id: 'm3',
    name: 'Coach Brutal Leo',
    role: 'Silicon Valley Hackathon Vet',
    bio: 'Ոչ մի ավելորդություն։ Խիստ, պահանջկոտ և արագ արդյունքներ ապահովող մենթոր ծրագրավորողների համար։',
    persona: 'Brutal',
    subject: 'Programming',
    price: 14.99,
    rating: 4.7,
    subscribers: 890,
    avatar: '⚡'
  },
  {
    id: 'm4',
    name: 'Անի Սարգսյան (Ani)',
    role: 'English Language Architect',
    bio: 'Ընկերական, աջակցող և համբերատար անգլերենի ուսուցչուհի բոլոր մակարդակների համար։',
    persona: 'Supportive',
    subject: 'Languages',
    price: 0,
    rating: 5.0,
    subscribers: 4120,
    avatar: '🌟'
  }
];

export const MentorMarketplace: React.FC = () => {
  const { t } = useTranslation();
  const [mentors, setMentors] = useState<AIMentorModel[]>(INITIAL_MENTORS);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [subscribedMentors, setSubscribedMentors] = useState<string[]>(['m1', 'm4']);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New mentor form fields
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPersona, setNewPersona] = useState<'Socratic' | 'Supportive' | 'Brutal' | 'Pragmatic'>('Supportive');
  const [newSubject, setNewSubject] = useState('Programming');
  const [newPrice, setNewPrice] = useState(0);

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.role.toLowerCase().includes(search.toLowerCase()) ||
                          m.bio.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || m.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleSubscribe = (id: string, price: number) => {
    if (subscribedMentors.includes(id)) {
      setSubscribedMentors(prev => prev.filter(mid => mid !== id));
      toast.success(t('common.success'), { description: 'Չեղարկվեց բաժանորդագրությունը' });
    } else {
      setSubscribedMentors(prev => [...prev, id]);
      toast.success(t('common.success'), { 
        description: price === 0 ? 'Բաժանորդագրությունը հաջողությամբ ակտիվացավ' : `Գնումը հաջողությամբ կատարվեց՝ $${price}/ամիս` 
      });
    }
  };

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole || !newBio) {
      toast.error(t('common.error'), { description: 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը:' });
      return;
    }

    const newMentor: AIMentorModel = {
      id: `custom_${Date.now()}`,
      name: newName,
      role: newRole,
      bio: newBio,
      persona: newPersona,
      subject: newSubject,
      price: newPrice,
      rating: 5.0,
      subscribers: 0,
      avatar: newPersona === 'Brutal' ? '💀' : newPersona === 'Socratic' ? '🔮' : newPersona === 'Pragmatic' ? '🛠️' : '💖',
      isCustom: true
    };

    setMentors(prev => [newMentor, ...prev]);
    setIsCreateOpen(false);
    // Reset form
    setNewName('');
    setNewRole('');
    setNewBio('');
    setNewPrice(0);
    toast.success(t('common.success'), { description: 'Ձեր ԱԲ Մենթորը ստեղծվել է և հասանելի է շուկայում:' });
  };

  return (
    <div className="space-y-8" id="mentor-marketplace-container">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-primary" size={32} />
            {t('mentorMarketplace.title')}
          </h2>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            {t('mentorMarketplace.subtitle')}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 font-bold text-sm cursor-pointer"
          >
            <Plus size={18} />
            {t('mentorMarketplace.createMentor')}
          </button>
        </div>
      </div>

      {/* Monetization Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-black uppercase tracking-widest">
            {t('mentorMarketplace.monetizePrompt')}
          </span>
          <h3 className="text-xl font-black">{t('mentorMarketplace.earnMessage')}</h3>
          <p className="text-slate-400 text-sm font-medium">
            Ստացեք մինչև 70% հեղինակային հոնորարներ յուրաքանչյուր վճարովի բաժանորդագրությունից:
          </p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-bold text-sm hover:bg-white/15 transition-all z-10 cursor-pointer">
          <span>{t('mentorMarketplace.creatorDashboard')}</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t('mentorMarketplace.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Programming', 'AI & Machine Learning', 'Languages'].map((subj) => (
            <button
              key={subj}
              onClick={() => setSubjectFilter(subj)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                subjectFilter === subj
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {subj === 'All' ? t('common.all') : subj}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor) => {
          const isSubscribed = subscribedMentors.includes(mentor.id);
          return (
            <motion.div
              key={mentor.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                      {mentor.avatar}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
                        {mentor.name}
                        {mentor.isCustom && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-[10px] font-black uppercase">
                            {t('common.new')}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-primary font-black uppercase tracking-wider">{mentor.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-xl text-xs font-bold">
                    <Star size={14} fill="currentColor" />
                    <span>{mentor.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                  {mentor.bio}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-50 p-3 rounded-2xl text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {t('mentorMarketplace.teachingStyle')}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">{mentor.persona}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {t('mentorMarketplace.mentorSubject')}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">{mentor.subject}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {t('mentorMarketplace.mentorPricing')}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {mentor.price === 0 ? t('mentorMarketplace.free') : `$${mentor.price}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-bold">
                  {(mentor.subscribers + (isSubscribed && !INITIAL_MENTORS.some(im => im.id === mentor.id) ? 1 : 0)).toLocaleString()} ուսանող
                </span>
                <button
                  onClick={() => handleSubscribe(mentor.id, mentor.price)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSubscribed
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isSubscribed ? <Check size={14} /> : <Zap size={14} />}
                  <span>{isSubscribed ? t('mentorMarketplace.subscribed') : t('mentorMarketplace.subscribe')}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Mentor Drawer / Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{t('mentorMarketplace.createMentor')}</h3>
                  <p className="text-sm text-slate-500 font-medium">Կառուցեք ձեր սեփական ինտելեկտուալ օգնականը</p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateMentor} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('mentorMarketplace.mentorName')}</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Օրինակ՝ Լևոն Ալիխանյան"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none font-medium text-sm transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('mentorMarketplace.mentorRole')}</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Օրինակ՝ UI/UX Design Specialist"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none font-medium text-sm transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('mentorMarketplace.mentorBio')}</label>
                  <textarea
                    required
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Նկարագրեք ձեր մենթորի առաքելությունն ու փորձը..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none font-medium text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('mentorMarketplace.mentorSubject')}</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none font-medium text-sm transition-all"
                    >
                      <option value="Programming">Programming</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Languages">Languages</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('mentorMarketplace.mentorPersona')}</label>
                    <select
                      value={newPersona}
                      onChange={(e) => setNewPersona(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none font-medium text-sm transition-all"
                    >
                      <option value="Supportive">Supportive (Աջակցող)</option>
                      <option value="Socratic">Socratic (Հարցադրող)</option>
                      <option value="Brutal">Brutal (Խիստ)</option>
                      <option value="Pragmatic">Pragmatic (Գործնական)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('mentorMarketplace.mentorPricing')} (Ամսական $)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none font-medium text-sm transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Անվճար մենթորների համար նշեք 0:</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1 px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-sm cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-sm shadow-md cursor-pointer"
                  >
                    {t('common.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
